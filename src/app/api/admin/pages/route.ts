import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all pages (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pages = await prisma.page.findMany({
      orderBy: { title: 'asc' }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Failed to fetch pages:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST - Create or update page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const page = await prisma.page.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        content: data.content,
        isPublished: data.isPublished ?? true,
      },
      create: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        isPublished: data.isPublished ?? true,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to save page:', error)
    return NextResponse.json({ error: 'Failed to save page' }, { status: 500 })
  }
}
