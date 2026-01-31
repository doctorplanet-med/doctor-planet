'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

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

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  'medical-clothes': { bg: 'bg-blue-500', text: 'text-white', gradient: 'from-blue-500 to-blue-600' },
  'medical-shoes': { bg: 'bg-emerald-500', text: 'text-white', gradient: 'from-emerald-500 to-emerald-600' },
  'medical-equipment': { bg: 'bg-purple-500', text: 'text-white', gradient: 'from-purple-500 to-purple-600' },
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      return () => ref.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-6 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-4 sm:mb-12"
        >
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-primary-600 font-medium text-[10px] sm:text-sm uppercase tracking-wider mb-0.5 sm:mb-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Browse by Category
            </div>
            <h2 className="text-base sm:text-3xl lg:text-4xl font-bold text-secondary-950">Shop Our Collections</h2>
          </div>
          
          {/* Desktop: View All */}
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Mobile: Horizontal Scroll - 3 items visible */}
        <div className="sm:hidden relative">
          <div 
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {categories.map((category, index) => {
              const colors = categoryColors[category.slug] || { bg: 'bg-gray-500', text: 'text-white', gradient: 'from-gray-500 to-gray-600' }
              const emoji = categoryEmojis[category.slug] || '📦'
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[calc(33.333%-7px)] snap-start"
                >
                  <Link href={`/products?category=${category.slug}`}>
                    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.gradient} p-3 h-[100px] flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow`}>
                      {/* Decorative circles */}
                      <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-white/10" />
                      <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white/10" />
                      
                      {/* Emoji */}
                      <span className="text-2xl">{emoji}</span>
                      
                      {/* Content */}
                      <div>
                        <h3 className="font-bold text-white text-xs leading-tight">{category.name}</h3>
                        <p className="text-white/70 text-[9px] mt-0.5">{category._count.products} Items</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/95 shadow-md rounded-full flex items-center justify-center z-10 -ml-1"
            >
              <ChevronLeft className="w-4 h-4 text-secondary-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/95 shadow-md rounded-full flex items-center justify-center z-10 -mr-1"
            >
              <ChevronRight className="w-4 h-4 text-secondary-700" />
            </button>
          )}
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
