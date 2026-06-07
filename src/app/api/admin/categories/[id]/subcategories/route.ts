import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET subcategories for a category
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subs = await prisma.subCategory.findMany({
      where: { categoryId: params.id },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(subs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST create a subcategory
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug } = await request.json()
    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    }

    // Get next order value
    const last = await prisma.subCategory.findFirst({
      where: { categoryId: params.id },
      orderBy: { order: 'desc' },
    })

    const sub = await prisma.subCategory.create({
      data: { name: name.trim(), slug: slug.trim(), categoryId: params.id, order: (last?.order ?? -1) + 1 },
    })
    return NextResponse.json(sub)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists in this category' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
