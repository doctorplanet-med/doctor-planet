'use client'

import { useState, useEffect } from 'react'
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
  Ruler,
  X,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import ProductCard from './product-card'
import RichTextDisplay from '@/components/rich-text-display'

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
  sizeChartImage?: string | null
  hasCustomization?: boolean
  customizationPrice?: number | null
  customizationCategories?: {
    id: string
    name: string
    order: number
    options: {
      id: string
      name: string
      order: number
    }[]
  }[]
  category: {
    name: string
    slug: string
  }
}

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

/** Normalize colorImages from API: value can be string (legacy) or string[] */
function normalizeColorImages(raw: Record<string, string | string[]> | null): Record<string, string[]> {
  if (!raw) return {}
  const out: Record<string, string[]> = {}
  for (const [color, val] of Object.entries(raw)) {
    out[color] = Array.isArray(val) ? val : (val ? [val] : [])
  }
  return out
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const images = JSON.parse(product.images)
  const sizes = product.sizes ? JSON.parse(product.sizes) : []
  const colors = product.colors ? JSON.parse(product.colors) : []
  const colorImagesRaw = product.colorImages ? JSON.parse(product.colorImages) : {}
  const colorImages = normalizeColorImages(colorImagesRaw as Record<string, string | string[]>)
  const colorSizeStock: Record<string, Record<string, number>> = product.colorSizeStock 
    ? JSON.parse(product.colorSizeStock) 
    : {}

  // Check if using variant stock management
  const hasVariantStock = Object.keys(colorSizeStock).length > 0

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(colors[0] || null)
  // Images to show in gallery: when a color with assigned images is selected, use those; else use main product images
  const displayImages = (selectedColor && colorImages[selectedColor]?.length)
    ? colorImages[selectedColor]
    : images
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const safeImageIndex = displayImages.length ? Math.min(currentImageIndex, displayImages.length - 1) : 0
  const currentImage = displayImages[safeImageIndex] ?? displayImages[0]

  useEffect(() => {
    if (displayImages.length && currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(displayImages.length - 1)
    }
  }, [displayImages.length, currentImageIndex])

  const [quantity, setQuantity] = useState(1)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [imageAnimationKey, setImageAnimationKey] = useState(0)
  // Customization state
  const [wantsCustomization, setWantsCustomization] = useState(false)
  const [customizationData, setCustomizationData] = useState<Record<string, Record<string, string>>>({})

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

  // Handle color selection with image change (switch to that color's images)
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null) // Reset size when color changes
    setQuantity(1)
    setCurrentImageIndex(0) // Show first image of the selected color (or main images)
    setImageAnimationKey(prev => prev + 1)
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
    setImageAnimationKey(prev => prev + 1)
  }

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const currentStock = getCurrentStock()
  const canAddToCart = hasVariantStock 
    ? (selectedColor && selectedSize && (selectedSize !== 'Custom' ? currentStock > 0 : true))
    : product.stock > 0

  const updateCustomizationField = (categoryName: string, optionName: string, value: string) => {
    setCustomizationData(prev => ({
      ...prev,
      [categoryName]: {
        ...(prev[categoryName] || {}),
        [optionName]: value,
      },
    }))
  }

  const displayPrice = product.salePrice || product.price
  const finalPrice = wantsCustomization && product.customizationPrice 
    ? displayPrice + product.customizationPrice 
    : displayPrice

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
      customization: wantsCustomization ? customizationData : undefined,
      customizationPrice: wantsCustomization && product.customizationPrice ? product.customizationPrice : undefined,
    })
    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
  }

  const nextImage = () => {
    const len = displayImages.length
    if (!len) return
    const nextIndex = (currentImageIndex + 1) % len
    setCurrentImageIndex(nextIndex)
    setImageAnimationKey(prev => prev + 1)
  }

  const prevImage = () => {
    const len = displayImages.length
    if (!len) return
    const prevIndex = (currentImageIndex - 1 + len) % len
    setCurrentImageIndex(prevIndex)
    setImageAnimationKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-8"
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

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl sm:rounded-3xl overflow-hidden bg-secondary-100 mb-3 sm:mb-4">
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
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-secondary-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-secondary-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                {discount > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] sm:text-sm font-semibold px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isLiked ? 'bg-primary-600 text-white' : 'bg-white text-secondary-700'
                  } ${isWishlistLoading ? 'opacity-70' : ''}`}
                >
                  {isWishlistLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : ''}`} />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard!')
                  }}
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-secondary-50 transition-colors"
                >
                  <Share2 className="w-4 h-4 sm:w-6 sm:h-6 text-secondary-700" />
                </motion.button>
              </div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scrollbar mt-2 sm:mt-0">
                {displayImages.map((image: string, index: number) => (
                  <motion.button
                    key={`${image}-${index}`}
                    onClick={() => handleThumbnailClick(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden transition-all ${
                      index === safeImageIndex
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
            
            {/* Description - Moved to left column */}
            <div className="mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-secondary-900 mb-3 sm:mb-4">
                Product Description
              </h2>
              <div className="text-secondary-600 text-sm sm:text-base leading-relaxed">
                <RichTextDisplay content={product.description} />
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:py-4"
          >
            <span className="text-primary-600 text-xs sm:text-base font-medium">{product.category.name}</span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-heading font-bold text-secondary-900 mt-1 sm:mt-2 mb-3 sm:mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-4">
                {product.salePrice ? (
                  <>
                    <span className="text-xl sm:text-3xl font-bold text-primary-600">
                      PKR {finalPrice.toLocaleString()}
                    </span>
                    {!wantsCustomization && (
                      <span className="text-sm sm:text-xl text-secondary-400 line-through">
                        PKR {product.price.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xl sm:text-3xl font-bold text-secondary-900">
                    PKR {finalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {wantsCustomization && product.customizationPrice && (
                <p className="text-xs sm:text-sm text-secondary-600 mt-1.5">
                  Base price: PKR {displayPrice.toLocaleString()} + Customization: PKR {product.customizationPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {hasVariantStock ? (
                selectedColor && selectedSize ? (
                  currentStock > 0 ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                      <span className="text-green-600 text-xs sm:text-base font-medium">
                        In Stock
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 text-xs sm:text-base font-medium">Out of Stock</span>
                  )
                ) : (
                  <span className="text-secondary-500 text-xs sm:text-base">Select color and size to see availability</span>
                )
              ) : product.stock > 0 ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                  <span className="text-green-600 text-xs sm:text-base font-medium">
                    In Stock
                  </span>
                </>
              ) : (
                <span className="text-red-500 text-xs sm:text-base font-medium">Out of Stock</span>
              )}
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-medium text-secondary-900 mb-2 sm:mb-3">
                  Color: <span className="text-primary-600">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {colors.map((color: string) => {
                    const colorStock = hasVariantStock ? getColorStock(color) : null
                    const isColorAvailable = !hasVariantStock || colorStock! > 0
                    
                    return (
                      <motion.button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base font-medium transition-all ${
                          !isColorAvailable
                            ? 'border-secondary-200 bg-secondary-100 text-secondary-400 opacity-60'
                            : selectedColor === color
                            ? 'border-primary-600 bg-primary-50 text-primary-600 shadow-lg shadow-primary-200'
                            : 'border-secondary-200 text-secondary-700 hover:border-primary-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {colorImages[color]?.[0] && (
                            <span className="relative w-6 h-6 rounded-full overflow-hidden border border-secondary-200">
                              <Image
                                src={colorImages[color][0]}
                                alt={color}
                                fill
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span>{color}</span>
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

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-sm sm:text-base font-medium text-secondary-900">
                    Size {selectedSize && <span className="text-primary-600">: {selectedSize}</span>}
                  </label>
                  {product.sizeChartImage && (
                    <button
                      type="button"
                      onClick={() => setSizeChartOpen(true)}
                      className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Size Chart
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                        className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 text-sm sm:text-base font-medium transition-all ${
                          !isAvailable
                            ? 'border-secondary-200 bg-secondary-100 text-secondary-400 cursor-not-allowed line-through'
                            : selectedSize === size
                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                            : 'border-secondary-200 text-secondary-700 hover:border-primary-300'
                        }`}
                      >
                        <span>{size}</span>
                      </motion.button>
                    )
                  })}
                  
                  {/* Add "Custom" option if product has customization */}
                  {product.hasCustomization && product.customizationCategories && product.customizationCategories.length > 0 && (
                    <motion.button
                      key="custom"
                      onClick={() => {
                        setSelectedSize('Custom')
                        setWantsCustomization(true)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 text-sm sm:text-base font-medium transition-all ${
                        selectedSize === 'Custom'
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-secondary-200 text-secondary-700 hover:border-primary-300'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 sm:w-4 sm:h-4" />
                        Custom
                      </span>
                    </motion.button>
                  )}
                </div>
                {hasVariantStock && !selectedColor && (
                  <p className="text-sm text-amber-600 mt-2">Select a color first to see size availability</p>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-2 sm:gap-4 mb-5 sm:mb-8">
              <div className="flex items-center border-2 border-secondary-200 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!canAddToCart}
                  className="p-2 sm:p-3 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
                </button>
                <span className="w-10 sm:w-16 text-center text-sm sm:text-base font-semibold text-secondary-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={!canAddToCart || quantity >= currentStock}
                  className="p-2 sm:p-3 hover:bg-secondary-100 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
                </button>
              </div>

              <motion.button
                whileHover={canAddToCart ? { scale: 1.02 } : {}}
                whileTap={canAddToCart ? { scale: 0.98 } : {}}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="btn-primary flex-1 text-sm sm:text-lg py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 mr-1.5 sm:mr-2" />
                {hasVariantStock && (!selectedColor || !selectedSize)
                  ? 'Select Options'
                  : currentStock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </motion.button>
            </div>

            {/* Customization Options - Show only when Custom size is selected */}
            {product.hasCustomization && product.customizationCategories && product.customizationCategories.length > 0 && selectedSize === 'Custom' && (
              <div className="mb-5 sm:mb-8 p-4 sm:p-6 bg-primary-50/50 border-2 border-primary-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary-600" />
                    Custom Measurements
                  </h3>
                  {product.customizationPrice && (
                    <span className="text-sm sm:text-base font-semibold text-primary-600">
                      +PKR {product.customizationPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <p className="text-xs sm:text-sm text-secondary-600 mb-3">
                    Enter your measurements (in inches) for each field:
                  </p>
                  {product.customizationCategories.map((category) => (
                    <div key={category.id} className="p-3 sm:p-4 bg-white rounded-lg border border-secondary-200">
                      <h4 className="text-sm sm:text-base font-semibold text-secondary-900 mb-3">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.options.map((option) => (
                          <div key={option.id}>
                            <label className="block text-xs sm:text-sm font-medium text-secondary-700 mb-1.5">
                              {option.name}
                            </label>
                            <input
                              type="text"
                              value={customizationData[category.name]?.[option.name] || ''}
                              onChange={(e) => updateCustomizationField(category.name, option.name, e.target.value)}
                              placeholder="e.g. 42"
                              className="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-secondary-50 rounded-xl sm:rounded-2xl">
              <div className="text-center">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-sm text-secondary-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-sm text-secondary-600">Warranty</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-sm text-secondary-600">Easy Returns</p>
              </div>
            </div>

            {/* Size Chart - only when product has a size chart image */}
            {product.sizeChartImage && (
              <div className="mt-5 sm:mt-6 mb-5 sm:mb-8">
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                  View Size Chart
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Size Chart modal */}
        <AnimatePresence>
          {sizeChartOpen && product.sizeChartImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
              onClick={() => setSizeChartOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              >
                <div className="sticky top-0 flex items-center justify-between p-3 border-b border-secondary-200 bg-white rounded-t-2xl z-10">
                  <h3 className="text-lg font-semibold text-secondary-900">Size Chart</h3>
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-600"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:min-h-[400px] rounded-xl overflow-hidden bg-secondary-100">
                    <Image
                      src={product.sizeChartImage}
                      alt={`${product.name} size chart`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 896px"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 sm:mt-20"
          >
            <h2 className="text-lg sm:text-2xl font-heading font-bold text-secondary-900 mb-5 sm:mb-8">
              Related Products
            </h2>
            {/* Mobile: horizontal left-right scroll; Desktop: grid */}
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible snap-x snap-mandatory hide-scrollbar">
              {relatedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[44vw] min-w-[140px] max-w-[180px] sm:w-auto sm:min-w-0 sm:max-w-none snap-center"
                >
                  <ProductCard product={product} index={index} compact />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
