'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tag, ArrowRight, Package, Clock, Flame, Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals')
      if (res.ok) {
        const data = await res.json()
        setDeals(data)
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

  if (loading) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-0 sm:pt-20 pb-16 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Hot Deals
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-2">
            Bundle & Save
          </h1>
          <p className="text-secondary-600 max-w-md mx-auto">
            Get more for less with our special combo deals
          </p>
        </motion.div>

        {/* Deals Grid */}
        {deals.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No deals available</h3>
            <p className="text-secondary-500 mb-6">Check back later for amazing bundle offers</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal, index) => {
              const savings = deal.originalPrice - deal.dealPrice
              const savingsPercent = Math.round((savings / deal.originalPrice) * 100)
              const timeRemaining = deal.endDate ? getTimeRemaining(deal.endDate) : null

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/deals/${deal.slug}`}>
                    <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:shadow-xl transition-all group h-full">
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
        )}
      </div>
    </div>
  )
}
