'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(sec)}`
}

/** "Ends in ..." badge for deals expiring within 7 days. Renders nothing otherwise. */
export default function DealCountdown({ endDate }: { endDate: string }) {
  const end = new Date(endDate).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Avoid SSR/client mismatch: render only after mount
  if (now === null || Number.isNaN(end)) return null
  const remaining = end - now
  if (remaining <= 0 || remaining > SEVEN_DAYS) return null

  return (
    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-secondary-950/85 px-2 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur">
      <Clock className="h-3 w-3" aria-hidden />
      <span className="sr-only">Ends in </span>
      {format(remaining)}
    </span>
  )
}
