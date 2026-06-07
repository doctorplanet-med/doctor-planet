'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Plus, Edit2, Trash2, X, User, Phone, Mail, 
  Eye, EyeOff, ShoppingBag, DollarSign, Calendar,
  Key, UserCheck, UserX, MapPin, CreditCard, Users, Upload, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Salesman {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  address: string | null
  cnic: string | null
  gender: string | null
  granterName: string | null
  granterPhone: string | null
  isActive: boolean
  createdAt: string
  totalSales: number
  salesCount: number
}

export default function AdminSalesmenPage() {
  const [salesmen, setSalesmen] = useState<Salesman[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingSalesman, setViewingSalesman] = useState<Salesman | null>(null)
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    image: '',
    address: '',
    cnic: '',
    gender: '',
    granterName: '',
    granterPhone: '',
    isActive: true,
  })

  useEffect(() => {
    fetchSalesmen()
  }, [])

  const fetchSalesmen = async () => {
    try {
      const res = await fetch('/api/admin/salesmen')
      if (res.ok) {
        const data = await res.json()
        setSalesmen(data)
      }
    } catch (error) {
      toast.error('Failed to fetch salesmen')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    if (!editingSalesman && !formData.password) {
      toast.error('Password is required for new salesman')
      return
    }

    try {
      const url = editingSalesman 
        ? `/api/admin/salesmen/${editingSalesman.id}`
        : '/api/admin/salesmen'

      const res = await fetch(url, {
        method: editingSalesman ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(editingSalesman ? 'Salesman updated!' : 'Salesman created!')
        setShowModal(false)
        resetForm()
        fetchSalesmen()
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salesman?')) return

    try {
      const res = await fetch(`/api/admin/salesmen/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || 'Salesman deleted!')
        fetchSalesmen()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete salesman')
    }
  }

  const toggleStatus = async (salesman: Salesman) => {
    try {
      const res = await fetch(`/api/admin/salesmen/${salesman.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...salesman, isActive: !salesman.isActive }),
      })

      if (res.ok) {
        toast.success(salesman.isActive ? 'Salesman deactivated' : 'Salesman activated')
        fetchSalesmen()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const openEditModal = (salesman: Salesman) => {
    setEditingSalesman(salesman)
    setFormData({
      name: salesman.name,
      email: salesman.email,
      phone: salesman.phone || '',
      password: '',
      image: salesman.image || '',
      address: salesman.address || '',
      cnic: salesman.cnic || '',
      gender: salesman.gender || '',
      granterName: salesman.granterName || '',
      granterPhone: salesman.granterPhone || '',
      isActive: salesman.isActive,
    })
    setShowModal(true)
  }

  const openViewModal = (salesman: Salesman) => {
    setViewingSalesman(salesman)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setEditingSalesman(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      image: '',
      address: '',
      cnic: '',
      gender: '',
      granterName: '',
      granterPhone: '',
      isActive: true,
    })
    setShowPassword(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, or WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)')
      return
    }

    setUploading(true)
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success('Image uploaded!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Stats
  const totalSalesmen = salesmen.length
  const activeSalesmen = salesmen.filter(s => s.isActive).length
  const totalPOSSales = salesmen.reduce((sum, s) => sum + s.totalSales, 0)
  const totalTransactions = salesmen.reduce((sum, s) => sum + s.salesCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Salesmen Management</h1>
          <p className="text-secondary-600">Manage POS salesmen for your physical store</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Salesman
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-secondary-600">Total Salesmen</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{totalSalesmen}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-secondary-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{activeSalesmen}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-secondary-600">Total POS Sales</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalPOSSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-secondary-600">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{totalTransactions}</p>
        </div>
      </div>

      {/* Salesmen List */}
      {salesmen.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
          <User className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No salesmen yet</h3>
          <p className="text-secondary-600 mb-4">Add your first salesman for POS operations</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add First Salesman
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Salesman</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Sales</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {salesmen.map((salesman, index) => (
                <motion.tr
                  key={salesman.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {salesman.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={salesman.image}
                            alt={salesman.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-secondary-900">{salesman.name}</p>
                        <p className="text-xs text-secondary-500">
                          {salesman.cnic || 'No CNIC'} • {salesman.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-secondary-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {salesman.email}
                      </p>
                      {salesman.phone && (
                        <p className="text-sm text-secondary-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {salesman.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-secondary-900">
                        {formatCurrency(salesman.totalSales)}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {salesman.salesCount} transactions
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      salesman.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {salesman.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openViewModal(salesman)}
                        className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(salesman)}
                        className={`p-2 rounded-lg transition-colors ${
                          salesman.isActive 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={salesman.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {salesman.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => openEditModal(salesman)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(salesman.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">
                  {editingSalesman ? 'Edit Salesman' : 'Add New Salesman'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {formData.image ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-primary-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-secondary-500 mt-2">Click to upload profile picture</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="salesman@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      CNIC *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="text"
                        value={formData.cnic}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnic: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="12345-1234567-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Password {editingSalesman ? '(leave blank to keep current)' : '*'}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required={!editingSalesman}
                        className="w-full pl-10 pr-12 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder={editingSalesman ? '••••••••' : 'Create password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Full address"
                    />
                  </div>
                </div>

                {/* Granter Info (Optional) */}
                <div className="border-t border-secondary-200 pt-4">
                  <p className="text-sm font-medium text-secondary-700 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Granter / Guardian Information (Optional)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Granter Name
                      </label>
                      <input
                        type="text"
                        value={formData.granterName}
                        onChange={(e) => setFormData(prev => ({ ...prev, granterName: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Guardian name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Granter Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.granterPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, granterPhone: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>

                {editingSalesman && (
                  <div className="flex items-center gap-3 border-t border-secondary-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-green-500' : 'bg-secondary-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-sm text-secondary-700">
                      {formData.isActive ? 'Active (can login)' : 'Inactive (cannot login)'}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-secondary-200 -mx-6 px-6 py-4 -mb-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingSalesman ? 'Update' : 'Create'} Salesman
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && viewingSalesman && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">Salesman Details</h2>
                <button onClick={() => setShowViewModal(false)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  {viewingSalesman.image ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden">
                      <Image
                        src={viewingSalesman.image}
                        alt={viewingSalesman.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">{viewingSalesman.name}</h3>
                    <p className="text-secondary-500">{viewingSalesman.gender || 'N/A'}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      viewingSalesman.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {viewingSalesman.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-xs text-secondary-500">Email</p>
                    <p className="font-medium text-secondary-900">{viewingSalesman.email}</p>
                  </div>
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-xs text-secondary-500">Phone</p>
                    <p className="font-medium text-secondary-900">{viewingSalesman.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-xs text-secondary-500">CNIC</p>
                    <p className="font-medium text-secondary-900">{viewingSalesman.cnic || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-xs text-secondary-500">Joined</p>
                    <p className="font-medium text-secondary-900">
                      {new Date(viewingSalesman.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <p className="text-xs text-secondary-500">Address</p>
                  <p className="font-medium text-secondary-900">{viewingSalesman.address || 'N/A'}</p>
                </div>

                {/* Granter Info */}
                {(viewingSalesman.granterName || viewingSalesman.granterPhone) && (
                  <div className="border-t border-secondary-200 pt-4">
                    <p className="text-sm font-medium text-secondary-700 mb-3">Granter Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <p className="text-xs text-secondary-500">Granter Name</p>
                        <p className="font-medium text-secondary-900">{viewingSalesman.granterName || 'N/A'}</p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <p className="text-xs text-secondary-500">Granter Phone</p>
                        <p className="font-medium text-secondary-900">{viewingSalesman.granterPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sales Stats */}
                <div className="border-t border-secondary-200 pt-4">
                  <p className="text-sm font-medium text-secondary-700 mb-3">Sales Performance</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary-600">{formatCurrency(viewingSalesman.totalSales)}</p>
                      <p className="text-sm text-secondary-600">Total Sales</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{viewingSalesman.salesCount}</p>
                      <p className="text-sm text-secondary-600">Transactions</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowViewModal(false)
                    openEditModal(viewingSalesman)
                  }}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Salesman
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
