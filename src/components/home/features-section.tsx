'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, 
  Shield, 
  RefreshCw, 
  Headphones, 
  Award,
  Clock
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
      description: `Free delivery on orders over PKR ${freeShippingMin}. Fast and reliable shipping nationwide.`,
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'All products meet medical-grade quality standards with manufacturer warranty.',
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day hassle-free returns. Not satisfied? Get a full refund.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Our dedicated team is here to help you anytime, day or night.',
    },
    {
      icon: Award,
      title: 'Certified Products',
      description: 'All medical equipment is FDA approved and certified for safety.',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Orders processed within 24 hours for quick delivery to your doorstep.',
    },
  ]
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="section-title mt-2">The Doctor Planet Difference</h2>
          <p className="section-subtitle">
            We're committed to providing the best experience for healthcare professionals
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
