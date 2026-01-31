import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch single page by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug }
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

// PUT - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const page = await prisma.page.update({
      where: { slug: params.slug },
      data: {
        title: data.title,
        content: data.content,
        isPublished: data.isPublished,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to update page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.page.delete({
      where: { slug: params.slug }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete page:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
