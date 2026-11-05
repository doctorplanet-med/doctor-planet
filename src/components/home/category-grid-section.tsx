'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

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

/** Soft brand-friendly tints. White photo backgrounds blend into these via mix-blend-multiply. */
const TINTS = [
  'from-rose-200 via-rose-100 to-rose-50',
  'from-sky-200 via-sky-100 to-sky-50',
  'from-emerald-200 via-emerald-100 to-emerald-50',
  'from-amber-200 via-amber-100 to-amber-50',
  'from-violet-200 via-violet-100 to-violet-50',
  'from-slate-300 via-slate-200 to-slate-100',
]

export default function CategoryGridSection({ categories }: CategoryGridSectionProps) {
  if (!categories.length) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Bento: first tile is a 2x2 feature on desktop; the rest flow around it */}
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:auto-rows-[260px] [grid-auto-flow:dense]">
        {categories.map((cat, i) => {
          const featured = i === 0
          const tint = TINTS[i % TINTS.length]
          const count = cat._count.products

          return (
            <li
              key={cat.id}
              className={featured ? 'lg:col-span-2 lg:row-span-2' : ''}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                aria-label={`${cat.name}, ${count} products`}
                className={`group relative block h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br ${tint} ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
                  featured ? 'aspect-[4/5] lg:aspect-auto' : 'aspect-[4/5] lg:aspect-auto'
                }`}
              >
                {/* Ghost index number */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute right-3 top-1 font-heading font-black leading-none text-black/5 select-none ${
                    featured ? 'text-[9rem] lg:text-[14rem]' : 'text-7xl sm:text-8xl'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Photo (white background multiplies into the tint) */}
                {cat.image ? (
                  <div className={`absolute inset-x-0 bottom-0 ${featured ? 'top-[42%] sm:top-[8%]' : 'top-[42%] sm:top-[14%]'}`}>
                    <Image
                      src={cat.image}
                      alt=""
                      fill
                      sizes={featured ? '(max-width: 1024px) 50vw, 66vw' : '(max-width: 1024px) 50vw, 33vw'}
                      priority={i < 2}
                      className="object-contain object-bottom sm:object-right-bottom mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.07] group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                    />
                  </div>
                ) : null}

                {/* Text (top-left) */}
                <div className="relative z-10 p-3 sm:p-6">
                  <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-secondary-900 backdrop-blur">
                    {count} {count === 1 ? 'product' : 'products'}
                  </span>
                  <h3
                    className={`mt-2 font-heading font-black leading-[1.05] tracking-tight text-secondary-950 ${
                      featured ? 'text-xl sm:text-3xl lg:text-6xl max-w-[12ch]' : 'text-xl sm:text-3xl max-w-[10ch]'
                    }`}
                  >
                    {cat.name}
                  </h3>
                </div>

                {/* CTA pill: arrow at rest, expands to label on hover/focus */}
                <span
                  aria-hidden
                  className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10 inline-flex h-9 sm:h-11 items-center gap-0 overflow-hidden rounded-full bg-secondary-950 text-white shadow-lg transition-all duration-300 group-hover:gap-2 group-hover:bg-primary-700 group-focus-visible:gap-2 motion-reduce:transition-none"
                >
                  <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[7rem] group-hover:pl-4 group-hover:opacity-100 group-focus-visible:max-w-[7rem] group-focus-visible:pl-4 group-focus-visible:opacity-100">
                    Shop now
                  </span>
                  <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
