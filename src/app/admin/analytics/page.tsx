import prisma from '@/lib/prisma'
import AdminAnalytics from '@/components/admin/admin-analytics'

export const dynamic = 'force-dynamic'

async function getAnalyticsData() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    totalOrders,
    monthlyOrders,
    totalCustomers,
    newCustomers,
    ordersByStatus,
    topProducts,
    recentOrders,
    categoryStats,
  ] = await Promise.all([
    // Total revenue
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    // Monthly revenue
    prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    // Weekly revenue
    prisma.order.aggregate({
      where: { createdAt: { gte: sevenDaysAgo } },
      _sum: { total: true },
    }),
    // Total orders
    prisma.order.count(),
    // Monthly orders
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Total customers
    prisma.user.count({ where: { role: 'USER' } }),
    // New customers this month
    prisma.user.count({
      where: { role: 'USER', createdAt: { gte: thirtyDaysAgo } },
    }),
    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    // Category stats
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          include: {
            orderItems: {
              select: { quantity: true },
            },
          },
        },
      },
    }),
  ])

  // Get product details for top products
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map(p => p.productId) } },
    select: { id: true, name: true, price: true, images: true },
  })

  return {
    revenue: {
      total: totalRevenue._sum.total || 0,
      monthly: monthlyRevenue._sum.total || 0,
      weekly: weeklyRevenue._sum.total || 0,
    },
    orders: {
      total: totalOrders,
      monthly: monthlyOrders,
      byStatus: ordersByStatus,
    },
    customers: {
      total: totalCustomers,
      new: newCustomers,
    },
    topProducts: topProducts.map(p => ({
      ...p,
      product: topProductDetails.find(pd => pd.id === p.productId),
    })),
    recentOrders,
    categoryStats: categoryStats.map(c => ({
      name: c.name,
      productCount: c._count.products,
      totalSold: c.products.reduce((sum, p) => 
        sum + p.orderItems.reduce((s, oi) => s + oi.quantity, 0), 0
      ),
    })),
  }
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData()
  return <AdminAnalytics data={data} />
}
