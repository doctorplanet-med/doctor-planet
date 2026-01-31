'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Barcode, 
  Search, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Package,
  Filter,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Check,
  Download,
  Upload
} from 'lucide-react'
import BarcodeLabel from '@/components/products/barcode-label'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  barcode: string | null
  sku: string | null
  price: number
  salePrice: number | null
  company: string | null
  sizes: string | null
  colors: string | null
  stock: number
  category: {
    id: string
    name: string
  }
  images: string
}

interface Category {
  id: string
  name: string
}

type FilterType = 'all' | 'with-barcode' | 'without-barcode'

export default function AdminBarcodeManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [generatingBarcode, setGeneratingBarcode] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [editingBarcode, setEditingBarcode] = useState<string | null>(null)
  const [editBarcodeValue, setEditBarcodeValue] = useState('')
  
  // Print modal state
  const [printProduct, setPrintProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Generate barcode for a single product
  const generateBarcode = async (productId: string) => {
    setGeneratingBarcode(productId)
    try {
      const prefix = 'DP'
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      const newBarcode = `${prefix}${timestamp}${random}`

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: newBarcode })
      })

      if (res.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, barcode: newBarcode } : p
        ))
        toast.success('Barcode generated!')
      } else {
        toast.error('Failed to generate barcode')
      }
    } catch (error) {
      console.error('Error generating barcode:', error)
      toast.error('Error generating barcode')
    } finally {
      setGeneratingBarcode(null)
    }
  }

  // Update barcode manually
  const updateBarcode = async (productId: string, newBarcode: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: newBarcode || null })
      })

      if (res.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, barcode: newBarcode || null } : p
        ))
        toast.success('Barcode updated!')
        setEditingBarcode(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update barcode')
      }
    } catch (error) {
      console.error('Error updating barcode:', error)
      toast.error('Error updating barcode')
    }
  }

  // Generate barcodes for all products without one
  const generateAllBarcodes = async () => {
    const productsWithoutBarcode = products.filter(p => !p.barcode)
    if (productsWithoutBarcode.length === 0) {
      toast.success('All products already have barcodes!')
      return
    }

    setGeneratingAll(true)
    try {
      const res = await fetch('/api/admin/products/generate-barcodes', {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Generated ${data.updated} barcodes!`)
        fetchProducts() // Refresh the list
      } else {
        toast.error('Failed to generate barcodes')
      }
    } catch (error) {
      console.error('Error generating barcodes:', error)
      toast.error('Error generating barcodes')
    } finally {
      setGeneratingAll(false)
    }
  }

  // Export barcodes to CSV
  const exportToCSV = () => {
    const productsWithBarcode = products.filter(p => p.barcode)
    if (productsWithBarcode.length === 0) {
      toast.error('No products with barcodes to export')
      return
    }

    const csvContent = [
      ['Product Name', 'Barcode', 'SKU', 'Category', 'Price', 'Company'].join(','),
      ...productsWithBarcode.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        p.barcode,
        p.sku || '',
        p.category.name,
        p.salePrice || p.price,
        p.company || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barcodes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV!')
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.company?.toLowerCase().includes(searchQuery.toLowerCase())

    // Barcode filter
    const matchesBarcodeFilter = 
      filterType === 'all' ||
      (filterType === 'with-barcode' && product.barcode) ||
      (filterType === 'without-barcode' && !product.barcode)

    // Category filter
    const matchesCategory = 
      selectedCategory === 'all' || product.category.id === selectedCategory

    return matchesSearch && matchesBarcodeFilter && matchesCategory
  })

  // Statistics
  const stats = {
    total: products.length,
    withBarcode: products.filter(p => p.barcode).length,
    withoutBarcode: products.filter(p => !p.barcode).length
  }

  // Toggle product selection
  const toggleSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProducts(newSelection)
  }

  // Select all filtered products with barcode
  const selectAllWithBarcode = () => {
    const productsWithBarcode = filteredProducts.filter(p => p.barcode)
    setSelectedProducts(new Set(productsWithBarcode.map(p => p.id)))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedProducts(new Set())
  }

  // Get first image from product
  const getProductImage = (product: Product) => {
    try {
      const images = JSON.parse(product.images)
      return images[0] || '/placeholder-product.png'
    } catch {
      return '/placeholder-product.png'
    }
  }

  // Start editing barcode
  const startEditBarcode = (product: Product) => {
    setEditingBarcode(product.id)
    setEditBarcodeValue(product.barcode || '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Barcode className="w-7 h-7 text-primary-600" />
            Barcode Management
          </h1>
          <p className="text-secondary-500 mt-1">Manage, edit, and print product barcodes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>

          {stats.withoutBarcode > 0 && (
            <button
              onClick={generateAllBarcodes}
              disabled={generatingAll}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {generatingAll ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Generate All ({stats.withoutBarcode})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            filterType === 'all' 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-secondary-200 bg-white hover:border-secondary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Package className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-sm text-secondary-500">Total Products</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setFilterType('with-barcode')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            filterType === 'with-barcode' 
              ? 'border-green-500 bg-green-50' 
              : 'border-secondary-200 bg-white hover:border-secondary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.withBarcode}</p>
              <p className="text-sm text-secondary-500">With Barcode</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setFilterType('without-barcode')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            filterType === 'without-barcode' 
              ? 'border-red-500 bg-red-50' 
              : 'border-secondary-200 bg-white hover:border-secondary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.withoutBarcode}</p>
              <p className="text-sm text-secondary-500">Without Barcode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by name, barcode, SKU, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-secondary-300 rounded-xl hover:bg-secondary-50 min-w-[180px]"
          >
            <Filter className="w-5 h-5 text-secondary-500" />
            <span className="flex-1 text-left">
              {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-secondary-400" />
          </button>

          <AnimatePresence>
            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 z-20 py-2"
              >
                <button
                  onClick={() => { setSelectedCategory('all'); setShowFilterDropdown(false) }}
                  className={`w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center justify-between ${
                    selectedCategory === 'all' ? 'text-primary-600 font-medium' : ''
                  }`}
                >
                  All Categories
                  {selectedCategory === 'all' && <Check className="w-4 h-4" />}
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => { setSelectedCategory(category.id); setShowFilterDropdown(false) }}
                    className={`w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center justify-between ${
                      selectedCategory === category.id ? 'text-primary-600 font-medium' : ''
                    }`}
                  >
                    {category.name}
                    {selectedCategory === category.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedProducts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-primary-50 border border-primary-200 rounded-xl"
        >
          <span className="text-sm font-medium text-primary-700">
            {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={clearSelection}
            className="text-sm text-secondary-600 hover:text-secondary-800"
          >
            Clear
          </button>
          <button
            onClick={selectAllWithBarcode}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Select All with Barcode
          </button>
        </motion.div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.filter(p => p.barcode).length && selectedProducts.size > 0}
                    onChange={(e) => e.target.checked ? selectAllWithBarcode() : clearSelection()}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 min-w-[200px]">Barcode</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700">Variants</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Barcode className="w-12 h-12 text-secondary-300" />
                      <p className="text-secondary-500">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const hasColors = product.colors && JSON.parse(product.colors).length > 0
                  const hasSizes = product.sizes && JSON.parse(product.sizes).length > 0
                  const hasCompany = !!product.company
                  const isEditing = editingBarcode === product.id

                  return (
                    <tr key={product.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelection(product.id)}
                          disabled={!product.barcode}
                          className="w-4 h-4 text-primary-600 rounded disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-secondary-100"
                          />
                          <div>
                            <p className="font-medium text-secondary-900 line-clamp-1">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-secondary-500">SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editBarcodeValue}
                              onChange={(e) => setEditBarcodeValue(e.target.value.toUpperCase())}
                              placeholder="Enter barcode..."
                              className="px-2 py-1 border border-secondary-300 rounded text-sm font-mono w-32 focus:ring-2 focus:ring-primary-500"
                              autoFocus
                            />
                            <button
                              onClick={() => updateBarcode(product.id, editBarcodeValue)}
                              className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingBarcode(null)}
                              className="p-1 bg-secondary-100 text-secondary-600 rounded hover:bg-secondary-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : product.barcode ? (
                          <div className="flex items-center gap-2">
                            <code 
                              onClick={() => startEditBarcode(product)}
                              className="px-2 py-1 bg-secondary-100 rounded text-sm font-mono cursor-pointer hover:bg-secondary-200"
                              title="Click to edit"
                            >
                              {product.barcode}
                            </code>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => startEditBarcode(product)}
                              className="text-sm text-secondary-400 cursor-pointer hover:text-secondary-600"
                            >
                              Click to add
                            </span>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-secondary-100 rounded-full text-xs text-secondary-600">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {hasColors && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              Colors
                            </span>
                          )}
                          {hasSizes && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              Sizes
                            </span>
                          )}
                          {hasCompany && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {product.company}
                            </span>
                          )}
                          {!hasColors && !hasSizes && !hasCompany && (
                            <span className="text-xs text-secondary-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {product.barcode ? (
                            <button
                              onClick={() => setPrintProduct(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                              Print
                            </button>
                          ) : (
                            <button
                              onClick={() => generateBarcode(product.id)}
                              disabled={generatingBarcode === product.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm font-medium transition-colors"
                            >
                              {generatingBarcode === product.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              Generate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-secondary-500 text-center">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Print Modal */}
      {printProduct && (
        <BarcodeLabel
          isOpen={!!printProduct}
          onClose={() => setPrintProduct(null)}
          product={printProduct}
        />
      )}

      {/* Click outside to close dropdown */}
      {showFilterDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  )
}
