import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all Udhar transactions (optionally filter by shopId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    const where = shopId ? { shopId } : {}

    const transactions = await prisma.udharTransaction.findMany({
      where,
      include: {
        shop: {
          select: { id: true, name: true, ownerName: true, phone: true }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Failed to fetch Udhar transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST - Create new Udhar transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { shopId, items, totalAmount, dueDate, notes } = data

    if (!shopId || !items || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transaction = await prisma.udharTransaction.create({
      data: {
        shopId,
        items: JSON.stringify(items),
        totalAmount,
        remainingAmount: totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        status: 'UNPAID'
      },
      include: {
        shop: {
          select: { name: true, ownerName: true }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Failed to create Udhar transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
