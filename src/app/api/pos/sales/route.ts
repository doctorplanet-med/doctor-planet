import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    // Ensure the salesman/admin user still exists in DB.
    // If the user record was deleted but the session is still active,
    // creating a sale would violate the foreign key on salesmanId.
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user?.id as string },
      select: { id: true, role: true },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Salesman user not found. Please log out and log in again.' },
        { status: 400 },
      )
    }

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
        select: { id: true, name: true, price: true, salePrice: true, costPrice: true, stock: true, colorSizeStock: true },
      })

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }

      // Use the price sent from the cart (custom price from sidebar/checkout). Must use request
      // price so that "change price on the spot" is reflected on bill and history.
      const rawPrice = typeof item.price === 'number' ? item.price : Number(item.price)
      const baseProductPrice = item.customizationPrice
        ? (product.salePrice || product.price) + item.customizationPrice
        : (product.salePrice || product.price)
      const itemPrice = Number.isFinite(rawPrice) && rawPrice >= 0
        ? rawPrice
        : baseProductPrice

      subtotal += itemPrice * item.quantity

      saleItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: itemPrice,
        costPrice: product.costPrice || 0,  // Record cost price for profit calculation
        size: item.size || null,
        color: item.color || null,
        customization: item.customization || null,
        customizationPrice: item.customizationPrice || null,
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

    // When there's a sale-level discount, store the effective (post-discount) unit price
    // in each item so Bill and history show what the customer actually paid (correct profit margin).
    if (discount > 0 && subtotal > 0) {
      const ratio = total / subtotal
      let allocated = 0
      for (let i = 0; i < saleItems.length; i++) {
        const itemLineTotal = saleItems[i].price * saleItems[i].quantity
        const effectiveLineTotal = i < saleItems.length - 1
          ? Math.round(itemLineTotal * ratio * 100) / 100
          : Math.round((total - allocated) * 100) / 100 // last item: exact remainder
        allocated += effectiveLineTotal
        saleItems[i].price = Math.round((effectiveLineTotal / saleItems[i].quantity) * 100) / 100
      }
    }

    // For shop customers with credit
    if (data.customerType === 'SHOP' && data.shopId) {
      const shop = await prisma.shop.findUnique({ where: { id: data.shopId } })
      if (!shop || !shop.isActive) {
        return NextResponse.json({ error: 'Shop not found or inactive' }, { status: 400 })
      }

      // Check credit limit if not paid in full
      if (!data.isPaid && shop.allowCredit) {
        const remainingAmount = data.remainingAmount || total
        const newCreditTotal = shop.currentCredit + remainingAmount
        if (shop.creditLimit && newCreditTotal > shop.creditLimit) {
          return NextResponse.json({
            error: `Credit limit exceeded. Limit: ${shop.creditLimit}, Current: ${shop.currentCredit}, New: ${remainingAmount}`
          }, { status: 400 })
        }
      }
    }

    // Create sale
    const sale = await prisma.pOSSale.create({
      data: {
        receiptNumber,
        salesmanId: dbUser.id,
        subtotal,
        discount,
        discountType: data.discountType || null,
        total,
        paymentMethod: data.paymentMethod || 'CASH',
        amountReceived: data.amountReceived || null,
        changeGiven: data.amountReceived && data.isPaid !== false ? data.amountReceived - total : null,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        customerType: data.customerType || 'WALKIN',
        shopId: data.shopId || null,
        isPaid: data.isPaid !== false,
        paidAmount: data.paidAmount || null,
        remainingAmount: data.remainingAmount || null,
        notes: data.notes || null,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: true,
        salesman: { select: { name: true } },
        shop: { select: { name: true } },
      },
    })

    // Update shop credit if applicable
    if (data.customerType === 'SHOP' && data.shopId && !data.isPaid) {
      const remainingAmount = data.remainingAmount || total
      await prisma.shop.update({
        where: { id: data.shopId },
        data: {
          currentCredit: {
            increment: remainingAmount
          }
        }
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Failed to create POS sale:', error)
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
