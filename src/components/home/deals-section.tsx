'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tag, ArrowRight, Package, Clock, Flame } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
}

interface DealItem {
  productId: string
  quantity: number
  product?: Product
}

interface Deal {
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

export default function DealsSection() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setDeals(data.slice(0, 3)) // Show max 3 deals
      }
    } catch (error) {
      console.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return null
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  if (loading || deals.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Hot Deals
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">
            Bundle & Save
          </h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            Get more for less with our special combo deals
          </p>
        </motion.div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => {
            const savings = deal.originalPrice - deal.dealPrice
            const savingsPercent = Math.round((savings / deal.originalPrice) * 100)
            const timeRemaining = deal.endDate ? getTimeRemaining(deal.endDate) : null

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/deals/${deal.slug}`}>
                  <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:shadow-xl transition-all group">
                    {/* Deal Image */}
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                      {deal.image ? (
                        <Image
                          src={deal.image}
                          alt={deal.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Show product images grid */}
                          <div className="grid grid-cols-2 gap-2 p-4 w-full">
                            {deal.items.slice(0, 4).map((item, i) => {
                              const images = item.product?.images ? JSON.parse(item.product.images) : []
                              return (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white shadow">
                                  {images[0] ? (
                                    <Image
                                      src={images[0]}
                                      alt={item.product?.name || 'Product'}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-secondary-300" />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full shadow-lg">
                          Save {savingsPercent}%
                        </span>
                        {timeRemaining && (
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeRemaining}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Deal Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {deal.name}
                      </h3>
                      
                      {deal.description && (
                        <p className="text-sm text-secondary-500 mb-3 line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      {/* Products included */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {deal.items.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded"
                          >
                            {item.product?.name?.slice(0, 15) || 'Product'}
                            {(item.product?.name?.length || 0) > 15 && '...'}
                            {item.quantity > 1 && ` x${item.quantity}`}
                          </span>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary-600">
                              {formatCurrency(deal.dealPrice)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-secondary-400 line-through">
                              {formatCurrency(deal.originalPrice)}
                            </span>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              Save {formatCurrency(savings)}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                          <ArrowRight className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View All */}
        {deals.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors"
            >
              View All Deals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
