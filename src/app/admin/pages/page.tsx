'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Edit2, Eye, EyeOff, Save, X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Home, Info, Phone, HelpCircle, Truck, RefreshCw, 
  Ruler, Shield, FileCheck, Cookie, Briefcase, BookOpen, Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Page {
  id: string
  slug: string
  title: string
  content: string
  isPublished: boolean
  updatedAt: string
}

interface Section {
  id: string
  type: 'text' | 'list' | 'faq' | 'stats' | 'cta' | 'cards' | 'table' | 'image'
  title: string
  subtitle?: string
  content?: string
  items?: any[]
  buttonText?: string
  buttonLink?: string
  bgColor?: 'white' | 'light' | 'dark' | 'primary'
  imageUrl?: string
  tableHeaders?: string[]
  tableRows?: string[][]
}

interface PageContent {
  heroTitle: string
  heroSubtitle: string
  heroImage?: string
  sections: Section[]
}

// Page templates
const pageTemplates = [
  { slug: 'about', title: 'About Us', icon: Info, description: 'Company information and story' },
  { slug: 'contact', title: 'Contact', icon: Phone, description: 'Contact information and form' },
  { slug: 'faq', title: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
  { slug: 'shipping', title: 'Shipping Info', icon: Truck, description: 'Shipping policies and times' },
  { slug: 'returns', title: 'Returns & Exchanges', icon: RefreshCw, description: 'Return and refund policies' },
  { slug: 'size-guide', title: 'Size Guide', icon: Ruler, description: 'Size charts and measurements' },
  { slug: 'privacy', title: 'Privacy Policy', icon: Shield, description: 'Data privacy information' },
  { slug: 'terms', title: 'Terms of Service', icon: FileCheck, description: 'Legal terms and conditions' },
  { slug: 'cookies', title: 'Cookie Policy', icon: Cookie, description: 'Cookie usage policy' },
  { slug: 'careers', title: 'Careers', icon: Briefcase, description: 'Job openings and company culture' },
  { slug: 'blog', title: 'Blog', icon: BookOpen, description: 'Blog posts and articles' },
]

const sectionTypes = [
  { type: 'text', label: 'Text Block', description: 'Rich text content' },
  { type: 'list', label: 'List', description: 'Bullet point list' },
  { type: 'table', label: 'Table', description: 'Size chart table' },
  { type: 'image', label: 'Image', description: 'Upload size chart image' },
  { type: 'faq', label: 'FAQ', description: 'Collapsible Q&A' },
  { type: 'stats', label: 'Statistics', description: 'Number highlights' },
  { type: 'cards', label: 'Cards', description: 'Grid of cards' },
  { type: 'cta', label: 'Call to Action', description: 'Button with text' },
]

const bgColors = [
  { value: 'white', label: 'White', class: 'bg-white' },
  { value: 'light', label: 'Light Gray', class: 'bg-secondary-100' },
  { value: 'dark', label: 'Dark', class: 'bg-secondary-800' },
  { value: 'primary', label: 'Primary', class: 'bg-primary-600' },
]

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [currentSlug, setCurrentSlug] = useState('')
  const [pageContent, setPageContent] = useState<PageContent>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    sections: [],
  })
  const [isPublished, setIsPublished] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch (error) {
      toast.error('Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (slug: string) => {
    const template = pageTemplates.find(t => t.slug === slug)
    const existingPage = pages.find(p => p.slug === slug)
    
    setCurrentSlug(slug)
    
    if (existingPage && existingPage.content) {
      try {
        const parsed = JSON.parse(existingPage.content)
        setPageContent({
          heroTitle: parsed.heroTitle || template?.title || '',
          heroSubtitle: parsed.heroSubtitle || '',
          heroImage: parsed.heroImage || '',
          sections: parsed.sections || [],
        })
        setIsPublished(existingPage.isPublished)
      } catch {
        setPageContent({
          heroTitle: template?.title || '',
          heroSubtitle: '',
          heroImage: '',
          sections: [],
        })
        setIsPublished(true)
      }
    } else {
      setPageContent({
        heroTitle: template?.title || '',
        heroSubtitle: `Welcome to our ${template?.title.toLowerCase()} page`,
        heroImage: '',
        sections: [],
      })
      setIsPublished(true)
    }
    
    setExpandedSections([])
    setShowEditor(true)
  }

  const handleSave = async () => {
    try {
      const template = pageTemplates.find(t => t.slug === currentSlug)
      
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: currentSlug,
          title: template?.title || pageContent.heroTitle,
          content: JSON.stringify(pageContent),
          isPublished,
        }),
      })

      if (res.ok) {
        toast.success('Page saved successfully!')
        setShowEditor(false)
        fetchPages()
      } else {
        toast.error('Failed to save page')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const addSection = (type: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type: type as Section['type'],
      title: '',
      subtitle: '',
      content: '',
      items: type === 'list' ? [{ text: '' }] : 
             type === 'faq' ? [{ question: '', answer: '' }] :
             type === 'stats' ? [{ number: '', label: '' }] :
             type === 'cards' ? [{ title: '', description: '' }] : [],
      bgColor: 'white',
      imageUrl: type === 'image' ? '' : undefined,
      tableHeaders: type === 'table' ? ['Size', 'Measurement'] : undefined,
      tableRows: type === 'table' ? [['', '']] : undefined,
    }
    setPageContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setExpandedSections(prev => [...prev, newSection.id])
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    setPageContent(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    }))
  }

  const removeSection = (id: string) => {
    setPageContent(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = pageContent.sections.findIndex(s => s.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pageContent.sections.length - 1)) return
    
    const newSections = [...pageContent.sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
    
    setPageContent(prev => ({ ...prev, sections: newSections }))
  }

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }

    setUploadingHeroImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setPageContent(prev => ({ ...prev, heroImage: data.url }))
        toast.success('Hero image uploaded!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingHeroImage(false)
    }
  }

  const togglePublish = async (page: Page) => {
    try {
      const res = await fetch(`/api/admin/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isPublished: !page.isPublished }),
      })

      if (res.ok) {
        toast.success(page.isPublished ? 'Page unpublished' : 'Page published')
        fetchPages()
      }
    } catch (error) {
      toast.error('Failed to update page')
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
        <h1 className="text-2xl font-bold text-secondary-900">Page Management</h1>
        <p className="text-secondary-600">Edit content for all website pages - no coding required!</p>
      </div>

      {/* Pages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageTemplates.map((template, index) => {
          const page = pages.find(p => p.slug === template.slug)
          const Icon = template.icon

          return (
            <motion.div
              key={template.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border p-6 ${
                page ? 'border-green-200' : 'border-secondary-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${page ? 'bg-green-100' : 'bg-secondary-100'}`}>
                  <Icon className={`w-6 h-6 ${page ? 'text-green-600' : 'text-secondary-600'}`} />
                </div>
                {page && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    page.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-secondary-900 mb-1">{template.title}</h3>
              <p className="text-sm text-secondary-500 mb-4">{template.description}</p>

              {page && (
                <p className="text-xs text-secondary-400 mb-4">
                  Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template.slug)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  {page ? 'Edit' : 'Setup'}
                </button>
                {page && (
                  <>
                    <button
                      onClick={() => togglePublish(page)}
                      className={`p-2 rounded-lg transition-colors ${
                        page.isPublished
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={page.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {page.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <a
                      href={`/${template.slug}`}
                      target="_blank"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Page"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Visual Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-secondary-50">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    Edit: {pageTemplates.find(t => t.slug === currentSlug)?.title}
                  </h2>
                  <p className="text-sm text-secondary-500">/{currentSlug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-secondary-300"
                    />
                    Published
                  </label>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="p-2 text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-xl border border-primary-100">
                  <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary-600" />
                    Hero Section
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={pageContent.heroTitle}
                        onChange={(e) => setPageContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Page Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Subtitle</label>
                      <textarea
                        value={pageContent.heroSubtitle}
                        onChange={(e) => setPageContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        rows={2}
                        placeholder="Brief description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Hero Image (optional)</label>
                      
                      {/* Image Preview */}
                      {pageContent.heroImage && (
                        <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden border border-secondary-200 group">
                          <img
                            src={pageContent.heroImage}
                            alt="Hero"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPageContent(prev => ({ ...prev, heroImage: '' }))}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Upload Button */}
                      <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors mb-3 ${
                        uploadingHeroImage 
                          ? 'border-primary-300 bg-primary-50 cursor-wait' 
                          : 'border-secondary-300 hover:border-primary-500 cursor-pointer'
                      }`}>
                        {uploadingHeroImage ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full"
                            />
                            <span className="text-primary-600 font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 text-secondary-600" />
                            <span className="text-secondary-600">Upload from Device</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleHeroImageUpload}
                          className="hidden"
                          disabled={uploadingHeroImage}
                        />
                      </label>

                      {/* URL Input */}
                      <div className="flex items-center gap-2 text-xs text-secondary-500 mb-2">
                        <div className="flex-1 border-t border-secondary-200"></div>
                        <span>OR</span>
                        <div className="flex-1 border-t border-secondary-200"></div>
                      </div>
                      <input
                        type="text"
                        value={pageContent.heroImage || ''}
                        onChange={(e) => setPageContent(prev => ({ ...prev, heroImage: e.target.value }))}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Or paste image URL: https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-secondary-900">Content Sections</h3>
                  </div>

                  {/* Existing Sections */}
                  <div className="space-y-4 mb-4">
                    {pageContent.sections.map((section, index) => (
                      <div key={section.id} className="border border-secondary-200 rounded-xl overflow-hidden">
                        {/* Section Header */}
                        <div
                          className="flex items-center justify-between p-4 bg-secondary-50 cursor-pointer"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-secondary-400" />
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">
                              {section.type}
                            </span>
                            <span className="font-medium text-secondary-900">
                              {section.title || `Section ${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up') }}
                              disabled={index === 0}
                              className="p-1 text-secondary-400 hover:text-secondary-600 disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down') }}
                              disabled={index === pageContent.sections.length - 1}
                              className="p-1 text-secondary-400 hover:text-secondary-600 disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {expandedSections.includes(section.id) ? 
                              <ChevronUp className="w-5 h-5 text-secondary-400" /> : 
                              <ChevronDown className="w-5 h-5 text-secondary-400" />
                            }
                          </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections.includes(section.id) && (
                          <div className="p-4 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Section Title</label>
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                  placeholder="Section title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Background</label>
                                <select
                                  value={section.bgColor || 'white'}
                                  onChange={(e) => updateSection(section.id, { bgColor: e.target.value as Section['bgColor'] })}
                                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                >
                                  {bgColors.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">Subtitle (optional)</label>
                              <input
                                type="text"
                                value={section.subtitle || ''}
                                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                                className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                placeholder="Section subtitle"
                              />
                            </div>

                            {/* Type-specific fields */}
                            {section.type === 'text' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Content</label>
                                <textarea
                                  value={section.content || ''}
                                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                  rows={6}
                                  placeholder="Your text content here..."
                                />
                              </div>
                            )}

                            {section.type === 'list' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">List Items</label>
                                {(section.items || []).map((item: any, i: number) => (
                                  <div key={i} className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={item.text}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])]
                                        newItems[i] = { text: e.target.value }
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                      placeholder="List item"
                                    />
                                    <button
                                      onClick={() => {
                                        const newItems = (section.items || []).filter((_: any, idx: number) => idx !== i)
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => updateSection(section.id, { items: [...(section.items || []), { text: '' }] })}
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  + Add Item
                                </button>
                              </div>
                            )}

                            {section.type === 'faq' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">FAQ Items</label>
                                {(section.items || []).map((item: any, i: number) => (
                                  <div key={i} className="p-3 bg-secondary-50 rounded-lg mb-2">
                                    <input
                                      type="text"
                                      value={item.question}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])]
                                        newItems[i] = { ...newItems[i], question: e.target.value }
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm mb-2"
                                      placeholder="Question"
                                    />
                                    <textarea
                                      value={item.answer}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])]
                                        newItems[i] = { ...newItems[i], answer: e.target.value }
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                      rows={2}
                                      placeholder="Answer"
                                    />
                                    <button
                                      onClick={() => {
                                        const newItems = (section.items || []).filter((_: any, idx: number) => idx !== i)
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="text-sm text-red-500 mt-2"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => updateSection(section.id, { items: [...(section.items || []), { question: '', answer: '' }] })}
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  + Add FAQ
                                </button>
                              </div>
                            )}

                            {section.type === 'stats' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Statistics</label>
                                <div className="grid md:grid-cols-2 gap-2">
                                  {(section.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={item.number}
                                        onChange={(e) => {
                                          const newItems = [...(section.items || [])]
                                          newItems[i] = { ...newItems[i], number: e.target.value }
                                          updateSection(section.id, { items: newItems })
                                        }}
                                        className="w-24 px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                        placeholder="10,000+"
                                      />
                                      <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => {
                                          const newItems = [...(section.items || [])]
                                          newItems[i] = { ...newItems[i], label: e.target.value }
                                          updateSection(section.id, { items: newItems })
                                        }}
                                        className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                        placeholder="Label"
                                      />
                                      <button
                                        onClick={() => {
                                          const newItems = (section.items || []).filter((_: any, idx: number) => idx !== i)
                                          updateSection(section.id, { items: newItems })
                                        }}
                                        className="p-2 text-red-500"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => updateSection(section.id, { items: [...(section.items || []), { number: '', label: '' }] })}
                                  className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                                >
                                  + Add Stat
                                </button>
                              </div>
                            )}

                            {section.type === 'cards' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Cards</label>
                                {(section.items || []).map((item: any, i: number) => (
                                  <div key={i} className="p-3 bg-secondary-50 rounded-lg mb-2">
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])]
                                        newItems[i] = { ...newItems[i], title: e.target.value }
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm mb-2"
                                      placeholder="Card title"
                                    />
                                    <textarea
                                      value={item.description}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])]
                                        newItems[i] = { ...newItems[i], description: e.target.value }
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                      rows={2}
                                      placeholder="Card description"
                                    />
                                    <button
                                      onClick={() => {
                                        const newItems = (section.items || []).filter((_: any, idx: number) => idx !== i)
                                        updateSection(section.id, { items: newItems })
                                      }}
                                      className="text-sm text-red-500 mt-2"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => updateSection(section.id, { items: [...(section.items || []), { title: '', description: '' }] })}
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  + Add Card
                                </button>
                              </div>
                            )}

                            {section.type === 'cta' && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-secondary-700 mb-1">Button Text</label>
                                  <input
                                    type="text"
                                    value={section.buttonText || ''}
                                    onChange={(e) => updateSection(section.id, { buttonText: e.target.value })}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                    placeholder="Shop Now"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-secondary-700 mb-1">Button Link</label>
                                  <input
                                    type="text"
                                    value={section.buttonLink || ''}
                                    onChange={(e) => updateSection(section.id, { buttonLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                    placeholder="/products"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-secondary-700 mb-1">CTA Text (optional)</label>
                                  <input
                                    type="text"
                                    value={section.content || ''}
                                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                    placeholder="Ready to get started?"
                                  />
                                </div>
                              </div>
                            )}

                            {section.type === 'table' && (
                              <div>
                                {/* Single Scrollable Container for Headers and Rows */}
                                <div className="border border-secondary-200 rounded-lg p-3 bg-secondary-50">
                                  <div className="overflow-x-auto scrollbar-thin">
                                    <div className="min-w-max">
                                      {/* Table Headers */}
                                      <div className="mb-3">
                                        <label className="block text-xs font-medium text-secondary-600 mb-2">Headers</label>
                                        <div className="flex gap-1.5">
                                          {(section.tableHeaders || []).map((header: string, i: number) => (
                                            <div key={i} className="flex gap-1 w-[140px]">
                                              <input
                                                type="text"
                                                value={header}
                                                onChange={(e) => {
                                                  const newHeaders = [...(section.tableHeaders || [])]
                                                  newHeaders[i] = e.target.value
                                                  updateSection(section.id, { tableHeaders: newHeaders })
                                                }}
                                                className="flex-1 px-2 py-1.5 border border-secondary-300 rounded text-xs bg-white"
                                                placeholder={`Col ${i + 1}`}
                                              />
                                              {(section.tableHeaders || []).length > 1 && (
                                                <button
                                                  onClick={() => {
                                                    const newHeaders = (section.tableHeaders || []).filter((_: string, idx: number) => idx !== i)
                                                    const newRows = (section.tableRows || []).map((row: string[]) => 
                                                      row.filter((_: string, idx: number) => idx !== i)
                                                    )
                                                    updateSection(section.id, { tableHeaders: newHeaders, tableRows: newRows })
                                                  }}
                                                  className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button
                                            onClick={() => {
                                              const newHeaders = [...(section.tableHeaders || []), '']
                                              const newRows = (section.tableRows || []).map((row: string[]) => [...row, ''])
                                              updateSection(section.id, { tableHeaders: newHeaders, tableRows: newRows })
                                            }}
                                            className="px-2 py-1.5 text-primary-600 hover:bg-primary-50 rounded text-xs whitespace-nowrap flex-shrink-0 border border-primary-200"
                                          >
                                            + Col
                                          </button>
                                        </div>
                                      </div>

                                      {/* Table Rows */}
                                      <div>
                                        <label className="block text-xs font-medium text-secondary-600 mb-2">Rows</label>
                                        <div className="space-y-1.5">
                                          {(section.tableRows || []).map((row: string[], i: number) => (
                                            <div key={i} className="flex gap-1.5">
                                              {row.map((cell: string, j: number) => (
                                                <input
                                                  key={j}
                                                  type="text"
                                                  value={cell}
                                                  onChange={(e) => {
                                                    const newRows = [...(section.tableRows || [])]
                                                    newRows[i][j] = e.target.value
                                                    updateSection(section.id, { tableRows: newRows })
                                                  }}
                                                  className="w-[140px] px-2 py-1.5 border border-secondary-300 rounded text-xs bg-white"
                                                  placeholder={section.tableHeaders?.[j] || `Col ${j + 1}`}
                                                />
                                              ))}
                                              <button
                                                onClick={() => {
                                                  const newRows = (section.tableRows || []).filter((_: string[], idx: number) => idx !== i)
                                                  updateSection(section.id, { tableRows: newRows })
                                                }}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Add Row Button Outside */}
                                <button
                                  onClick={() => {
                                    const newRow = new Array((section.tableHeaders || []).length).fill('')
                                    updateSection(section.id, { tableRows: [...(section.tableRows || []), newRow] })
                                  }}
                                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  + Add Row
                                </button>
                              </div>
                            )}

                            {section.type === 'image' && (
                              <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Size Chart Image</label>
                                <div className="space-y-3">
                                  <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                                    <ImageIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                                    <label className="cursor-pointer">
                                      <span className="text-primary-600 hover:text-primary-700 font-medium">
                                        Upload Image
                                      </span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0]
                                          if (!file) return

                                          const formData = new FormData()
                                          formData.append('file', file)

                                          try {
                                            const res = await fetch('/api/upload', {
                                              method: 'POST',
                                              body: formData,
                                            })

                                            if (res.ok) {
                                              const { url } = await res.json()
                                              updateSection(section.id, { imageUrl: url })
                                              toast.success('Image uploaded!')
                                            } else {
                                              toast.error('Upload failed')
                                            }
                                          } catch (error) {
                                            toast.error('Upload error')
                                          }
                                        }}
                                      />
                                    </label>
                                    <p className="text-xs text-secondary-500 mt-1">or enter URL below</p>
                                  </div>

                                  <input
                                    type="text"
                                    value={section.imageUrl || ''}
                                    onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                    placeholder="https://example.com/size-chart.jpg"
                                  />

                                  {section.imageUrl && (
                                    <div className="relative">
                                      <img
                                        src={section.imageUrl}
                                        alt="Size chart preview"
                                        className="w-full rounded-lg border border-secondary-200"
                                      />
                                      <button
                                        onClick={() => updateSection(section.id, { imageUrl: '' })}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Section */}
                  <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6">
                    <p className="text-center text-secondary-500 mb-4">Add a content section</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sectionTypes.map(st => (
                        <button
                          key={st.type}
                          onClick={() => addSection(st.type)}
                          className="p-3 text-left bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                          <span className="font-medium text-secondary-900 text-sm">{st.label}</span>
                          <p className="text-xs text-secondary-500">{st.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-secondary-200 bg-secondary-50">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-secondary-700 hover:bg-secondary-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Save className="w-5 h-5" />
                  Save Page
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
