'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Receipt, Store, Phone, Mail, MapPin, FileText, 
  Save, Eye, Printer, Image as ImageIcon, Settings,
  Type, Ruler, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BillSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  headerText: string
  logoUrl: string
  footerText: string
  returnPolicy: string
  showLogo: boolean
  showStoreAddress: boolean
  showStorePhone: boolean
  showReturnPolicy: boolean
  showBarcode: boolean
  paperWidth: string
  fontSize: string
}

export default function AdminBillSettingsPage() {
  const [settings, setSettings] = useState<BillSettings>({
    storeName: 'Doctor Planet',
    storeAddress: 'Medical Plaza, Healthcare City',
    storePhone: '+92 300 1234567',
    storeEmail: 'info@doctorplanet.com',
    headerText: '',
    logoUrl: '/logos/logo.png',
    footerText: 'Thank you for shopping with us!',
    returnPolicy: 'Returns accepted within 7 days with receipt',
    showLogo: true,
    showStoreAddress: true,
    showStorePhone: true,
    showReturnPolicy: true,
    showBarcode: false,
    paperWidth: '80mm',
    fontSize: 'normal',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/bill-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          storeName: data.storeName || 'Doctor Planet',
          storeAddress: data.storeAddress || '',
          storePhone: data.storePhone || '',
          storeEmail: data.storeEmail || '',
          headerText: data.headerText || '',
          logoUrl: data.logoUrl || '/logos/logo.png',
          footerText: data.footerText || '',
          returnPolicy: data.returnPolicy || '',
          showLogo: data.showLogo ?? true,
          showStoreAddress: data.showStoreAddress ?? true,
          showStorePhone: data.showStorePhone ?? true,
          showReturnPolicy: data.showReturnPolicy ?? true,
          showBarcode: data.showBarcode ?? false,
          paperWidth: data.paperWidth || '80mm',
          fontSize: data.fontSize || 'normal',
        })
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bill-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast.success('Bill settings saved!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-secondary-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-primary-600' : 'bg-secondary-300'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )

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
          <h1 className="text-2xl font-bold text-secondary-900">Bill/Receipt Settings</h1>
          <p className="text-secondary-600">Customize how POS receipts look when printed</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-secondary-300"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary-600" />
            Store Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Store Address</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => setSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={settings.storePhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Logo URL</label>
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="/logos/logo.png"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Bill Content */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Bill Content
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Header Message (Optional)</label>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => setSettings(prev => ({ ...prev, headerText: e.target.value }))}
                placeholder="Welcome to Doctor Planet!"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Footer Message</label>
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Return Policy</label>
              <textarea
                value={settings.returnPolicy}
                onChange={(e) => setSettings(prev => ({ ...prev, returnPolicy: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" />
            Display Options
          </h2>
          
          <div className="space-y-4">
            <Toggle
              value={settings.showLogo}
              onChange={(v) => setSettings(prev => ({ ...prev, showLogo: v }))}
              label="Show Logo"
            />
            <Toggle
              value={settings.showStoreAddress}
              onChange={(v) => setSettings(prev => ({ ...prev, showStoreAddress: v }))}
              label="Show Store Address"
            />
            <Toggle
              value={settings.showStorePhone}
              onChange={(v) => setSettings(prev => ({ ...prev, showStorePhone: v }))}
              label="Show Store Phone"
            />
            <Toggle
              value={settings.showReturnPolicy}
              onChange={(v) => setSettings(prev => ({ ...prev, showReturnPolicy: v }))}
              label="Show Return Policy"
            />
            <Toggle
              value={settings.showBarcode}
              onChange={(v) => setSettings(prev => ({ ...prev, showBarcode: v }))}
              label="Show Barcode"
            />
          </div>
        </div>

        {/* Printer Settings */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary-600" />
            Printer Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Paper Width</label>
              <select
                value={settings.paperWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, paperWidth: e.target.value }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="58mm">58mm (Small Thermal)</option>
                <option value="80mm">80mm (Standard Thermal)</option>
                <option value="A4">A4 (Full Page)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
              <h3 className="font-semibold">Bill Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-secondary-400 hover:text-secondary-600">×</button>
            </div>
            
            {/* Receipt Preview */}
            <div className={`p-6 bg-white font-mono ${
              settings.fontSize === 'small' ? 'text-xs' : 
              settings.fontSize === 'large' ? 'text-base' : 'text-sm'
            }`} style={{ maxWidth: settings.paperWidth === '58mm' ? '220px' : settings.paperWidth === '80mm' ? '300px' : '100%', margin: '0 auto' }}>
              {/* Header */}
              <div className="text-center border-b border-dashed border-secondary-300 pb-4 mb-4">
                {settings.showLogo && settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />
                )}
                <h2 className="font-bold text-lg">{settings.storeName}</h2>
                {settings.showStoreAddress && (
                  <p className="text-secondary-600">{settings.storeAddress}</p>
                )}
                {settings.showStorePhone && (
                  <p className="text-secondary-600">{settings.storePhone}</p>
                )}
                {settings.headerText && (
                  <p className="mt-2 text-secondary-700">{settings.headerText}</p>
                )}
              </div>

              {/* Receipt Info */}
              <div className="border-b border-dashed border-secondary-300 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span>POS-20240131-0001</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>John Doe</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b border-dashed border-secondary-300 pb-4 mb-4">
                <div className="flex justify-between font-bold mb-2">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Medical Scrub Top x2</span>
                    <span>PKR 3,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Shoes x1</span>
                    <span>PKR 2,500</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="border-b border-dashed border-secondary-300 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR 5,500</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-PKR 500</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>TOTAL:</span>
                  <span>PKR 5,000</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Cash:</span>
                  <span>PKR 5,500</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span>PKR 500</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <p className="font-medium">{settings.footerText}</p>
                {settings.showReturnPolicy && (
                  <p className="text-xs text-secondary-500 mt-2">{settings.returnPolicy}</p>
                )}
                {settings.showBarcode && (
                  <div className="mt-4">
                    <div className="h-10 bg-secondary-200 flex items-center justify-center text-xs">
                      [Barcode]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
