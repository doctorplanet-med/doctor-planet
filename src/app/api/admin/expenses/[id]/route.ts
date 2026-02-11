import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function canAccess(session: any, expense: { userId: string }) {
  if (session.user?.role === 'ADMIN') return true
  if (session.user?.role === 'SALESMAN' && expense.userId === session.user?.id) return true
  return false
}

// GET - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    if (!canAccess(session, expense)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    if (!canAccess(session, existing)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount, description, category, expenseDate, image } = body

    const updateData: any = {}
    if (amount != null && typeof amount === 'number' && amount >= 0) updateData.amount = amount
    if (description !== undefined) updateData.description = String(description).trim()
    if (category !== undefined) updateData.category = category && String(category).trim() ? String(category).trim() : null
    if (expenseDate !== undefined) updateData.expenseDate = new Date(expenseDate)
    if (image !== undefined) updateData.image = image && String(image).trim() ? String(image).trim() : null

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    if (!canAccess(session, existing)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
