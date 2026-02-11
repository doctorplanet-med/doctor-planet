import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ensurePromoBannerTable } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

/** Public API: list active promo banners for home page (after Categories section) */
export async function GET() {
  try {
    const banners = await prisma.promoBanner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || ''
    if (msg.includes('no such table') || msg.includes('does not exist')) {
      try {
        await ensurePromoBannerTable()
        const banners = await prisma.promoBanner.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
        })
        return NextResponse.json(banners)
      } catch {
        return NextResponse.json([])
      }
    }
    console.error('Failed to fetch promo banners:', error)
    return NextResponse.json([])
  }
}
