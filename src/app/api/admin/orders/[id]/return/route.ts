import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Process order return (admin and salesman)
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

    // Get the order with items
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.isReturned) {
      return NextResponse.json({ error: 'Order already returned' }, { status: 400 })
    }

    // Restore stock for each item
    for (const item of order.items) {
      const product = item.product

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

    // Mark order as returned and cancelled
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        isReturned: true,
        returnReason: returnReason.trim(),
        returnedAt: new Date(),
        returnedBy: session.user?.email || session.user?.name || 'Unknown',
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({
      message: 'Order returned successfully',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Failed to process return:', error)
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    )
  }
}
