'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function WhatsAppFloat() {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const message = 'Hello! I need assistance with Doctor Planet products.'

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          const num = data.whatsappNumber
          if (num && typeof num === 'string' && num.trim()) {
            setWhatsappNumber(num.trim().replace(/\D/g, ''))
          }
        }
      } catch (e) {
        console.error('Failed to fetch WhatsApp number:', e)
      }
    }
    fetchSettings()
  }, [])

  const handleClick = () => {
    if (!whatsappNumber) return
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (!whatsappNumber) return null

  return (
    <>
      {/* Pulsing Ring Animation - Attention Grabber */}
      <motion.div
        className="fixed bottom-[70px] right-4 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 z-[99] rounded-full bg-[#25D366]"
        style={{ 
          width: '44px', 
          height: '44px',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        className="fixed bottom-[74px] right-[18px] sm:bottom-9 sm:right-9 lg:bottom-11 lg:right-11 z-[100] hover:scale-110 transition-all duration-300 group cursor-pointer"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ 
          scale: 1, 
          rotate: 0, 
          opacity: 1,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          delay: 0.3
        }}
        whileHover={{ 
          scale: 1.15,
          rotate: 10,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="Chat on WhatsApp"
        style={{ 
          width: '44px', 
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* WhatsApp SVG Icon */}
        <motion.div 
          className="relative w-full h-full drop-shadow-2xl"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/icons/whatsapp-icon-seeklogo.svg"
            alt="WhatsApp"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
        
        {/* Tooltip - Hidden on mobile, visible on larger screens */}
        <span className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
          Chat with us on WhatsApp
        </span>
      </motion.button>
    </>
  )
}
