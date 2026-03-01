'use client'

import { motion } from 'framer-motion'

export default function SEOContentSection() {
  return (
    <section className="bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-lg border border-secondary-100 p-6 sm:p-10"
        >
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 mb-6 text-center">
            Premium Medical Scrubs & Healthcare Apparel in Pakistan
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-secondary-700">
            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Medical Scrubs for Healthcare Professionals
              </h3>
              <p className="mb-4 leading-relaxed">
                Doctor Planet is Pakistan's leading provider of high-quality <strong>medical scrubs</strong>, <strong>nursing scrubs</strong>, and professional <strong>medical apparel</strong>. 
                We offer an extensive collection of <strong>scrubs uniforms</strong> designed for comfort, durability, and style.
              </p>
              <p className="leading-relaxed">
                Our <strong>scrubs for women</strong> and <strong>scrubs for men</strong> are crafted from premium fabrics, ensuring all-day comfort during long shifts. 
                Whether you need <strong>nursing scrubs</strong>, <strong>dr scrubs</strong>, or <strong>medicine scrubs</strong>, we have the perfect fit for every healthcare professional.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Men's & Women's Medical Scrubs Collection
              </h3>
              <p className="mb-4 leading-relaxed">
                Explore our diverse range of <strong>men's scrubs clothing</strong> and <strong>ladies scrubs</strong> designed specifically for Pakistani healthcare workers. 
                Our <strong>scrubs men</strong> collection features modern cuts and professional designs, while our <strong>scrubs ladies</strong> line offers stylish and comfortable options.
              </p>
              <p className="leading-relaxed">
                From <strong>female medical scrubs</strong> to <strong>men's scrubs</strong>, <strong>scrub for men</strong> to <strong>scrubs women's</strong> collection, 
                we provide <strong>scrubs uniform for ladies</strong> and gentlemen that meet international quality standards. Shop our <strong>scrub medical</strong> wear today!
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Medical Scrubs', desc: 'Premium quality scrubs' },
              { title: 'Nursing Scrubs', desc: 'Comfortable uniforms' },
              { title: 'Men\'s Scrubs', desc: 'Professional wear' },
              { title: 'Women\'s Scrubs', desc: 'Stylish & practical' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 text-center border border-primary-200"
              >
                <h4 className="font-bold text-primary-700 mb-1">{item.title}</h4>
                <p className="text-xs text-primary-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-600 leading-relaxed">
              <strong>Keywords:</strong> scrubs, medical apparel, men's scrubs clothing, ladies scrubs, scrubs ladies, 
              female medical scrubs, scrubs women's, scrubs uniform for ladies, men's scrubs, scrubs men, medical scrubs, 
              nursing scrubs, scrub for men, scrubs for women, medicine scrubs, nurse scrubs, scrub medical, scrubs for men, 
              scrubs uniforms, dr scrubs, medical scrubs Pakistan, healthcare apparel, nursing uniforms, doctor scrubs
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
