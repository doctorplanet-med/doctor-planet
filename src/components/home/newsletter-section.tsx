'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check, Sparkles } from 'lucide-react'
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
    <section className="py-8 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 via-purple-50 to-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-primary-300/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * 600,
            }}
            animate={{
              y: [Math.random() * 600, -100, Math.random() * 600],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative bg-gradient-to-br from-white to-primary-50/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-primary-200/50 backdrop-blur-sm"
        >
          {/* Animated Background Elements */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent" />
          
          {/* Floating decorative elements */}
          <motion.div 
            className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 right-1/4 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.15, 1],
              y: [0, -20, 0],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{ duration: 7, repeat: Infinity }}
          />
          
          {/* Medical cross pattern */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-5 hidden md:block">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-primary-600">
              <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
            </svg>
          </div>
          
          <div className="relative px-5 py-8 sm:px-8 sm:py-12 md:px-16 md:py-20">
            <div className="max-w-2xl">
              {/* Icon - Mobile */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 via-purple-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg relative overflow-hidden group"
              >
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>

              {/* Content */}
              <div className="flex items-center gap-2 text-primary-600 font-medium text-xs uppercase tracking-wider mb-2 sm:hidden">
                <Sparkles className="w-3.5 h-3.5" />
                Newsletter
              </div>
              
              <motion.h2
                className="text-xl sm:text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-2 sm:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Stay Updated with{' '}
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  Doctor Planet
                </motion.span>
              </motion.h2>
              <motion.p
                className="text-sm sm:text-lg text-secondary-600 mb-5 sm:mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Get exclusive deals, new arrivals, and healthcare tips.
              </motion.p>

              {/* Form - Mobile Stacked */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 sm:py-3.5 pl-11 sm:pl-12 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  />
                  <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-secondary-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || isSubscribed}
                  className={`relative w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white transition-all flex items-center justify-center gap-2 overflow-hidden ${
                    isSubscribed 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600'
                  } disabled:opacity-50`}
                  style={{ backgroundSize: '200% 100%' }}
                  animate={!isSubscribed && !isSubmitting ? {
                    backgroundPosition: ['0%', '100%', '0%'],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Subscribing...</span>
                    </>
                  ) : isSubscribed ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Privacy Note */}
              <p className="text-xs sm:text-sm text-secondary-500 mt-3 sm:mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
