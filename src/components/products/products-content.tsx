'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown,
  Grid3X3,
  List,
  Tag,
  ArrowRight,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from './product-card'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  stock: number
  category: {
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface Deal {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  dealPrice: number
  originalPrice: number
  items: {
    productId: string
    quantity: number
    product?: {
      id: string
      name: string
      images: string
    }
  }[]
}

interface ProductsContentProps {
  products: Product[]
  categories: Category[]
  currentCategory?: string
  searchQuery?: string
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function ProductsContent({
  products,
  categories,
  currentCategory,
  searchQuery,
}: ProductsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery || '')
  const [sortBy, setSortBy] = useState('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deals, setDeals] = useState<Deal[]>([])

  // Fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/deals')
        const data = await res.json()
        if (res.ok && Array.isArray(data)) {
          setDeals(data.slice(0, 2)) // Show max 2 deals on products page
        }
      } catch (error) {
        console.error('Failed to load deals')
      }
    }
    fetchDeals()
  }, [])

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/products?${params.toString()}`)
  }

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // newest - already sorted by createdAt desc
        break
    }

    return result
  }, [products, sortBy])

  const currentCategoryName = currentCategory
    ? categories.find((c) => c.slug === currentCategory)?.name
    : 'All Products'

  return (
    <div className="min-h-screen pt-0 sm:pt-20 pb-16 lg:pb-0 bg-gradient-to-br from-secondary-50 via-white to-secondary-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl opacity-10 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-4 sm:py-8">
        {/* Header with Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <motion.div
              className="w-1 h-8 sm:h-12 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            <h1 className="text-xl sm:text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900">
              {currentCategoryName}
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 ml-4 sm:ml-6"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-secondary-600">
              <motion.span
                className="font-bold text-primary-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {filteredAndSortedProducts.length}
              </motion.span>
              products available
            </div>
            <div className="w-px h-4 bg-secondary-300" />
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Filters Bar - Modern Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-3 sm:p-5 mb-4 sm:mb-8 overflow-hidden"
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 rounded-2xl sm:rounded-3xl" />
          
          <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            {/* Search with Icon Animation */}
            <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
              <div className="relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="relative w-full px-4 py-2.5 sm:py-3 pl-11 sm:pl-14 pr-10 text-sm sm:text-base border-2 border-secondary-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/90 backdrop-blur-sm font-medium"
                />
                <motion.div
                  animate={{ rotate: search ? 0 : [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                </motion.div>
                {search && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    type="button"
                    onClick={() => {
                      setSearch('')
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete('search')
                      router.push(`/products?${params.toString()}`)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-secondary-400 hover:text-secondary-600" />
                  </motion.button>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Filter Toggle (Mobile) with Badge */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="sm:hidden flex-1 relative flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {categories.length}
                </motion.div>
              </motion.button>

              {/* Sort with Gradient */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm font-semibold border-2 border-secondary-200 rounded-xl sm:rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/90 backdrop-blur-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
                  </motion.div>
                </motion.div>
              </div>

              {/* View Mode - Desktop with Gradient Background */}
              <div className="hidden sm:flex items-center bg-white border-2 border-secondary-200 rounded-xl overflow-hidden shadow-sm">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-white text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </motion.button>
                <div className="w-px h-6 bg-secondary-200" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-white text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="sm:hidden overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-secondary-100">
                  <h3 className="font-medium text-secondary-900 text-xs mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        !currentCategory
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          currentCategory === category.slug
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                      >
                        {category.name} ({category._count.products})
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar - Modern Glass Design */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sticky top-28 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-2xl" />
              
              <div className="relative">
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full" />
                  <h3 className="font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-secondary-900 to-primary-700">
                    Categories
                  </h3>
                </motion.div>
                
                <ul className="space-y-2">
                  <motion.li
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryChange(null)}
                      className={`w-full text-left px-5 py-3 rounded-xl sm:rounded-2xl transition-all relative overflow-hidden group ${
                        !currentCategory
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      {!currentCategory && (
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                      <span className="relative font-bold">All Products</span>
                    </motion.button>
                  </motion.li>
                  {categories.map((category, i) => (
                    <motion.li
                      key={category.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                      <motion.button
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`w-full text-left px-5 py-3 rounded-xl sm:rounded-2xl transition-all flex items-center justify-between relative overflow-hidden group ${
                          currentCategory === category.slug
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                            : 'text-secondary-700 hover:bg-secondary-50'
                        }`}
                      >
                        {currentCategory === category.slug && (
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                        <span className="relative font-bold">{category.name}</span>
                        <motion.span
                          className={`relative text-sm font-semibold px-2.5 py-1 rounded-full ${
                            currentCategory === category.slug
                              ? 'bg-white/20 text-white'
                              : 'bg-secondary-100 text-secondary-600'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {category._count.products}
                        </motion.span>
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Deals Section */}
            {deals.length > 0 && !currentCategory && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-bold text-secondary-900">Hot Deals</h2>
                  </div>
                  <Link
                    href="/deals"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deals.map((deal) => {
                    const savings = deal.originalPrice - deal.dealPrice
                    const savingsPercent = Math.round((savings / deal.originalPrice) * 100)
                    return (
                      <Link key={deal.id} href={`/deals/${deal.slug}`}>
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200 hover:shadow-lg transition-all group">
                          <div className="flex gap-4">
                            {/* Product Images */}
                            <div className="flex -space-x-3">
                              {deal.items.slice(0, 3).map((item, i) => {
                                const images = item.product?.images ? JSON.parse(item.product.images) : []
                                return (
                                  <div
                                    key={i}
                                    className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border-2 border-white shadow-sm"
                                    style={{ zIndex: 3 - i }}
                                  >
                                    {images[0] ? (
                                      <Image
                                        src={images[0]}
                                        alt={item.product?.name || 'Product'}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                                        <Package className="w-5 h-5 text-secondary-300" />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              {deal.items.length > 3 && (
                                <div className="w-14 h-14 rounded-lg bg-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                  +{deal.items.length - 3}
                                </div>
                              )}
                            </div>
                            {/* Deal Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                                {deal.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-primary-600">
                                  PKR {deal.dealPrice.toLocaleString()}
                                </span>
                                <span className="text-sm text-secondary-400 line-through">
                                  PKR {deal.originalPrice.toLocaleString()}
                                </span>
                              </div>
                              <span className="inline-block mt-1 text-xs font-bold text-white bg-primary-600 px-2 py-0.5 rounded-full">
                                Save {savingsPercent}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {filteredAndSortedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 text-secondary-400" />
                </div>
                <h3 className="text-base sm:text-xl font-heading font-semibold text-secondary-900 mb-2">
                  No products found
                </h3>
                <p className="text-secondary-600 text-sm mb-4 sm:mb-6">
                  Try adjusting your search or filter.
                </p>
                <button
                  onClick={() => {
                    setSearch('')
                    router.push('/products')
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6'
                    : 'space-y-4'
                }
              >
                {filteredAndSortedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
