import { Banknote, Truck, RefreshCw, ShieldCheck } from 'lucide-react'

const items = [
  { icon: Banknote, title: 'Cash on Delivery', text: 'Pay when it arrives' },
  { icon: Truck, title: 'Free Shipping', text: 'On orders over PKR 7,000' },
  { icon: RefreshCw, title: 'Easy Returns', text: '30-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Medical-grade Fabric', text: 'Built for long shifts' },
]

/** Compact trust strip shown right under the hero (server component, no animation cost). */
export default function TrustBar() {
  return (
    <section aria-label="Why shop with us" className="bg-secondary-50 border-b border-secondary-200">
      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex gap-6 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 shrink-0 snap-start sm:shrink">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-secondary-950 whitespace-nowrap">{title}</span>
              <span className="block text-xs text-secondary-700 whitespace-nowrap">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
