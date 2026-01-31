'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, ShoppingBag, Truck, Shield, Clock, 
  ChevronLeft, ChevronRight, Star, Headphones, Sparkles
} from 'lucide-react'

interface HeroSettings {
  heroTitle: string
  heroSubtitle: string
  heroBannerImage: string | null
  freeShippingMinimum: number
}

const bannerSlides = [
  {
    id: 1,
    badge: 'FEATURED',
    title: 'Premium Medical Scrubs',
    subtitle: 'Comfort meets professionalism',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200',
    cta: 'Shop Now',
    link: '/products?category=medical-clothes',
    bgGradient: 'from-primary-600 via-primary-700 to-primary-800',
  },
  {
    id: 2,
    badge: 'BEST SELLERS',
    title: 'Comfortable Medical Shoes',
    subtitle: 'Designed for long shifts',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200',
    cta: 'Shop Shoes',
    link: '/products?category=medical-shoes',
    bgGradient: 'from-blue-600 via-blue-700 to-blue-800',
  },
  {
    id: 3,
    badge: 'TOP RATED',
    title: 'Professional Lab Coats',
    subtitle: 'Premium quality coats',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200',
    cta: 'Shop Now',
    link: '/products?category=medical-equipment',
    bgGradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
  },
]

const quickCategories = [
  { name: 'Scrubs', emoji: '👔', href: '/products?category=medical-clothes', color: 'bg-blue-50 text-blue-600' },
  { name: 'Shoes', emoji: '👟', href: '/products?category=medical-shoes', color: 'bg-green-50 text-green-600' },
  { name: 'Lab Coats', emoji: '🥼', href: '/products?category=medical-clothes', color: 'bg-purple-50 text-purple-600' },
  { name: 'Equipment', emoji: '🩺', href: '/products?category=medical-equipment', color: 'bg-orange-50 text-orange-600' },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [settings, setSettings] = useState<HeroSettings>({
    heroTitle: 'Premium Medical Apparel',
    heroSubtitle: 'Premium quality scrubs and lab coats for healthcare heroes',
    heroBannerImage: null,
    freeShippingMinimum: 5000,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({
            heroTitle: data.heroTitle || 'Premium Medical Apparel',
            heroSubtitle: data.heroSubtitle || 'Premium quality scrubs and lab coats for healthcare heroes',
            heroBannerImage: data.heroBannerImage,
            freeShippingMinimum: data.freeShippingMinimum || 5000,
          })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)

  // Dynamic promo features with settings
  const promoFeatures = [
    { icon: Truck, text: 'Free Delivery', subtext: `Orders PKR ${settings.freeShippingMinimum}+` },
    { icon: Shield, text: '100% Genuine', subtext: 'Quality Assured' },
    { icon: Clock, text: 'Fast Shipping', subtext: '2-3 Days' },
    { icon: Headphones, text: '24/7 Support', subtext: 'Always Here' },
  ]

  return (
    <section className="bg-secondary-50">
      {/* Mobile: Free Shipping Banner - Directly under navbar with NO gap */}
      <div className="sm:hidden pt-14 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-medium text-white">
          <Sparkles className="w-3 h-3" />
          <span>Free Shipping on orders above PKR {settings.freeShippingMinimum}</span>
          <Sparkles className="w-3 h-3" />
        </div>
      </div>

      {/* Desktop: Spacing for navbar */}
      <div className="hidden sm:block h-20" />

      {/* Main Hero */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-3 sm:py-6">
          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Banner Slider */}
            <div className="lg:col-span-3 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-[180px] sm:h-[350px] md:h-[480px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7 }}
                    className={`absolute inset-0 bg-gradient-to-r ${bannerSlides[currentSlide].bgGradient}`}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={settings.heroBannerImage || bannerSlides[currentSlide].image}
                        alt={bannerSlides[currentSlide].title}
                        fill
                        className="object-cover opacity-30"
                        priority
                      />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                      <div className="w-full px-4 sm:px-8 md:px-12">
                        {/* Mobile Layout */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="sm:max-w-md"
                        >
                          <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] sm:text-sm font-medium mb-2 sm:mb-4"
                          >
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                            {bannerSlides[currentSlide].badge}
                          </motion.span>
                          
                          <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg sm:text-3xl md:text-5xl font-bold text-white mb-1 sm:mb-4 leading-tight"
                          >
                            {bannerSlides[currentSlide].title}
                          </motion.h1>
                          
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/90 text-[11px] sm:text-lg mb-2.5 sm:mb-6"
                          >
                            {bannerSlides[currentSlide].subtitle}
                          </motion.p>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <Link
                              href={bannerSlides[currentSlide].link}
                              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-secondary-900 px-3.5 sm:px-6 py-1.5 sm:py-3 rounded-full font-semibold text-[11px] sm:text-base hover:bg-secondary-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <ShoppingBag className="w-3 h-3 sm:w-5 sm:h-5" />
                              {bannerSlides[currentSlide].cta}
                              <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
                            </Link>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows - Desktop */}
                <button
                  onClick={prevSlide}
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-white w-5 sm:w-8'
                          : 'bg-white/50 w-1 sm:w-2 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Side Banners - Desktop Only */}
            <div className="hidden lg:flex flex-col gap-4">
              <Link
                href="/products?category=medical-clothes"
                className="relative h-[230px] rounded-2xl overflow-hidden group shadow-lg"
              >
                <Image
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
                  alt="New Arrivals"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <span className="text-xs font-medium bg-primary-600 px-2 py-1 rounded">NEW</span>
                  <h3 className="text-lg font-bold mt-2">New Arrivals</h3>
                  <p className="text-sm text-white/80">Fresh styles just landed</p>
                </div>
              </Link>

              <Link
                href="/products"
                className="relative h-[230px] rounded-2xl overflow-hidden group shadow-lg"
              >
                <Image
                  src="https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400"
                  alt="All Products"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <span className="text-xs font-medium bg-blue-600 px-2 py-1 rounded">EXPLORE</span>
                  <h3 className="text-lg font-bold mt-2">All Products</h3>
                  <p className="text-sm text-white/80">Browse collection</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Categories - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-3 sm:pb-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {quickCategories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={cat.href}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl ${cat.color} hover:scale-105 transition-all shadow-sm hover:shadow-md`}
              >
                <span className="text-xl sm:text-3xl mb-0.5 sm:mb-1">{cat.emoji}</span>
                <span className="text-[9px] sm:text-sm font-medium">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Strip - Mobile Optimized */}
      <div className="bg-white border-y border-secondary-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
          {/* Mobile: Horizontal Scroll */}
          <div className="sm:hidden overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 min-w-max">
              {promoFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 py-1"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900 text-xs whitespace-nowrap">{feature.text}</p>
                    <p className="text-[10px] text-secondary-500 whitespace-nowrap">{feature.subtext}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Desktop: Grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4">
            {promoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">{feature.text}</p>
                  <p className="text-sm text-secondary-500">{feature.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
