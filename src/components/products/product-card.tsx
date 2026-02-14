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

function parseImages(imagesJson: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson)
    return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
  } catch {
    return []
  }
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const { addItem, setCartOpen } = useCartStore()
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { data: session } = useSession()
  const router = useRouter()
  
  const isLiked = isInWishlist(product.id)

  const images = parseImages(product.images)
  const mainImage = images[imageIndex] ?? images[0] ?? ''
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <motion.div
          className="relative bg-gradient-to-br from-white to-secondary-50/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
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
          <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-50">
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
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 z-10">
              {discount > 0 && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500 blur-md opacity-50" />
                  <div className="relative bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-xl flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                    -{discount}%
                  </div>
                </motion.div>
              )}
              {product.stock === 0 && (
                <span className="bg-gradient-to-r from-secondary-700 to-secondary-600 text-white text-[9px] sm:text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1 rounded-full shadow-lg">
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist Button - Top Right */}
            <motion.button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all z-20 ${
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

            {/* Hover Overlay - Desktop */}
            <motion.div
              className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"
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
              className="hidden sm:block absolute bottom-4 left-4 right-4 z-20"
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
          <div className="relative p-3 sm:p-5 bg-white">
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
              initial={{ x: '-100%' }}
              animate={{ x: isHovered ? '200%' : '-100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            <div className="relative">
              {/* Category */}
              <motion.div
                className="flex items-center gap-1.5 mb-1.5 sm:mb-2"
                whileHover={{ x: 3 }}
              >
                <div className="w-1 h-1 rounded-full bg-primary-500" />
                <p className="text-[9px] sm:text-xs text-primary-600 font-bold uppercase tracking-wider">
                  {product.category.name}
                </p>
              </motion.div>

              {/* Product Name */}
              <h3 className="text-xs sm:text-base font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight mb-2 sm:mb-3">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  {product.salePrice ? (
                    <>
                      <motion.span 
                        className="text-sm sm:text-xl font-black text-primary-600"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        PKR {product.salePrice.toLocaleString()}
                      </motion.span>
                      <span className="text-[10px] sm:text-sm text-secondary-400 line-through font-medium">
                        {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-xl font-black text-secondary-900">
                      PKR {product.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Rating Placeholder */}
                <div className="hidden sm:flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-secondary-200'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                whileTap={{ scale: 0.95 }}
                className="sm:hidden w-full mt-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
