'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Loader2, 
  Package,
  ArrowRight
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    images: string
    stock: number
    category: {
      name: string
    }
  }
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { addItem } = useCartStore()
  const { removeItem: removeFromWishlistStore } = useWishlistStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/wishlist')
    }
  }, [status, router])

  useEffect(() => {
    const fetchWishlist = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/wishlist')
          if (response.ok) {
            const data = await response.json()
            setItems(data.items || [])
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (session) {
      fetchWishlist()
    }
  }, [session])

  const removeFromWishlist = async (itemId: string, productId: string) => {
    setRemovingId(itemId)
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId))
        removeFromWishlistStore(productId) // Update global store
        toast.success('Removed from wishlist')
      }
    } catch (error) {
      toast.error('Failed to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const addToCart = (item: WishlistItem) => {
    const images = JSON.parse(item.product.images)
    addItem({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      salePrice: item.product.salePrice ?? undefined,
      image: images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

  const moveAllToCart = () => {
    items.forEach(item => {
      if (item.product.stock > 0) {
        addToCart(item)
      }
    })
    toast.success(`Added ${items.filter(i => i.product.stock > 0).length} items to cart!`)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 pb-20 flex items-center justify-center bg-secondary-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-8">
        {/* Header - Compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-3 sm:mb-6"
        >
          <div>
            <h1 className="text-base sm:text-3xl font-heading font-bold text-secondary-900 flex items-center gap-1.5 sm:gap-2">
              <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-primary-600 fill-primary-600" />
              My Wishlist
            </h1>
            <p className="text-secondary-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={moveAllToCart}
              className="btn-primary text-xs sm:text-base px-2 py-1.5 sm:px-4 sm:py-2"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add All to Cart</span>
              <span className="sm:hidden">Add All</span>
            </button>
          )}
        </motion.div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-12 text-center"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="w-7 h-7 sm:w-10 sm:h-10 text-secondary-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-semibold text-secondary-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-secondary-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
              Start adding items you love to your wishlist.
            </p>
            <Link href="/products" className="btn-primary text-sm sm:text-base">
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Items - 2 columns on mobile */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const images = JSON.parse(item.product.images)
                const isOutOfStock = item.product.stock === 0
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden group"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.product.slug}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {item.product.salePrice && !isOutOfStock && (
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-primary-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold">
                            -{Math.round((1 - item.product.salePrice / item.product.price) * 100)}%
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details - Compact on mobile */}
                    <div className="p-2 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-primary-600 font-medium uppercase tracking-wide mb-0.5 sm:mb-1">
                        {item.product.category.name}
                      </p>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-medium text-secondary-900 text-xs sm:text-base line-clamp-2 hover:text-primary-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      {/* Price - Compact */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-1 sm:mt-2">
                        {item.product.salePrice ? (
                          <>
                            <span className="font-bold text-primary-600 text-xs sm:text-base">
                              PKR {item.product.salePrice.toFixed(0)}
                            </span>
                            <span className="text-[10px] sm:text-sm text-secondary-400 line-through">
                              PKR {item.product.price.toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-secondary-900 text-xs sm:text-base">
                            PKR {item.product.price.toFixed(0)}
                          </span>
                        )}
                      </div>

                      {/* Actions - Compact on mobile */}
                      <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-4">
                        <button
                          onClick={() => addToCart(item)}
                          disabled={isOutOfStock}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded text-[10px] sm:text-sm font-medium transition-colors ${
                            isOutOfStock
                              ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                          <span className="sm:hidden">{isOutOfStock ? 'Out' : 'Add'}</span>
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id, item.product.id)}
                          disabled={removingId === item.id}
                          className="p-1.5 sm:p-2 rounded border border-secondary-200 text-secondary-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          {removingId === item.id ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
