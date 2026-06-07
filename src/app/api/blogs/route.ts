import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, image: true, author: true, tags: true, createdAt: true },
    })
    return NextResponse.json(blogs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}
