'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: string
  category: {
    name: string
    slug: string
  }
  stock: number
}

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const { addItem, setCartOpen } = useCartStore()
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { data: session } = useSession()
  const router = useRouter()
  
  const isLiked = isInWishlist(product.id)

  const images = JSON.parse(product.images)
  const mainImage = images[0]
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || undefined,
      image: mainImage,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`}>
        <div
          className="card-hover relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container - Smaller aspect ratio on mobile */}
          <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-secondary-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges - Smaller on mobile */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
              {discount > 0 && (
                <span className="bg-primary-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-secondary-700 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist Button - Always visible on mobile, hover on desktop */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                
                // Check if user is logged in
                if (!session) {
                  toast.error('Please login to add to wishlist')
                  router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
                  return
                }
                
                // Optimistically update UI
                const wasLiked = isLiked
                if (wasLiked) {
                  removeFromWishlist(product.id)
                } else {
                  addToWishlist(product.id)
                }
                
                setIsWishlistLoading(true)
                try {
                  const response = await fetch('/api/wishlist/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id }),
                  })
                  
                  if (response.ok) {
                    const data = await response.json()
                    // Sync with server response
                    if (data.inWishlist) {
                      addToWishlist(product.id)
                    } else {
                      removeFromWishlist(product.id)
                    }
                    toast.success(data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist')
                  } else {
                    // Revert on error
                    if (wasLiked) {
                      addToWishlist(product.id)
                    } else {
                      removeFromWishlist(product.id)
                    }
                    toast.error('Failed to update wishlist')
                  }
                } catch (error) {
                  // Revert on error
                  if (wasLiked) {
                    addToWishlist(product.id)
                  } else {
                    removeFromWishlist(product.id)
                  }
                  toast.error('Something went wrong')
                } finally {
                  setIsWishlistLoading(false)
                }
              }}
              disabled={isWishlistLoading}
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                isLiked
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/90 text-secondary-700 sm:opacity-0 sm:group-hover:opacity-100'
              } ${isWishlistLoading ? 'opacity-70' : ''}`}
            >
              {isWishlistLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
              )}
            </motion.button>

            {/* Quick View - Hidden on mobile */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex absolute top-14 right-3 w-9 h-9 rounded-full bg-white/90 text-secondary-700 items-center justify-center shadow-md hover:bg-primary-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>

            {/* Add to Cart Button - Desktop hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 20 
              }}
              className="hidden sm:block absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </motion.div>
          </div>

          {/* Content - Compact on mobile */}
          <div className="p-2.5 sm:p-4">
            <p className="text-[10px] sm:text-xs text-primary-600 font-medium mb-0.5 sm:mb-1 uppercase tracking-wide">
              {product.category.name}
            </p>
            <h3 className="text-xs sm:text-sm font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              {product.salePrice ? (
                <>
                  <span className="text-sm sm:text-base font-bold text-primary-600">
                    PKR {product.salePrice.toFixed(0)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-secondary-400 line-through">
                    PKR {product.price.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-bold text-secondary-900">
                  PKR {product.price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Mobile Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="sm:hidden w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
