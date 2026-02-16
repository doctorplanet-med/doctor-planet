import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** Public API: list hero banners for home page (order by order asc) */
export async function GET() {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Failed to fetch hero banners:', error)
    return NextResponse.json({ error: 'Failed to fetch hero banners' }, { status: 500 })
  }
}
