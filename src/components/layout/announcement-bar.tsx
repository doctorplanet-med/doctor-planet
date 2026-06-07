'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.announcementActive && data.announcementBar) {
            setAnnouncement(data.announcementBar)
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error)
      }
    }
    fetchSettings()
  }, [])

  if (!announcement || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-primary-600 text-white relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
          <p className="text-sm font-medium text-center pr-8">
            {announcement}
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 p-1 hover:bg-primary-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
