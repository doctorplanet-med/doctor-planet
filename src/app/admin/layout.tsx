import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminLayoutClient from '@/components/admin/admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/admin')
  }

  if (session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
