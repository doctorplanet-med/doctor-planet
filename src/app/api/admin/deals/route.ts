import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all deals
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deals = await prisma.deal.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch product details for each deal
    const dealsWithProducts = await Promise.all(
      deals.map(async (deal) => {
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

        return {
          ...deal,
          items: itemsWithProducts,
        }
      })
    )

    return NextResponse.json(dealsWithProducts)
  } catch (error) {
    console.error('Fetch deals error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

// POST - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, image, dealPrice, items, isActive, startDate, endDate } = data

    if (!name || !dealPrice || !items || items.length < 2) {
      return NextResponse.json(
        { error: 'Name, deal price, and at least 2 products are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingDeal = await prisma.deal.findUnique({
      where: { slug },
    })

    const finalSlug = existingDeal ? `${slug}-${Date.now()}` : slug

    // Calculate original price (sum of all product prices * quantities)
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, salePrice: true },
    })

    let originalPrice = 0
    items.forEach((item: any) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        const productPrice = product.salePrice || product.price
        originalPrice += productPrice * (item.quantity || 1)
      }
    })

    // Create deal with items
    const deal = await prisma.deal.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        dealPrice: parseFloat(dealPrice),
        originalPrice,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error: any) {
    console.error('Create deal error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Deal with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
