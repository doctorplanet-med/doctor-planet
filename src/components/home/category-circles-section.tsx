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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
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
      className="py-8 sm:py-10 bg-transparent"
      aria-label="Shop by category"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6 max-w-[29rem] lg:max-w-[52rem]"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants} className="flex flex-col items-center flex-shrink-0">
              <Link
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-full"
              >
                <span className="relative block w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-secondary-100 group-hover:ring-primary-300 transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={category.image || DEFAULT_IMAGE}
                    alt={category.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={isGifUrl(category.image)}
                  />
                </span>
                <span className="mt-2 text-[11px] sm:text-xs text-secondary-600 group-hover:text-primary-600 text-center font-medium max-w-[72px] sm:max-w-[80px] truncate transition-colors">
                  {category.name}
                </span>
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
