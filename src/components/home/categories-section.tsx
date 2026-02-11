'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Shirt, Footprints, Stethoscope, Package, Eye } from 'lucide-react'

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

// Professional icons for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'medical-clothes': <Shirt className="w-6 h-6 sm:w-8 sm:h-8" />,
  'medical-shoes': <Footprints className="w-6 h-6 sm:w-8 sm:h-8" />,
  'medical-equipment': <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8" />,
}

const categoryGradients: Record<string, string> = {
  'medical-clothes': 'from-blue-600 via-blue-500 to-cyan-500',
  'medical-shoes': 'from-emerald-600 via-emerald-500 to-teal-500',
  'medical-equipment': 'from-purple-600 via-purple-500 to-pink-500',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-white via-secondary-50/50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary-50 text-primary-600 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-4"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Shop by Category
          </motion.div>
          
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 sm:mb-4">
            Explore Our{' '}
            <span className="text-gradient-animate">Collections</span>
          </h2>
          
          <p className="text-secondary-600 text-sm sm:text-lg max-w-2xl mx-auto">
            Discover premium medical apparel designed for comfort, durability, and professional excellence.
          </p>
        </motion.div>

        {/* Categories Grid - Desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {categories.map((category, index) => {
            const gradient = categoryGradients[category.slug] || 'from-gray-600 via-gray-500 to-slate-500'
            const icon = categoryIcons[category.slug] || <Package className="w-8 h-8" />
            const isHovered = hoveredIndex === index
            
            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <motion.div
                    className="group relative h-[400px] lg:h-[450px] rounded-3xl overflow-hidden"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={category.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-overlay`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 0.4 : 0 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      initial={false}
                    >
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </motion.div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between">
                      {/* Top - Icon & Badge */}
                      <div className="flex justify-between items-start">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-2xl`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {icon}
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
                          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full"
                        >
                          <span className="text-secondary-900 font-bold text-sm flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            View All
                          </span>
                        </motion.div>
                      </div>

                      {/* Bottom - Text Content */}
                      <div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isHovered ? 60 : 0 }}
                          className={`h-1 bg-gradient-to-r ${gradient} rounded-full mb-4`}
                          transition={{ duration: 0.4 }}
                        />
                        
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
                            {category._count.products} Products
                          </span>
                        </motion.div>
                        
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                          {category.name}
                        </h3>
                        
                        <p className="text-white/70 text-sm lg:text-base mb-4 line-clamp-2 group-hover:text-white/90 transition-colors">
                          {category.description || 'Explore our premium collection of professional medical wear.'}
                        </p>
                        
                        <motion.div
                          className="inline-flex items-center gap-2 text-white font-semibold"
                          animate={{ x: isHovered ? 5 : 0 }}
                        >
                          <span className="group-hover:text-primary-300 transition-colors">Shop Collection</span>
                          <motion.div
                            animate={{ x: isHovered ? 5 : 0 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Border Glow Effect */}
                    <motion.div
                      className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-500`}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Categories - Mobile Horizontal Scroll */}
        <div className="sm:hidden">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
            {categories.map((category, index) => {
              const gradient = categoryGradients[category.slug] || 'from-gray-600 to-slate-500'
              const icon = categoryIcons[category.slug] || <Package className="w-6 h-6" />
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[75vw] max-w-[300px]"
                >
                  <Link href={`/products?category=${category.slug}`}>
                    <div className="relative h-[280px] rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={category.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'}
                        alt={category.name}
                        fill
                        sizes="75vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                          {icon}
                        </div>
                        
                        <div>
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-medium mb-2">
                            {category._count.products} items
                          </span>
                          <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <span>Shop now</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-secondary-900 text-white px-4 py-2.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:bg-secondary-800 transition-all hover:shadow-xl hover:scale-105 group"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
