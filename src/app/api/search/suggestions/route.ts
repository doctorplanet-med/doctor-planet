import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cachedJson } from '@/lib/cache-headers'

export const dynamic = 'force-dynamic'

const MAX_PRODUCTS = 6
const MAX_CATEGORIES = 4

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')?.trim() || ''
    if (q.length < 2) {
      return NextResponse.json({ products: [], categories: [] })
    }

    // Filter in the database (SQLite LIKE is case-insensitive for ASCII) instead of
    // loading every product + description into memory on each keystroke.
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { name: 'asc' },
        take: MAX_PRODUCTS,
      }),
      prisma.category.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
        take: MAX_CATEGORIES,
      }),
    ])

    return cachedJson({ products, categories }, 60)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ products: [], categories: [] }, { status: 500 })
  }
}
