'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Tag,
  Check,
  Clock,
  Loader2,
  Star,
  Shield,
  Phone,
  Mail,
  HeartHandshake,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart-store'
import RichTextDisplay from '@/components/rich-text-display'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  sizes: string | null
  colors: string | null
  colorImages: string | null
  stock: number
  category: {
    name: string
  }
}

interface DealItem {
  id: string
  productId: string
  quantity: number
  product: Product
}

interface Deal {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  dealPrice: number
  originalPrice: number
  items: DealItem[]
  isActive: boolean
  startDate: string | null
  endDate: string | null
}

interface ProductSelection {
  productId: string
  size: string | null
  color: string | null
  quantity: number
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, setCartOpen, isOpen: isCartOpen } = useCartStore()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [selections, setSelections] = useState<ProductSelection[]>([])
  const [activeProductId, setActiveProductId] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchDeal()
    }
  }, [params.slug])

  const fetchDeal = async () => {
    try {
      const res = await fetch(`/api/deals?slug=${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setDeal(data)
        // Initialize selections for each product in the deal
        const initialSelections: ProductSelection[] = data.items.map((item: DealItem) => ({
          productId: item.productId,
          size: null,
          color: null,
          quantity: item.quantity,
        }))
        setSelections(initialSelections)
        
        // Set first product with variants as active
        const firstWithVariants = data.items.find((item: DealItem) => {
          const sizes = item.product.sizes ? JSON.parse(item.product.sizes) : []
          const colors = item.product.colors ? JSON.parse(item.product.colors) : []
          return sizes.length > 0 || colors.length > 0
        })
        if (firstWithVariants) {
          setActiveProductId(firstWithVariants.productId)
        }
      } else {
        toast.error('Deal not found')
        router.push('/products')
      }
    } catch (error) {
      toast.error('Failed to load deal')
    } finally {
      setLoading(false)
    }
  }

  const updateSelection = (productId: string, field: 'size' | 'color', value: string | null) => {
    setSelections(prev =>
      prev.map(s =>
        s.productId === productId ? { ...s, [field]: value } : s
      )
    )
  }

  const getProductSelection = (productId: string) => {
    return selections.find(s => s.productId === productId)
  }

  const isProductComplete = (item: DealItem) => {
    const product = item.product
    const selection = getProductSelection(item.productId)
    const sizes = product.sizes ? JSON.parse(product.sizes) : []
    const colors = product.colors ? JSON.parse(product.colors) : []
    
    if (sizes.length > 0 && !selection?.size) return false
    if (colors.length > 0 && !selection?.color) return false
    return true
  }

  const allSelectionsComplete = () => {
    if (!deal) return false
    return deal.items.every(item => isProductComplete(item))
  }

  const validateSelections = () => {
    if (!deal) return false
    
    for (const item of deal.items) {
      const product = item.product
      const selection = getProductSelection(item.productId)
      
      const sizes = product.sizes ? JSON.parse(product.sizes) : []
      const colors = product.colors ? JSON.parse(product.colors) : []
      
      if (sizes.length > 0 && !selection?.size) {
        toast.error(`Please select a size for ${product.name}`)
        setActiveProductId(item.productId)
        return false
      }
      
      if (colors.length > 0 && !selection?.color) {
        toast.error(`Please select a color for ${product.name}`)
        setActiveProductId(item.productId)
        return false
      }
    }
    
    return true
  }

  const handleAddToCart = async () => {
    if (!validateSelections()) return

    setAddingToCart(true)
    try {
      // Calculate the discount ratio for the deal
      const discountRatio = deal!.dealPrice / deal!.originalPrice
      
      // Generate a unique deal instance ID - all products from this deal purchase share this ID
      const dealInstanceId = `deal-${deal!.id}-${Date.now()}`
      
      // Add each product in the deal to cart with proportional deal pricing
      for (const item of deal!.items) {
        const product = item.product
        const selection = getProductSelection(item.productId)
        const images = product.images ? JSON.parse(product.images) : []
        const colorImages = product.colorImages ? JSON.parse(product.colorImages) : {}
        
        // Get the appropriate image based on color selection
        const image = selection?.color && colorImages[selection.color] 
          ? colorImages[selection.color] 
          : images[0] || ''
        
        // Calculate proportional deal price for this product
        const originalProductTotal = product.price * item.quantity
        const dealProductPrice = Math.round(originalProductTotal * discountRatio)
        
        addItem({
          productId: product.id,
          name: `${product.name} (${deal!.name})`,
          price: originalProductTotal,
          salePrice: dealProductPrice,
          image,
          quantity: 1,
          size: selection?.size || undefined,
          color: selection?.color || undefined,
          dealId: dealInstanceId, // Link all products in this deal together
          dealName: deal!.name,
        })
      }

      toast.success('Deal added to cart!')
      setCartOpen(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add deal to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return { days, hours, minutes, text: `${days}d ${hours}h left` }
    if (hours > 0) return { days: 0, hours, minutes, text: `${hours}h ${minutes}m left` }
    return { days: 0, hours: 0, minutes, text: `${minutes}m left` }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Deal not found</h1>
          <Link href="/products" className="text-primary-600 hover:underline">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  const savings = deal.originalPrice - deal.dealPrice
  const savingsPercent = Math.round((savings / deal.originalPrice) * 100)
  const timeRemaining = deal.endDate ? getTimeRemaining(deal.endDate) : null
  const completedCount = deal.items.filter(item => isProductComplete(item)).length

  return (
    <div className="min-h-screen pt-0 sm:pt-20 pb-40 sm:pb-32 bg-gradient-to-b from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-secondary-600 hover:text-secondary-900 mb-3 sm:mb-6 text-sm sm:text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back
        </button>

        {/* Deal Header - Compact on mobile */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <div className="flex items-center gap-1 text-primary-100 text-xs sm:text-sm mb-1 sm:mb-2">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  Bundle Deal
                </div>
                <h1 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-2">{deal.name}</h1>
                {deal.description && (
                  <div className="text-primary-100 text-xs sm:text-base max-w-2xl line-clamp-2 sm:line-clamp-none">
                    <RichTextDisplay content={deal.description} />
                  </div>
                )}
              </div>
              
              {/* Timer - Compact on mobile */}
              {timeRemaining && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">Ends Soon</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 text-white justify-center">
                    {timeRemaining.days > 0 && (
                      <div className="bg-white/20 rounded px-2 py-0.5 sm:px-3 sm:py-1">
                        <span className="text-sm sm:text-xl font-bold">{timeRemaining.days}</span>
                        <span className="text-[10px] sm:text-xs block">days</span>
                      </div>
                    )}
                    <div className="bg-white/20 rounded px-2 py-0.5 sm:px-3 sm:py-1">
                      <span className="text-sm sm:text-xl font-bold">{timeRemaining.hours}</span>
                      <span className="text-[10px] sm:text-xs block">hrs</span>
                    </div>
                    <div className="bg-white/20 rounded px-2 py-0.5 sm:px-3 sm:py-1">
                      <span className="text-sm sm:text-xl font-bold">{timeRemaining.minutes}</span>
                      <span className="text-[10px] sm:text-xs block">min</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Banner - Compact on mobile */}
            <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-5xl font-bold">{formatCurrency(deal.dealPrice)}</span>
                <span className="text-sm sm:text-xl text-primary-200 line-through">{formatCurrency(deal.originalPrice)}</span>
              </div>
              <div className="bg-amber-400 text-amber-900 px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base font-bold">
                Save {savingsPercent}%
              </div>
            </div>
          </div>

          {/* Features - Smaller on mobile */}
          <div className="grid grid-cols-2 divide-x divide-secondary-100 border-t border-secondary-100">
            <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4 text-secondary-600">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <span className="text-xs sm:text-sm font-medium">{deal.items.length} Products</span>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4 text-secondary-600">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <span className="text-xs sm:text-sm font-medium">Quality Assured</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator - Smaller on mobile */}
        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 mb-3 sm:mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-secondary-700">
              Progress
            </span>
            <span className="text-xs sm:text-sm text-secondary-500">
              {completedCount}/{deal.items.length} ready
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-secondary-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / deal.items.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Customer Support Notice - Compact on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6 shadow-lg text-white"
        >
          <div className="flex items-start gap-2 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                <Star className="w-3 h-3 sm:w-5 sm:h-5 text-amber-300 flex-shrink-0" />
                <span className="truncate">Can't Select Options?</span>
              </h3>
              <p className="text-emerald-50 text-xs sm:text-base leading-relaxed">
                No worries! <span className="font-semibold text-white">Doctor Planet</span> will contact you to confirm preferences.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 mt-2 sm:mt-4">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-sm font-medium">Call</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-sm font-medium">Email</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-sm font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-6">
          {deal.items.map((item, index) => {
            const product = item.product
            const images = product.images ? JSON.parse(product.images) : []
            const sizes = product.sizes ? JSON.parse(product.sizes) : []
            const colors = product.colors ? JSON.parse(product.colors) : []
            const colorImages = product.colorImages ? JSON.parse(product.colorImages) : {}
            const selection = getProductSelection(item.productId)
            const isComplete = isProductComplete(item)
            const isActive = activeProductId === item.productId
            const needsSelection = sizes.length > 0 || colors.length > 0
            
            // Get current display image
            const displayImage = selection?.color && colorImages[selection.color] 
              ? colorImages[selection.color] 
              : images[0]

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveProductId(item.productId)}
                className={`relative bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive ? 'border-primary-500 ring-2 sm:ring-4 ring-primary-100' : 
                  isComplete ? 'border-green-300' : 'border-secondary-200'
                }`}
              >
                {/* Product Number Badge */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                  <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-secondary-200 text-secondary-600'
                  }`}>
                    {isComplete ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : index + 1}
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative w-full aspect-square sm:aspect-[4/3]">
                  <Image
                    src={displayImage || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {item.quantity > 1 && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-primary-600 text-white text-[10px] sm:text-sm font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      x{item.quantity}
                    </div>
                  )}
                  
                  {/* Status Badge on Image */}
                  {isComplete && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">Ready</span>
                    </div>
                  )}
                </div>

                {/* Product Details - Compact on mobile */}
                <div className="p-2 sm:p-4">
                  <span className="text-[10px] sm:text-xs text-primary-600 font-medium bg-primary-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                    {product.category.name}
                  </span>
                  <h3 className="text-xs sm:text-base font-bold text-secondary-900 mt-1 sm:mt-2 line-clamp-2">{product.name}</h3>
                  
                  {/* Price - Compact */}
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-sm text-secondary-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  {/* Variant Selection - Compact on mobile */}
                  {needsSelection && (
                    <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
                      {/* Colors */}
                      {colors.length > 0 && (
                        <div>
                          <label className="block text-[10px] sm:text-sm font-medium text-secondary-700 mb-1">
                            Color: <span className="text-primary-600">{selection?.color || '-'}</span>
                          </label>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {colors.map((color: string) => (
                              <button
                                key={color}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateSelection(item.productId, 'color', color)
                                }}
                                className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-sm font-medium transition-all ${
                                  selection?.color === color
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-secondary-100 text-secondary-700'
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {sizes.length > 0 && (
                        <div>
                          <label className="block text-[10px] sm:text-sm font-medium text-secondary-700 mb-1">
                            Size: <span className="text-primary-600">{selection?.size || '-'}</span>
                          </label>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                              {sizes.map((size: string) => (
                                <button
                                  key={size}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateSelection(item.productId, 'size', size)
                                  }}
                                  className={`min-w-[28px] sm:min-w-[40px] h-7 sm:h-10 px-1.5 sm:px-3 rounded text-[10px] sm:text-sm font-bold transition-all ${
                                    selection?.size === size
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-secondary-100 text-secondary-700'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selection Status - Compact */}
                        {!isComplete && (
                          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 sm:px-3 sm:py-2 rounded text-[10px] sm:text-sm">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium">Select options</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </motion.div>
            )
          })}
        </div>

        {/* Sticky Add to Cart - Hide when cart is open */}
        <AnimatePresence>
          {!isCartOpen && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-14 lg:bottom-0 left-0 right-0 bg-white border-t border-secondary-200 shadow-2xl z-40"
            >
              <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Summary - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {deal.items.slice(0, 3).map((item, i) => {
                        const images = item.product.images ? JSON.parse(item.product.images) : []
                        return (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                            style={{ zIndex: 3 - i }}
                          >
                            <Image
                              src={images[0] || '/placeholder.png'}
                              alt=""
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )
                      })}
                      {deal.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-bold text-primary-600">
                          +{deal.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-secondary-900">{deal.name}</p>
                      <p className="text-sm text-secondary-500">{completedCount}/{deal.items.length} ready</p>
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-2xl font-bold text-primary-600">{formatCurrency(deal.dealPrice)}</p>
                      <p className="text-xs sm:text-sm text-secondary-400 line-through">{formatCurrency(deal.originalPrice)}</p>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !allSelectionsComplete()}
                      className={`flex-1 sm:flex-none px-3 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                        allSelectionsComplete()
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30'
                          : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                      }`}
                    >
                      {addingToCart ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="hidden sm:inline">Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          {allSelectionsComplete() ? 'Add to Cart' : `Select (${deal.items.length - completedCount})`}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
