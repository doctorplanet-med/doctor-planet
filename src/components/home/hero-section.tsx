'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { heroBanners as defaultBanners, type HeroBannerItem } from '@/data/heroBanners'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSectionProps {
  settings?: any
  randomProducts?: any[]
  banners?: HeroBannerItem[]
  children?: React.ReactNode
}

const ROTATION_INTERVAL_MS = 6000
const SWIPE_THRESHOLD_PX = 40

export default function HeroSection({ banners: bannersProp, children }: HeroSectionProps) {
  const banners = (bannersProp?.length ? bannersProp : defaultBanners) as HeroBannerItem[]
  const count = banners.length
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const safe = Math.min(current, Math.max(0, count - 1))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const autoplay = count > 1 && !isPaused && !reducedMotion

  useEffect(() => {
    if (!autoplay) return
    const t = setTimeout(() => setCurrent((p) => (p + 1) % count), ROTATION_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [autoplay, count, safe])

  const prev = useCallback(() => setCurrent((p) => (p - 1 + count) % count), [count])
  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    if (dx < 0) next()
    else prev()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative overflow-x-hidden"
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}
    >
      {/* Spacer for fixed navbar + scrolling banner */}
      <div className="h-[84px] sm:h-[108px]" />

      <div
        className="relative overflow-hidden bg-secondary-100 aspect-[1920/650]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
      >
        {/* Slides are stacked and cross-faded; only the first image is loaded eagerly (LCP) */}
        {banners.map((banner, i) => {
          const active = i === safe
          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${banner.title}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
                active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Link
                href={banner.ctaLink}
                tabIndex={active ? 0 : -1}
                className="block w-full h-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
              >
                <Image
                  src={banner.images.desktop}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  quality={80}
                  priority={i === 0}
                  loading={i === 0 ? undefined : 'lazy'}
                  draggable={false}
                  className="object-cover select-none"
                />
              </Link>
            </div>
          )
        })}

        {/* Arrows — 44px touch targets */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" aria-hidden />
            </button>
          </>
        )}

        {/* Dots — visually small, 44px hit area */}
        {count > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center" role="tablist" aria-label="Choose slide">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={i === safe}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group flex h-11 w-8 sm:w-10 items-center justify-center focus-visible:outline-none"
              >
                <span
                  className={`block h-1.5 rounded-full bg-white transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/50 ${
                    i === safe ? 'w-6 opacity-100' : 'w-1.5 opacity-60 group-hover:opacity-90'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Autoplay progress bar */}
        {autoplay && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/20" aria-hidden>
            <div
              key={safe}
              className="h-full bg-white/90 origin-left"
              style={{ animation: `hero-progress ${ROTATION_INTERVAL_MS}ms linear forwards` }}
            />
          </div>
        )}

        <span className="sr-only" aria-live="polite">{`Slide ${safe + 1} of ${count}`}</span>
      </div>

      {children && <div className="relative z-0">{children}</div>}
    </section>
  )
}
