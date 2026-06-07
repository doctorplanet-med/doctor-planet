import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch revenue statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // today, week, month, year, all

    // Calculate date ranges
    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = undefined
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {}

    // Get Web Orders Revenue
    const webOrders = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true },
      _count: true,
    })

    // Get POS Sales Revenue
    const posSales = await prisma.pOSSale.aggregate({
      where: dateFilter,
      _sum: { total: true },
      _count: true,
    })

    // Get delivered orders (completed web orders)
    const deliveredOrders = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: 'DELIVERED',
      },
      _sum: { total: true },
      _count: true,
    })

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    })

    // Get today's breakdown for quick stats
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayWebOrders = await prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: { total: true },
      _count: true,
    })

    const todayPOSSales = await prisma.pOSSale.aggregate({
      where: {
        createdAt: { gte: todayStart },
      },
      _sum: { total: true },
      _count: true,
    })

    // Calculate totals
    const webRevenue = webOrders._sum.total || 0
    const posRevenue = posSales._sum.total || 0
    const totalRevenue = webRevenue + posRevenue

    return NextResponse.json({
      period,
      webOrders: {
        revenue: webRevenue,
        count: webOrders._count,
        delivered: {
          revenue: deliveredOrders._sum.total || 0,
          count: deliveredOrders._count,
        },
        pending: pendingOrders,
      },
      posSales: {
        revenue: posRevenue,
        count: posSales._count,
      },
      combined: {
        revenue: totalRevenue,
        transactions: webOrders._count + posSales._count,
      },
      today: {
        webOrders: {
          revenue: todayWebOrders._sum.total || 0,
          count: todayWebOrders._count,
        },
        posSales: {
          revenue: todayPOSSales._sum.total || 0,
          count: todayPOSSales._count,
        },
        total: (todayWebOrders._sum.total || 0) + (todayPOSSales._sum.total || 0),
      },
    })
  } catch (error) {
    console.error('Failed to fetch revenue:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
  }
}
