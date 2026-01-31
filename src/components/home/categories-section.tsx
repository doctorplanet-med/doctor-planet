'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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

const categoryIcons: Record<string, string> = {
  'medical-clothes': '👔',
  'medical-shoes': '👟',
  'medical-equipment': '🩺',
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">
            Browse by Category
          </span>
          <h2 className="section-title mt-2">Shop Our Collections</h2>
          <p className="section-subtitle">
            Find exactly what you need for your medical practice
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                      {categoryIcons[category.slug] || '📦'}
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
