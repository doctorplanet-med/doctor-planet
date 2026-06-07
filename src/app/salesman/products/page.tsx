'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Package, Search, Plus, Edit2, Eye, X, Save, 
  DollarSign, TrendingUp, AlertCircle, Barcode, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'
import BarcodeLabel from '@/components/products/barcode-label'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  barcode: string | null
  sku: string | null
  company: string | null
  description: string
  costPrice: number
  price: number
  salePrice: number | null
  images: string
  stock: number
  sizes: string | null
  colors: string | null
  colorSizeStock: string | null
  isActive: boolean
  category: Category
  createdAt: string
}

export default function SalesmanProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    costPrice: '',
    price: '',
    salePrice: '',
    stock: '',
  })
  const [saving, setSaving] = useState(false)
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null)
  const [generatingBarcodes, setGeneratingBarcodes] = useState(false)

  // Count products without barcodes
  const productsWithoutBarcode = products.filter(p => !p.barcode).length

  const generateBarcodes = async () => {
    if (!confirm(`Generate barcodes for ${productsWithoutBarcode} products without barcodes?`)) return
    
    setGeneratingBarcodes(true)
    try {
      const res = await fetch('/api/admin/products/generate-barcodes', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        fetchProducts()
      } else {
        toast.error('Failed to generate barcodes')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setGeneratingBarcodes(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term) ||
      product.barcode?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.company?.toLowerCase().includes(term)
    )
  })

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      costPrice: product.costPrice?.toString() || '0',
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      stock: product.stock.toString(),
    })
  }

  const handleSave = async () => {
    if (!editingProduct) return
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costPrice: parseFloat(editForm.costPrice) || 0,
          price: parseFloat(editForm.price),
          salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) : null,
          stock: parseInt(editForm.stock) || 0,
        }),
      })

      if (res.ok) {
        toast.success('Product updated!')
        fetchProducts()
        setEditingProduct(null)
      } else {
        toast.error('Failed to update product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // Calculate stats
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const lowStockProducts = products.filter(p => p.stock < 10).length
  const totalValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-primary-600" />
            Products
          </h1>
          <p className="text-secondary-600">Manage product prices and stock</p>
        </div>
        <div className="flex items-center gap-3">
          {productsWithoutBarcode > 0 && (
            <button
              onClick={generateBarcodes}
              disabled={generatingBarcodes}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
            >
              <Barcode className="w-5 h-5" />
              {generatingBarcodes ? 'Generating...' : `Generate Barcodes (${productsWithoutBarcode})`}
            </button>
          )}
          <Link
            href="/salesman/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-secondary-600">Total Products</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{totalProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-secondary-600">Active Products</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{activeProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-secondary-600">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{lowStockProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Inventory Value</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Category</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Cost Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Sale Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Profit</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Stock</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredProducts.map((product, index) => {
                const images = JSON.parse(product.images || '[]')
                const sellingPrice = product.salePrice || product.price
                const profit = sellingPrice - (product.costPrice || 0)
                const profitPercent = product.costPrice ? ((profit / product.costPrice) * 100).toFixed(1) : '0'
                
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-secondary-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary-100">
                          {images[0] && (
                            <Image
                              src={images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{product.name}</p>
                          {product.company && (
                            <p className="text-xs text-blue-600">{product.company}</p>
                          )}
                          {product.barcode && (
                            <p className="text-[10px] text-secondary-400 font-mono flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              {product.barcode}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-secondary-600">{product.category.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-secondary-600">{formatCurrency(product.costPrice || 0)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="font-medium text-secondary-900">{formatCurrency(sellingPrice)}</p>
                        {product.salePrice && (
                          <p className="text-xs text-secondary-400 line-through">{formatCurrency(product.price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </p>
                        <p className="text-xs text-secondary-500">{profitPercent}%</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                        product.stock < 10 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Edit Prices"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setBarcodeProduct(product)}
                          className="p-2 text-secondary-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Print Barcode"
                          disabled={!product.barcode}
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No products found</p>
          </div>
        )}
      </div>

      {/* View Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-secondary-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary-900">Product Details</h2>
                <button onClick={() => setSelectedProduct(null)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Product Image */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-secondary-100">
                  {JSON.parse(selectedProduct.images || '[]')[0] && (
                    <Image
                      src={JSON.parse(selectedProduct.images)[0]}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">{selectedProduct.name}</h3>
                  <p className="text-secondary-500">{selectedProduct.category.name}</p>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary-50 p-4 rounded-xl">
                    <p className="text-sm text-secondary-500">Cost Price</p>
                    <p className="text-xl font-bold text-secondary-900">
                      {formatCurrency(selectedProduct.costPrice || 0)}
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-xl">
                    <p className="text-sm text-secondary-500">Sale Price</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatCurrency(selectedProduct.salePrice || selectedProduct.price)}
                    </p>
                  </div>
                </div>

                {/* Profit */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600">Profit per Unit</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency((selectedProduct.salePrice || selectedProduct.price) - (selectedProduct.costPrice || 0))}
                  </p>
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <span className="text-secondary-600">Current Stock</span>
                  <span className={`text-2xl font-bold ${
                    selectedProduct.stock === 0 ? 'text-red-600' :
                    selectedProduct.stock < 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedProduct.stock}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedProduct(null)
                    openEditModal(selectedProduct)
                  }}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-secondary-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary-100">
                    {JSON.parse(editingProduct.images || '[]')[0] && (
                      <Image
                        src={JSON.parse(editingProduct.images)[0]}
                        alt={editingProduct.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{editingProduct.name}</p>
                    <p className="text-sm text-secondary-500">{editingProduct.category.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Cost Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={editForm.costPrice}
                    onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 mt-1">What you pay to buy this product</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Sale Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 mt-1">Regular selling price</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Discount Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={editForm.salePrice}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Leave empty if no discount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Profit Preview */}
                {editForm.costPrice && editForm.price && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-green-600">Profit per Unit</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency((parseFloat(editForm.salePrice || editForm.price) - parseFloat(editForm.costPrice)))}
                      <span className="text-sm font-normal ml-2">
                        ({(((parseFloat(editForm.salePrice || editForm.price) - parseFloat(editForm.costPrice)) / parseFloat(editForm.costPrice)) * 100).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-secondary-300 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Label Modal */}
      {barcodeProduct && (
        <BarcodeLabel
          isOpen={!!barcodeProduct}
          onClose={() => setBarcodeProduct(null)}
          product={{
            name: barcodeProduct.name,
            barcode: barcodeProduct.barcode,
            price: barcodeProduct.price,
            salePrice: barcodeProduct.salePrice,
            company: barcodeProduct.company,
            sizes: barcodeProduct.sizes,
            colors: barcodeProduct.colors,
          }}
        />
      )}
    </div>
  )
}
