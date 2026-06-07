import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch a single deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Fetch product details
    const productIds = deal.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        stock: true,
      },
    })

    const itemsWithProducts = deal.items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))

    return NextResponse.json({
      ...deal,
      items: itemsWithProducts,
    })
  } catch (error) {
    console.error('Fetch deal error:', error)
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 })
  }
}

// PUT - Update a deal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, image, dealPrice, items, isActive, startDate, endDate } = data

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    })

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Calculate original price if items are provided
    let originalPrice = existingDeal.originalPrice
    if (items && items.length > 0) {
      const productIds = items.map((item: any) => item.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, salePrice: true },
      })

      originalPrice = 0
      items.forEach((item: any) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          const productPrice = product.salePrice || product.price
          originalPrice += productPrice * (item.quantity || 1)
        }
      })

      // Delete existing items and create new ones
      await prisma.dealItem.deleteMany({
        where: { dealId: params.id },
      })

      await prisma.dealItem.createMany({
        data: items.map((item: any) => ({
          dealId: params.id,
          productId: item.productId,
          quantity: item.quantity || 1,
        })),
      })
    }

    // Update deal
    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        name: name || existingDeal.name,
        description,
        image,
        dealPrice: dealPrice ? parseFloat(dealPrice) : existingDeal.dealPrice,
        originalPrice,
        isActive: isActive ?? existingDeal.isActive,
        startDate: startDate ? new Date(startDate) : existingDeal.startDate,
        endDate: endDate ? new Date(endDate) : existingDeal.endDate,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Update deal error:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

// DELETE - Delete a deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.deal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error) {
    console.error('Delete deal error:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
