import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Add payment to Udhar transaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { amount, paymentMethod, notes } = data

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    // Get transaction
    const transaction = await prisma.udharTransaction.findUnique({
      where: { id: params.id }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (amount > transaction.remainingAmount) {
      return NextResponse.json({ error: 'Payment amount exceeds remaining balance' }, { status: 400 })
    }

    // Create payment
    const payment = await prisma.udharPayment.create({
      data: {
        transactionId: params.id,
        shopId: transaction.shopId,
        amount,
        paymentMethod: paymentMethod || 'CASH',
        notes: notes || null,
        createdBy: session.user?.id
      }
    })

    // Update transaction
    const newPaidAmount = transaction.paidAmount + amount
    const newRemainingAmount = transaction.totalAmount - newPaidAmount
    let newStatus = transaction.status

    if (newRemainingAmount === 0) {
      newStatus = 'PAID'
    } else if (newPaidAmount > 0 && newRemainingAmount > 0) {
      newStatus = 'PARTIAL'
    }

    // Check if overdue
    if (newStatus !== 'PAID' && transaction.dueDate && new Date() > transaction.dueDate) {
      newStatus = 'OVERDUE'
    }

    const updatedTransaction = await prisma.udharTransaction.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus
      },
      include: {
        shop: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({ payment, transaction: updatedTransaction })
  } catch (error) {
    console.error('Failed to add payment:', error)
    return NextResponse.json({ error: 'Failed to add payment' }, { status: 500 })
  }
}
