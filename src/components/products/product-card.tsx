'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Sparkles, Zap, TrendingUp, Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { useGlobalDiscount } from '@/hooks/useGlobalDiscount'

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
  /** When true, renders a smaller card for horizontal scroll strips (e.g. related products) */
  compact?: boolean
}

function parseImages(imagesJson: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson)
    return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
  } catch {
    return []
  }
}

export default function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const { addItem, setCartOpen } = useCartStore()
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { data: session } = useSession()
  const router = useRouter()
  const { calculatePrice, getDiscountPercentage, isGlobalDiscountActive } = useGlobalDiscount()
  
  const isLiked = isInWishlist(product.id)

  const images = parseImages(product.images)
  const mainImage = images[imageIndex] ?? images[0] ?? ''
  
  // Use global discount or sale price discount
  const discount = getDiscountPercentage(product.price, product.salePrice)
  const finalPrice = calculatePrice(product.price, product.salePrice)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: isGlobalDiscountActive ? finalPrice : (product.salePrice || undefined),
      image: mainImage,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    })
    setCartOpen(true)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session) {
      toast.error('Please login to add to wishlist')
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }
    
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
        if (data.inWishlist) {
          addToWishlist(product.id)
          toast.success('Added to wishlist', { icon: '❤️' })
        } else {
          removeFromWishlist(product.id)
          toast.success('Removed from wishlist')
        }
      } else {
        if (wasLiked) {
          addToWishlist(product.id)
        } else {
          removeFromWishlist(product.id)
        }
        toast.error('Failed to update wishlist')
      }
    } catch (error) {
      if (wasLiked) {
        addToWishlist(product.id)
      } else {
        removeFromWishlist(product.id)
      }
      toast.error('Something went wrong')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 10 : 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: compact ? 0.3 : 0.5,
        delay: compact ? index * 0.04 : index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={compact ? {} : { y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <motion.div
          className={`relative bg-gradient-to-br from-white to-secondary-50/30 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 ${
            compact ? 'rounded-xl' : 'rounded-2xl sm:rounded-3xl'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated Border Gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(165, 42, 42, 0.15) 0%, rgba(165, 42, 42, 0.05) 100%)',
              padding: '2px',
            }}
          />

          {/* Image Container */}
          <div
            className={`relative overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-50 ${
              compact ? 'aspect-[3/4]' : 'aspect-[3/4] sm:aspect-[4/5]'
            }`}
          >
            {/* Animated Background Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-transparent to-primary-300/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Main Image */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes={compact ? '(max-width: 640px) 44vw, 25vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
                  className="object-cover"
                  priority={index < 4}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary-200 to-secondary-100 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-secondary-300" />
                </div>
              )}
            </motion.div>

            {/* Image Dots Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.slice(0, 4).map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setImageIndex(i)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === imageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            )}

            {/* Badges - Top Left */}
            <div className={`absolute flex flex-col gap-1 z-10 ${compact ? 'top-1.5 left-1.5' : 'top-2 sm:top-3 left-2 sm:left-3 gap-1.5'}`}>
              {discount > 0 && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500 blur-md opacity-50" />
                  <div className={`relative bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-full shadow-xl flex items-center gap-0.5 ${
                    compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 gap-1'
                  }`}>
                    <Zap className={compact ? 'w-2 h-2 fill-current' : 'w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current'} />
                    -{discount}%
                  </div>
                </motion.div>
              )}
              {product.stock === 0 && (
                <span className={`bg-gradient-to-r from-secondary-700 to-secondary-600 text-white font-bold rounded-full shadow-lg ${
                  compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] sm:text-xs px-2 py-1 sm:px-2.5 sm:py-1'
                }`}>
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist Button - Top Right */}
            <motion.button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`absolute rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all z-20 ${
                compact ? 'top-1.5 right-1.5 w-6 h-6' : 'top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10'
              } ${
                isLiked
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white scale-100'
                  : 'bg-white/90 text-secondary-600 hover:bg-white hover:scale-110'
              }`}
              whileHover={{ scale: isLiked ? 1.05 : 1.15, rotate: isLiked ? 0 : 12 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              {isWishlistLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              )}
            </motion.button>

            {/* Hover Overlay - Desktop (hidden when compact) */}
            <motion.div
              className={compact ? 'hidden' : 'hidden sm:block absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10'}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Quick Add to Cart - Desktop Hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 20 
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={compact ? 'hidden' : 'hidden sm:block absolute bottom-4 left-4 right-4 z-20'}
            >
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl group/btn"
              >
                <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </div>

          {/* Content */}
          <div className={`relative bg-white ${compact ? 'p-2' : 'p-3 sm:p-5'}`}>
            {/* Shine Effect */}
            {!compact && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '200%' : '-100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}

            <div className="relative">
              {/* Category */}
              <motion.div
                className={`flex items-center gap-1 mb-1 ${compact ? '' : 'mb-1.5 sm:mb-2 gap-1.5'}`}
                whileHover={compact ? {} : { x: 3 }}
              >
                <div className={`rounded-full bg-primary-500 ${compact ? 'w-0.5 h-0.5' : 'w-1 h-1'}`} />
                <p className={`text-primary-600 font-bold uppercase tracking-wider ${compact ? 'text-[8px]' : 'text-[9px] sm:text-xs'}`}>
                  {product.category.name}
                </p>
              </motion.div>

              {/* Product Name */}
              <h3 className={`font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight ${
                compact ? 'text-[11px] min-h-[2rem] mb-1' : 'text-xs sm:text-base min-h-[2.5rem] sm:min-h-[3rem] mb-2 sm:mb-3'
              }`}>
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1 sm:gap-2">
                  {discount > 0 ? (
                    <>
                      <motion.span
                        className={`font-black text-primary-600 ${compact ? 'text-xs' : 'text-sm sm:text-xl'}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        PKR {finalPrice.toLocaleString()}
                      </motion.span>
                      <span className={`text-secondary-400 line-through font-medium ${compact ? 'text-[9px]' : 'text-[10px] sm:text-sm'}`}>
                        {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className={`font-black text-secondary-900 ${compact ? 'text-xs' : 'text-sm sm:text-xl'}`}>
                      PKR {product.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Rating Placeholder - hide when compact */}
                {!compact && (
                  <div className="hidden sm:flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-secondary-200'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                whileTap={{ scale: 0.95 }}
                className={`w-full mt-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                  compact ? 'text-[10px] py-2 sm:hidden' : 'sm:hidden mt-3 text-xs py-2.5 gap-2'
                }`}
              >
                <ShoppingCart className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
