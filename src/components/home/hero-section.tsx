'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { heroBanners as defaultBanners, type HeroBannerItem } from '@/data/heroBanners'

interface SiteSettings {
  freeShippingMinimum?: number | null
}


interface RandomProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  category: { name: string; slug: string }
}

interface HeroSectionProps {
  settings?: SiteSettings | null
  randomProducts?: RandomProduct[]
  /** Banners from DB (or fallback from data file). When not passed, uses default from file. */
  banners?: HeroBannerItem[]
  /** Renders below the banner, on top of the same gradient (e.g. category circles). */
  children?: React.ReactNode
}

const ROTATION_INTERVAL_MS = 5000
const DEFAULT_GRADIENT_TOP = '#4c1d95'

/** Extract first hex color from Tailwind gradient/color string for dynamic gradient top */
function getGradientTopColor(banner: HeroBannerItem): string {
  const str = banner.backgroundGradient ?? banner.backgroundColor ?? ''
  const hex = str.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/)?.[0]
  return hex ?? DEFAULT_GRADIENT_TOP
}

export default function HeroSection({ settings: initialSettings, randomProducts = [], banners: bannersProp, children }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const banners = (bannersProp?.length ? bannersProp : defaultBanners) as HeroBannerItem[]
  const safeIndex = Math.min(currentSlide, Math.max(0, banners.length - 1))
  const currentSlideClamped = banners.length === 0 ? 0 : safeIndex
  const current = banners[currentSlideClamped]


  useEffect(() => {
    setCurrentSlide((prev) => (banners.length === 0 ? 0 : Math.min(prev, banners.length - 1)))
  }, [banners.length])

  useEffect(() => {
    if (banners.length === 0) return
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, ROTATION_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [isHovered, banners.length])

  const gradientTopColor = current ? getGradientTopColor(current) : DEFAULT_GRADIENT_TOP

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      {/* Wrapper so gradient extends over banner + children (e.g. category circles) */}
      <div className="relative">
        {/* Full-bleed gradient: covers entire first block (banner + circles), smooth merge into white */}
        <div
          className="absolute left-0 right-0 bottom-0 top-0 max-sm:-top-16 transition-colors duration-500"
          style={{
            background: `linear-gradient(to bottom, ${gradientTopColor} 0%, ${gradientTopColor} 12%, color-mix(in srgb, ${gradientTopColor} 70%, white) 35%, color-mix(in srgb, ${gradientTopColor} 25%, white) 55%, color-mix(in srgb, ${gradientTopColor} 8%, white) 75%, white 92%, white 100%)`,
          }}
        />

        {/* Banner area - z-10 so it stays above category circles when scrolling */}
        <div
          className="relative z-10 pt-0 sm:pt-20 sm:min-h-[40vh] lg:min-h-[70vh]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div className="relative min-h-0 max-sm:min-h-[80vh] sm:min-h-[40vh] sm:h-[40vh] lg:min-h-[70vh] lg:h-[70vh] max-h-[900px] h-auto flex items-start justify-center pt-16 sm:pt-2 px-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10">
          {/* Clickable image - on mobile: larger, subtle corners; from sm: rounded card */}
          {current && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideClamped}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl lg:max-w-6xl xl:max-w-[calc(100%-4rem)] 2xl:max-w-[calc(100%-5rem)] mx-auto flex justify-center relative"
              >
                <Link
                  href={current.ctaLink}
                  className="block w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {/* Below 640: fixed 400×600 (2:3); tablet: 40vh; lg: 16:9, 68vh */}
                  <div className="relative w-full aspect-[2/3] max-sm:max-w-[400px] max-sm:max-h-[600px] sm:aspect-[16/9] sm:max-h-[38vh] lg:max-h-[68vh] max-h-[70vh] max-w-[calc(100%-1rem)] sm:max-w-none mx-auto bg-secondary-100 overflow-hidden rounded-2xl sm:rounded-3xl">
                    <picture className="block size-full">
                      <source
                        media="(min-width: 1024px)"
                        srcSet={current.images.desktop}
                      />
                      <source
                        media="(min-width: 640px)"
                        srcSet={current.images.tablet ?? current.images.desktop}
                      />
                      <img
                        src={current.images.mobile}
                        alt=""
                        className="w-full h-full object-cover object-center"
                      />
                    </picture>
                  </div>
                </Link>
                {/* Dots inside banner bottom - one per slide */}
                {banners.length > 0 && (
                  <div
                    className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
                    aria-hidden
                  >
                    <div className="flex items-center gap-2 pointer-events-auto">
                      {banners.map((_, index) => (
                        <button
                          key={banners[index]?.id ?? index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCurrentSlide(index)
                          }}
                          className="rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={`Go to slide ${index + 1}`}
                        >
                          <span
                            className={`block rounded-full transition-all duration-300 ${
                              index === currentSlideClamped
                                ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white'
                                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
          </motion.div>
        </div>

        {/* Children (e.g. category circles) sit on same gradient, below banner in stack */}
        <div className="relative z-0">
          {children}
        </div>
      </div>
    </section>
  )
}
