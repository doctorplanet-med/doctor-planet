'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check } from 'lucide-react'
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
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setIsSubscribed(true)
        toast.success(data.message || 'Successfully subscribed!')
        setEmail('')
        // Reset after animation
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
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent" />
          
          <div className="relative px-8 py-12 md:px-16 md:py-20">
            <div className="max-w-2xl">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6"
              >
                <Mail className="w-8 h-8 text-primary-600" />
              </motion.div>

              {/* Content */}
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
                Stay Updated with <span className="text-primary-600">Doctor Planet</span>
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                Subscribe to our newsletter for exclusive deals, new arrivals, and healthcare tips. 
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-field w-full pl-12"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || isSubscribed}
                  className={`btn-primary whitespace-nowrap px-8 ${
                    isSubscribed ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </span>
                  ) : isSubscribed ? (
                    <span className="flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      Subscribed!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Subscribe
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Privacy Note */}
              <p className="text-sm text-secondary-500 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
