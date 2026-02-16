'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Save,
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  Barcode,
  Building2,
  Sliders,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadToFirebase } from '@/lib/upload'
import RichTextEditor from '@/components/admin/rich-text-editor'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  costPrice: number
  price: number
  salePrice: number | null
  categoryId: string
  stock: number
  isActive: boolean
  featured: boolean
  images: string
  sizes: string | null
  colors: string | null
  colorImages: string | null
  colorSizeStock: string | null
  sizeChartImage?: string | null
  hasCustomization?: boolean
  customizationFields?: string | null
  customizationPrice?: number | null
  customizationCategories?: { id: string; name: string; order: number; options: { id: string; name: string; order: number }[] }[]
  barcode: string | null
  sku: string | null
  company: string | null
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    costPrice: '',
    price: '',
    salePrice: '',
    categoryId: '',
    stock: '',
    isActive: true,
    isFeatured: false,
    barcode: '',
    sku: '',
    company: '',
  })
  
  const [images, setImages] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({})
  const [colorSizeStock, setColorSizeStock] = useState<Record<string, Record<string, number>>>({})
  const [sizeChartImage, setSizeChartImage] = useState<string>('')
  const [isUploadingSizeChart, setIsUploadingSizeChart] = useState(false)
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')
  // Customization (optional) - categories with options (CustomizationCategory / CustomizationOption in DB)
  const [hasCustomization, setHasCustomization] = useState(false)
  const [customizationCategories, setCustomizationCategories] = useState<{ name: string; options: string[]; newOption: string }[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [customizationPrice, setCustomizationPrice] = useState('')

  const calculatedTotalStock = Object.values(colorSizeStock).reduce((total, sizeStocks) => {
    return total + Object.values(sizeStocks).reduce((sum, qty) => sum + qty, 0)
  }, 0)

  const useVariantStock = colors.length > 0 && sizes.length > 0

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`)
        if (response.ok) {
          const product: Product = await response.json()
          
          setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description,
            costPrice: product.costPrice?.toString() || '0',
            price: product.price.toString(),
            salePrice: product.salePrice?.toString() || '',
            categoryId: product.categoryId,
            stock: product.stock.toString(),
            isActive: product.isActive,
            isFeatured: product.featured,
            barcode: product.barcode || '',
            sku: product.sku || '',
            company: product.company || '',
          })
          
          // Parse JSON fields
          try {
            setImages(JSON.parse(product.images) || [])
          } catch { setImages([]) }
          
          try {
            setSizes(product.sizes ? JSON.parse(product.sizes) : [])
          } catch { setSizes([]) }
          
          try {
            setColors(product.colors ? JSON.parse(product.colors) : [])
          } catch { setColors([]) }
          
          try {
            const raw = product.colorImages ? JSON.parse(product.colorImages) : {}
            // Support legacy: value can be string (single image) or string[] (multiple)
            const normalized: Record<string, string[]> = {}
            for (const [color, val] of Object.entries(raw)) {
              normalized[color] = Array.isArray(val) ? val : (val ? [val] : [])
            }
            setColorImages(normalized)
          } catch { setColorImages({}) }
          
          try {
            setColorSizeStock(product.colorSizeStock ? JSON.parse(product.colorSizeStock) : {})
          } catch { setColorSizeStock({}) }
          setSizeChartImage(product.sizeChartImage || '')
          setHasCustomization(product.hasCustomization ?? false)
          if (product.customizationCategories?.length) {
            setCustomizationCategories(
              product.customizationCategories.map((c) => ({
                name: c.name,
                options: c.options.map((o) => o.name),
                newOption: '',
              }))
            )
          } else {
            try {
              const legacy = product.customizationFields ? JSON.parse(product.customizationFields) : []
              if (Array.isArray(legacy) && legacy.length > 0) {
                setCustomizationCategories([{ name: 'Measurements', options: legacy, newOption: '' }])
              }
            } catch { /* ignore */ }
          }
          setCustomizationPrice(product.customizationPrice != null ? String(product.customizationPrice) : '')
        } else {
          toast.error('Product not found')
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
      } finally {
        setIsFetching(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchProduct()
    fetchCategories()
  }, [productId, router])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 5MB)`)
        continue
      }

      try {
        // Upload directly to Firebase Storage
        const url = await uploadToFirebase(file, 'products')
        uploadedUrls.push(url)
      } catch (error: any) {
        toast.error(`${file.name}: ${error.message || 'Upload failed'}`)
      }
    }

    if (uploadedUrls.length > 0) {
      setImages([...images, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) uploaded`)
    }

    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSizeChartUpload = async (file: File | null) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG or WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)')
      return
    }

    setIsUploadingSizeChart(true)
    try {
      const url = await uploadToFirebase(file, 'size-charts')
      setSizeChartImage(url)
      toast.success('Size chart uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload size chart')
    } finally {
      setIsUploadingSizeChart(false)
    }
  }

  const removeSizeChart = () => {
    setSizeChartImage('')
    toast.success('Size chart removed')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileUpload(e.dataTransfer.files)
  }

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      const trimmedSize = newSize.trim()
      setSizes([...sizes, trimmedSize])
      setNewSize('')
      if (colors.length > 0) {
        const newStock = { ...colorSizeStock }
        colors.forEach(color => {
          if (!newStock[color]) newStock[color] = {}
          newStock[color][trimmedSize] = 0
        })
        setColorSizeStock(newStock)
      }
    }
  }

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size))
    const newStock = { ...colorSizeStock }
    Object.keys(newStock).forEach(color => {
      delete newStock[color][size]
    })
    setColorSizeStock(newStock)
  }

  const addCustomizationCategory = () => {
    const name = newCategoryName.trim()
    if (name) {
      setCustomizationCategories([...customizationCategories, { name, options: [], newOption: '' }])
      setNewCategoryName('')
    }
  }

  const removeCustomizationCategory = (index: number) => {
    setCustomizationCategories(customizationCategories.filter((_, i) => i !== index))
  }

  const updateCustomizationCategoryName = (index: number, name: string) => {
    setCustomizationCategories(customizationCategories.map((c, i) => (i === index ? { ...c, name } : c)))
  }

  const addCustomizationOption = (categoryIndex: number) => {
    const cat = customizationCategories[categoryIndex]
    const opt = cat.newOption.trim()
    if (opt && !cat.options.includes(opt)) {
      setCustomizationCategories(
        customizationCategories.map((c, i) =>
          i === categoryIndex ? { ...c, options: [...c.options, opt], newOption: '' } : c
        )
      )
    }
  }

  const removeCustomizationOption = (categoryIndex: number, optionName: string) => {
    setCustomizationCategories(
      customizationCategories.map((c, i) =>
        i === categoryIndex ? { ...c, options: c.options.filter((o) => o !== optionName) } : c
      )
    )
  }

  const setCustomizationCategoryNewOption = (categoryIndex: number, value: string) => {
    setCustomizationCategories(
      customizationCategories.map((c, i) => (i === categoryIndex ? { ...c, newOption: value } : c))
    )
  }

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      const trimmedColor = newColor.trim()
      setColors([...colors, trimmedColor])
      setNewColor('')
      if (sizes.length > 0) {
        const newStock = { ...colorSizeStock }
        newStock[trimmedColor] = {}
        sizes.forEach(size => {
          newStock[trimmedColor][size] = 0
        })
        setColorSizeStock(newStock)
      }
    }
  }

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color))
    const newColorImages = { ...colorImages }
    delete newColorImages[color]
    setColorImages(newColorImages)
    const newStock = { ...colorSizeStock }
    delete newStock[color]
    setColorSizeStock(newStock)
  }

  /** Toggle an image in/out of a color's image list (multi-select per color) */
  const toggleColorImage = (color: string, imageUrl: string) => {
    const current = colorImages[color] || []
    const next = current.includes(imageUrl)
      ? current.filter((u) => u !== imageUrl)
      : [...current, imageUrl]
    setColorImages({ ...colorImages, [color]: next })
  }

  const updateColorSizeStock = (color: string, size: string, quantity: number) => {
    setColorSizeStock(prev => ({
      ...prev,
      [color]: {
        ...(prev[color] || {}),
        [size]: quantity
      }
    }))
  }

  const getColorTotalStock = (color: string) => {
    if (!colorSizeStock[color]) return 0
    return Object.values(colorSizeStock[color]).reduce((sum, qty) => sum + qty, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (images.length === 0) {
      toast.error('Please upload at least one product image')
      setIsLoading(false)
      return
    }

    if (!formData.categoryId) {
      toast.error('Please select a category')
      setIsLoading(false)
      return
    }

    const finalStock = useVariantStock ? calculatedTotalStock : (parseInt(formData.stock) || 0)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          costPrice: parseFloat(formData.costPrice) || 0,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          categoryId: formData.categoryId,
          stock: finalStock,
          isActive: formData.isActive,
          featured: formData.isFeatured,
          images: JSON.stringify(images),
          sizes: sizes.length > 0 ? JSON.stringify(sizes) : null,
          colors: colors.length > 0 ? JSON.stringify(colors) : null,
          colorImages: Object.keys(colorImages).length > 0 ? JSON.stringify(colorImages) : null,
          colorSizeStock: Object.keys(colorSizeStock).length > 0 ? JSON.stringify(colorSizeStock) : null,
          sizeChartImage: sizeChartImage.trim() || null,
          barcode: formData.barcode || null,
          sku: formData.sku || null,
          company: formData.company || null,
          // Customization (optional) – backend/database to be added later
          hasCustomization,
          customizationFields: null,
          customizationPrice: hasCustomization && customizationPrice.trim() ? parseFloat(customizationPrice) : null,
          customizationCategories: hasCustomization
            ? customizationCategories.map((c, i) => ({
                name: c.name,
                order: i,
                options: c.options.map((name, j) => ({ name, order: j })),
              }))
            : [],
        }),
      })

      if (response.ok) {
        toast.success('Product updated successfully!')
        router.push('/admin/products')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary-900">Edit Product</h1>
            <p className="text-secondary-600 mt-1">Update product details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Premium Medical Scrubs"
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
                  placeholder="premium-medical-scrubs"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Describe your product... Use the toolbar to add formatting, bullets, numbering, etc."
                  required
                />
              </div>

              {/* Barcode & Company Section */}
              <div className="pt-4 border-t border-secondary-200">
                <h3 className="text-sm font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-primary-600" />
                  Product Identification
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value.toUpperCase() })}
                      placeholder="Auto-generated if empty"
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      placeholder="e.g., SCR-BLK-001"
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company/Brand
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., Littmann, 3M"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Product Images
            </h2>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-secondary-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
                  <p className="text-secondary-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-secondary-900 font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-secondary-500">
                    PNG, JPG, WebP or GIF (max 5MB each)
                  </p>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-secondary-700 mb-3">
                  Uploaded Images ({images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary-100">
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                            Main
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Please upload at least one product image
              </p>
            )}

            {/* Size Chart Image (optional - for products that need a size chart) */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Size Chart Image (optional)
              </label>
              <p className="text-xs text-secondary-500 mb-3">
                Upload a size chart image to help customers choose the right size
              </p>
              
              {!sizeChartImage ? (
                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleSizeChartUpload(e.target.files?.[0] || null)}
                      className="hidden"
                      id="editSizeChartInput"
                    />
                    <div
                      onClick={() => document.getElementById('editSizeChartInput')?.click()}
                      className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
                    >
                      {isUploadingSizeChart ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
                          <p className="text-secondary-600 text-sm">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-primary-600" />
                          </div>
                          <p className="text-secondary-900 font-medium mb-1">
                            Click to upload size chart
                          </p>
                          <p className="text-xs text-secondary-500">
                            PNG, JPG or WebP (max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-secondary-100 border-2 border-secondary-200">
                    <div className="relative w-full" style={{ minHeight: '200px' }}>
                      <Image
                        src={sizeChartImage}
                        alt="Size Chart"
                        width={600}
                        height={400}
                        className="w-full h-auto"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeSizeChart}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500">
                    This size chart will be shown to customers on the product page
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Variants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Variants (Optional)
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sizes
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    placeholder="XS, S, M, L, XL"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="btn-primary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 rounded-full text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-secondary-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Colors
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    placeholder="Black, White, Blue"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="btn-primary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 rounded-full text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-secondary-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Color-Image Mapping (multiple images per color) */}
            {colors.length > 0 && images.length > 0 && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="text-sm font-medium text-secondary-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary-600" />
                  Assign Images to Colors
                </h3>
                <p className="text-xs text-secondary-500 mb-4">
                  Select one or more images for each color; customers will see these when they choose that color
                </p>
                <div className="space-y-4">
                  {colors.map((color) => (
                    <div key={color} className="p-4 bg-secondary-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium text-secondary-900">{color}</span>
                        {(colorImages[color]?.length ?? 0) > 0 && (
                          <span className="text-xs text-secondary-500">
                            ({(colorImages[color]?.length ?? 0)} selected)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {images.map((img, idx) => {
                          const selected = (colorImages[color] || []).includes(img)
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleColorImage(color, img)}
                              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                selected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-secondary-200 hover:border-primary-300'
                              }`}
                            >
                              <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                              {selected && (
                                <span className="absolute inset-0 bg-primary-600/30 flex items-center justify-center">
                                  <span className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                    {(colorImages[color] || []).indexOf(img) + 1}
                                  </span>
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Customization (Optional) - admin adds field names; user enters values (e.g. inches) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary-600" />
              Customization (Optional)
            </h2>
            <p className="text-sm text-secondary-500 mb-4">
              Enable for products like stitching of scrub: add measurement field names (e.g. Shoulder, Chest). Customers will enter their measurements (e.g. in inches) in these fields.
            </p>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={hasCustomization}
                onChange={(e) => {
                  setHasCustomization(e.target.checked)
                  if (!e.target.checked) {
                    setCustomizationCategories([])
                    setCustomizationPrice('')
                  }
                }}
                className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-secondary-700">This product supports customization</span>
            </label>
            {hasCustomization && (
              <div className="pt-4 border-t border-secondary-200">
                <p className="text-xs text-secondary-500 mb-4">
                  Add <strong>Customization categories</strong> (e.g. Body Measurements) and <strong>options</strong> under each (e.g. Shoulder, Chest). Users will enter values (e.g. in inches) for each option. Not compulsory.
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomizationCategory())}
                    placeholder="e.g. Body Measurements, Size"
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addCustomizationCategory} className="btn-primary px-4">
                    Add category
                  </button>
                </div>
                {customizationCategories.map((cat, catIndex) => (
                  <div key={catIndex} className="mb-4 p-4 rounded-xl border border-primary-200 bg-primary-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateCustomizationCategoryName(catIndex, e.target.value)}
                        placeholder="Category name"
                        className="input-field flex-1 max-w-[240px]"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomizationCategory(catIndex)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove category"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cat.options.map((opt) => (
                        <span
                          key={opt}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-sm border border-primary-200"
                        >
                          {opt}
                          <button type="button" onClick={() => removeCustomizationOption(catIndex, opt)} className="text-primary-600 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cat.newOption}
                        onChange={(e) => setCustomizationCategoryNewOption(catIndex, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomizationOption(catIndex))}
                        placeholder="e.g. Shoulder, Chest — then Add"
                        className="input-field flex-1 text-sm"
                      />
                      <button type="button" onClick={() => addCustomizationOption(catIndex)} className="btn-secondary text-sm px-3">
                        Add option
                      </button>
                    </div>
                  </div>
                ))}
                {customizationCategories.length === 0 && (
                  <p className="text-xs text-secondary-500 mb-4">
                    Add a category (e.g. Body Measurements), then add options (e.g. Shoulder, Chest).
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Customization price (PKR)
                  </label>
                  <input
                    type="number"
                    value={customizationPrice}
                    onChange={(e) => setCustomizationPrice(e.target.value)}
                    placeholder="e.g. 500"
                    min="0"
                    step="1"
                    className="input-field w-full max-w-[200px]"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Extra amount when customer selects &quot;Customize&quot;. Leave empty for no extra charge.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Color-Size Stock Management */}
          {colors.length > 0 && sizes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-secondary-900">
                    Inventory by Color & Size
                  </h2>
                  <p className="text-sm text-secondary-500 mt-1">
                    Set stock quantity for each color-size combination
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">Total Stock</p>
                  <p className="text-2xl font-bold text-primary-600">{calculatedTotalStock}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary-50">
                      <th className="text-left p-3 font-semibold text-secondary-900 rounded-tl-xl">Color</th>
                      {sizes.map(size => (
                        <th key={size} className="text-center p-3 font-semibold text-secondary-900 min-w-[80px]">
                          {size}
                        </th>
                      ))}
                      <th className="text-center p-3 font-semibold text-secondary-900 rounded-tr-xl bg-primary-50">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color, colorIdx) => (
                      <tr key={color} className={colorIdx % 2 === 0 ? 'bg-white' : 'bg-secondary-50/50'}>
                        <td className="p-3 font-medium text-secondary-900 flex items-center gap-2">
                          {colorImages[color]?.[0] && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-secondary-200">
                              <Image
                                src={colorImages[color][0]}
                                alt={color}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          {color}
                        </td>
                        {sizes.map(size => (
                          <td key={`${color}-${size}`} className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={colorSizeStock[color]?.[size] || 0}
                              onChange={(e) => updateColorSizeStock(color, size, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 text-center border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </td>
                        ))}
                        <td className="p-3 text-center font-semibold text-primary-600 bg-primary-50/50">
                          {getColorTotalStock(color)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-secondary-100">
                      <td className="p-3 font-semibold text-secondary-900 rounded-bl-xl">Size Total</td>
                      {sizes.map(size => {
                        const sizeTotal = colors.reduce((sum, color) => sum + (colorSizeStock[color]?.[size] || 0), 0)
                        return (
                          <td key={`total-${size}`} className="p-3 text-center font-semibold text-secondary-700">
                            {sizeTotal}
                          </td>
                        )
                      })}
                      <td className="p-3 text-center font-bold text-primary-600 bg-primary-100 rounded-br-xl">
                        {calculatedTotalStock}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Pricing
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Cost Price (PKR) *
                </label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="1500"
                  min="0"
                  step="1"
                  className="input-field"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Buying price (what you pay to supplier)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sale Price (PKR) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="2500"
                  min="0"
                  step="1"
                  className="input-field"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Selling price (what customer pays)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Discount Price (PKR)
                </label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="2000"
                  min="0"
                  step="1"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Leave empty if not on sale
                </p>
              </div>

              {/* Profit Margin Display */}
              {formData.costPrice && formData.price && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Profit Margin</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600">Per Unit:</span>
                    <span className="font-bold text-green-700">
                      PKR {(parseFloat(formData.salePrice || formData.price) - parseFloat(formData.costPrice)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-green-600">Percentage:</span>
                    <span className="font-bold text-green-700">
                      {(((parseFloat(formData.salePrice || formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Organization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Organization
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Stock Quantity {!useVariantStock && '*'}
                </label>
                {useVariantStock ? (
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-600">Auto-calculated from variants</span>
                      <span className="text-2xl font-bold text-primary-600">{calculatedTotalStock}</span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-2">
                      Set stock in the "Inventory by Color & Size" section
                    </p>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    min="0"
                    className="input-field"
                    required
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
              Status
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-secondary-700">Active (visible to customers)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-secondary-700">Featured product</span>
              </label>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <Link href="/admin/products" className="btn-ghost flex-1 justify-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </div>
      </form>
    </div>
  )
}
