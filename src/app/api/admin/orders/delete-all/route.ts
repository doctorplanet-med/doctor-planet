import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - Delete all orders (admin only)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    // Only ADMIN can delete all orders
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({})

    // Then delete all orders
    await prisma.order.deleteMany({})

    return NextResponse.json({ 
      message: 'All orders deleted successfully',
      success: true 
    })
  } catch (error) {
    console.error('Failed to delete all orders:', error)
    return NextResponse.json(
      { error: 'Failed to delete orders' },
      { status: 500 }
    )
  }
}
