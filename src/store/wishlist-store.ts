'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  // Set of product IDs in wishlist
  items: Set<string>
  // Loading state
  isLoaded: boolean
  // Actions
  setItems: (productIds: string[]) => void
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => boolean // returns new state
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  fetchWishlist: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: new Set<string>(),
      isLoaded: false,

      setItems: (productIds: string[]) => {
        set({ items: new Set(productIds), isLoaded: true })
      },

      addItem: (productId: string) => {
        const newItems = new Set(get().items)
        newItems.add(productId)
        set({ items: newItems })
      },

      removeItem: (productId: string) => {
        const newItems = new Set(get().items)
        newItems.delete(productId)
        set({ items: newItems })
      },

      toggleItem: (productId: string) => {
        const items = get().items
        const newItems = new Set(items)
        const wasInWishlist = items.has(productId)
        
        if (wasInWishlist) {
          newItems.delete(productId)
        } else {
          newItems.add(productId)
        }
        
        set({ items: newItems })
        return !wasInWishlist // return new state
      },

      isInWishlist: (productId: string) => {
        return get().items.has(productId)
      },

      clearWishlist: () => {
        set({ items: new Set(), isLoaded: false })
      },

      fetchWishlist: async () => {
        try {
          const response = await fetch('/api/wishlist')
          if (response.ok) {
            const data = await response.json()
            const productIds = data.items?.map((item: any) => item.product.id) || []
            set({ items: new Set(productIds), isLoaded: true })
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error)
        }
      },
    }),
    {
      name: 'wishlist-storage',
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          return {
            ...parsed,
            state: {
              ...parsed.state,
              items: new Set(parsed.state.items || []),
            },
          }
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              items: Array.from(value.state.items || []),
            },
          }
          localStorage.setItem(name, JSON.stringify(toStore))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
