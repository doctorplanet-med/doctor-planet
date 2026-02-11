'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Tag, ChevronLeft, ChevronRight, Package } from 'lucide-react'

interface DealItemProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  stock: number
}

interface DealItem {
  productId: string
  quantity: number
  product?: DealItemProduct
}

export interface DealForSection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  dealPrice: number
  originalPrice: number
  items: DealItem[]
  endDate: string | null
}

interface DealsOffersSectionProps {
  deals: DealForSection[]
}

function DealCard({ deal, index }: { deal: DealForSection; index: number }) {
  const images: string[] = []
  if (deal.image) {
    images.push(deal.image)
  } else if (deal.items?.length) {
    deal.items.slice(0, 4).forEach((item) => {
      try {
        const parsed = item.product?.images ? JSON.parse(item.product.images) : []
        const arr = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
        if (arr[0]) images.push(arr[0])
      } catch {}
    })
  }
  const mainImage = images[0]
  const savings = deal.originalPrice > 0
    ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
    : 0

  return (
    <Link href={`/deals/${deal.slug}`} className="block group">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl border border-secondary-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all h-full flex flex-col"
      >
        <div className="relative aspect-square bg-secondary-50">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={deal.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 56vw, 220px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-10 h-10 text-secondary-300" />
            </div>
          )}
          {savings > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
              Save {savings}%
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-secondary-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
            {deal.name}
          </h3>
          <div className="mt-auto pt-2">
            <span className="text-base font-bold text-primary-600">
              PKR {deal.dealPrice.toLocaleString()}
            </span>
            {deal.originalPrice > deal.dealPrice && (
              <span className="ml-2 text-xs text-secondary-400 line-through">
                PKR {deal.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function DealsOffersSection({ deals }: DealsOffersSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!deals.length) return null

  return (
    <section ref={sectionRef} className="py-2 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: same layout as Exclusive Offers */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-0.5 sm:gap-2 bg-primary-100 text-primary-700 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-semibold shrink-0">
              <Tag className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              Bundles
            </span>
            <h2 className="text-sm sm:text-3xl font-bold text-secondary-900 truncate">
              Deals
            </h2>
          </div>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 sm:gap-2 bg-primary-600 text-white px-2 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-semibold hover:bg-primary-700 transition-colors group shrink-0"
          >
            View All
            <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll with arrows overlay */}
        <div className="sm:hidden relative -mx-4 px-4">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
          >
            {deals.map((deal, index) => (
              <div
                key={deal.id}
                className="flex-shrink-0 w-[56vw] max-w-[220px] snap-start"
              >
                <DealCard deal={deal} index={index} />
              </div>
            ))}
          </div>
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
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06 }}
            >
              <DealCard deal={deal} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
