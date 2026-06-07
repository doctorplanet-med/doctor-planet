'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { heroBanners as defaultBanners, type HeroBannerItem } from '@/data/heroBanners'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSectionProps {
  settings?: any
  randomProducts?: any[]
  banners?: HeroBannerItem[]
  children?: React.ReactNode
}

const ROTATION_INTERVAL_MS = 5000

export default function HeroSection({ banners: bannersProp, children }: HeroSectionProps) {
  const banners = (bannersProp?.length ? bannersProp : defaultBanners) as HeroBannerItem[]
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const safe = Math.min(current, Math.max(0, banners.length - 1))
  const slide = banners[safe]

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    const t = setInterval(() => setCurrent((p) => (p + 1) % banners.length), ROTATION_INTERVAL_MS)
    return () => clearInterval(t)
  }, [banners.length, isPaused])

  useEffect(() => {
    setCurrent((p) => Math.min(p, Math.max(0, banners.length - 1)))
  }, [banners.length])

  const prev = () => setCurrent((p) => (p - 1 + banners.length) % banners.length)
  const next = () => setCurrent((p) => (p + 1) % banners.length)

  return (
    <section
      className="relative overflow-x-hidden"
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
    >
      {/* Spacer for fixed navbar + scrolling banner */}
      <div className="h-[84px] sm:h-[108px]" />

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Invisible placeholder — keeps the container height = image height */}
        {slide && (
          <img
            src={slide.images.desktop}
            alt=""
            className="w-full h-auto block invisible"
            aria-hidden
            draggable={false}
          />
        )}

        {/* Slides — absolutely positioned relative to this div only */}
        <AnimatePresence initial={false}>
          {slide && (
            <motion.div
              key={safe}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Link href={slide.ctaLink} className="block w-full h-full">
                <img
                  src={slide.images.desktop}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ARROWS ── */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); prev() }}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* ── DOTS ── */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); setCurrent(i) }}
                aria-label={`Go to slide ${i + 1}`}
                className="focus:outline-none"
              >
                <motion.span
                  animate={{ width: i === safe ? 24 : 8, opacity: i === safe ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="block h-2 rounded-full bg-white"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {children && <div className="relative z-0">{children}</div>}
    </section>
  )
}
