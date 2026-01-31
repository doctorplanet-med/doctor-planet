import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import OrdersList from '@/components/orders/orders-list'

async function getOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: true, slug: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/orders')
  }

  const orders = await getOrders(session.user.id)

  return <OrdersList orders={orders} />
}
