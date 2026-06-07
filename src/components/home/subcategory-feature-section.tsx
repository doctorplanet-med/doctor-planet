'use client'

import Link from 'next/link'
import ProductCard from '@/components/products/product-card'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  stock: number
  category: { name: string; slug: string }
}

interface SubCategoryFeatureSectionProps {
  title: string
  products: Product[]
  viewAllHref?: string
}

export default function SubCategoryFeatureSection({ title, products, viewAllHref }: SubCategoryFeatureSectionProps) {
  if (!products.length) return null

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Heading with lines */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-px bg-secondary-200" />
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 whitespace-nowrap">
            {title}
          </h2>
          <div className="flex-1 h-px bg-secondary-200" />
        </div>
        {/* View All */}
        {viewAllHref && (
          <div className="text-center mt-2">
            <Link
              href={viewAllHref}
              className="text-sm text-secondary-600 underline underline-offset-2 hover:text-primary-600 transition-colors"
            >
              View All
            </Link>
          </div>
        )}
      </div>

      {/* Product cards grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
