'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Megaphone,
  Truck,
  Save,
  Loader2,
  Image as ImageIcon,
  Type,
  Facebook,
  Instagram,
  MessageCircle,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  id: string
  siteName: string
  siteTagline: string
  heroTitle: string
  heroSubtitle: string
  heroBannerImage: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string | null
  instagramUrl: string | null
  whatsappNumber: string | null
  freeShippingMinimum: number
  shippingFee: number
  announcementBar: string | null
  announcementActive: boolean
  footerText: string
}

interface AdminSettingsProps {
  settings: SiteSettings
}

export default function AdminSettings({ settings: initialSettings }: AdminSettingsProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('branding')

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'hero', label: 'Hero Section', icon: ImageIcon },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'announcement', label: 'Announcement', icon: Megaphone },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-600 mt-1">Customize your store appearance and settings</p>
        </div>
        <button onClick={handleSave} disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary-600" />
                  Branding
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Site Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.siteTagline}
                      onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Footer Text
                    </label>
                    <textarea
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  Color Scheme
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-secondary-200"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-secondary-200"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-secondary-200"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="text-sm text-secondary-600">
                    <strong>Note:</strong> Color changes require a page refresh to take effect across the site.
                  </p>
                </div>
              </div>
            )}

            {/* Hero Section Tab */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                  Hero Section
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Hero Subtitle
                    </label>
                    <textarea
                      value={settings.heroSubtitle}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Hero Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={settings.heroBannerImage || ''}
                      onChange={(e) => setSettings({ ...settings, heroBannerImage: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  Contact Information
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="input-field pl-12"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="input-field pl-12"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={settings.contactAddress}
                        onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                        className="input-field pl-12"
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" />
                  Social Media Links
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Facebook URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={settings.facebookUrl || ''}
                        onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/yourpage"
                        className="input-field pl-12"
                      />
                      <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Instagram URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={settings.instagramUrl || ''}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/yourhandle"
                        className="input-field pl-12"
                      />
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={settings.whatsappNumber || ''}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        placeholder="923001234567"
                        className="input-field pl-12"
                      />
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      Enter number with country code, no + or spaces (e.g., 923001234567)
                    </p>
                    {settings.whatsappNumber && (
                      <p className="text-xs text-primary-600 mt-1">
                        Link: <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="underline">wa.me/{settings.whatsappNumber}</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Shipping Settings
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Free Shipping Minimum (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingMinimum}
                      onChange={(e) => setSettings({ ...settings, freeShippingMinimum: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="input-field"
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      Orders above this amount get free shipping
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Shipping Fee (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.shippingFee}
                      onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="input-field"
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      Fee for orders below free shipping minimum
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Announcement Tab */}
            {activeTab === 'announcement' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary-600" />
                  Announcement Bar
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.announcementActive}
                        onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                    <span className="text-sm font-medium text-secondary-700">
                      Show announcement bar
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Announcement Text
                    </label>
                    <input
                      type="text"
                      value={settings.announcementBar || ''}
                      onChange={(e) => setSettings({ ...settings, announcementBar: e.target.value })}
                      placeholder="🎉 Free shipping on orders over PKR 5000!"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
