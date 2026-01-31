import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch POS sales (admin sees all, salesman sees own)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Admin sees all, salesman sees only their own
    const where = session.user?.role === 'SALESMAN' 
      ? { salesmanId: session.user.id }
      : {}

    const [sales, total] = await Promise.all([
      prisma.pOSSale.findMany({
        where,
        include: {
          salesman: { select: { name: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pOSSale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch POS sales:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

// POST - Create new POS sale
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'No items in sale' }, { status: 400 })
    }

    // Generate receipt number
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.pOSSale.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    })
    const receiptNumber = `POS-${dateStr}-${String(count + 1).padStart(4, '0')}`

    // Calculate totals
    let subtotal = 0
    const saleItems = []

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, salePrice: true, stock: true, colorSizeStock: true },
      })

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }

      const price = product.salePrice || product.price
      subtotal += price * item.quantity

      saleItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: price,
        size: item.size || null,
        color: item.color || null,
      })

      // Update stock
      if (item.size && item.color && product.colorSizeStock) {
        // Update color-size specific stock
        const colorSizeStock = JSON.parse(product.colorSizeStock)
        if (colorSizeStock[item.color] && colorSizeStock[item.color][item.size] !== undefined) {
          colorSizeStock[item.color][item.size] = Math.max(0, colorSizeStock[item.color][item.size] - item.quantity)
          
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
        // Update general stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: Math.max(0, product.stock - item.quantity) },
        })
      }
    }

    // Calculate discount
    let discount = 0
    if (data.discount) {
      if (data.discountType === 'PERCENTAGE') {
        discount = (subtotal * data.discount) / 100
      } else {
        discount = data.discount
      }
    }

    const total = subtotal - discount

    // Create sale
    const sale = await prisma.pOSSale.create({
      data: {
        receiptNumber,
        salesmanId: session.user?.id as string,
        subtotal,
        discount,
        discountType: data.discountType || null,
        total,
        paymentMethod: data.paymentMethod || 'CASH',
        amountReceived: data.amountReceived || null,
        changeGiven: data.amountReceived ? data.amountReceived - total : null,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: true,
        salesman: { select: { name: true } },
      },
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Failed to create POS sale:', error)
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
