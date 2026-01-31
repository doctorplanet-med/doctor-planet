import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all products for POS (admin and salesman)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only ADMIN and SALESMAN can access POS products
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all active products with category info (same as admin)
    const products = await prisma.product.findMany({
      where: {
        isActive: true, // Only active products for POS
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch POS products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
