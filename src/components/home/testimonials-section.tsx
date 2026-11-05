'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

import { Star, User } from 'lucide-react'
import SectionHeader from './section-header'

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
    name: 'Dr. Rab Nawaz',
    role: 'General Physician',
    image: null,
    content: 'Doctor Planet ke scrubs bohat zyada comfortable hain. Long shifts mein bhi fatigue nahi hoti. Highly recommended for all doctors!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Dr. Shah Afridi',
    role: 'Surgeon',
    image: null,
    content: 'OT kit aur scrubs dono zabardast quality ke hain. Delivery bhi fast thi. Doctor Planet is the best medical store in Pakistan.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Dr. Laiba',
    role: 'Medical Student, KEMU',
    image: null,
    content: 'Mujhe apni uniform ke liye bohat achi quality ka fabric mila. Prices bhi reasonable hain. Will definitely order again!',
    rating: 5,
  },
  {
    id: '4',
    name: 'Dr. Kainat',
    role: 'House Officer',
    image: null,
    content: 'Medical crocs bohot comfortable hain, poori duty mein pair nahi dard karte. Shukriya Doctor Planet!',
    rating: 5,
  },
  {
    id: '5',
    name: 'Dr. Iqra',
    role: 'Nurse, Services Hospital',
    image: null,
    content: 'Nursing uniform ki quality aur stitching excellent hai. Colors bhi bilkul waisi hain jaise pictures mein thi. Very satisfied!',
    rating: 5,
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-current' : 'text-secondary-300'}`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="w-[300px] sm:w-[360px] shrink-0 rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm">
      <Stars rating={t.rating} />
      <blockquote className="mt-3 text-sm sm:text-[15px] leading-relaxed text-secondary-900 line-clamp-5">
        &ldquo;{t.content}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-100 ring-2 ring-primary-200">
          {t.image ? (
            <Image src={t.image} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-primary-700">
              <User className="h-5 w-5" aria-hidden />
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-secondary-950">{t.name}</span>
          <span className="block truncate text-xs text-secondary-700">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

function MarqueeRow({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  // Duplicate once so the -50% translate loops seamlessly
  const loop = [...items, ...items]
  return (
    <div className="marquee-mask overflow-hidden motion-reduce:overflow-x-auto">
      <div className={`marquee-track flex w-max gap-4 ${reverse ? 'marquee-reverse' : ''}`}>
        {loop.map((t, i) => (
          <div key={`${t.id}-${i}`} aria-hidden={i >= items.length}>
            <ReviewCard t={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setTestimonials(data)
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      }
    }
    fetchTestimonials()
  }, [])

  if (testimonials.length === 0) return null

  const avg = testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
  // Need enough cards per row for a smooth loop
  const pad = (arr: Testimonial[]) => (arr.length >= 4 ? arr : [...arr, ...arr, ...arr].slice(0, 6))
  const half = Math.ceil(testimonials.length / 2)
  const rowA = pad(testimonials.slice(0, half))
  const rowB = pad(testimonials.slice(half).length ? testimonials.slice(half) : testimonials)

  return (
    <section className="py-10 sm:py-16 bg-secondary-50 overflow-hidden" aria-label="Customer reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Trusted by Doctors & Nurses"
          subtitle={`${avg.toFixed(1)} / 5 average from ${testimonials.length} verified reviews`}
        />
      </div>
      <div className="space-y-4 group/marquee">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>
    </section>
  )
}
