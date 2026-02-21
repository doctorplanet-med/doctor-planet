'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Plus, Edit, Trash2, X, Phone, MapPin, CreditCard, User, FileText, CheckCircle, XCircle, Receipt, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Shop {
  id: string
  name: string
  ownerName: string | null
  phone: string | null
  address: string | null
  city: string | null
  cnic: string | null
  allowCredit: boolean
  creditLimit: number | null
  currentCredit: number
  isActive: boolean
  notes: string | null
  posOutstanding: number
  udharOutstanding: number
  _count?: {
    sales: number
    udharTransactions: number
  }
  createdAt: string
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    cnic: '',
    allowCredit: false,
    creditLimit: '',
    notes: ''
  })

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const data = await res.json()
        setShops(data)
      }
    } catch (error) {
      toast.error('Failed to load shops')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedShop ? `/api/shops/${selectedShop.id}` : '/api/shops'
      const method = selectedShop ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null
        })
      })

      if (res.ok) {
        toast.success(selectedShop ? 'Shop updated!' : 'Shop added!')
        setShowAddModal(false)
        setSelectedShop(null)
        resetForm()
        fetchShops()
      } else {
        toast.error('Failed to save shop')
      }
    } catch (error) {
      toast.error('Failed to save shop')
    }
  }

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop)
    setFormData({
      name: shop.name,
      ownerName: shop.ownerName || '',
      phone: shop.phone || '',
      address: shop.address || '',
      city: shop.city || '',
      cnic: shop.cnic || '',
      allowCredit: shop.allowCredit,
      creditLimit: shop.creditLimit?.toString() || '',
      notes: shop.notes || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return

    try {
      const res = await fetch(`/api/shops/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Shop deleted')
        fetchShops()
      } else {
        toast.error('Failed to delete shop')
      }
    } catch (error) {
      toast.error('Failed to delete shop')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      ownerName: '',
      phone: '',
      address: '',
      city: '',
      cnic: '',
      allowCredit: false,
      creditLimit: '',
      notes: ''
    })
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Shops</h1>
          <p className="text-secondary-600 mt-1">Manage business customers</p>
        </div>
        <button
          onClick={() => {
            setSelectedShop(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Shop
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <p className="text-secondary-600 text-sm">Total Shops</p>
          <p className="text-2xl font-bold text-secondary-900">{shops.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <p className="text-secondary-600 text-sm">Credit Enabled</p>
          <p className="text-2xl font-bold text-primary-600">{shops.filter(s => s.allowCredit).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <p className="text-secondary-600 text-sm">POS Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">
            PKR {shops.reduce((sum, s) => sum + (s.posOutstanding || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <p className="text-secondary-600 text-sm">Udhar Outstanding</p>
          <p className="text-2xl font-bold text-orange-600">
            PKR {shops.reduce((sum, s) => sum + (s.udharOutstanding || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Shops List */}
      <div className="bg-white rounded-xl border border-secondary-200">
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-500 font-medium">No shops yet</p>
            <p className="text-sm text-secondary-400 mt-1">Add your first business customer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Shop Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Owner / Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Location</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Credit</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">POS Outstanding</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Udhar Outstanding</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Transactions</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-secondary-900">{shop.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {shop.ownerName && <p className="text-sm text-secondary-600">{shop.ownerName}</p>}
                        {shop.phone && (
                          <p className="text-xs text-secondary-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {shop.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {shop.city && (
                        <p className="text-sm text-secondary-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shop.city}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {shop.allowCredit ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 text-secondary-600 rounded text-xs">
                          <XCircle className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {shop.posOutstanding > 0 ? (
                        <span className="font-semibold text-blue-600">
                          PKR {shop.posOutstanding.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {shop.udharOutstanding > 0 ? (
                        <span className="font-semibold text-orange-600">
                          PKR {shop.udharOutstanding.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-xs text-secondary-500">
                          POS: {shop._count?.sales || 0}
                        </span>
                        <span className="text-xs text-secondary-500">
                          Udhar: {shop._count?.udharTransactions || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Link 
                          href={`/salesman/shops/${shop.id}/udhar`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                          Udhar Account
                        </Link>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(shop)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(shop.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-900">
                  {selectedShop ? 'Edit Shop' : 'Add Shop'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedShop(null)
                    resetForm()
                  }}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Phone & CNIC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      CNIC
                    </label>
                    <input
                      type="text"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="12345-1234567-1"
                      className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>

                {/* Address & City */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Credit Settings */}
                <div className="pt-4 border-t border-secondary-200">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="allowCredit"
                      checked={formData.allowCredit}
                      onChange={(e) => setFormData({ ...formData, allowCredit: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-100"
                    />
                    <label htmlFor="allowCredit" className="text-sm font-medium text-secondary-700">
                      Allow Credit / Pay Later
                    </label>
                  </div>

                  {formData.allowCredit && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Credit Limit (PKR)
                      </label>
                      <input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        placeholder="e.g. 50000"
                        className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedShop(null)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {selectedShop ? 'Update' : 'Add'} Shop
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
