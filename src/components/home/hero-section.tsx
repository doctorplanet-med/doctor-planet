'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, ShoppingBag, Truck, Shield, Clock, 
  ChevronLeft, ChevronRight, Star, Headphones
} from 'lucide-react'

interface HeroSettings {
  heroTitle: string
  heroSubtitle: string
  heroBannerImage: string | null
  freeShippingMinimum: number
}

const promoFeatures = [
  { icon: Truck, text: 'Free Delivery', subtext: 'Orders PKR 5000+' },
  { icon: Shield, text: '100% Genuine', subtext: 'Quality Assured' },
  { icon: Clock, text: 'Fast Shipping', subtext: '2-3 Days Delivery' },
  { icon: Headphones, text: '24/7 Support', subtext: 'Always Here to Help' },
]

const bannerSlides = [
  {
    id: 1,
    badge: 'FEATURED',
    title: 'Premium Medical Scrubs',
    subtitle: 'Comfort meets professionalism with our latest collection',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200',
    cta: 'Shop Collection',
    link: '/products?category=medical-clothes',
    bgGradient: 'from-primary-600 via-primary-700 to-primary-800',
  },
  {
    id: 2,
    badge: 'BEST SELLERS',
    title: 'Comfortable Medical Shoes',
    subtitle: 'Designed for long shifts with maximum support',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200',
    cta: 'Shop Shoes',
    link: '/products?category=medical-shoes',
    bgGradient: 'from-blue-600 via-blue-700 to-blue-800',
  },
  {
    id: 3,
    badge: 'TOP RATED',
    title: 'Professional Lab Coats',
    subtitle: 'Look sharp with our premium lab coats',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200',
    cta: 'Shop Now',
    link: '/products?category=medical-equipment',
    bgGradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
  },
]

const quickCategories = [
  { name: 'Scrubs', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', href: '/products?category=medical-clothes' },
  { name: 'Lab Coats', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', href: '/products?category=medical-clothes' },
  { name: 'Shoes', image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', href: '/products?category=medical-shoes' },
  { name: 'Equipment', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', href: '/products?category=medical-equipment' },
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
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)

  return (
    <section className="bg-secondary-50 pt-[80px]">
      {/* Main Hero Banner */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Banner Slider */}
            <div className="lg:col-span-3 relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
              <div className="relative h-[280px] sm:h-[350px] md:h-[480px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
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
                      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 items-center px-4 sm:px-8 md:px-12 w-full">
                        {/* Text Content */}
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-4">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                            {bannerSlides[currentSlide].badge}
                          </span>
                          
                          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                            {bannerSlides[currentSlide].title}
                          </h1>
                          
                          <p className="text-white/90 text-sm sm:text-lg mb-3 sm:mb-6 max-w-md line-clamp-2 sm:line-clamp-none">
                            {bannerSlides[currentSlide].subtitle}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <Link
                              href={bannerSlides[currentSlide].link}
                              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-secondary-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-secondary-100 transition-colors shadow-lg"
                            >
                              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                              {bannerSlides[currentSlide].cta}
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                          </div>
                        </motion.div>

                        {/* Product Image */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="hidden md:block"
                        >
                          <div className="relative h-[350px] flex items-center justify-center">
                            <div className="relative w-[280px] h-[280px] rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                              <Image
                                src={bannerSlides[currentSlide].image}
                                alt={bannerSlides[currentSlide].title}
                                width={250}
                                height={250}
                                className="object-cover rounded-2xl shadow-2xl"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-white w-8'
                          : 'bg-white/50 w-2 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Side Banners */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Top Mini Banner - New Arrivals */}
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

              {/* Bottom Mini Banner - All Products */}
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
                  <p className="text-sm text-white/80">Browse our full collection</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Links */}
      <div className="max-w-7xl mx-auto px-4 pb-3 sm:pb-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {quickCategories.map((cat, index) => (
            <Link
              key={index}
              href={cat.href}
              className="group relative h-16 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden shadow-md"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-3">
                <h3 className="text-white font-semibold text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2">
                  {cat.name}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all hidden sm:block" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Strip */}
      <div className="bg-white border-y border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {promoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-secondary-50 transition-colors"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 text-xs sm:text-base">{feature.text}</p>
                  <p className="text-[10px] sm:text-sm text-secondary-500 hidden sm:block">{feature.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
