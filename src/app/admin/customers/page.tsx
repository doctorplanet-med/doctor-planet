import prisma from '@/lib/prisma'
import AdminCustomersList from '@/components/admin/admin-customers-list'

export const dynamic = 'force-dynamic'

async function getCustomers() {
  return await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      _count: {
        select: { orders: true }
      },
      orders: {
        select: { total: true },
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()
  return <AdminCustomersList customers={customers} />
}
