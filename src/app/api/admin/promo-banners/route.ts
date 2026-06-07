import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ensurePromoBannerTable } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const banners = await prisma.promoBanner.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || ''
    if (msg.includes('no such table') || msg.includes('does not exist')) {
      try {
        await ensurePromoBannerTable()
        const banners = await prisma.promoBanner.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await request.json()
    const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : ''
    const linkUrl = typeof data.linkUrl === 'string' ? data.linkUrl.trim() || '/' : '/'
    const alt = typeof data.alt === 'string' ? data.alt.trim() || 'Promo' : 'Promo'
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }
    let order = 0
    try {
      const max = await prisma.promoBanner.aggregate({ _max: { order: true } })
      order = (max._max.order ?? -1) + 1
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)) || ''
      if (msg.includes('no such table') || msg.includes('does not exist')) {
        await ensurePromoBannerTable()
        const max = await prisma.promoBanner.aggregate({ _max: { order: true } })
        order = (max._max.order ?? -1) + 1
      } else throw e
    }
    const banner = await prisma.promoBanner.create({
      data: { imageUrl, linkUrl, alt, order, isActive: data.isActive !== false },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to create promo banner:', error)
    return NextResponse.json(
      { error: 'Failed to create promo banner', details: (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
