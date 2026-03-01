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
            Premium Medical Scrubs, Crocs & Medical Equipment in Pakistan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-secondary-700">
            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Medical Scrubs & Uniforms
              </h3>
              <p className="mb-4 leading-relaxed">
                Doctor Planet is Pakistan's leading provider of high-quality <strong>medical scrubs</strong>, <strong>nursing scrubs</strong>, and professional <strong>medical apparel</strong>. 
                We offer an extensive collection of <strong>scrubs uniforms</strong> designed for comfort, durability, and style.
              </p>
              <p className="leading-relaxed">
                Our <strong>scrubs for women</strong> and <strong>scrubs for men</strong> are crafted from premium fabrics. 
                From <strong>ladies scrubs</strong>, <strong>female medical scrubs</strong>, <strong>scrubs women's</strong>, <strong>scrubs uniform for ladies</strong> to 
                <strong>men's scrubs clothing</strong>, <strong>scrubs men</strong>, <strong>scrub for men</strong>, we have it all!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Medical Crocs & Footwear
              </h3>
              <p className="mb-4 leading-relaxed">
                Shop our premium collection of <strong>crocs</strong>, <strong>medical crocs</strong>, and <strong>crocs shoes</strong> designed for healthcare professionals. 
                Our <strong>doctor crocs</strong> and <strong>nurse crocs</strong> provide all-day comfort during long shifts.
              </p>
              <p className="leading-relaxed">
                We offer <strong>crocs clogs</strong>, <strong>medical shoes</strong>, <strong>nursing shoes</strong>, <strong>healthcare footwear</strong>, 
                <strong>medical clogs</strong>, <strong>crocs for nurses</strong>, and <strong>crocs for doctors</strong>. 
                Slip-resistant, comfortable, and professional!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-600 mb-4">
                Medical Equipment & Supplies
              </h3>
              <p className="mb-4 leading-relaxed">
                Browse our extensive range of <strong>medical equipment</strong>, <strong>medical supplies</strong>, including <strong>stethoscopes</strong>, 
                <strong>blood pressure monitors</strong>, <strong>thermometers</strong>, and <strong>medical instruments</strong>.
              </p>
              <p className="leading-relaxed">
                We stock <strong>diagnostic equipment</strong>, <strong>surgical equipment</strong>, <strong>medical devices</strong>, 
                <strong>healthcare equipment</strong>, <strong>nursing equipment</strong>, <strong>doctor equipment</strong>, <strong>medical tools</strong>, 
                <strong>hospital equipment</strong>, and professional <strong>medical gear</strong> for all healthcare needs.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: 'Medical Scrubs', desc: 'Premium uniforms' },
              { title: 'Nursing Scrubs', desc: 'Comfortable wear' },
              { title: 'Crocs Shoes', desc: 'Medical footwear' },
              { title: 'Medical Clogs', desc: 'Doctor crocs' },
              { title: 'Medical Equipment', desc: 'Healthcare supplies' },
              { title: 'Medical Devices', desc: 'Professional tools' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 text-center border border-primary-200"
              >
                <h4 className="font-bold text-primary-700 mb-1 text-sm">{item.title}</h4>
                <p className="text-xs text-primary-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-600 leading-relaxed">
              <strong>Keywords:</strong> scrubs, medical apparel, men's scrubs, ladies scrubs, female medical scrubs, nursing scrubs, 
              medical scrubs, scrubs uniforms, dr scrubs, crocs, medical crocs, crocs shoes, doctor crocs, nurse crocs, 
              crocs clogs, medical shoes, nursing shoes, medical clogs, crocs for nurses, crocs for doctors, 
              medical equipment, medical supplies, stethoscope, blood pressure monitor, thermometer, medical instruments, 
              diagnostic equipment, surgical equipment, medical devices, healthcare equipment, nursing equipment, 
              doctor equipment, medical tools, hospital equipment, medical gear, Pakistan medical supplies
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
