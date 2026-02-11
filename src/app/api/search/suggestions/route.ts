import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const MAX_PRODUCTS = 6
const MAX_CATEGORIES = 4

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')?.trim() || ''
    if (q.length < 2) {
      return NextResponse.json({ products: [], categories: [] })
    }

    const search = q.toLowerCase()

    // SQLite doesn't support mode: 'insensitive', so fetch all and filter in memory
    const [allProducts, allCategories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
    ])

    // Filter products (case-insensitive)
    const products = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
      )
      .slice(0, MAX_PRODUCTS)
      .map(({ description, ...rest }) => rest)

    // Filter categories (case-insensitive)
    const categories = allCategories
      .filter((c) => c.name.toLowerCase().includes(search))
      .slice(0, MAX_CATEGORIES)

    return NextResponse.json({ products, categories })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ products: [], categories: [] }, { status: 500 })
  }
}
