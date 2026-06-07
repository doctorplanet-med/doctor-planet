import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = (await params).id
    const banner = await prisma.promoBanner.findUnique({ where: { id } })
    if (!banner) return NextResponse.json({ error: 'Promo banner not found' }, { status: 404 })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to fetch promo banner:', error)
    return NextResponse.json({ error: 'Failed to fetch promo banner' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = (await params).id
    const data = await request.json()
    const update: { imageUrl?: string; linkUrl?: string; alt?: string; order?: number; isActive?: boolean } = {}
    if (typeof data.imageUrl === 'string') update.imageUrl = data.imageUrl.trim()
    if (typeof data.linkUrl === 'string') update.linkUrl = data.linkUrl.trim() || '/'
    if (typeof data.alt === 'string') update.alt = data.alt.trim() || 'Promo'
    if (typeof data.order === 'number') update.order = data.order
    if (typeof data.isActive === 'boolean') update.isActive = data.isActive
    const banner = await prisma.promoBanner.update({
      where: { id },
      data: update,
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Failed to update promo banner:', error)
    return NextResponse.json({ error: 'Failed to update promo banner' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = (await params).id
    await prisma.promoBanner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete promo banner:', error)
    return NextResponse.json({ error: 'Failed to delete promo banner' }, { status: 500 })
  }
}
