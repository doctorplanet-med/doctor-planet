import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch active deals (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const now = new Date()

    // If slug is provided, fetch single deal
    if (slug) {
      const deal = await prisma.deal.findUnique({
        where: { 
          slug,
          isActive: true,
        },
        include: {
          items: true,
        },
      })

      if (!deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
      }

      // Check if deal is within date range
      if (deal.startDate && deal.startDate > now) {
        return NextResponse.json({ error: 'Deal has not started yet' }, { status: 404 })
      }
      if (deal.endDate && deal.endDate < now) {
        return NextResponse.json({ error: 'Deal has ended' }, { status: 404 })
      }

      // Fetch product details
      const productIds = deal.items.map((item) => item.productId)
      const products = await prisma.product.findMany({
        where: { 
          id: { in: productIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          images: true,
          stock: true,
          category: {
            select: { name: true },
          },
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
    }

    // Fetch ALL deals and filter in JS for SQLite compatibility
    const allDeals = await prisma.deal.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter active deals
    const deals = allDeals.filter((deal) => {
      if (!deal.isActive) return false
      if (deal.startDate && new Date(deal.startDate) > now) return false
      if (deal.endDate && new Date(deal.endDate) < now) return false
      return true
    })

    // Fetch product details for each deal
    const dealsWithProducts = await Promise.all(
      deals.map(async (deal) => {
        const productIds = deal.items.map((item) => item.productId)
        const products = await prisma.product.findMany({
          where: { 
            id: { in: productIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
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
