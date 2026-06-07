import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug: params.slug } })
    if (!blog || !blog.isPublished) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}
