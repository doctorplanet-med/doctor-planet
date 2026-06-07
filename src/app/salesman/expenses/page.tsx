'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Receipt,
  Image as ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  amount: number
  description: string
  category: string | null
  expenseDate: string
  image: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string | null; role: string }
}

const defaultForm = {
  amount: '',
  description: '',
  category: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  image: '',
}

export default function SalesmanExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState(defaultForm)
  const [uploading, setUploading] = useState(false)

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/admin/expenses')
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      } else toast.error('Failed to load expenses')
    } catch {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    try {
      const url = editingExpense
        ? `/api/admin/expenses/${editingExpense.id}`
        : '/api/admin/expenses'
      const res = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: formData.description.trim(),
          category: formData.category.trim() || null,
          expenseDate: formData.expenseDate || new Date().toISOString(),
          image: formData.image.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success(editingExpense ? 'Expense updated' : 'Expense added')
        setShowModal(false)
        resetForm()
        fetchExpenses()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Expense deleted')
        fetchExpenses()
      } else toast.error('Failed to delete')
    } catch {
      toast.error('Something went wrong')
    }
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      amount: String(expense.amount),
      description: expense.description,
      category: expense.category || '',
      expenseDate: expense.expenseDate.slice(0, 10),
      image: expense.image || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingExpense(null)
    setFormData(defaultForm)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'expenses')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, image: data.url }))
        toast.success('Image uploaded')
      } else toast.error('Upload failed')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Expenses</h1>
          <p className="text-secondary-400 text-sm">Add and view your expenses (optional image)</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-4">
        <p className="text-secondary-400 text-sm">Your total (this list)</p>
        <p className="text-xl font-bold text-white">PKR {total.toLocaleString()}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-secondary-800 rounded-lg border border-secondary-700">
          <Receipt className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No expenses yet</h3>
          <p className="text-secondary-400 mb-4">Add expenses with optional receipt image</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500"
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-800 rounded-lg border border-secondary-700 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">PKR {exp.amount.toLocaleString()}</p>
                <p className="text-sm text-secondary-400 truncate">{exp.description}</p>
                <p className="text-xs text-secondary-500 mt-1">
                  {new Date(exp.expenseDate).toLocaleDateString()}
                  {exp.category ? ` · ${exp.category}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {exp.image && (
                  <a
                    href={exp.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-400 hover:bg-secondary-700 rounded-lg"
                    title="View image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => openEdit(exp)}
                  className="p-2 text-blue-400 hover:bg-secondary-700 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-red-400 hover:bg-secondary-700 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-secondary-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-secondary-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-secondary-700">
                <h2 className="text-lg font-bold text-white">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-secondary-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                    rows={2}
                    placeholder="What was this expense for?"
                    className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-500 resize-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Rent, Supplies"
                    className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expenseDate: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Image (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.image ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-secondary-600">
                        <Image
                          src={formData.image}
                          alt="Receipt"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-secondary-900 flex items-center justify-center border border-secondary-600">
                        <ImageIcon className="w-8 h-8 text-secondary-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-3 py-2 bg-secondary-700 text-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-600 text-sm w-fit">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading…' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                        placeholder="Or paste image URL"
                        className="mt-2 w-full px-3 py-2 text-sm bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-500 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-600 text-secondary-300 rounded-lg hover:bg-secondary-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500"
                  >
                    {editingExpense ? 'Update' : 'Add'} Expense
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
