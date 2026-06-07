import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Process POS sale return (admin and salesman)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only ADMIN and SALESMAN can process returns
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { returnReason } = await request.json()

    if (!returnReason || !returnReason.trim()) {
      return NextResponse.json({ error: 'Return reason is required' }, { status: 400 })
    }

    // Get the sale with items
    const sale = await prisma.pOSSale.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    if (sale.isReturned) {
      return NextResponse.json({ error: 'Sale already returned' }, { status: 400 })
    }

    // Restore stock for each item
    for (const item of sale.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) continue

      if (item.size && item.color && product.colorSizeStock) {
        // Restore color-size specific stock
        const colorSizeStock = JSON.parse(product.colorSizeStock)
        if (colorSizeStock[item.color] && colorSizeStock[item.color][item.size] !== undefined) {
          colorSizeStock[item.color][item.size] += item.quantity

          // Calculate new total stock
          let newTotalStock = 0
          for (const color of Object.keys(colorSizeStock)) {
            for (const size of Object.keys(colorSizeStock[color])) {
              newTotalStock += colorSizeStock[color][size]
            }
          }

          await prisma.product.update({
            where: { id: product.id },
            data: {
              colorSizeStock: JSON.stringify(colorSizeStock),
              stock: newTotalStock,
            },
          })
        }
      } else {
        // Restore general stock
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock + item.quantity,
          },
        })
      }
    }

    // Mark sale as returned
    const updatedSale = await prisma.pOSSale.update({
      where: { id: params.id },
      data: {
        isReturned: true,
        returnReason: returnReason.trim(),
        returnedAt: new Date(),
        returnedBy: session.user?.email || session.user?.name || 'Unknown',
      },
    })

    return NextResponse.json({
      message: 'Sale returned successfully',
      sale: updatedSale,
    })
  } catch (error) {
    console.error('Failed to process return:', error)
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    )
  }
}
