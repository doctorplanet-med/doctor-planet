'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, Truck, Shield, ShoppingBag, Play,
  ChevronLeft, ChevronRight, Star, Zap, Gift
} from 'lucide-react'

interface SiteSettings {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroBannerImage?: string | null
  freeShippingMinimum?: number | null
}

interface RandomProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  images: string
  category: {
    name: string
    slug: string
  }
}

interface HeroSectionProps {
  settings?: SiteSettings | null
  randomProducts?: RandomProduct[]
}

const bannerSlides = [
  {
    id: 1,
    badge: 'NEW COLLECTION',
    title: 'Premium Medical Scrubs',
    subtitle: 'Designed for comfort during long shifts. Made with breathable, antimicrobial fabric.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200',
    cta: 'Shop Collection',
    link: '/products?category=medical-clothes',
    gradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  },
  {
    id: 2,
    badge: 'BEST SELLERS',
    title: 'Comfortable Medical Shoes',
    subtitle: 'Ergonomic design with superior arch support. Perfect for healthcare heroes.',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200',
    cta: 'Shop Shoes',
    link: '/products?category=medical-shoes',
    gradient: 'from-[#134e5e] via-[#71b280] to-[#134e5e]',
    accent: 'bg-gradient-to-r from-emerald-400 to-teal-500',
  },
  {
    id: 3,
    badge: 'TOP RATED',
    title: 'Professional Lab Coats',
    subtitle: 'Premium quality coats with modern fit. Stain-resistant and durable.',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200',
    cta: 'Shop Now',
    link: '/products?category=medical-equipment',
    gradient: 'from-[#2c3e50] via-[#4ca1af] to-[#2c3e50]',
    accent: 'bg-gradient-to-r from-purple-400 to-pink-500',
  },
]

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products' },
  { value: '99%', label: 'Satisfaction' },
  { value: '24/7', label: 'Support' },
]

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
)

export default function HeroSection({ settings: initialSettings, randomProducts = [] }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const freeShippingMinimum = initialSettings?.freeShippingMinimum || 5000

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isHovered])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)

  const promoFeatures = [
    { icon: Truck, text: 'Free Delivery', subtext: `Orders PKR ${freeShippingMinimum.toLocaleString()}+`, color: 'text-blue-600 bg-blue-100' },
    { icon: Shield, text: '100% Genuine', subtext: 'Quality Assured', color: 'text-green-600 bg-green-100' },
    { icon: Zap, text: 'Fast Shipping', subtext: '2-3 Days Delivery', color: 'text-orange-600 bg-orange-100' },
    { icon: Gift, text: 'Special Offers', subtext: 'Weekly Deals', color: 'text-purple-600 bg-purple-100' },
  ]

  return (
    <section ref={containerRef} className="relative bg-secondary-950 pt-0 overflow-hidden">
      {/* Main Hero Banner */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div style={{ y }} className="relative">
          <div className="relative h-[85vh] sm:h-[90vh] max-h-[800px] min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${bannerSlides[currentSlide].gradient}`}
              >
                {/* Background Image with Parallax */}
                <motion.div 
                  className="absolute inset-0"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6 }}
                >
                  <Image
                    src={bannerSlides[currentSlide].image}
                    alt={bannerSlides[currentSlide].title}
                    fill
                    sizes="100vw"
                    className="object-cover opacity-40"
                    priority
                  />
                </motion.div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                
                {/* Floating Particles */}
                <FloatingParticles />
                
                {/* Animated Lines */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <motion.div
                    className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent w-full"
                    style={{ top: '20%' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent w-full"
                    style={{ top: '60%' }}
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                  <div className="w-full lg:w-2/3">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className={`inline-flex items-center gap-2 ${bannerSlides[currentSlide].accent} text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg`}>
                        <Star className="w-4 h-4 fill-current" />
                        {bannerSlides[currentSlide].badge}
                      </span>
                    </motion.div>
                    
                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-[1.1]"
                    >
                      {bannerSlides[currentSlide].title.split(' ').map((word, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="inline-block mr-3"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.h1>
                    
                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-xl leading-relaxed"
                    >
                      {bannerSlides[currentSlide].subtitle}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap gap-3 sm:gap-4"
                    >
                      <Link
                        href={bannerSlides[currentSlide].link}
                        className="group relative inline-flex items-center gap-2 bg-white text-secondary-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base overflow-hidden transition-all hover:shadow-2xl hover:shadow-white/20"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          {bannerSlides[currentSlide].cta}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors" />
                      </Link>
                      
                      <Link
                        href="/products"
                        className="group inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
                      >
                        <Play className="w-5 h-5" />
                        Explore All
                      </Link>
                    </motion.div>

                    {/* Stats - Desktop */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="hidden md:flex gap-8 mt-12 pt-8 border-t border-white/10"
                    >
                      {stats.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          className="text-center"
                        >
                          <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-white/60 text-sm">{stat.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
              <button
                onClick={prevSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/20"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="flex gap-2">
                {bannerSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="group relative"
                  >
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
                    }`} />
                    {index === currentSlide && (
                      <motion.div
                        layoutId="slideIndicator"
                        className="absolute inset-0 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/20"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Slide Counter */}
            <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-2 text-white/60">
              <span className="text-2xl font-bold text-white">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="text-lg">/</span>
              <span>{String(bannerSlides.length).padStart(2, '0')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scrolling Products Carousel */}
      {randomProducts.length > 0 && (
        <div className="relative z-10 -mt-12 sm:-mt-16">
          {/* Infinite Scroll Container */}
          <div className="relative overflow-hidden py-4">
            {/* Gradient Overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-secondary-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-secondary-950 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling Track */}
            <motion.div
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6"
              animate={{
                x: [0, -1400],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {/* Double the products for seamless loop */}
              {[...randomProducts, ...randomProducts].map((product, index) => {
                const images = JSON.parse(product.images)
                const mainImage = images[0]
                const hasDiscount = product.salePrice && product.salePrice < product.price
                
                return (
                  <Link 
                    key={`${product.id}-${index}`} 
                    href={`/products/${product.slug}`}
                    className="flex-shrink-0"
                  >
                    <motion.div
                      whileHover={{ y: -8, scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-40 sm:w-48 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-secondary-100">
                        <Image
                          src={mainImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 160px, 192px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                            -{Math.round((1 - product.salePrice! / product.price) * 100)}%
                          </div>
                        )}
                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-secondary-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            View Product
                          </span>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
                          {product.category.name}
                        </p>
                        <h4 className="text-xs sm:text-sm font-semibold text-secondary-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm sm:text-base font-bold text-primary-600">
                                PKR {product.salePrice?.toLocaleString()}
                              </span>
                              <span className="text-[10px] sm:text-xs text-secondary-400 line-through">
                                PKR {product.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm sm:text-base font-bold text-secondary-900">
                              PKR {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </motion.div>
          </div>
        </div>
      )}

      {/* Features Strip */}
      <div className="bg-white py-6 sm:py-8 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {promoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-secondary-50 transition-all group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-900 text-sm sm:text-base">{feature.text}</h4>
                  <p className="text-secondary-500 text-xs sm:text-sm">{feature.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
