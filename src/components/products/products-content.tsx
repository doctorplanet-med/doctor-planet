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
    <div className="min-h-screen pt-0 sm:pt-20 pb-16 lg:pb-0 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-2 sm:py-6">
        {/* Header - Compact on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 sm:mb-6"
        >
          <h1 className="text-base sm:text-3xl md:text-4xl font-heading font-bold text-secondary-900">
            {currentCategoryName}
          </h1>
          <p className="text-secondary-600 text-[11px] sm:text-base mt-0.5 sm:mt-2">
            {filteredAndSortedProducts.length} products found
          </p>
        </motion.div>

        {/* Filters Bar - Compact on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-2.5 sm:p-4 mb-4 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
            {/* Search - Compact on Mobile */}
            <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 sm:py-2.5 pl-9 sm:pl-12 pr-8 text-sm border border-secondary-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-secondary-400" />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete('search')
                      router.push(`/products?${params.toString()}`)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-secondary-400 hover:text-secondary-600" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="sm:hidden flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-secondary-700 bg-secondary-100 rounded-lg"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>

              {/* Sort - Compact on Mobile */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 pr-8 text-xs sm:text-sm border border-secondary-200 rounded-lg sm:rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
              </div>

              {/* View Mode - Desktop Only */}
              <div className="hidden sm:flex items-center border border-secondary-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
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
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
              <h3 className="font-heading font-semibold text-lg text-secondary-900 mb-4">
                Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      !currentCategory
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-secondary-600 hover:bg-secondary-50'
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        currentCategory === category.slug
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      {category.name}
                      <span className="text-sm text-secondary-400">
                        {category._count.products}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
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
