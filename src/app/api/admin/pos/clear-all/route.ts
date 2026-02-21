import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - Clear all POS sales data (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can clear all data
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Delete all POS sale items first (due to foreign key constraints)
    await prisma.pOSSaleItem.deleteMany({})
    
    // Then delete all POS sales
    const deletedSales = await prisma.pOSSale.deleteMany({})

    console.log(`Admin ${session.user.email} cleared all POS sales data. ${deletedSales.count} sales deleted.`)

    return NextResponse.json({
      message: 'All POS sales data cleared successfully',
      deletedCount: deletedSales.count
    })
  } catch (error) {
    console.error('Failed to clear POS sales data:', error)
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}
