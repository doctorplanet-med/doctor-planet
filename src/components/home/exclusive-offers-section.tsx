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

const CARD_WIDTH_DESKTOP = 280
const SCROLL_AMOUNT = 320

export default function ExclusiveOffersSection({ products }: ExclusiveOffersSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRefDesktop = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current ?? scrollRefDesktop.current
    if (el) {
      const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
      el.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  if (!products.length) return null

  return (
    <section ref={sectionRef} className="py-6 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-px bg-secondary-200" />
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 whitespace-nowrap">
            Exclusive Offers
          </h2>
          <div className="flex-1 h-px bg-secondary-200" />
        </div>
        <div className="text-center mb-5 sm:mb-8">
          <Link href="/products?sale=true" className="text-sm text-secondary-600 underline underline-offset-2 hover:text-primary-600 transition-colors">
            View All
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

        {/* Desktop (lg): horizontal scroll with left/right buttons */}
        <div className="hidden sm:block relative">
          <div
            ref={scrollRefDesktop}
            className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 hide-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.06 }}
                className="flex-shrink-0"
                style={{ minWidth: CARD_WIDTH_DESKTOP, maxWidth: CARD_WIDTH_DESKTOP }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none py-4 -mx-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 shadow-lg border border-secondary-200 flex items-center justify-center text-secondary-700 hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 shadow-lg border border-secondary-200 flex items-center justify-center text-secondary-700 hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
