'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  costPrice: number
  price: number
  salePrice: number | null
  images: string
  stock: number
  isActive: boolean
  category: { name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface AdminProductsListProps {
  products: Product[]
  categories: Category[]
}

export default function AdminProductsList({ products, categories }: AdminProductsListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || product.category.slug === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (productId: string, productName: string, forceDelete = false) => {
    const confirmMessage = forceDelete
      ? `⚠️ FORCE DELETE: This will permanently delete "${productName}" AND all its order history. This cannot be undone! Continue?`
      : `Are you sure you want to delete "${productName}"?`
    
    if (!confirm(confirmMessage)) return

    try {
      const url = forceDelete 
        ? `/api/admin/products/${productId}?force=true`
        : `/api/admin/products/${productId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.deleted) {
        toast.success('Product permanently deleted!')
        window.location.reload()
      } else if (data.hasOrderHistory && !forceDelete) {
        // Ask if they want to force delete
        const shouldForce = confirm(
          `"${productName}" has order history and cannot be deleted normally.\n\n` +
          `Do you want to FORCE DELETE? This will:\n` +
          `• Remove the product permanently\n` +
          `• Remove all order records for this product\n\n` +
          `Click OK to Force Delete, or Cancel to keep the product.`
        )
        if (shouldForce) {
          handleDelete(productId, productName, true)
        }
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Products</h1>
          <p className="text-secondary-600 mt-1">{products.length} products in your store</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-12"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field appearance-none pr-10 min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Category</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Cost</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Profit</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Stock</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-secondary-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredProducts.map((product, index) => {
                const images = JSON.parse(product.images)
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary-100">
                          <Image
                            src={images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{product.name}</p>
                          <p className="text-sm text-secondary-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-secondary-600">
                        PKR {(product.costPrice || 0).toFixed(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        {product.salePrice ? (
                          <>
                            <span className="font-semibold text-primary-600">
                              PKR {product.salePrice.toFixed(0)}
                            </span>
                            <span className="block text-xs text-secondary-400 line-through">
                              PKR {product.price.toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-secondary-900">
                            PKR {product.price.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(() => {
                        const sellingPrice = product.salePrice || product.price
                        const profit = sellingPrice - (product.costPrice || 0)
                        const profitPercent = product.costPrice ? ((profit / product.costPrice) * 100).toFixed(0) : '0'
                        return (
                          <div>
                            <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              PKR {profit.toFixed(0)}
                            </span>
                            <span className="block text-xs text-secondary-400">
                              {profitPercent}%
                            </span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {product.stock === 0 ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : product.stock < 10 ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Package className="w-4 h-4 text-green-500" />
                        )}
                        <span className={`font-medium ${
                          product.stock === 0 
                            ? 'text-red-500' 
                            : product.stock < 10 
                              ? 'text-amber-500' 
                              : 'text-secondary-900'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-secondary-100 text-secondary-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}
