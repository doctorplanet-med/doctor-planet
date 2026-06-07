'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Star, Eye, EyeOff, 
  GripVertical, X, Upload, User 
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  name: string
  role: string
  image: string | null
  content: string
  rating: number
  isActive: boolean
  order: number
  createdAt: string
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    content: '',
    rating: 5,
    isActive: true,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTestimonial 
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials'
      
      const res = await fetch(url, {
        method: editingTestimonial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        toast.success(editingTestimonial ? 'Testimonial updated!' : 'Testimonial added!')
        setShowModal(false)
        resetForm()
        fetchTestimonials()
      } else {
        toast.error('Failed to save testimonial')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('Testimonial deleted!')
        fetchTestimonials()
      } else {
        toast.error('Failed to delete testimonial')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testimonial, isActive: !testimonial.isActive }),
      })
      
      if (res.ok) {
        toast.success(testimonial.isActive ? 'Testimonial hidden' : 'Testimonial visible')
        fetchTestimonials()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      image: testimonial.image || '',
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingTestimonial(null)
    setFormData({
      name: '',
      role: '',
      image: '',
      content: '',
      rating: 5,
      isActive: true,
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
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
    }
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
          <h1 className="text-2xl font-bold text-secondary-900">Testimonials</h1>
          <p className="text-secondary-600">Manage customer reviews displayed on the homepage</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <Star className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No testimonials yet</h3>
          <p className="text-secondary-600 mb-4">Add customer reviews to display on your homepage</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg border p-6 ${
                !testimonial.isActive ? 'border-secondary-200 opacity-60' : 'border-secondary-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="text-secondary-400 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {testimonial.image ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-secondary-900">{testimonial.name}</h3>
                      <p className="text-sm text-secondary-600">{testimonial.role}</p>
                      
                      {/* Rating */}
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-secondary-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(testimonial)}
                        className={`p-2 rounded-lg transition-colors ${
                          testimonial.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-secondary-400 hover:bg-secondary-50'
                        }`}
                        title={testimonial.isActive ? 'Hide' : 'Show'}
                      >
                        {testimonial.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => openEditModal(testimonial)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="mt-3 text-secondary-700 line-clamp-2">"{testimonial.content}"</p>
                </div>
              </div>
            </motion.div>
          ))}
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-200 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-secondary-500 mt-1">Or paste image URL below</p>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://... or /uploads/..."
                        className="mt-2 w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Dr. Sarah Mitchell"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                    placeholder="Emergency Medicine Physician"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-secondary-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Review Text *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Write the customer's review here..."
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-primary-600' : 'bg-secondary-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-secondary-700">
                    {formData.isActive ? 'Visible on homepage' : 'Hidden'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
