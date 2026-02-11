'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
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

interface ExclusiveOffersSectionProps {
  products: Product[]
}

export default function ExclusiveOffersSection({ products }: ExclusiveOffersSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!products.length) return null

  return (
    <section ref={sectionRef} className="py-6 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: one line on mobile (smaller), row on desktop */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-0.5 sm:gap-2 bg-primary-100 text-primary-700 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-semibold shrink-0">
              <Tag className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              On Sale
            </span>
            <h2 className="text-sm sm:text-3xl font-bold text-secondary-900 truncate">
              Exclusive Offers
            </h2>
          </div>
          <Link
            href="/products?sale=true"
            className="inline-flex items-center gap-1 sm:gap-2 bg-primary-600 text-white px-2 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-semibold hover:bg-primary-700 transition-colors group shrink-0"
          >
            View All
            <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll with arrows overlay on products */}
        <div className="sm:hidden relative -mx-4 px-4">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[56vw] max-w-[220px] snap-start"
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
          {/* Arrows overlay on left/right of product strip */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-0 py-4">
            <div className="pointer-events-auto ml-0.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-white/95 shadow-md border border-secondary-100 flex items-center justify-center text-secondary-700 hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="pointer-events-auto mr-0.5">
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-white/95 shadow-md border border-secondary-100 flex items-center justify-center text-secondary-700 hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
