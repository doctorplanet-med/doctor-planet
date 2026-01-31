import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DP-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProfileComplete: true },
    })

    if (!user?.isProfileComplete) {
      return NextResponse.json(
        { error: 'Please complete your profile before placing an order' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { items, subtotal, shippingFee, total, shippingAddress, paymentMethod, notes } = body

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        subtotal,
        shippingFee: shippingFee || 0,
        total,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: 'PENDING',
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Get customer details for notification and email
    const customer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: 'ORDER_PLACED',
        title: 'New Order Received!',
        message: `${customer?.name || customer?.email || 'A customer'} placed an order worth PKR ${total.toFixed(0)}`,
        data: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: customer?.name,
          customerEmail: customer?.email,
          total: order.total,
          itemCount: items.length,
        }),
      },
    })

    // Send confirmation email to customer
    if (customer?.email) {
      const parsedAddress = JSON.parse(shippingAddress)
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: customer.name || 'Valued Customer',
        customerEmail: customer.email,
        items: order.items.map(item => ({
          product: { name: item.product.name },
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        subtotal,
        shippingFee: shippingFee || 0,
        total,
        shippingAddress: parsedAddress,
        status: 'PENDING',
      })
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      order,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
