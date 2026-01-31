'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, 
  Shield, 
  RefreshCw, 
  Headphones, 
  Award,
  Clock,
  Sparkles
} from 'lucide-react'

export default function FeaturesSection() {
  const [freeShippingMin, setFreeShippingMin] = useState(5000)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setFreeShippingMin(data.freeShippingMinimum || 5000)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: `Free delivery on orders over PKR ${freeShippingMin}`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'Medical-grade quality standards',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day hassle-free returns',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated team to help you',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Award,
      title: 'Certified Products',
      description: 'FDA approved and certified',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Orders processed in 24 hours',
      color: 'bg-teal-50 text-teal-600',
    },
  ]

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-2 text-primary-600 font-medium text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Why Choose Us
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-secondary-950 mb-2 sm:mb-4">
            The Doctor Planet Difference
          </h2>
          <p className="text-secondary-600 text-sm sm:text-base max-w-lg mx-auto">
            Committed to providing the best for healthcare professionals
          </p>
        </motion.div>

        {/* Mobile: 2-column compact grid */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 rounded-2xl ${feature.color.split(' ')[0]} border border-secondary-100`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 ${feature.color.split(' ')[1]}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-secondary-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-secondary-500 text-xs leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group p-8 bg-secondary-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-secondary-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
