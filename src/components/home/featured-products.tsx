'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/products/product-card'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  stock: number
  category: {
    name: string
    slug: string
  }
}

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6 sm:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-medium text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Featured Collection
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-secondary-950">Best Sellers</h2>
          </div>
          <Link
            href="/products?featured=true"
            className="hidden sm:flex btn-ghost items-center"
          >
            View All
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>

        {/* Mobile: Horizontal Scroll */}
        <div className="sm:hidden relative">
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[160px] snap-start"
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
          
          {/* Scroll Buttons - Mobile */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-5 h-5 text-secondary-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center z-10"
          >
            <ChevronRight className="w-5 h-5 text-secondary-700" />
          </button>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile: View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sm:hidden mt-4 text-center"
        >
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-16 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative px-5 py-6 sm:px-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white mb-1 sm:mb-2">
                New Collection Available!
              </h3>
              <p className="text-white/80 text-sm sm:text-base">Get 20% off on first order</p>
            </div>
            <Link
              href="/products"
              className="bg-white text-primary-600 hover:bg-secondary-100 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              Shop New Arrivals
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
