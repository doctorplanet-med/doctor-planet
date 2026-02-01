'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Facebook, 
  Instagram, 
  MessageCircle,
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react'

const footerLinks = {
  shop: [
    { href: '/products?category=medical-clothes', label: 'Medical Clothes' },
    { href: '/products?category=medical-shoes', label: 'Medical Shoes' },
    { href: '/products?category=medical-equipment', label: 'Medical Equipment' },
    { href: '/products?featured=true', label: 'Featured Products' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/size-guide', label: 'Size Guide' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
}

interface SiteSettings {
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string | null
  instagramUrl: string | null
  whatsappNumber: string | null
  footerText: string
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const socialLinks = [
    { 
      href: settings?.facebookUrl || '#', 
      icon: Facebook, 
      label: 'Facebook', 
      color: 'hover:bg-blue-600',
      show: !!settings?.facebookUrl 
    },
    { 
      href: settings?.instagramUrl || '#', 
      icon: Instagram, 
      label: 'Instagram', 
      color: 'hover:bg-pink-600',
      show: !!settings?.instagramUrl 
    },
    { 
      href: settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : '#', 
      icon: MessageCircle, 
      label: 'WhatsApp', 
      color: 'hover:bg-green-600',
      show: !!settings?.whatsappNumber 
    },
  ].filter(link => link.show)

  return (
    <footer className="bg-secondary-950 text-white pb-20 lg:pb-0">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Mobile: Compact Footer */}
        <div className="sm:hidden">
          {/* Brand */}
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logos/logo.png"
                  alt="Doctor Planet"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-base">
                <span className="text-primary-500">doctor</span>
                <span className="text-white">planet</span>
              </span>
            </Link>
          </div>

          {/* Contact Info - Compact */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-secondary-400 mb-4">
            <a href={`mailto:${settings?.contactEmail || 'info@doctorplanet.com'}`} className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{settings?.contactEmail || 'info@doctorplanet.com'}</span>
            </a>
            <a href={`tel:${settings?.contactPhone || '+923001234567'}`} className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{settings?.contactPhone || '+92 300 1234567'}</span>
            </a>
          </div>

          {/* Quick Links - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center mb-4">
            {[...footerLinks.shop.slice(0, 2), ...footerLinks.support.slice(0, 2)].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-secondary-400 hover:text-primary-400 transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 ${social.color} hover:text-white transition-colors`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}

          {/* Copyright */}
          <p className="text-secondary-500 text-[10px] text-center flex items-center justify-center gap-1">
            © {new Date().getFullYear()} Doctor Planet. Made with
            <Heart className="w-3 h-3 text-primary-500 fill-current" />
          </p>
        </div>

        {/* Desktop: Full Footer */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src="/logos/logo.png"
                  alt="Doctor Planet"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl">
                <span className="text-primary-500">doctor</span>
                <span className="text-white">planet</span>
              </span>
            </Link>
            <p className="text-secondary-300 mb-6 leading-relaxed">
              {settings?.footerText || 'Your trusted partner for premium medical apparel and equipment. Providing healthcare professionals with quality products.'}
            </p>
            <div className="space-y-3">
              <a
                href={`mailto:${settings?.contactEmail || 'info@doctorplanet.com'}`}
                className="flex items-center text-secondary-300 hover:text-primary-400 transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                {settings?.contactEmail || 'info@doctorplanet.com'}
              </a>
              <a
                href={`tel:${settings?.contactPhone || '+923001234567'}`}
                className="flex items-center text-secondary-300 hover:text-primary-400 transition-colors"
              >
                <Phone className="w-5 h-5 mr-3" />
                {settings?.contactPhone || '+92 300 1234567'}
              </a>
              <p className="flex items-center text-secondary-300">
                <MapPin className="w-5 h-5 mr-3" />
                {settings?.contactAddress || 'Medical Plaza, Healthcare City'}
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Desktop Only */}
      <div className="hidden sm:block border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-400 text-sm flex items-center">
              © {new Date().getFullYear()} Doctor Planet. Made with{' '}
              <Heart className="w-4 h-4 mx-1 text-primary-500 fill-current" /> for healthcare heroes.
            </p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 ${social.color} hover:text-white transition-colors`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
