import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
  size?: string
  color?: string
  dealId?: string // For deal bundles - all items in a deal share the same dealId
  dealName?: string // Name of the deal for display
  customization?: Record<string, Record<string, string>> // { categoryName: { optionName: value } }
  customizationPrice?: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  removeDeal: (dealId: string) => void // Remove all items from a deal
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items
        // For deal items, don't merge - each deal addition is separate
        if (item.dealId) {
          const id = `${item.productId}-${item.size || 'none'}-${item.color || 'none'}-${item.dealId}-${Date.now()}`
          set({ items: [...items, { ...item, id }] })
          return
        }
        
        const existingItem = items.find(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color &&
            !i.dealId && // Don't merge with deal items
            !i.customization // Don't merge customized items
        )

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          const id = `${item.productId}-${item.size || 'none'}-${item.color || 'none'}-${Date.now()}`
          set({ items: [...items, { ...item, id }] })
        }
      },

      removeItem: (id) => {
        const items = get().items
        const itemToRemove = items.find((i) => i.id === id)
        
        // If item is part of a deal, remove ALL items from that deal
        if (itemToRemove?.dealId) {
          set({ items: items.filter((i) => i.dealId !== itemToRemove.dealId) })
        } else {
          set({ items: items.filter((i) => i.id !== id) })
        }
      },

      removeDeal: (dealId) => {
        set({ items: get().items.filter((i) => i.dealId !== dealId) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const items = get().items
        const item = items.find((i) => i.id === id)
        
        // If item is part of a deal, update ALL items from that deal
        if (item?.dealId) {
          set({
            items: items.map((i) => 
              i.dealId === item.dealId ? { ...i, quantity } : i
            ),
          })
        } else {
          set({
            items: items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          })
        }
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCartOpen: (open) => set({ isOpen: open }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const basePrice = item.salePrice || item.price
          const customizationPrice = item.customizationPrice || 0
          const finalPrice = basePrice + customizationPrice
          return total + finalPrice * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'doctor-planet-cart',
    }
  )
)
