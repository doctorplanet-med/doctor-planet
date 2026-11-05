'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSubscribed(true)
        toast.success(data.message || 'Successfully subscribed!')
        setEmail('')
        setTimeout(() => setIsSubscribed(false), 3000)
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16" aria-labelledby="newsletter-heading">
      <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 px-6 py-10 sm:px-12 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-12">
        {/* Soft decorative circles (static, no animation cost) */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-black/10" aria-hidden />

        <div className="relative max-w-xl">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
            <Mail className="h-5 w-5" aria-hidden />
          </span>
          <h2 id="newsletter-heading" className="mt-4 text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-white text-balance">
            Get early access to new scrubs & offers
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/85">
            New arrivals, exclusive deals and healthcare tips. No spam, unsubscribe any time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-6 lg:mt-0 w-full lg:max-w-md" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 w-full flex-1 rounded-xl border border-white/30 bg-white px-4 text-base text-secondary-950 placeholder:text-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
            />
            <button
              type="submit"
              disabled={isSubmitting || isSubscribed}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary-950 px-6 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : isSubscribed ? (
                <>
                  <Check className="h-4 w-4" aria-hidden /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-xs text-white/75" aria-live="polite">
            {isSubscribed ? 'Thanks! Check your inbox soon.' : 'We respect your privacy.'}
          </p>
        </form>
      </div>
    </section>
  )
}
