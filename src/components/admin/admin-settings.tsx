'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
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
  Trash2,
  Plus,
  Pencil,
  Upload,
  X,
  LayoutGrid,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { heroBanners as fallbackBannersFromCode } from '@/data/heroBanners'

interface HeroBannerRow {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundGradient: string | null
  backgroundColor: string | null
  images: string
  order: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
}

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
  hiddenDefaultHeroBannerIds?: string | null
}

interface AdminSettingsProps {
  settings: SiteSettings
  categories: { name: string; slug: string }[]
  products: { name: string; slug: string }[]
  deals?: { name: string; slug: string }[]
}

const CTA_CUSTOM = '__custom__'

const DEFAULT_GRADIENT_COLORS = ['#4c1d95', '#6d28d9', '#a78bfa']

/** Extract hex colors from Tailwind gradient string */
function getGradientColors(str: string): string[] {
  if (!str?.trim()) return []
  const hexes = str.match(/#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g)
  return hexes ? Array.from(new Set(hexes)) : []
}

/** Build Tailwind gradient class from hex array (2 or 3 colors) */
function colorsToTailwind(colors: string[]): string {
  const [a, b, c] = colors
  if (!a || !b) return ''
  if (c) return `from-[${a}] via-[${b}] to-[${c}]`
  return `from-[${a}] to-[${b}]`
}

/** Normalize to exactly 3 hex values for the 3 pickers */
function normalizeToThreeColors(colors: string[]): string[] {
  if (colors.length >= 3) return colors.slice(0, 3)
  if (colors.length === 2) return [colors[0], colors[1], colors[1]]
  if (colors.length === 1) return [colors[0], colors[0], colors[0]]
  return [...DEFAULT_GRADIENT_COLORS]
}

function GradientColorPicker({
  value,
  onChange,
  label = 'Background gradient',
}: {
  value: string
  onChange: (tailwind: string) => void
  label?: string
}) {
  const parsed = getGradientColors(value)
  const colors = normalizeToThreeColors(parsed.length ? parsed : DEFAULT_GRADIENT_COLORS)

  const handleColorChange = (index: number, hex: string) => {
    const next = [...colors]
    next[index] = hex
    onChange(colorsToTailwind(next))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1">{label}</label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary-500 whitespace-nowrap">Start</span>
          <input
            type="color"
            value={colors[0]}
            onChange={(e) => handleColorChange(0, e.target.value)}
            className="w-10 h-10 rounded border border-secondary-300 cursor-pointer bg-transparent"
            title="Start color"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary-500 whitespace-nowrap">Middle</span>
          <input
            type="color"
            value={colors[1]}
            onChange={(e) => handleColorChange(1, e.target.value)}
            className="w-10 h-10 rounded border border-secondary-300 cursor-pointer bg-transparent"
            title="Middle color"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary-500 whitespace-nowrap">End</span>
          <input
            type="color"
            value={colors[2]}
            onChange={(e) => handleColorChange(2, e.target.value)}
            className="w-10 h-10 rounded border border-secondary-300 cursor-pointer bg-transparent"
            title="End color"
          />
        </div>
      </div>
      <div
        className="mt-2 h-8 rounded-lg border border-secondary-200 w-full max-w-[240px]"
        style={{
          background: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        }}
        aria-hidden
      />
    </div>
  )
}

export default function AdminSettings({ settings: initialSettings, categories = [], products = [], deals = [] }: AdminSettingsProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('branding')
  const [heroBanners, setHeroBanners] = useState<HeroBannerRow[]>([])
  const [heroBannersLoading, setHeroBannersLoading] = useState(false)
  const [hiddenDefaultIds, setHiddenDefaultIds] = useState<string[]>(() => {
    try {
      return initialSettings.hiddenDefaultHeroBannerIds
        ? (JSON.parse(initialSettings.hiddenDefaultHeroBannerIds) as string[])
        : []
    } catch {
      return []
    }
  })
  const [addBannerLoading, setAddBannerLoading] = useState(false)
  const [newBanner, setNewBanner] = useState({
    ctaText: 'Shop Now',
    ctaLink: '/products',
    backgroundGradient: 'from-[#4c1d95] via-[#6d28d9] to-[#a78bfa]',
    mobileImage: '',
    tabletImage: '',
    desktopImage: '',
    startDate: '',
    endDate: '',
  })
  const [editingBanner, setEditingBanner] = useState<(HeroBannerRow & { _fromCode?: boolean }) | null>(null)
  const [editForm, setEditForm] = useState({ ctaText: '', ctaLink: '', backgroundGradient: '', mobileImage: '', tabletImage: '', desktopImage: '', startDate: '', endDate: '', isActive: true })
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [saveEditLoading, setSaveEditLoading] = useState(false)
  const [previewImages, setPreviewImages] = useState<{ mobile?: string; desktop?: string }>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Promo Banners (3rd section: PNG/JPG/GIF, transparent bg)
  const [promoBanners, setPromoBanners] = useState<{ id: string; imageUrl: string; linkUrl: string; alt: string; order: number; isActive: boolean }[]>([])
  const [promoBannersLoading, setPromoBannersLoading] = useState(false)
  const [newPromoBanner, setNewPromoBanner] = useState({ imageUrl: '', linkUrl: '/deals', alt: 'Promo' })
  const [addPromoLoading, setAddPromoLoading] = useState(false)
  const [editingPromo, setEditingPromo] = useState<{ id: string; imageUrl: string; linkUrl: string; alt: string; order: number; isActive: boolean } | null>(null)
  const [editPromoForm, setEditPromoForm] = useState({ imageUrl: '', linkUrl: '', alt: '' })
  const [uploadPromoField, setUploadPromoField] = useState<'imageUrl' | null>(null)
  const [savePromoEditLoading, setSavePromoEditLoading] = useState(false)

  const fetchHeroBanners = async () => {
    setHeroBannersLoading(true)
    try {
      const res = await fetch('/api/admin/hero-banners', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setHeroBanners(data)
      } else {
        setHeroBanners([])
      }
    } catch {
      toast.error('Failed to load hero banners')
      setHeroBanners([])
    } finally {
      setHeroBannersLoading(false)
    }
  }

  /** Banners to display: DB banners + default (from code) banners that are not hidden */
  const visibleDefaults = fallbackBannersFromCode.filter((b) => !hiddenDefaultIds.includes(b.id))
  const displayBanners: (HeroBannerRow & { _fromCode?: boolean })[] = [
    ...heroBanners,
    ...visibleDefaults.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      backgroundGradient: b.backgroundGradient ?? null,
      backgroundColor: b.backgroundColor ?? null,
      images: JSON.stringify(b.images),
      order: 0,
      isActive: true,
      startDate: null,
      endDate: null,
      _fromCode: true,
    })),
  ]

  useEffect(() => {
    if (activeTab === 'hero') fetchHeroBanners()
  }, [activeTab])

  const fetchPromoBanners = async () => {
    setPromoBannersLoading(true)
    try {
      const res = await fetch('/api/admin/promo-banners', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setPromoBanners(Array.isArray(data) ? data : [])
      } else setPromoBanners([])
    } catch {
      toast.error('Failed to load promo banners')
      setPromoBanners([])
    } finally {
      setPromoBannersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'promo') fetchPromoBanners()
  }, [activeTab])

  const uploadPromoImage = async (file: File, field: 'imageUrl', isEdit: boolean) => {
    setUploadPromoField(field)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'promo')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (isEdit && editingPromo) {
          setEditPromoForm((prev) => ({ ...prev, [field]: data.url }))
        } else {
          setNewPromoBanner((prev) => ({ ...prev, [field]: data.url }))
        }
        toast.success('Image uploaded')
      } else toast.error(data.error || 'Upload failed')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadPromoField(null)
    }
  }

  const handleAddPromoBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPromoBanner.imageUrl.trim()) {
      toast.error('Image is required (PNG, JPG, or GIF)')
      return
    }
    setAddPromoLoading(true)
    try {
      const res = await fetch('/api/admin/promo-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newPromoBanner.imageUrl.trim(),
          linkUrl: newPromoBanner.linkUrl.trim() || '/',
          alt: newPromoBanner.alt.trim() || 'Promo',
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setPromoBanners((prev) => [...prev, created])
        setNewPromoBanner({ imageUrl: '', linkUrl: '/deals', alt: 'Promo' })
        toast.success('Promo banner added')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add')
      }
    } catch {
      toast.error('Failed to add promo banner')
    } finally {
      setAddPromoLoading(false)
    }
  }

  const handleUpdatePromoBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPromo) return
    if (!editPromoForm.imageUrl.trim()) {
      toast.error('Image is required')
      return
    }
    setSavePromoEditLoading(true)
    try {
      const res = await fetch(`/api/admin/promo-banners/${editingPromo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: editPromoForm.imageUrl.trim(),
          linkUrl: editPromoForm.linkUrl.trim() || '/',
          alt: editPromoForm.alt.trim() || 'Promo',
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPromoBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        setEditingPromo(null)
        toast.success('Promo banner updated')
      } else toast.error('Failed to update')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSavePromoEditLoading(false)
    }
  }

  const handleDeletePromoBanner = async (banner: { id: string }) => {
    if (!confirm('Remove this promo banner?')) return
    try {
      const res = await fetch(`/api/admin/promo-banners/${banner.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPromoBanners((prev) => prev.filter((b) => b.id !== banner.id))
        toast.success('Promo banner removed')
      } else toast.error('Failed to remove')
    } catch {
      toast.error('Failed to remove')
    }
  }

  const handleRemoveBanner = async (banner: HeroBannerRow & { _fromCode?: boolean }) => {
    if (!confirm('Remove this hero banner? It will no longer show on the home page.')) return
    const fromCode = banner._fromCode
    const id = banner.id
    try {
      if (fromCode) {
        const res = await fetch('/api/admin/hero-banners/hide-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        if (res.ok) {
          toast.success('Default banner removed')
          setHiddenDefaultIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        } else toast.error('Failed to remove banner')
      } else {
        const res = await fetch(`/api/admin/hero-banners/${id}`, { method: 'DELETE' })
        if (res.ok) {
          toast.success('Banner removed')
          setHeroBanners((prev) => prev.filter((b) => b.id !== id))
        } else toast.error('Failed to remove banner')
      }
    } catch {
      toast.error('Failed to remove banner')
    }
  }

  const uploadImage = async (file: File, field: 'mobileImage' | 'desktopImage' | 'tabletImage', isEdit: boolean) => {
    // Create local preview
    const previewUrl = URL.createObjectURL(file)
    const previewKey = field === 'mobileImage' ? 'mobile' : 'desktop'
    setPreviewImages(prev => ({ ...prev, [previewKey]: previewUrl }))
    setShowPreviewModal(true)
    
    setUploadingField(field)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'hero')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (isEdit && editingBanner) {
          setEditForm((prev) => ({ ...prev, [field]: data.url }))
        } else {
          setNewBanner((prev) => ({ ...prev, [field]: data.url }))
        }
        // Update preview with uploaded URL
        setPreviewImages(prev => ({ ...prev, [previewKey]: data.url }))
        toast.success('Image uploaded - Check preview below')
      } else {
        toast.error(data.error || 'Upload failed')
        setPreviewImages(prev => ({ ...prev, [previewKey]: undefined }))
      }
    } catch {
      toast.error('Failed to upload image')
      setPreviewImages(prev => ({ ...prev, [previewKey]: undefined }))
    } finally {
      setUploadingField(null)
    }
  }

  const openEditBanner = (banner: HeroBannerRow & { _fromCode?: boolean }) => {
    let imgs = { mobile: '', tablet: '', desktop: '' }
    try {
      imgs = JSON.parse(banner.images)
    } catch {}
    setEditingBanner(banner)
    setEditForm({
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      backgroundGradient: banner.backgroundGradient || '',
      mobileImage: imgs.mobile || '',
      tabletImage: imgs.tablet || '',
      desktopImage: imgs.desktop || '',
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : '',
      isActive: '_fromCode' in banner && banner._fromCode ? true : (banner as HeroBannerRow).isActive !== false,
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBanner) return
    if (!editForm.mobileImage.trim() || !editForm.desktopImage.trim()) {
      toast.error('Mobile and desktop images are required')
      return
    }
    setSaveEditLoading(true)
    const payload = {
      ctaText: editForm.ctaText,
      ctaLink: editForm.ctaLink,
      backgroundGradient: editForm.backgroundGradient || null,
      mobileImage: editForm.mobileImage,
      tabletImage: editForm.tabletImage || undefined,
      desktopImage: editForm.desktopImage,
      startDate: editForm.startDate || null,
      endDate: editForm.endDate || null,
      isActive: editForm.isActive,
    }
    try {
      if (editingBanner._fromCode) {
        const createRes = await fetch('/api/admin/hero-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingBanner.title, subtitle: editingBanner.subtitle, ...payload }),
        })
        if (!createRes.ok) {
          toast.error('Failed to save banner')
          return
        }
        const hideRes = await fetch('/api/admin/hero-banners/hide-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBanner.id }),
        })
        if (hideRes.ok) {
          setHiddenDefaultIds((prev) => (prev.includes(editingBanner.id) ? prev : [...prev, editingBanner.id]))
        }
        await fetchHeroBanners()
        setEditingBanner(null)
        toast.success('Banner saved; default replaced with your version.')
        return
      }
      const res = await fetch(`/api/admin/hero-banners/${editingBanner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setHeroBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        setEditingBanner(null)
        toast.success('Banner updated')
      } else toast.error('Failed to update banner')
    } catch {
      toast.error('Failed to update banner')
    } finally {
      setSaveEditLoading(false)
    }
  }

  const getBannerStatus = (b: HeroBannerRow & { _fromCode?: boolean }) => {
    if (!('_fromCode' in b) && (b as HeroBannerRow).isActive === false) return 'Inactive'
    const now = new Date()
    const start = b.startDate ? new Date(b.startDate) : null
    const end = b.endDate ? new Date(b.endDate) : null
    if (start && now < start) return 'Scheduled'
    if (end && now > end) return 'Ended'
    return 'Active'
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBanner.mobileImage.trim() || !newBanner.desktopImage.trim()) {
      toast.error('Small-screen and large-screen images are required')
      return
    }
    setAddBannerLoading(true)
    try {
      const res = await fetch('/api/admin/hero-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Banner',
          subtitle: '',
          ctaText: newBanner.ctaText,
          ctaLink: newBanner.ctaLink,
          backgroundGradient: newBanner.backgroundGradient || null,
          mobileImage: newBanner.mobileImage,
          tabletImage: newBanner.tabletImage || undefined,
          desktopImage: newBanner.desktopImage,
          startDate: newBanner.startDate || null,
          endDate: newBanner.endDate || null,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setHeroBanners((prev) => [...prev, created])
        setNewBanner({
          ctaText: 'Shop Now',
          ctaLink: '/products',
          backgroundGradient: 'from-[#4c1d95] via-[#6d28d9] to-[#a78bfa]',
          mobileImage: '',
          tabletImage: '',
          desktopImage: '',
          startDate: '',
          endDate: '',
        })
        setPreviewImages({})
        setShowPreviewModal(false)
        toast.success('Banner added')
      } else toast.error('Failed to add banner')
    } catch {
      toast.error('Failed to add banner')
    } finally {
      setAddBannerLoading(false)
    }
  }

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
    { id: 'promo', label: 'Promo Banners', icon: LayoutGrid },
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
                  Hero Banners
                </h2>
                <p className="text-secondary-600 text-sm">
                  Banners rotate on the home page hero. Add, edit, or remove below. Order is by creation; first added = first shown.
                </p>
                <div className="rounded-lg bg-primary-50 border border-primary-100 p-3 text-sm text-primary-800">
                  <p className="font-medium mb-1">CTA (Call to action)</p>
                  <p className="text-primary-700">When a visitor <strong>clicks the banner</strong> on the home page, they go to the <strong>CTA Link</strong> (e.g. /products or /deals/summer). CTA Text is stored for reference; the banner itself is one clickable image.</p>
                </div>
                <div className="rounded-lg bg-secondary-100 p-3 text-sm text-secondary-700">
                  <p className="font-medium mb-1">Banner image sizes</p>
                  <p><strong>Small screens (mobile):</strong> Use a <strong>tall/portrait</strong> image (e.g. 800×1200px).</p>
                  <p><strong>Large screens (desktop):</strong> Use a <strong>wide/landscape</strong> image. Recommended size: <strong>1600×560px</strong> (width × height; max height on site is 560px).</p>
                  <p className="mt-1">You must add <strong>two images per banner</strong> — one for small and one for large. You can paste a URL or upload from your device.</p>
                </div>

                <div className="space-y-6">
                    <form onSubmit={handleAddBanner} className="rounded-xl border border-secondary-200 p-6 space-y-4 bg-secondary-50/30">
                      <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary-600" />
                        Add new banner
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">CTA Text *</label>
                          <input
                            type="text"
                            value={newBanner.ctaText}
                            onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                            className="input-field"
                            placeholder="Shop Now"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-1">CTA Link *</label>
                          <p className="text-xs text-secondary-500 mb-2">Select a Category, Product, or Deal — or enter a custom URL below.</p>
                          {(() => {
                            const categoryLinks = categories.map((c) => `/products?category=${c.slug}`)
                            const productLinks = products.map((p) => `/products/${p.slug}`)
                            const dealsList = deals ?? []
                            const dealLinks = dealsList.map((d) => `/deals/${d.slug}`)
                            const isPreset = categoryLinks.includes(newBanner.ctaLink) || productLinks.includes(newBanner.ctaLink) || dealLinks.includes(newBanner.ctaLink)
                            return (
                              <>
                                <select
                                  value={isPreset ? newBanner.ctaLink : CTA_CUSTOM}
                                  onChange={(e) => setNewBanner({ ...newBanner, ctaLink: e.target.value === CTA_CUSTOM ? newBanner.ctaLink : e.target.value })}
                                  className="input-field"
                                >
                                  <option value={CTA_CUSTOM}>Custom URL (enter below)</option>
                                  {categories.length > 0 && (
                                    <optgroup label="Category">
                                      {categories.map((c) => (
                                        <option key={c.slug} value={`/products?category=${c.slug}`}>{c.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {products.length > 0 && (
                                    <optgroup label="Product">
                                      {products.map((p) => (
                                        <option key={p.slug} value={`/products/${p.slug}`}>{p.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {dealsList.length > 0 && (
                                    <optgroup label="Deal">
                                      {dealsList.map((d) => (
                                        <option key={d.slug} value={`/deals/${d.slug}`}>{d.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                                {!isPreset && (
                                  <input
                                    type="text"
                                    value={newBanner.ctaLink}
                                    onChange={(e) => setNewBanner({ ...newBanner, ctaLink: e.target.value })}
                                    className="input-field mt-2"
                                    placeholder="/products or /deals/slug"
                                  />
                                )}
                              </>
                            )
                          })()}
                        </div>
                        <div className="sm:col-span-2">
                          <GradientColorPicker
                            label="Background gradient"
                            value={newBanner.backgroundGradient}
                            onChange={(v) => setNewBanner({ ...newBanner, backgroundGradient: v })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Small screen image (mobile, tall) *</label>
                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="text"
                              value={newBanner.mobileImage}
                              onChange={(e) => setNewBanner({ ...newBanner, mobileImage: e.target.value })}
                              className="input-field flex-1 min-w-[200px]"
                              placeholder="Paste URL or click Upload to choose from device"
                            />
                            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              {uploadingField === 'mobileImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) uploadImage(f, 'mobileImage', false)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Large screen image (desktop, wide) *</label>
                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="text"
                              value={newBanner.desktopImage}
                              onChange={(e) => setNewBanner({ ...newBanner, desktopImage: e.target.value })}
                              className="input-field flex-1 min-w-[200px]"
                              placeholder="Paste URL or click Upload to choose from device"
                            />
                            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              {uploadingField === 'desktopImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) uploadImage(f, 'desktopImage', false)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        
                        {/* Banner Preview */}
                        {(previewImages.mobile || previewImages.desktop || newBanner.mobileImage || newBanner.desktopImage) && (
                          <div className="sm:col-span-2 border-t border-secondary-200 pt-6 mt-2">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-secondary-900 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary-600" />
                                Banner Preview - How it will appear on site
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewImages({})
                                  setShowPreviewModal(false)
                                }}
                                className="text-xs text-secondary-500 hover:text-secondary-700"
                              >
                                Clear previews
                              </button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Mobile Preview */}
                              {(previewImages.mobile || newBanner.mobileImage) && (
                                <div>
                                  <p className="text-xs font-medium text-secondary-700 mb-2 flex items-center gap-1">
                                    📱 Mobile (Tall - 800×1200px recommended)
                                  </p>
                                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-secondary-50 to-secondary-100">
                                    <img
                                      src={previewImages.mobile || newBanner.mobileImage}
                                      alt="Mobile preview"
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Visible area overlay */}
                                    <div className="absolute inset-0 border-4 border-dashed border-primary-500 pointer-events-none"></div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                      Visible area
                                    </div>
                                  </div>
                                  <p className="text-xs text-secondary-500 mt-2 italic">
                                    ✓ Image fills entire mobile banner
                                  </p>
                                </div>
                              )}
                              
                              {/* Desktop Preview */}
                              {(previewImages.desktop || newBanner.desktopImage) && (
                                <div>
                                  <p className="text-xs font-medium text-secondary-700 mb-2 flex items-center gap-1">
                                    🖥️ Desktop (Wide - 1600×900px recommended)
                                  </p>
                                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-primary-200 bg-gradient-to-br from-secondary-50 to-secondary-100">
                                    <img
                                      src={previewImages.desktop || newBanner.desktopImage}
                                      alt="Desktop preview"
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Visible area overlay */}
                                    <div className="absolute inset-0 border-4 border-dashed border-primary-500 pointer-events-none"></div>
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                      Visible area
                                    </div>
                                  </div>
                                  <p className="text-xs text-secondary-500 mt-2 italic">
                                    ✓ Image fills entire desktop banner
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs text-blue-800">
                                <strong>💡 Tip:</strong> The dashed border shows the visible banner area. Images use <code className="bg-blue-100 px-1 rounded">object-cover</code> which centers and crops to fill the space. 
                                <br/>
                                <strong>Mobile:</strong> Use tall/portrait images (2:3 ratio).
                                <br/>
                                <strong>Desktop:</strong> Use wide/landscape images (16:9 ratio).
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Show from (optional)</label>
                          <input
                            type="datetime-local"
                            value={newBanner.startDate}
                            onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Show until (optional)</label>
                          <input
                            type="datetime-local"
                            value={newBanner.endDate}
                            onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={addBannerLoading} className="btn-primary">
                        {addBannerLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        Add banner
                      </button>
                    </form>

                    {/* All hero banners - bottom (DB list or fallback from code = same as home page) */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-3">All hero banners</h3>
                      {heroBannersLoading ? (
                        <div className="flex items-center gap-2 text-secondary-500 py-4">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading banners…
                        </div>
                      ) : displayBanners.length === 0 ? (
                        <p className="text-secondary-500 text-sm py-4 rounded-xl border border-secondary-200 bg-secondary-50/50 px-4">No banners yet. Add one above.</p>
                      ) : (
                        <>
                          {visibleDefaults.length > 0 && (
                            <p className="text-secondary-600 text-sm mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                              Default banners (from code) can be edited or removed. Edit saves your version to the database and hides the default.
                            </p>
                          )}
                          <ul className="divide-y divide-secondary-200 rounded-xl border border-secondary-200 overflow-hidden">
                            {displayBanners.map((banner) => {
                            let thumb = ''
                            try {
                              const imgs = JSON.parse(banner.images)
                              thumb = imgs.mobile || imgs.desktop || ''
                            } catch {
                              thumb = ''
                            }
                            const fromCode = (banner as HeroBannerRow & { _fromCode?: boolean })._fromCode
                            const status = fromCode ? 'Default' : getBannerStatus(banner)
                            return (
                              <li key={banner.id} className="flex items-center gap-4 p-4 bg-secondary-50/50 hover:bg-secondary-50">
                                {thumb ? (
                                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary-200 flex-shrink-0">
                                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-20 h-14 rounded-lg bg-secondary-200 flex-shrink-0 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-secondary-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                  <p className="text-sm text-secondary-600 truncate">CTA: {banner.ctaText} → {banner.ctaLink}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    fromCode ? 'bg-amber-100 text-amber-800' : status === 'Inactive' ? 'bg-red-100 text-red-800' : status === 'Active' ? 'bg-green-100 text-green-800' : status === 'Scheduled' ? 'bg-amber-100 text-amber-800' : 'bg-secondary-200 text-secondary-600'
                                  }`}>
                                    {status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditBanner(banner)}
                                      className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-200 transition-colors"
                                      title="Edit banner"
                                    >
                                      <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBanner(banner)}
                                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                      title="Remove banner"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                              </li>
                            )
                          })}
                        </ul>
                        </>
                      )}
                    </div>

                    {/* Edit banner modal */}
                    {editingBanner && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingBanner(null)}>
                        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
                            <h3 className="font-semibold text-secondary-900">Edit banner</h3>
                            <button type="button" onClick={() => setEditingBanner(null)} className="p-2 rounded-lg hover:bg-secondary-100">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">CTA Text</label>
                              <input
                                type="text"
                                value={editForm.ctaText}
                                onChange={(e) => setEditForm({ ...editForm, ctaText: e.target.value })}
                                className="input-field"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-secondary-700 mb-1">CTA Link</label>
                              <p className="text-xs text-secondary-500 mb-2">Select a Category, Product, or Deal — or enter a custom URL below.</p>
                              {(() => {
                                const categoryLinks = categories.map((c) => `/products?category=${c.slug}`)
                                const productLinks = products.map((p) => `/products/${p.slug}`)
                                const dealsList = deals ?? []
                                const dealLinks = dealsList.map((d) => `/deals/${d.slug}`)
                                const isPreset = categoryLinks.includes(editForm.ctaLink) || productLinks.includes(editForm.ctaLink) || dealLinks.includes(editForm.ctaLink)
                                return (
                                  <>
                                    <select
                                      value={isPreset ? editForm.ctaLink : CTA_CUSTOM}
                                      onChange={(e) => setEditForm({ ...editForm, ctaLink: e.target.value === CTA_CUSTOM ? editForm.ctaLink : e.target.value })}
                                      className="input-field"
                                    >
                                      <option value={CTA_CUSTOM}>Custom URL (enter below)</option>
                                      {categories.length > 0 && (
                                        <optgroup label="Category">
                                          {categories.map((c) => (
                                            <option key={c.slug} value={`/products?category=${c.slug}`}>{c.name}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                      {products.length > 0 && (
                                        <optgroup label="Product">
                                          {products.map((p) => (
                                            <option key={p.slug} value={`/products/${p.slug}`}>{p.name}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                      {dealsList.length > 0 && (
                                        <optgroup label="Deal">
                                          {dealsList.map((d) => (
                                            <option key={d.slug} value={`/deals/${d.slug}`}>{d.name}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </select>
                                    {!isPreset && (
                                      <input
                                        type="text"
                                        value={editForm.ctaLink}
                                        onChange={(e) => setEditForm({ ...editForm, ctaLink: e.target.value })}
                                        className="input-field mt-2"
                                        placeholder="/products or /deals/slug"
                                      />
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                            <div>
                              <GradientColorPicker
                                label="Background gradient"
                                value={editForm.backgroundGradient}
                                onChange={(v) => setEditForm({ ...editForm, backgroundGradient: v })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">Small screen image (mobile) *</label>
                              <div className="flex gap-2 flex-wrap">
                                <input
                                  type="text"
                                  value={editForm.mobileImage}
                                  onChange={(e) => setEditForm({ ...editForm, mobileImage: e.target.value })}
                                  className="input-field flex-1 min-w-0"
                                  placeholder="Paste URL or click Upload"
                                />
                                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                                  <Upload className="w-4 h-4" />
                                  {uploadingField === 'mobileImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0]
                                      if (f) uploadImage(f, 'mobileImage', true)
                                      e.target.value = ''
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">Large screen image (desktop) *</label>
                              <div className="flex gap-2 flex-wrap">
                                <input
                                  type="text"
                                  value={editForm.desktopImage}
                                  onChange={(e) => setEditForm({ ...editForm, desktopImage: e.target.value })}
                                  className="input-field flex-1 min-w-0"
                                  placeholder="Paste URL or click Upload"
                                />
                                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                                  <Upload className="w-4 h-4" />
                                  {uploadingField === 'desktopImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0]
                                      if (f) uploadImage(f, 'desktopImage', true)
                                      e.target.value = ''
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive}
                                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-secondary-700">Active (show on home page)</span>
                              </label>
                              <p className="text-xs text-secondary-500 mt-1 ml-6">Uncheck to hide this banner from the home page without deleting it.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Show from (optional)</label>
                                <input
                                  type="datetime-local"
                                  value={editForm.startDate}
                                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Show until (optional)</label>
                                <input
                                  type="datetime-local"
                                  value={editForm.endDate}
                                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button type="button" onClick={() => setEditingBanner(null)} className="btn-secondary flex-1">
                                Cancel
                              </button>
                              <button type="submit" disabled={saveEditLoading} className="btn-primary flex-1">
                                {saveEditLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save changes'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            )}

            {/* Promo Banners Tab (3rd section after Categories: PNG/JPG/GIF, transparent bg) */}
            {activeTab === 'promo' && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-secondary-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary-600" />
                  Promo Banners
                </h2>
                <p className="text-secondary-600 text-sm">
                  Shown after the Categories section on the home page. Multiple banners supported. Transparent background. Image types: PNG, JPG, GIF.
                </p>

                <form onSubmit={handleAddPromoBanner} className="rounded-xl border border-secondary-200 p-6 space-y-4 bg-secondary-50/30">
                  <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-600" />
                    Add promo banner
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Image (PNG, JPG, or GIF) *</label>
                      <div className="flex gap-2 flex-wrap">
                        <input
                          type="text"
                          value={newPromoBanner.imageUrl}
                          onChange={(e) => setNewPromoBanner({ ...newPromoBanner, imageUrl: e.target.value })}
                          className="input-field flex-1 min-w-[200px]"
                          placeholder="Paste URL or click Upload to choose from device"
                        />
                        <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                          <Upload className="w-4 h-4" />
                          {uploadPromoField === 'imageUrl' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) uploadPromoImage(f, 'imageUrl', false)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Link URL</label>
                      <input
                        type="text"
                        value={newPromoBanner.linkUrl}
                        onChange={(e) => setNewPromoBanner({ ...newPromoBanner, linkUrl: e.target.value })}
                        className="input-field"
                        placeholder="/deals or full URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Alt text (accessibility)</label>
                      <input
                        type="text"
                        value={newPromoBanner.alt}
                        onChange={(e) => setNewPromoBanner({ ...newPromoBanner, alt: e.target.value })}
                        className="input-field"
                        placeholder="Promo"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={addPromoLoading} className="btn-primary">
                    {addPromoLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    Add banner
                  </button>
                </form>

                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">All promo banners</h3>
                  {promoBannersLoading ? (
                    <div className="flex items-center gap-2 text-secondary-500 py-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading…
                    </div>
                  ) : promoBanners.length === 0 ? (
                    <p className="text-secondary-500 text-sm py-4 rounded-xl border border-secondary-200 bg-secondary-50/50 px-4">No promo banners yet. Add one above.</p>
                  ) : (
                    <ul className="divide-y divide-secondary-200 rounded-xl border border-secondary-200 overflow-hidden">
                      {promoBanners.map((banner) => (
                        <li key={banner.id} className="flex items-center gap-4 p-4 bg-secondary-50/50 hover:bg-secondary-50">
                          {banner.imageUrl ? (
                            <div className="w-24 h-14 rounded-lg overflow-hidden bg-secondary-200 flex-shrink-0">
                              <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-24 h-14 rounded-lg bg-secondary-200 flex-shrink-0 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-secondary-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-secondary-600 truncate">→ {banner.linkUrl}</p>
                            <p className="text-xs text-secondary-500 truncate">{banner.alt}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPromo(banner)
                                setEditPromoForm({ imageUrl: banner.imageUrl, linkUrl: banner.linkUrl, alt: banner.alt })
                              }}
                              className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-200"
                              title="Edit"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePromoBanner(banner)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                              title="Remove"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {editingPromo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingPromo(null)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
                        <h3 className="font-semibold text-secondary-900">Edit promo banner</h3>
                        <button type="button" onClick={() => setEditingPromo(null)} className="p-2 rounded-lg hover:bg-secondary-100">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <form onSubmit={handleUpdatePromoBanner} className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Image (PNG, JPG, GIF) *</label>
                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="text"
                              value={editPromoForm.imageUrl}
                              onChange={(e) => setEditPromoForm({ ...editPromoForm, imageUrl: e.target.value })}
                              className="input-field flex-1 min-w-0"
                              placeholder="Paste URL or click Upload"
                            />
                            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              {uploadPromoField === 'imageUrl' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif"
                                className="sr-only"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) uploadPromoImage(f, 'imageUrl', true)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Link URL</label>
                          <input
                            type="text"
                            value={editPromoForm.linkUrl}
                            onChange={(e) => setEditPromoForm({ ...editPromoForm, linkUrl: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Alt text</label>
                          <input
                            type="text"
                            value={editPromoForm.alt}
                            onChange={(e) => setEditPromoForm({ ...editPromoForm, alt: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setEditingPromo(null)} className="btn-secondary flex-1">Cancel</button>
                          <button type="submit" disabled={savePromoEditLoading} className="btn-primary flex-1">
                            {savePromoEditLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
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
