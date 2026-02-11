import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ensureHeroBannerTable } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

function isHeroBannerTableError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)) || ''
  const code = (e as { code?: string })?.code
  const meta = (e as { meta?: { modelName?: string } })?.meta
  return (
    msg.includes('no such table') ||
    msg.includes('does not exist') ||
    code === 'SQLITE_UNKNOWN' ||
    meta?.modelName === 'HeroBanner'
  )
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const banners = await prisma.heroBanner.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Failed to fetch hero banners:', error)
    // Return empty array so admin Hero tab still loads (e.g. if HeroBanner table not created yet)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  let data: Record<string, unknown> = {}
  let title = 'Banner'
  let subtitle = ''
  let imagesJson = '{}'
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    data = (await request.json()) as Record<string, unknown>
    title = typeof data.title === 'string' ? data.title.trim() : 'Banner'
    subtitle = typeof data.subtitle === 'string' ? data.subtitle.trim() : ''
    const imagesObj = data.images && typeof data.images === 'object' ? (data.images as Record<string, unknown>) : {}
    imagesJson =
      typeof data.images === 'string'
        ? data.images
        : JSON.stringify({
            mobile: data.mobileImage ?? imagesObj.mobile ?? '',
            tablet: data.tabletImage ?? imagesObj.tablet ?? undefined,
            desktop: data.desktopImage ?? imagesObj.desktop ?? '',
          })

    let order = 0
    try {
      const maxOrder = await prisma.heroBanner.aggregate({ _max: { order: true } })
      order = (maxOrder._max.order ?? -1) + 1
    } catch (e) {
      if (isHeroBannerTableError(e)) {
        try {
          await ensureHeroBannerTable()
          const maxOrder = await prisma.heroBanner.aggregate({ _max: { order: true } })
          order = (maxOrder._max.order ?? -1) + 1
        } catch (retryErr) {
          console.error('Failed to create or use HeroBanner table:', retryErr)
          return NextResponse.json(
            { error: 'Database not ready. Run: npx prisma db push' },
            { status: 503 }
          )
        }
      } else {
        throw e
      }
    }

    const startDate = data.startDate && String(data.startDate).trim() ? new Date(data.startDate as string | number) : null
    const endDate = data.endDate && String(data.endDate).trim() ? new Date(data.endDate as string | number) : null
    if (startDate && isNaN(startDate.getTime())) throw new Error('Invalid startDate')
    if (endDate && isNaN(endDate.getTime())) throw new Error('Invalid endDate')

    const banner = await prisma.heroBanner.create({
      data: {
        title: title || 'Banner',
        subtitle,
        ctaText: typeof data.ctaText === 'string' ? data.ctaText : 'Shop Now',
        ctaLink: typeof data.ctaLink === 'string' ? data.ctaLink : '/products',
        backgroundGradient: typeof data.backgroundGradient === 'string' ? data.backgroundGradient : null,
        backgroundColor: typeof data.backgroundColor === 'string' ? data.backgroundColor : null,
        images: imagesJson,
        order,
        startDate,
        endDate,
      },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to create hero banner:', error)
    if (isHeroBannerTableError(error)) {
      try {
        await ensureHeroBannerTable()
        const maxOrder = await prisma.heroBanner.aggregate({ _max: { order: true } })
        const order = (maxOrder._max.order ?? -1) + 1
        const startDate = data.startDate && String(data.startDate).trim() ? new Date(data.startDate as string | number) : null
        const endDate = data.endDate && String(data.endDate).trim() ? new Date(data.endDate as string | number) : null
        const banner = await prisma.heroBanner.create({
          data: {
            title: title || 'Banner',
            subtitle,
            ctaText: typeof data.ctaText === 'string' ? data.ctaText : 'Shop Now',
            ctaLink: typeof data.ctaLink === 'string' ? data.ctaLink : '/products',
            backgroundGradient: typeof data.backgroundGradient === 'string' ? data.backgroundGradient : null,
            backgroundColor: typeof data.backgroundColor === 'string' ? data.backgroundColor : null,
            images: imagesJson,
            order,
            startDate,
            endDate,
          },
        })
        return NextResponse.json(banner)
      } catch (e) {
        console.error('Failed to create HeroBanner table or banner:', e)
        return NextResponse.json(
          { error: 'Database not ready. Run: npx prisma db push' },
          { status: 503 }
        )
      }
    }
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to create hero banner', details: msg },
      { status: 500 }
    )
  }
}
