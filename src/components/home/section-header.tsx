import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
}

/** Shared home-page section heading: bold left title, optional subtitle, clear "View all" action. */
export default function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 sm:mb-8">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-3xl font-heading font-extrabold tracking-tight text-secondary-950 text-balance">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm sm:text-base text-secondary-700">{subtitle}</p>}
        <div className="mt-2 h-1 w-12 rounded-full bg-primary-600" aria-hidden />
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-3 rounded-lg text-sm font-semibold text-primary-700 hover:text-primary-800 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          {viewAllLabel}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      )}
    </div>
  )
}
