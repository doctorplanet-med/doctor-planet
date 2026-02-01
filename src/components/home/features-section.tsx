'use client'

import { motion } from 'framer-motion'
import { 
  Truck, 
  Shield, 
  RefreshCw, 
  Headphones, 
  Award,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on orders over PKR 5,000',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'Medical-grade quality standards',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated team to help you',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Award,
    title: 'Certified Products',
    description: 'FDA approved and certified',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Orders processed in 24 hours',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50',
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export default function FeaturesSection() {

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
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-2xl ${feature.bgColor} border border-secondary-100 overflow-hidden`}
            >
              {/* Gradient accent */}
              <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${feature.color} opacity-10 rounded-full`} />
              
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg flex items-center justify-center mb-3`}>
                <feature.icon className="w-5 h-5 text-white" />
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

        {/* Desktop: 3-column grid with advanced animations */}
        <motion.div 
          className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative p-8 bg-white rounded-3xl border border-secondary-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Animated Corner Accent */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500 group-hover:scale-150`} />
              
              {/* Icon with gradient background */}
              <motion.div 
                className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-8 h-8 text-white" />
                {/* Pulse effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl animate-ping opacity-20`} />
              </motion.div>
              
              <h3 className="font-heading font-bold text-xl text-secondary-900 mb-3 group-hover:text-secondary-950 transition-colors">
                {feature.title}
              </h3>
              <p className="text-secondary-500 leading-relaxed group-hover:text-secondary-600 transition-colors">
                {feature.description}
              </p>
              
              {/* Bottom line indicator */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-500`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="hidden sm:flex justify-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-secondary-50 rounded-full">
            <Heart className="w-5 h-5 text-primary-600 animate-heartbeat" />
            <span className="text-secondary-600 font-medium">
              Trusted by <span className="text-primary-600 font-bold">10,000+</span> Healthcare Professionals
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
