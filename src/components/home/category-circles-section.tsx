'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count: {
    products: number
  }
}

interface CategoryCirclesSectionProps {
  categories: Category[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      duration: 0.5,
    },
  },
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200'

export default function CategoryCirclesSection({ categories }: CategoryCirclesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  if (!categories.length) return null

  return (
    <section
      ref={sectionRef}
      className="pt-0 pb-8 sm:py-10 bg-transparent"
      aria-label="Shop by category"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6 max-w-[29rem] lg:max-w-[52rem]"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="flex flex-col items-center flex-shrink-0"
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-full"
              >
                <motion.span
                  className="relative block w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-secondary-100 group-hover:ring-primary-400 transition-all duration-300"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated gradient border on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-[2px] rounded-full overflow-hidden bg-white">
                    <Image
                      src={category.image || DEFAULT_IMAGE}
                      alt={category.name}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized={isGifUrl(category.image)}
                    />
                  </div>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full"
                    animate={{ x: ['0%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.span>
                <motion.span
                  className="mt-2 text-[11px] sm:text-xs text-secondary-600 group-hover:text-primary-600 text-center font-medium max-w-[72px] sm:max-w-[80px] truncate transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {category.name}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function isGifUrl(url: string | null): boolean {
  if (!url) return false
  return /\.gif(\?|$)/i.test(url) || url.toLowerCase().includes('.gif')
}
