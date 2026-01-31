import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Find product by barcode
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const barcode = params.code

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode: barcode },
          { sku: barcode },
        ],
        isActive: true,
      },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error finding product by barcode:', error)
    return NextResponse.json({ error: 'Failed to find product' }, { status: 500 })
  }
}
