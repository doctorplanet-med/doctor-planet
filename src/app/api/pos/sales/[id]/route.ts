import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single POS sale details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sale = await prisma.pOSSale.findUnique({
      where: { id: params.id },
      include: {
        salesman: { select: { name: true, email: true } },
        items: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // Salesman can only view their own sales
    if (session.user?.role === 'SALESMAN' && sale.salesmanId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Failed to fetch sale:', error)
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 })
  }
}

// DELETE - Delete POS sale (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sale items first to restore stock
    const sale = await prisma.pOSSale.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // Restore stock for each item
    for (const item of sale.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, colorSizeStock: true },
      })

      if (product) {
        if (item.size && item.color && product.colorSizeStock) {
          const colorSizeStock = JSON.parse(product.colorSizeStock)
          if (colorSizeStock[item.color] && colorSizeStock[item.color][item.size] !== undefined) {
            colorSizeStock[item.color][item.size] += item.quantity
            
            let newTotalStock = 0
            for (const color of Object.keys(colorSizeStock)) {
              for (const size of Object.keys(colorSizeStock[color])) {
                newTotalStock += colorSizeStock[color][size]
              }
            }

            await prisma.product.update({
              where: { id: item.productId },
              data: {
                colorSizeStock: JSON.stringify(colorSizeStock),
                stock: newTotalStock,
              },
            })
          }
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: product.stock + item.quantity },
          })
        }
      }
    }

    // Delete sale
    await prisma.pOSSale.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete sale:', error)
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 })
  }
}
