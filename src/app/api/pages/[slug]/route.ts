import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch page by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        isPublished: true,
        updatedAt: true,
      }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to fetch page:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}
