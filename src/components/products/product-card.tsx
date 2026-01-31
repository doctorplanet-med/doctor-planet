'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart-store'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: string
  category: {
    name: string
    slug: string
  }
  stock: number
}

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const { addItem, setCartOpen } = useCartStore()

  const images = JSON.parse(product.images)
  const mainImage = images[0]
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || undefined,
      image: mainImage,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`}>
        <div
          className="card-hover relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-secondary-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
                >
                  -{discount}%
                </motion.span>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-secondary-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                  toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isLiked
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-secondary-700 hover:bg-primary-600 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white text-secondary-700 flex items-center justify-center shadow-lg hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Eye className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 20 
              }}
              className="absolute bottom-4 left-4 right-4"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-primary-600 font-medium mb-1">
              {product.category.name}
            </p>
            <h3 className="font-heading font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-primary-600">
                    PKR {product.salePrice.toFixed(0)}
                  </span>
                  <span className="text-sm text-secondary-400 line-through">
                    PKR {product.price.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-secondary-900">
                  PKR {product.price.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
