'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface PromoBannerItem {
  id: string
  imageUrl: string
  linkUrl: string
  alt: string
  order: number
}

/**
 * 3rd section (after Categories): multiple promo banners added by admin.
 * PNG, JPG, GIF supported. Transparent background. Centered, block link per image.
 */
export default function PromoBannerSection() {
  const [banners, setBanners] = useState<PromoBannerItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/promo-banners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data)
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || banners.length === 0) return null

  return (
    <section className="py-2 sm:py-3 bg-transparent" aria-label="Promo banners">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.linkUrl}
            className="block text-center mb-2 sm:mb-3 last:mb-0"
          >
            <span className="relative block w-full max-w-full mx-auto">
              <Image
                src={banner.imageUrl}
                alt={banner.alt}
                width={1200}
                height={400}
                className="w-full max-w-full h-auto block mx-auto object-contain"
                sizes="(max-width: 1024px) 100vw, 1200px"
                unoptimized={isGif(banner.imageUrl)}
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function isGif(url: string): boolean {
  return /\.gif(\?|$)/i.test(url) || url.toLowerCase().includes('.gif')
}
