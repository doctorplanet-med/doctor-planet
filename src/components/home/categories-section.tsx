'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: {
    products: number
  }
}

interface CategoriesSectionProps {
  categories: Category[]
}

const categoryEmojis: Record<string, string> = {
  'medical-clothes': '👔',
  'medical-shoes': '👟',
  'medical-equipment': '🩺',
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'medical-clothes': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'medical-shoes': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  'medical-equipment': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 text-primary-600 font-medium text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Browse by Category
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-secondary-950 mb-2 sm:mb-4">Shop Our Collections</h2>
          <p className="text-secondary-600 text-sm sm:text-base max-w-lg mx-auto">
            Find exactly what you need for your medical practice
          </p>
        </motion.div>

        {/* Mobile: Card Style Categories */}
        <div className="sm:hidden space-y-3">
          {categories.map((category, index) => {
            const colors = categoryColors[category.slug] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
            const emoji = categoryEmojis[category.slug] || '📦'
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <div className={`relative overflow-hidden rounded-2xl ${colors.bg} border ${colors.border} p-4`}>
                    <div className="flex items-center gap-4">
                      {/* Emoji Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl`}>
                        {emoji}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className={`font-bold text-base ${colors.text}`}>{category.name}</h3>
                        <p className="text-secondary-500 text-xs mt-0.5">{category._count.products} Products</p>
                      </div>
                      
                      {/* Arrow */}
                      <div className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center ${colors.text}`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/50 opacity-50" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop: Image Cards */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/products?category=${category.slug}`}>
                <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl h-[200px] sm:h-[300px] md:h-[400px]">
                  {/* Background Image */}
                  <Image
                    src={category.image || '/images/placeholder.jpg'}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                    <motion.span
                      className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      {categoryEmojis[category.slug] || '📦'}
                    </motion.span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-white mb-1 sm:mb-2">
                      {category.name}
                    </h3>
                    <p className="hidden sm:block text-white/80 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-medium text-sm sm:text-base">
                        {category._count.products} Products
                      </span>
                      <motion.span
                        className="flex items-center text-white group-hover:text-primary-400 transition-colors text-sm sm:text-base"
                        whileHover={{ x: 5 }}
                      >
                        Shop Now
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                      </motion.span>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 sm:border-4 border-transparent group-hover:border-primary-500 rounded-2xl sm:rounded-3xl transition-colors duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
