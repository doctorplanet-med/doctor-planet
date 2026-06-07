'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Percent, Calendar, Save, AlertCircle, Check, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

interface GlobalDiscount {
  id: string
  isActive: boolean
  percentage: number
  startDate: string | null
  endDate: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export default function GlobalDiscountPage() {
  const [discount, setDiscount] = useState<GlobalDiscount | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [isActive, setIsActive] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchDiscount()
  }, [])

  const fetchDiscount = async () => {
    try {
      const res = await fetch('/api/admin/global-discount')
      if (res.ok) {
        const data = await res.json()
        setDiscount(data)
        setIsActive(data.isActive)
        setPercentage(data.percentage)
        setStartDate(data.startDate ? data.startDate.split('T')[0] : '')
        setEndDate(data.endDate ? data.endDate.split('T')[0] : '')
      }
    } catch (error) {
      toast.error('Failed to load discount settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (percentage < 0 || percentage > 100) {
      toast.error('Percentage must be between 0 and 100')
      return
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/global-discount', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
          percentage,
          startDate: startDate || null,
          endDate: endDate || null,
        })
      })

      if (res.ok) {
        const data = await res.json()
        setDiscount(data)
        toast.success('Global discount updated successfully')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update discount')
      }
    } catch (error) {
      toast.error('Failed to update discount')
    } finally {
      setSaving(false)
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Global Discount</h1>
        <p className="text-secondary-600">Set a site-wide discount that applies to all products</p>
      </div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• When active, this discount applies to ALL products on the website</li>
              <li>• Individual sale prices will be hidden</li>
              <li>• Only the global discount percentage will be shown</li>
              <li>• Original prices will still be displayed for comparison</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="space-y-6">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-secondary-200'}`}>
                {isActive ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <Tag className="w-6 h-6 text-secondary-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Discount Status</h3>
                <p className="text-sm text-secondary-600">
                  {isActive ? 'Active - Discount is live on all products' : 'Inactive - No global discount applied'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-secondary-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Discount Percentage <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-4 py-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-lg font-semibold"
                placeholder="Enter percentage (0-100)"
              />
            </div>
            <p className="text-sm text-secondary-500 mt-2">
              This percentage will be applied to the original price of all products
            </p>
          </div>

          {/* Date Range (Optional) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Start Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Discount will start from this date
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Discount will end on this date
              </p>
            </div>
          </div>

          {/* Preview */}
          {percentage > 0 && (
            <div className="p-4 bg-gradient-to-r from-primary-50 to-orange-50 border border-primary-200 rounded-xl">
              <h3 className="font-semibold text-secondary-900 mb-2">Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Original Price:</span>
                  <span className="font-medium">PKR 1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Discount ({percentage}%):</span>
                  <span className="font-medium text-red-600">- PKR {((1000 * percentage) / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-200">
                  <span className="font-semibold text-secondary-900">Final Price:</span>
                  <span className="font-bold text-primary-600">PKR {(1000 - ((1000 * percentage) / 100)).toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Global Discount
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Status Card */}
      {discount && (
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Current Settings</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-secondary-600">Status:</span>
              <span className={`ml-2 font-medium ${discount.isActive ? 'text-green-600' : 'text-secondary-900'}`}>
                {discount.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-secondary-600">Discount:</span>
              <span className="ml-2 font-medium text-secondary-900">{discount.percentage}%</span>
            </div>
            {discount.startDate && (
              <div>
                <span className="text-secondary-600">Start Date:</span>
                <span className="ml-2 font-medium text-secondary-900">
                  {new Date(discount.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {discount.endDate && (
              <div>
                <span className="text-secondary-600">End Date:</span>
                <span className="ml-2 font-medium text-secondary-900">
                  {new Date(discount.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {discount.createdBy && (
              <div>
                <span className="text-secondary-600">Created By:</span>
                <span className="ml-2 font-medium text-secondary-900">{discount.createdBy}</span>
              </div>
            )}
            <div>
              <span className="text-secondary-600">Last Updated:</span>
              <span className="ml-2 font-medium text-secondary-900">
                {new Date(discount.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
