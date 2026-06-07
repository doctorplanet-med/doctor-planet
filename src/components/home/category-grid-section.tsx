'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count: { products: number }
}

interface CategoryGridSectionProps {
  categories: Category[]
}

export default function CategoryGridSection({ categories }: CategoryGridSectionProps) {
  if (!categories.length) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: 0 }}>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="relative overflow-hidden group block aspect-square"
        >
          {/* Background image */}
          {cat.image ? (
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-secondary-200" />
          )}

          {/* Category name — charcoal grey, no overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4">
            <h3 className="leading-tight" style={{ color: '#374151' }}>
              {cat.name.split(' ').map((word, i) => (
                <span key={i} className={`block truncate ${
                  i === 0
                    ? 'text-base sm:text-3xl lg:text-5xl font-bold'
                    : 'text-[11px] sm:text-lg lg:text-2xl font-light'
                }`}>
                  {word}
                </span>
              ))}
            </h3>
          </div>
        </Link>
      ))}
    </div>
    </div>
  )
}
