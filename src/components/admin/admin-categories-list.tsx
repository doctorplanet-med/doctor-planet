'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  X,
  Loader2,
  ImageIcon,
  Upload,
  Link as LinkIcon,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import RichTextEditor from '@/components/admin/rich-text-editor'
import RichTextDisplay from '@/components/rich-text-display'

interface SubCategory {
  id: string
  name: string
  slug: string
  order: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  order: number
  _count: { products: number }
}

interface AdminCategoriesListProps {
  categories: Category[]
}

export default function AdminCategoriesList({ categories: initialCategories }: AdminCategoriesListProps) {
  const sorted = [...initialCategories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  const [categories, setCategories] = useState(sorted)
  const [orderDirty, setOrderDirty] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  })

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const next = direction === 'up' ? index - 1 : index + 1
    if (next < 0 || next >= categories.length) return
    const updated = [...categories]
    ;[updated[index], updated[next]] = [updated[next], updated[index]]
    setCategories(updated)
    setOrderDirty(true)
  }

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    const updated = [...categories]
    const [item] = updated.splice(from, 1)
    updated.splice(index, 0, item)
    dragIndexRef.current = index
    setCategories(updated)
    setOrderDirty(true)
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
  }

  const saveOrder = async () => {
    setIsSavingOrder(true)
    try {
      const payload = categories.map((cat, i) => ({ id: cat.id, order: i }))
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: payload }),
      })
      if (!res.ok) throw new Error('Failed')
      setCategories(categories.map((cat, i) => ({ ...cat, order: i })))
      setOrderDirty(false)
      toast.success('Order saved! Navbar updated.')
    } catch {
      toast.error('Failed to save order')
    } finally {
      setIsSavingOrder(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '' })
    setEditingCategory(null)
    setImageInputType('upload')
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      })
      // If category has an image URL, show URL input type
      if (category.image) {
        setImageInputType('url')
      }
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }

    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'categories')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await response.json()
      setFormData(prev => ({ ...prev, image: url }))
      toast.success('Image uploaded!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleImageUpload({ target: input } as any)
      }
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories'
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated!' : 'Category created!')
        setShowModal(false)
        resetForm()
        window.location.reload()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to save category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure? This will affect all products in this category.')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Category deleted!')
        setCategories(categories.filter(c => c.id !== categoryId))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  // ── Subcategory panel state ──
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null)
  const [subsByCategory, setSubsByCategory] = useState<Record<string, SubCategory[]>>({})
  const [subLoading, setSubLoading] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [editSubName, setEditSubName] = useState('')

  const generateSlugFrom = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const toggleSubPanel = async (catId: string) => {
    if (expandedCatId === catId) { setExpandedCatId(null); return }
    setExpandedCatId(catId)
    if (!subsByCategory[catId]) {
      setSubLoading(catId)
      try {
        const res = await fetch(`/api/admin/categories/${catId}/subcategories`)
        const data = await res.json()
        setSubsByCategory(prev => ({ ...prev, [catId]: Array.isArray(data) ? data : [] }))
      } finally { setSubLoading(null) }
    }
  }

  const addSub = async (catId: string) => {
    const name = newSubName.trim()
    if (!name) return
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: generateSlugFrom(name) }),
      })
      if (res.ok) {
        const created = await res.json()
        setSubsByCategory(prev => ({ ...prev, [catId]: [...(prev[catId] || []), created] }))
        setNewSubName('')
        toast.success('Subcategory added!')
      } else {
        const d = await res.json(); toast.error(d.error || 'Failed')
      }
    } catch { toast.error('Failed to add') }
  }

  const deleteSub = async (catId: string, subId: string) => {
    if (!confirm('Delete this subcategory?')) return
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${subId}`, { method: 'DELETE' })
      if (res.ok) {
        setSubsByCategory(prev => ({ ...prev, [catId]: prev[catId].filter(s => s.id !== subId) }))
        toast.success('Deleted')
      }
    } catch { toast.error('Failed') }
  }

  const saveSub = async (catId: string) => {
    if (!editingSub) return
    const name = editSubName.trim()
    if (!name) return
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${editingSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: generateSlugFrom(name) }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSubsByCategory(prev => ({ ...prev, [catId]: prev[catId].map(s => s.id === updated.id ? updated : s) }))
        setEditingSub(null)
        toast.success('Updated')
      }
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Categories</h1>
          <p className="text-secondary-600 mt-1">{categories.length} categories in your store</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-secondary-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}
              title="List view (drag to reorder)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          {/* Save order button — only visible when order changed */}
          <AnimatePresence>
            {orderDirty && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={saveOrder}
                disabled={isSavingOrder}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {isSavingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Order
              </motion.button>
            )}
          </AnimatePresence>

          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Reorder hint */}
      {viewMode === 'list' && categories.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-secondary-500 bg-secondary-50 rounded-xl px-4 py-2.5">
          <GripVertical className="w-4 h-4" />
          Drag rows or use ↑↓ arrows to reorder — the navbar updates in the same order.
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="relative h-40 bg-secondary-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderTree className="w-16 h-16 text-secondary-300" />
                  </div>
                )}
                {/* Order badge */}
                <div className="absolute top-2 left-2 w-7 h-7 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-lg text-secondary-900">
                  {category.name}
                </h3>
                <div className="text-sm text-secondary-500 mt-1 line-clamp-2">
                  <RichTextDisplay content={category.description || 'No description'} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-primary-600 font-medium">
                    {category._count.products} products
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSubPanel(category.id)}
                      className="flex items-center gap-1 px-2 py-1.5 text-xs text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-secondary-200"
                    >
                      <Tag className="w-3 h-3" />
                      Subcategories
                      {expandedCatId === category.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Inline Subcategory Panel ── */}
                <AnimatePresence>
                  {expandedCatId === category.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-secondary-100">
                        {subLoading === category.id ? (
                          <div className="flex items-center gap-2 text-sm text-secondary-400 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                          </div>
                        ) : (
                          <>
                            {/* Existing subcategories */}
                            <ul className="space-y-1.5 mb-3">
                              {(subsByCategory[category.id] || []).map(sub => (
                                <li key={sub.id} className="flex items-center gap-2">
                                  {editingSub?.id === sub.id ? (
                                    <>
                                      <input
                                        autoFocus
                                        value={editSubName}
                                        onChange={e => setEditSubName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveSub(category.id); if (e.key === 'Escape') setEditingSub(null) }}
                                        className="flex-1 text-sm px-2 py-1 border border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                      />
                                      <button onClick={() => saveSub(category.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setEditingSub(null)} className="p-1 text-secondary-400 hover:bg-secondary-100 rounded">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="flex-1 text-sm text-secondary-700 bg-secondary-50 px-2 py-1 rounded-lg">{sub.name}</span>
                                      <button onClick={() => { setEditingSub(sub); setEditSubName(sub.name) }} className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => deleteSub(category.id, sub.id)} className="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </li>
                              ))}
                              {(subsByCategory[category.id] || []).length === 0 && (
                                <li className="text-xs text-secondary-400 italic">No subcategories yet</li>
                              )}
                            </ul>

                            {/* Add new subcategory */}
                            <div className="flex gap-2">
                              <input
                                value={expandedCatId === category.id ? newSubName : ''}
                                onChange={e => setNewSubName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addSub(category.id) }}
                                placeholder="New subcategory..."
                                className="flex-1 text-sm px-2 py-1.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              />
                              <button
                                onClick={() => addSub(category.id)}
                                className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── LIST VIEW (reorder) ── */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-4 px-4 py-3 border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors cursor-grab active:cursor-grabbing group"
            >
              {/* Drag handle */}
              <GripVertical className="w-5 h-5 text-secondary-300 group-hover:text-secondary-500 shrink-0" />

              {/* Position number */}
              <span className="w-6 text-center text-sm font-semibold text-secondary-400 shrink-0">
                {index + 1}
              </span>

              {/* Image */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 shrink-0">
                {category.image ? (
                  <Image src={category.image} alt={category.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderTree className="w-5 h-5 text-secondary-300" />
                  </div>
                )}
              </div>

              {/* Name & products */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900">{category.name}</p>
                <p className="text-xs text-secondary-400">{category._count.products} products</p>
              </div>

              {/* Up / Down arrows */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveCategory(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg text-secondary-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1.5 rounded-lg text-secondary-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Edit / Delete */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <FolderTree className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">No categories yet. Create your first one!</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h3 className="text-xl font-heading font-semibold text-secondary-900">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingCategory ? formData.slug : generateSlug(e.target.value),
                      })
                    }}
                    placeholder="Medical Clothes"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="medical-clothes"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Category description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category Image
                  </label>
                  
                  {/* Image Type Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageInputType('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        imageInputType === 'upload'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputType('url')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        imageInputType === 'url'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      URL
                    </button>
                  </div>

                  {imageInputType === 'upload' ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-secondary-300 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="py-4">
                          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                          <p className="text-sm text-secondary-500">Uploading...</p>
                        </div>
                      ) : formData.image ? (
                        <div className="relative">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
                            <Image
                              src={formData.image}
                              alt="Preview"
                              fill
                              sizes="400px"
                              className="object-cover"
                            />
                          </div>
                          <p className="text-xs text-secondary-500">Click or drag to replace</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormData(prev => ({ ...prev, image: '' }))
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                          <p className="text-sm text-secondary-600 font-medium">Click or drag image here</p>
                          <p className="text-xs text-secondary-400 mt-1">PNG, JPG, WebP up to 10MB</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="input-field pl-12"
                        />
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      </div>
                      {formData.image && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-secondary-200">
                          <Image
                            src={formData.image}
                            alt="Preview"
                            fill
                            sizes="400px"
                            className="object-cover"
                            onError={() => {
                              // Handle invalid image URL
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingCategory ? (
                      'Update'
                    ) : (
                      'Create'
                    )}
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
