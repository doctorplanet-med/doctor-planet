import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendOrderStatusEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    // Get current order to check if status changed
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true },
    })

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    })

    // Send email notification if status changed
    if (status && currentOrder?.status !== status && order.user.email) {
      const parsedAddress = JSON.parse(order.shippingAddress)
      
      await sendOrderStatusEmail(status, {
        orderNumber: order.orderNumber,
        customerName: order.user.name || 'Valued Customer',
        customerEmail: order.user.email,
        items: order.items.map(item => ({
          product: { name: item.product.name },
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        shippingAddress: parsedAddress,
        status: status,
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
