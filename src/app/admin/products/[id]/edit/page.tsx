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
} from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [colorImages, setColorImages] = useState<Record<string, string>>({})
  const [colorSizeStock, setColorSizeStock] = useState<Record<string, Record<string, number>>>({})
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')

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
            setColorImages(product.colorImages ? JSON.parse(product.colorImages) : {})
          } catch { setColorImages({}) }
          
          try {
            setColorSizeStock(product.colorSizeStock ? JSON.parse(product.colorSizeStock) : {})
          } catch { setColorSizeStock({}) }
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

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
        } else {
          const error = await response.json()
          toast.error(`${file.name}: ${error.error}`)
        }
      } catch (error) {
        toast.error(`${file.name}: Upload failed`)
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

  const setColorImage = (color: string, imageUrl: string) => {
    setColorImages({ ...colorImages, [color]: imageUrl })
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
          barcode: formData.barcode || null,
          sku: formData.sku || null,
          company: formData.company || null,
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
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={4}
                  className="input-field resize-none"
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

            {/* Color-Image Mapping */}
            {colors.length > 0 && images.length > 0 && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="text-sm font-medium text-secondary-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary-600" />
                  Assign Images to Colors
                </h3>
                <div className="space-y-3">
                  {colors.map((color) => (
                    <div key={color} className="flex items-center gap-4 p-3 bg-secondary-50 rounded-xl">
                      <span className="font-medium text-secondary-900 min-w-[80px]">{color}</span>
                      <select
                        value={colorImages[color] || ''}
                        onChange={(e) => setColorImage(color, e.target.value)}
                        className="input-field flex-1 text-sm"
                      >
                        <option value="">Select image for {color}</option>
                        {images.map((img, idx) => (
                          <option key={idx} value={img}>
                            Image {idx + 1} {idx === 0 ? '(Main)' : ''}
                          </option>
                        ))}
                      </select>
                      {colorImages[color] && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
                          <Image
                            src={colorImages[color]}
                            alt={color}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
                          {colorImages[color] && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-secondary-200">
                              <Image
                                src={colorImages[color]}
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
