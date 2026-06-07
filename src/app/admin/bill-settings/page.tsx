'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Receipt, Store, Phone, Mail, MapPin, FileText, 
  Save, Eye, Printer, Image as ImageIcon, Settings,
  Type, Ruler, ToggleLeft, ToggleRight, Percent, Calculator
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
  // Tax Settings
  taxEnabled: boolean
  taxName: string
  taxRate: number
  taxIncludedInPrice: boolean
  showTaxBreakdown: boolean
  taxNumber: string
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
    // Tax Settings
    taxEnabled: false,
    taxName: 'GST',
    taxRate: 0,
    taxIncludedInPrice: false,
    showTaxBreakdown: true,
    taxNumber: '',
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
          // Tax Settings
          taxEnabled: data.taxEnabled ?? false,
          taxName: data.taxName || 'GST',
          taxRate: data.taxRate ?? 0,
          taxIncludedInPrice: data.taxIncludedInPrice ?? false,
          showTaxBreakdown: data.showTaxBreakdown ?? true,
          taxNumber: data.taxNumber || '',
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

        {/* Tax Settings */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary-600" />
            Tax Settings
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Tax Configuration */}
            <div className="space-y-4">
              <Toggle
                value={settings.taxEnabled}
                onChange={(v) => setSettings(prev => ({ ...prev, taxEnabled: v }))}
                label="Enable Tax on Bills"
              />
              
              {settings.taxEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Tax Name</label>
                    <input
                      type="text"
                      value={settings.taxName}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxName: e.target.value }))}
                      placeholder="GST, VAT, Sales Tax, etc."
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Tax Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.taxRate}
                        onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="17"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-2 pr-12 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400">
                        <Percent className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Tax Registration Number (Optional)</label>
                    <input
                      type="text"
                      value={settings.taxNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                      placeholder="e.g., NTN-1234567-8"
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Right Column - Tax Options */}
            {settings.taxEnabled && (
              <div className="space-y-4">
                <Toggle
                  value={settings.taxIncludedInPrice}
                  onChange={(v) => setSettings(prev => ({ ...prev, taxIncludedInPrice: v }))}
                  label="Prices Already Include Tax"
                />
                <p className="text-xs text-secondary-500 -mt-2 ml-0">
                  {settings.taxIncludedInPrice 
                    ? "Tax will be calculated from the inclusive price and shown separately" 
                    : "Tax will be added on top of the product prices"}
                </p>
                
                <Toggle
                  value={settings.showTaxBreakdown}
                  onChange={(v) => setSettings(prev => ({ ...prev, showTaxBreakdown: v }))}
                  label="Show Tax Breakdown on Bill"
                />
                
                {/* Tax Preview */}
                <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-700 mb-2">Tax Preview</p>
                  <div className="text-sm text-secondary-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>PKR 1,000</span>
                    </div>
                    {settings.taxIncludedInPrice ? (
                      <>
                        <div className="flex justify-between text-secondary-500">
                          <span>({settings.taxName} {settings.taxRate}% included):</span>
                          <span>PKR {Math.round(1000 - (1000 / (1 + settings.taxRate / 100)))}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-secondary-200 pt-1">
                          <span>Total:</span>
                          <span>PKR 1,000</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>{settings.taxName} ({settings.taxRate}%):</span>
                          <span>PKR {Math.round(1000 * settings.taxRate / 100)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-secondary-200 pt-1">
                          <span>Total:</span>
                          <span>PKR {Math.round(1000 * (1 + settings.taxRate / 100))}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                {settings.taxEnabled && settings.taxNumber && (
                  <p className="text-secondary-500 text-xs">{settings.taxName} #: {settings.taxNumber}</p>
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
                {settings.taxEnabled && settings.showTaxBreakdown && (
                  <div className="flex justify-between">
                    <span>{settings.taxName} ({settings.taxRate}%):</span>
                    <span>PKR {settings.taxIncludedInPrice 
                      ? Math.round(5000 - (5000 / (1 + settings.taxRate / 100)))
                      : Math.round(5000 * settings.taxRate / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>TOTAL:</span>
                  <span>PKR {settings.taxIncludedInPrice 
                    ? '5,000' 
                    : (5000 + Math.round(5000 * settings.taxRate / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Cash:</span>
                  <span>PKR {settings.taxIncludedInPrice 
                    ? '5,500' 
                    : (5500 + Math.round(5000 * settings.taxRate / 100)).toLocaleString()}</span>
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
