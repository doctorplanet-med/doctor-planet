import prisma from '@/lib/prisma'
import AdminOrdersList from '@/components/admin/admin-orders-list'

export const dynamic = 'force-dynamic'

async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true, phone: true }
      },
      items: {
        include: {
          product: {
            select: { name: true, images: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  return <AdminOrdersList orders={orders} />
}
