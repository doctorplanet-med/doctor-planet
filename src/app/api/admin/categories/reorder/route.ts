import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/categories/reorder
// Body: { order: [{ id: string, order: number }] }
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await Promise.all(
      order.map(({ id, order: o }: { id: string; order: number }) =>
        prisma.category.update({ where: { id }, data: { order: o } })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 })
  }
}
