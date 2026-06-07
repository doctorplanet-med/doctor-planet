'use client'

const MESSAGES = [
  'Delivery Time: 5-14 working Days',
  'Free Shipping on Orders of PKR 7,000 or above',
  'Premium Doctor Scrubs & High-Quality Medical Uniforms',
  'Top-Quality OT Kits & Surgical Scrub Suits',
  'Premium Medical Crocs for Doctors, Nurses & Students',
  'Best Quality Lab Coats • OT Gowns • Hospital Uniforms',
  'Premium Scrubs for Male & Female Doctors',
  'High-Quality Complete OT Kits for Medical Students',
  'Trusted Premium Quality — by Hospitals & Clinics Across Pakistan',
  'Good Quality Nursing Uniforms & Healthcare Apparel',
  'Premium Stethoscopes • BP Monitors • Medical Equipment',
  'Pakistan\'s No.1 Store for Premium Medical Apparel & Equipment',
]

const singleRow = MESSAGES.join('    ✦    ')

export default function ScrollingTextBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary-600 overflow-hidden" style={{ height: '28px' }}>
      <div
        className="flex items-center h-full"
        style={{ animation: 'marquee-scroll 30s linear infinite', whiteSpace: 'nowrap' }}
      >
        {/* Two identical copies — animate to -50% for a seamless loop */}
        <span className="text-white text-xs font-medium shrink-0 pr-16">{singleRow}</span>
        <span className="text-white text-xs font-medium shrink-0 pr-16" aria-hidden>{singleRow}</span>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
