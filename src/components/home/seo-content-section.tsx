'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Stethoscope, ShoppingBag, Footprints } from 'lucide-react'

export default function SEOContentSection() {
  return (
    <section className="bg-gradient-to-br from-white via-primary-50/30 to-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 mb-4">
            Premium Medical Scrubs, Crocs & Medical Equipment in Pakistan
          </h2>
          <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
            Your trusted partner for professional healthcare apparel, footwear, and medical supplies
          </p>
        </motion.div>

        {/* Three Product Categories with Images */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Medical Scrubs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <Link href="/products">
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-secondary-100">
                <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="w-32 h-32 text-primary-600/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">Medical Scrubs</h3>
                    <p className="text-white/90 text-sm">Premium Quality Uniforms</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-secondary-700 mb-4 leading-relaxed">
                    Shop our extensive collection of <strong>medical scrubs</strong>, <strong>nursing scrubs</strong>, and <strong>scrubs uniforms</strong>. 
                    Available in <strong>men's scrubs</strong> and <strong>women's scrubs</strong> with professional designs.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      Medical Scrubs
                    </span>
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      Nursing Uniforms
                    </span>
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                      Ladies Scrubs
                    </span>
                  </div>
                  <span className="text-primary-600 font-semibold group-hover:underline">
                    Shop Scrubs →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Medical Crocs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <Link href="/products">
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-secondary-100">
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Footprints className="w-32 h-32 text-blue-600/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">Medical Crocs</h3>
                    <p className="text-white/90 text-sm">Comfortable Healthcare Footwear</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-secondary-700 mb-4 leading-relaxed">
                    Discover our range of <strong>medical crocs</strong>, <strong>crocs shoes</strong>, and <strong>medical clogs</strong>. 
                    Perfect <strong>doctor crocs</strong> and <strong>nurse crocs</strong> for all-day comfort.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Medical Crocs
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Nursing Shoes
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Medical Clogs
                    </span>
                  </div>
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    Shop Crocs →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Medical Equipment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <Link href="/products">
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-secondary-100">
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Stethoscope className="w-32 h-32 text-green-600/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">Medical Equipment</h3>
                    <p className="text-white/90 text-sm">Professional Healthcare Supplies</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-secondary-700 mb-4 leading-relaxed">
                    Browse our <strong>medical equipment</strong>, <strong>stethoscopes</strong>, <strong>medical supplies</strong>, and <strong>diagnostic equipment</strong>. 
                    Professional <strong>medical devices</strong> and <strong>healthcare equipment</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Stethoscopes
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Medical Supplies
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      Diagnostic Tools
                    </span>
                  </div>
                  <span className="text-green-600 font-semibold group-hover:underline">
                    Shop Equipment →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Detailed SEO Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-lg border border-secondary-100 p-8 sm:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 text-secondary-700">
            <div>
              <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-600 rounded-full" />
                Complete Healthcare Solutions
              </h3>
              <p className="mb-4 leading-relaxed">
                Doctor Planet offers a comprehensive range of <strong>medical scrubs</strong>, <strong>nursing scrubs</strong>, <strong>medical apparel</strong>, 
                <strong>men's scrubs clothing</strong>, <strong>ladies scrubs</strong>, <strong>scrubs ladies</strong>, <strong>female medical scrubs</strong>, 
                <strong>scrubs women's</strong>, <strong>scrubs uniform for ladies</strong>, <strong>men's scrubs</strong>, <strong>scrubs men</strong>, 
                <strong>scrub for men</strong>, <strong>scrubs for women</strong>, <strong>medicine scrubs</strong>, <strong>nurse scrubs</strong>, 
                <strong>scrub medical</strong>, <strong>scrubs for men</strong>, <strong>scrubs uniforms</strong>, and <strong>dr scrubs</strong>.
              </p>
              <p className="leading-relaxed">
                Our footwear collection includes <strong>crocs</strong>, <strong>medical crocs</strong>, <strong>crocs shoes</strong>, 
                <strong>doctor crocs</strong>, <strong>nurse crocs</strong>, <strong>crocs clogs</strong>, <strong>medical shoes</strong>, 
                <strong>nursing shoes</strong>, <strong>healthcare footwear</strong>, <strong>medical clogs</strong>, 
                <strong>crocs for nurses</strong>, and <strong>crocs for doctors</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded-full" />
                Professional Medical Supplies
              </h3>
              <p className="mb-4 leading-relaxed">
                We stock high-quality <strong>medical equipment</strong>, <strong>medical supplies</strong>, <strong>stethoscopes</strong>, 
                <strong>blood pressure monitors</strong>, <strong>thermometers</strong>, <strong>medical instruments</strong>, 
                <strong>diagnostic equipment</strong>, <strong>surgical equipment</strong>, <strong>medical devices</strong>, 
                <strong>healthcare equipment</strong>, <strong>nursing equipment</strong>, <strong>doctor equipment</strong>, 
                <strong>medical tools</strong>, <strong>hospital equipment</strong>, and professional <strong>medical gear</strong>.
              </p>
              <p className="leading-relaxed">
                All products are sourced from trusted manufacturers and meet international quality standards. 
                Shop with confidence for all your healthcare needs in Pakistan.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
