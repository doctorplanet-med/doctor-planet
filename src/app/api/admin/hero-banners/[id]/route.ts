import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const banner = await prisma.heroBanner.findUnique({ where: { id: params.id } })
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to fetch hero banner:', error)
    return NextResponse.json({ error: 'Failed to fetch hero banner' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await request.json()
    const imagesJson = typeof data.images === 'string' ? data.images : (data.mobileImage !== undefined || data.desktopImage !== undefined
      ? JSON.stringify({
          mobile: data.mobileImage ?? data.images?.mobile ?? '',
          tablet: data.tabletImage ?? data.images?.tablet ?? undefined,
          desktop: data.desktopImage ?? data.images?.desktop ?? '',
        })
      : undefined)
    const banner = await prisma.heroBanner.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.ctaText !== undefined && { ctaText: data.ctaText }),
        ...(data.ctaLink !== undefined && { ctaLink: data.ctaLink }),
        ...(data.backgroundGradient !== undefined && { backgroundGradient: data.backgroundGradient }),
        ...(data.backgroundColor !== undefined && { backgroundColor: data.backgroundColor }),
        ...(imagesJson !== undefined && { images: imagesJson }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.isActive !== undefined && { isActive: !!data.isActive }),
      },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to update hero banner:', error)
    return NextResponse.json({ error: 'Failed to update hero banner' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.heroBanner.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete hero banner:', error)
    return NextResponse.json({ error: 'Failed to delete hero banner' }, { status: 500 })
  }
}
