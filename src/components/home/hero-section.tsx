'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { heroBanners as defaultBanners, type HeroBannerItem } from '@/data/heroBanners'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const banners = (bannersProp?.length ? bannersProp : defaultBanners) as HeroBannerItem[]
  const safeIndex = Math.min(currentSlide, Math.max(0, banners.length - 1))
  const currentSlideClamped = banners.length === 0 ? 0 : safeIndex
  const current = banners[currentSlideClamped]

  // Parallax scroll effect
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Mouse move effect for floating elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 20,
          y: (e.clientY - rect.top - rect.height / 2) / 20,
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])


  useEffect(() => {
    setCurrentSlide((prev) => (banners.length === 0 ? 0 : Math.min(prev, banners.length - 1)))
  }, [banners.length])

  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, ROTATION_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [banners.length])

  const gradientTopColor = current ? getGradientTopColor(current) : DEFAULT_GRADIENT_TOP

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const randomX = (i * 73) % 1200
          const randomY = (i * 59) % 800
          const randomX2 = ((i + 10) * 73) % 1200
          const randomY2 = ((i + 10) * 59) % 800
          const randomDuration = 10 + (i % 10)
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: randomX,
                y: randomY,
              }}
              animate={{
                x: randomX2,
                y: randomY2,
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )
        })}
      </div>

      {/* Wrapper so gradient extends over banner + children (e.g. category circles) */}
      <div className="relative">
        {/* Full-bleed gradient: covers entire first block (banner + circles), smooth merge into white */}
        <motion.div
          className="absolute left-0 right-0 bottom-0 top-0 max-sm:-top-16 transition-colors duration-500"
          style={{
            background: `linear-gradient(to bottom, ${gradientTopColor} 0%, ${gradientTopColor} 12%, color-mix(in srgb, ${gradientTopColor} 70%, white) 35%, color-mix(in srgb, ${gradientTopColor} 25%, white) 55%, color-mix(in srgb, ${gradientTopColor} 8%, white) 75%, white 92%, white 100%)`,
            y,
            opacity,
          }}
        />

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 hidden lg:block"
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
            rotate: [0, 10, 0],
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          <Sparkles className="w-12 h-12 text-white/30" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 hidden lg:block"
          animate={{
            x: mousePosition.x * -1.5,
            y: mousePosition.y * -1.5,
            rotate: [0, -15, 0],
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          <Zap className="w-16 h-16 text-white/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-1/4 hidden lg:block"
          animate={{
            x: mousePosition.x * 1,
            y: mousePosition.y * 1,
            scale: [1, 1.1, 1],
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          <TrendingUp className="w-10 h-10 text-white/25" />
        </motion.div>

        {/* Banner area - z-10 so it stays above category circles when scrolling. Large screen size matches admin: 1600×900 (16:9, max 900px height). */}
        <div
          className="relative z-10 pt-0 sm:pt-20 sm:min-h-[40vh] lg:min-h-0"
        >
          <motion.div className="relative min-h-0 max-sm:min-h-[80vh] sm:min-h-[40vh] sm:h-[40vh] lg:min-h-0 lg:h-auto flex items-start justify-center pt-12 sm:pt-2 px-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10">
          {/* Clickable image - on mobile: larger, subtle corners; from sm: rounded card */}
          {current && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSlideClamped}
                initial={{ opacity: 0, x: 80, scale: 0.96, rotateY: 10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  rotateY: 0,
                }}
                exit={{ opacity: 0, x: -80, scale: 0.98, rotateY: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 360,
                  damping: 34,
                  mass: 0.9,
                }}
                className="w-full max-w-4xl lg:max-w-6xl xl:max-w-[calc(100%-4rem)] 2xl:max-w-[calc(100%-5rem)] mx-auto flex justify-center relative will-change-transform"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-full"
                >
                  <Link
                    href={current.ctaLink}
                    className="block w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent relative group"
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10" />
                    {/* Mobile: 2:3 (e.g. 800×1200); tablet: 16:9, 38vh; large: 16:9, max height 560px (matches admin recommendation) */}
                    <div className="relative w-full aspect-[2/3] max-sm:max-w-[400px] max-sm:max-h-[600px] sm:aspect-[16/9] sm:max-h-[38vh] lg:aspect-[16/9] lg:max-h-[560px] max-w-[calc(100%-1rem)] sm:max-w-none mx-auto bg-secondary-100 overflow-hidden rounded-2xl sm:rounded-3xl">
                      <motion.picture
                        className="block size-full"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      >
                        <source
                          media="(min-width: 1024px)"
                          srcSet={current.images.desktop}
                        />
                        <source
                          media="(min-width: 640px)"
                          srcSet={current.images.tablet ?? current.images.desktop}
                        />
                        <motion.img
                          src={current.images.mobile}
                          alt=""
                          className="w-full h-full object-cover object-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        />
                      </motion.picture>
                      
                      {/* Gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </Link>
                </motion.div>
                {/* Animated dots inside banner bottom - one per slide */}
                {banners.length > 0 && (
                  <div
                    className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
                    aria-hidden
                  >
                    <motion.div
                      className="flex items-center gap-2 pointer-events-auto bg-black/30 backdrop-blur-md px-4 py-2 rounded-full"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {banners.map((_, index) => (
                        <motion.button
                          key={banners[index]?.id ?? index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCurrentSlide(index)
                          }}
                          className="rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 relative"
                          aria-label={`Go to slide ${index + 1}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.span
                            className={`block rounded-full transition-all duration-300 ${
                              index === currentSlideClamped
                                ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white'
                                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50'
                            }`}
                            animate={
                              index === currentSlideClamped
                                ? { scale: [1, 1.2, 1] }
                                : {}
                            }
                            transition={{ duration: 0.3 }}
                          />
                          {index === currentSlideClamped && (
                            <motion.span
                              className="absolute inset-0 rounded-full bg-white/30"
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
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
