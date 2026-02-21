import prisma from '@/lib/prisma'
import AdminDashboard from '@/components/admin/admin-dashboard'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  // Get today's date at midnight
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Get this month's start
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    totalProducts,
    totalOrders,
    totalPOSSales,
    totalCustomers,
    lowStockProducts,
    recentOrders,
    recentPOSSales,
    webRevenue,
    posRevenue,
    udharRevenue,
    todayWebRevenue,
    todayPOSRevenue,
    todayUdharRevenue,
    monthWebRevenue,
    monthPOSRevenue,
    monthUdharRevenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.pOSSale.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 5,
      orderBy: { stock: 'asc' },
      include: { category: true }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } }
      }
    }),
    prisma.pOSSale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        salesman: { select: { name: true } },
        items: true
      }
    }),
    // Total Web Revenue (all time)
    prisma.order.aggregate({
      where: { status: { notIn: ['CANCELLED'] } },
      _sum: { total: true }
    }),
    // Total POS Revenue (all time)
    prisma.pOSSale.aggregate({
      _sum: { total: true }
    }),
    // Total Udhar Payments (all time) - counts as revenue when received
    prisma.udharPayment.aggregate({
      _sum: { amount: true }
    }),
    // Today's Web Revenue
    prisma.order.aggregate({
      where: { 
        createdAt: { gte: todayStart },
        status: { notIn: ['CANCELLED'] }
      },
      _sum: { total: true },
      _count: true
    }),
    // Today's POS Revenue
    prisma.pOSSale.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: true
    }),
    // Today's Udhar Payments
    prisma.udharPayment.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { amount: true },
      _count: true
    }),
    // This Month's Web Revenue
    prisma.order.aggregate({
      where: { 
        createdAt: { gte: monthStart },
        status: { notIn: ['CANCELLED'] }
      },
      _sum: { total: true },
      _count: true
    }),
    // This Month's POS Revenue
    prisma.pOSSale.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: true
    }),
    // This Month's Udhar Payments
    prisma.udharPayment.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true
    }),
  ])

  const totalWebRevenue = webRevenue._sum.total || 0
  const totalPOSRevenue = posRevenue._sum.total || 0
  const totalUdharRevenue = udharRevenue._sum.amount || 0

  return {
    stats: {
      totalProducts,
      totalOrders,
      totalPOSSales,
      totalCustomers,
      // Revenue breakdown
      webRevenue: totalWebRevenue,
      posRevenue: totalPOSRevenue,
      udharRevenue: totalUdharRevenue,
      totalRevenue: totalWebRevenue + totalPOSRevenue + totalUdharRevenue,
      // Today's stats
      todayWeb: {
        revenue: todayWebRevenue._sum.total || 0,
        count: todayWebRevenue._count
      },
      todayPOS: {
        revenue: todayPOSRevenue._sum.total || 0,
        count: todayPOSRevenue._count
      },
      todayUdhar: {
        revenue: todayUdharRevenue._sum.amount || 0,
        count: todayUdharRevenue._count
      },
      // This month's stats
      monthWeb: {
        revenue: monthWebRevenue._sum.total || 0,
        count: monthWebRevenue._count
      },
      monthPOS: {
        revenue: monthPOSRevenue._sum.total || 0,
        count: monthPOSRevenue._count
      },
      monthUdhar: {
        revenue: monthUdharRevenue._sum.amount || 0,
        count: monthUdharRevenue._count
      },
    },
    lowStockProducts,
    recentOrders,
    recentPOSSales,
  }
}

export default async function AdminPage() {
  const dashboardData = await getDashboardStats()

  return <AdminDashboard data={dashboardData} />
}
