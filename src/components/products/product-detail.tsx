'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import ProductCard from './product-card'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  images: string
  stock: number
  sizes: string | null
  colors: string | null
  colorImages: string | null
  colorSizeStock: string | null
  category: {
    name: string
    slug: string
  }
}

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const images = JSON.parse(product.images)
  const sizes = product.sizes ? JSON.parse(product.sizes) : []
  const colors = product.colors ? JSON.parse(product.colors) : []
  const colorImages: Record<string, string> = product.colorImages ? JSON.parse(product.colorImages) : {}
  const colorSizeStock: Record<string, Record<string, number>> = product.colorSizeStock 
    ? JSON.parse(product.colorSizeStock) 
    : {}

  // Check if using variant stock management
  const hasVariantStock = Object.keys(colorSizeStock).length > 0

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImage, setCurrentImage] = useState(images[0])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [imageAnimationKey, setImageAnimationKey] = useState(0)

  const { addItem, setCartOpen } = useCartStore()
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { data: session } = useSession()
  const router = useRouter()
  
  const isLiked = isInWishlist(product.id)

  // Toggle wishlist
  const handleToggleWishlist = async () => {
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
  }

  // Get stock for current color-size selection
  const getCurrentStock = () => {
    if (hasVariantStock && selectedColor && selectedSize) {
      return colorSizeStock[selectedColor]?.[selectedSize] || 0
    }
    return product.stock
  }

  // Get total stock for a specific color
  const getColorStock = (color: string) => {
    if (!colorSizeStock[color]) return 0
    return Object.values(colorSizeStock[color]).reduce((sum, qty) => sum + qty, 0)
  }

  // Get stock for a specific size in selected color
  const getSizeStock = (size: string) => {
    if (!selectedColor || !colorSizeStock[selectedColor]) return 0
    return colorSizeStock[selectedColor][size] || 0
  }

  // Check if a size is available for selected color
  const isSizeAvailable = (size: string) => {
    if (!hasVariantStock) return true
    return getSizeStock(size) > 0
  }

  // Handle color selection with image change
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null) // Reset size when color changes
    setQuantity(1)
    if (colorImages[color]) {
      setCurrentImage(colorImages[color])
      setImageAnimationKey(prev => prev + 1)
      // Find index of this image in the images array
      const imgIndex = images.indexOf(colorImages[color])
      if (imgIndex !== -1) {
        setCurrentImageIndex(imgIndex)
      }
    }
  }

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    if (hasVariantStock && !isSizeAvailable(size)) return
    setSelectedSize(size)
    setQuantity(1)
  }

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
    setCurrentImage(images[index])
    setImageAnimationKey(prev => prev + 1)
  }

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const currentStock = getCurrentStock()
  const canAddToCart = hasVariantStock 
    ? (selectedColor && selectedSize && currentStock > 0)
    : product.stock > 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || undefined,
      image: images[0],
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })
    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
  }

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % images.length
    setCurrentImageIndex(nextIndex)
    setCurrentImage(images[nextIndex])
    setImageAnimationKey(prev => prev + 1)
  }

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length
    setCurrentImageIndex(prevIndex)
    setCurrentImage(images[prevIndex])
    setImageAnimationKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen pt-0 sm:pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <Link href="/" className="text-secondary-500 hover:text-primary-600">
            Home
          </Link>
          <span className="text-secondary-300">/</span>
          <Link href="/products" className="text-secondary-500 hover:text-primary-600">
            Products
          </Link>
          <span className="text-secondary-300">/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-secondary-500 hover:text-primary-600"
          >
            {product.category.name}
          </Link>
          <span className="text-secondary-300">/</span>
          <span className="text-secondary-900 font-medium">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary-100 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imageAnimationKey}
                  initial={{ opacity: 0, scale: 1.1, rotateY: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.3 }
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-secondary-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-secondary-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="bg-primary-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="bg-amber-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isLiked ? 'bg-primary-600 text-white' : 'bg-white text-secondary-700'
                  } ${isWishlistLoading ? 'opacity-70' : ''}`}
                >
                  {isWishlistLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard!')
                  }}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-secondary-50 transition-colors"
                >
                  <Share2 className="w-6 h-6 text-secondary-700" />
                </motion.button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {images.map((image: string, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all ${
                      currentImage === image
                        ? 'ring-2 ring-primary-600 ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:py-4"
          >
            <span className="text-primary-600 font-medium">{product.category.name}</span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-primary-600">
                    PKR {product.salePrice.toFixed(0)}
                  </span>
                  <span className="text-xl text-secondary-400 line-through">
                    PKR {product.price.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-secondary-900">
                  PKR {product.price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {hasVariantStock ? (
                selectedColor && selectedSize ? (
                  currentStock > 0 ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">
                        In Stock ({currentStock} available for {selectedColor} - {selectedSize})
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock for this variant</span>
                  )
                ) : (
                  <span className="text-secondary-500">Select color and size to see availability</span>
                )
              ) : product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-secondary-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <label className="block font-medium text-secondary-900 mb-3">
                  Size {selectedSize && <span className="text-primary-600">: {selectedSize}</span>}
                  {hasVariantStock && selectedColor && selectedSize && (
                    <span className="text-sm text-secondary-500 font-normal ml-2">
                      ({getSizeStock(selectedSize)} in stock)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => {
                    const sizeStock = hasVariantStock ? getSizeStock(size) : null
                    const isAvailable = hasVariantStock ? isSizeAvailable(size) : true
                    
                    return (
                      <motion.button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        disabled={hasVariantStock && !isAvailable}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        className={`relative px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          !isAvailable
                            ? 'border-secondary-200 bg-secondary-100 text-secondary-400 cursor-not-allowed line-through'
                            : selectedSize === size
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-secondary-200 text-secondary-700 hover:border-primary-300'
                        }`}
                      >
                        <span className="flex flex-col items-center">
                          <span>{size}</span>
                          {hasVariantStock && selectedColor && (
                            <span className={`text-xs ${isAvailable ? 'text-secondary-500' : 'text-secondary-400'}`}>
                              {sizeStock === 0 ? 'Out' : sizeStock}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
                {hasVariantStock && !selectedColor && (
                  <p className="text-sm text-amber-600 mt-2">Select a color first to see size availability</p>
                )}
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-8">
                <label className="block font-medium text-secondary-900 mb-3">
                  Color: <span className="text-primary-600">{selectedColor}</span>
                  {hasVariantStock && selectedColor && (
                    <span className="text-sm text-secondary-500 font-normal ml-2">
                      (Total: {getColorStock(selectedColor)} in stock)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: string) => {
                    const colorStock = hasVariantStock ? getColorStock(color) : null
                    const isColorAvailable = !hasVariantStock || colorStock! > 0
                    
                    return (
                      <motion.button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                          !isColorAvailable
                            ? 'border-secondary-200 bg-secondary-100 text-secondary-400 opacity-60'
                            : selectedColor === color
                            ? 'border-primary-600 bg-primary-50 text-primary-600 shadow-lg shadow-primary-200'
                            : 'border-secondary-200 text-secondary-700 hover:border-primary-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {colorImages[color] && (
                            <span className="relative w-6 h-6 rounded-full overflow-hidden border border-secondary-200">
                              <Image
                                src={colorImages[color]}
                                alt={color}
                                fill
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span className="flex flex-col items-start">
                            <span>{color}</span>
                            {hasVariantStock && (
                              <span className={`text-xs ${isColorAvailable ? 'text-secondary-500' : 'text-secondary-400'}`}>
                                {colorStock === 0 ? 'Out of stock' : `${colorStock} available`}
                              </span>
                            )}
                          </span>
                        </span>
                        {selectedColor === color && (
                          <motion.span
                            layoutId="colorIndicator"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-600 rounded-full"
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border-2 border-secondary-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!canAddToCart}
                  className="p-3 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-5 h-5 text-secondary-600" />
                </button>
                <span className="w-16 text-center font-semibold text-secondary-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={!canAddToCart || quantity >= currentStock}
                  className="p-3 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <motion.button
                whileHover={canAddToCart ? { scale: 1.02 } : {}}
                whileTap={canAddToCart ? { scale: 0.98 } : {}}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="btn-primary flex-1 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                {hasVariantStock && (!selectedColor || !selectedSize)
                  ? 'Select Options'
                  : currentStock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </motion.button>
            </div>

            {/* Selection Reminder */}
            {hasVariantStock && sizes.length > 0 && (!selectedColor || !selectedSize) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-8"
              >
                <p className="text-amber-800 text-sm">
                  {!selectedColor 
                    ? 'Please select a color to continue'
                    : 'Please select a size to continue'}
                </p>
              </motion.div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-secondary-50 rounded-2xl">
              <div className="text-center">
                <Truck className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-secondary-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-secondary-600">Warranty</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-secondary-600">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
