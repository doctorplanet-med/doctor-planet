'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Tag,
  Calendar,
  Percent,
  Loader2,
  AlertCircle,
  Check,
  ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  salePrice: number | null
  images: string
  stock: number
}

interface DealItem {
  id: string
  productId: string
  quantity: number
  product?: Product
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
  createdAt: string
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    dealPrice: '',
    isActive: true,
    startDate: '',
    endDate: '',
  })
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchDeals()
    fetchProducts()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/admin/deals')
      if (res.ok) {
        const data = await res.json()
        setDeals(data)
      }
    } catch (error) {
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to load products')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      dealPrice: '',
      isActive: true,
      startDate: '',
      endDate: '',
    })
    setSelectedProducts([])
    setEditingDeal(null)
    setProductSearch('')
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal)
    setFormData({
      name: deal.name,
      description: deal.description || '',
      image: deal.image || '',
      dealPrice: deal.dealPrice.toString(),
      isActive: deal.isActive,
      startDate: deal.startDate ? deal.startDate.split('T')[0] : '',
      endDate: deal.endDate ? deal.endDate.split('T')[0] : '',
    })
    setSelectedProducts(
      deal.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    )
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: data.url }))
        toast.success('Image uploaded')
      } else {
        toast.error(data.error || 'Failed to upload image')
        console.error('Upload error:', data)
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const addProduct = (productId: string) => {
    if (selectedProducts.some((p) => p.productId === productId)) {
      toast.error('Product already added')
      return
    }
    setSelectedProducts([...selectedProducts, { productId, quantity: 1 }])
    setProductSearch('')
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      )
    )
  }

  const calculateOriginalPrice = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        const price = product.salePrice || product.price
        return total + price * item.quantity
      }
      return total
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedProducts.length < 2) {
      toast.error('Please select at least 2 products for a deal')
      return
    }

    if (!formData.dealPrice || parseFloat(formData.dealPrice) <= 0) {
      toast.error('Please enter a valid deal price')
      return
    }

    setSaving(true)
    try {
      const url = editingDeal
        ? `/api/admin/deals/${editingDeal.id}`
        : '/api/admin/deals'
      const method = editingDeal ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dealPrice: parseFloat(formData.dealPrice),
          items: selectedProducts,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      if (res.ok) {
        toast.success(editingDeal ? 'Deal updated!' : 'Deal created!')
        setShowModal(false)
        resetForm()
        fetchDeals()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save deal')
      }
    } catch (error) {
      toast.error('Failed to save deal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Deal deleted!')
        setDeals(deals.filter((d) => d.id !== id))
      } else {
        toast.error('Failed to delete deal')
      }
    } catch (error) {
      toast.error('Failed to delete deal')
    } finally {
      setDeleting(null)
    }
  }

  const filteredDeals = deals.filter((deal) =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !selectedProducts.some((p) => p.productId === product.id)
  )

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Deals</h1>
          <p className="text-secondary-500">Create and manage product bundles with special prices</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Deal
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search deals..."
          className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
          <Tag className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No deals yet</h3>
          <p className="text-secondary-500 mb-4">Create your first product bundle deal</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Deal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const savings = deal.originalPrice - deal.dealPrice
            const savingsPercent = Math.round((savings / deal.originalPrice) * 100)

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-secondary-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Deal Image */}
                <div className="relative aspect-video bg-secondary-100">
                  {deal.image ? (
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-12 h-12 text-secondary-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                    deal.isActive ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600'
                  }`}>
                    {deal.isActive ? 'Active' : 'Inactive'}
                  </div>
                  {/* Savings Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-bold">
                    Save {savingsPercent}%
                  </div>
                </div>

                {/* Deal Info */}
                <div className="p-4">
                  <h3 className="font-bold text-secondary-900 mb-2">{deal.name}</h3>
                  {deal.description && (
                    <p className="text-sm text-secondary-500 mb-3 line-clamp-2">{deal.description}</p>
                  )}

                  {/* Products in deal */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {deal.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded"
                      >
                        {item.product?.name?.slice(0, 20) || 'Product'}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                    ))}
                    {deal.items.length > 3 && (
                      <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded">
                        +{deal.items.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-primary-600">
                      {formatCurrency(deal.dealPrice)}
                    </span>
                    <span className="text-sm text-secondary-400 line-through">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>

                  {/* Date Range */}
                  {(deal.startDate || deal.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-secondary-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {deal.startDate && new Date(deal.startDate).toLocaleDateString()}
                        {deal.startDate && deal.endDate && ' - '}
                        {deal.endDate && new Date(deal.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(deal)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      disabled={deleting === deal.id}
                      className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === deal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-900">
                  {editingDeal ? 'Edit Deal' : 'Create New Deal'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Deal Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Doctor Starter Kit"
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what's included in this deal..."
                    rows={2}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Deal Image */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Deal Image
                  </label>
                  <div className="flex gap-4">
                    {formData.image ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary-100">
                        <Image
                          src={formData.image}
                          alt="Deal image"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-secondary-400" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-secondary-400" />
                            <span className="text-xs text-secondary-500 mt-1">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Select Products */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Select Products * (minimum 2)
                  </label>
                  
                  {/* Product Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products to add..."
                      className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Product Search Results */}
                  {productSearch && filteredProducts.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-secondary-200 rounded-lg mb-3">
                      {filteredProducts.slice(0, 5).map((product) => {
                        const images = JSON.parse(product.images)
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product.id)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-secondary-50 transition-colors"
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-secondary-100">
                              <Image
                                src={images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-primary-600">
                                {formatCurrency(product.salePrice || product.price)}
                              </p>
                            </div>
                            <Plus className="w-5 h-5 text-primary-600" />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Selected Products */}
                  {selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      {selectedProducts.map((item) => {
                        const product = products.find((p) => p.id === item.productId)
                        if (!product) return null
                        const images = JSON.parse(product.images)
                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-3 p-2 bg-secondary-50 rounded-lg"
                          >
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-white">
                              <Image
                                src={images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-secondary-500">
                                {formatCurrency(product.salePrice || product.price)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border border-secondary-200 rounded hover:bg-secondary-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border border-secondary-200 rounded hover:bg-secondary-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProduct(item.productId)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedProducts.length < 2 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Add at least {2 - selectedProducts.length} more product(s)
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Original Price
                    </label>
                    <div className="px-4 py-2 bg-secondary-100 rounded-lg text-secondary-600">
                      {formatCurrency(calculateOriginalPrice())}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Deal Price *
                    </label>
                    <input
                      type="number"
                      value={formData.dealPrice}
                      onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* Savings Preview */}
                {formData.dealPrice && calculateOriginalPrice() > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                    <Percent className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Customers save {formatCurrency(calculateOriginalPrice() - parseFloat(formData.dealPrice || '0'))}
                      </p>
                      <p className="text-xs text-green-600">
                        {Math.round(((calculateOriginalPrice() - parseFloat(formData.dealPrice || '0')) / calculateOriginalPrice()) * 100)}% discount
                      </p>
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Start Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-500' : 'bg-secondary-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        formData.isActive ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-secondary-700">
                    {formData.isActive ? 'Deal is active' : 'Deal is inactive'}
                  </span>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="p-6 border-t border-secondary-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-secondary-300 rounded-xl font-medium hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || selectedProducts.length < 2}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingDeal ? 'Update Deal' : 'Create Deal'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
