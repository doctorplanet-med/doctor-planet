import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(blogs)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, slug, excerpt, content, image, author, isPublished, tags } = await request.json()
    if (!title || !slug || !content) return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })

    const existing = await prisma.blog.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })

    const blog = await prisma.blog.create({
      data: { title, slug, excerpt: excerpt || null, content, image: image || null, author: author || 'Doctor Planet', isPublished: isPublished ?? false, tags: tags || null },
    })
    return NextResponse.json(blog)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}
