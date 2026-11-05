'use client'

import ProductCard from '@/components/products/product-card'
import SectionHeader from './section-header'

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
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} viewAllHref={viewAllHref} />
        {/* Mobile: swipeable snap carousel (peek of next card). sm+: regular grid. */}
        <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {products.map((product, index) => (
            <li key={product.id} className="snap-start shrink-0 w-[44%] min-[480px]:w-[34%] sm:w-auto">
              <ProductCard product={product} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
