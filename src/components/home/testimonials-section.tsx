'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote, User } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  image: string | null
  content: string
  rating: number
}

// Default testimonials (shown while loading or if no data)
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    role: 'Emergency Medicine Physician',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    content: 'Doctor Planet has been my go-to for medical apparel. The scrubs are incredibly comfortable for 12-hour shifts, and the quality is unmatched. Highly recommend!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Nurse James Chen',
    role: 'ICU Nurse',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
    content: 'Finally found shoes that don\'t hurt my feet after long shifts! The nursing clogs from Doctor Planet are a game-changer. Plus, the delivery was super fast.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Dr. Maria Rodriguez',
    role: 'Pediatrician',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
    content: 'The stethoscope I purchased has excellent acoustic quality. My patients love the colorful scrubs too - makes the clinic less intimidating for kids!',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Add cache-busting parameter
        const res = await fetch(`/api/testimonials?t=${Date.now()}`, {
          cache: 'no-store'
        })
        const data = await res.json()
        
        // Check if data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data)
          setCurrentIndex(0) // Reset to first testimonial
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
        // Keep default testimonials on error
      }
    }
    
    fetchTestimonials()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  if (testimonials.length === 0) return null

  const current = testimonials[currentIndex]

  return (
    <section className="py-20 bg-secondary-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <Quote className="absolute top-20 left-20 w-64 h-64 text-white" />
        <Quote className="absolute bottom-20 right-20 w-64 h-64 text-white rotate-180" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-2 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-secondary-400 max-w-2xl mx-auto">
            Join thousands of satisfied healthcare professionals who trust Doctor Planet
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < current.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-secondary-600'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-xl md:text-2xl text-white/90 text-center leading-relaxed mb-8">
                "{current.content}"
              </p>

              {/* Author */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-primary-500/50">
                  {current.image ? (
                    <Image
                      src={current.image}
                      alt={current.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="font-heading font-semibold text-white text-lg">
                  {current.name}
                </h4>
                <p className="text-secondary-400">
                  {current.role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 bg-white/10 hover:bg-primary-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 bg-white/10 hover:bg-primary-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary-500 w-8'
                    : 'bg-secondary-600 hover:bg-secondary-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
