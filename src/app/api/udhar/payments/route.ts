import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all Udhar payments (for revenue calculation)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all payments (for revenue tracking)
    const payments = await prisma.udharPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: { name: true }
        },
        transaction: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Failed to fetch Udhar payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
