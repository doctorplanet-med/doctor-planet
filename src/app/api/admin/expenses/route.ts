import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET - List expenses (Admin: all, Salesman: own only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user?.role === 'SALESMAN' && !session.user?.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') // YYYY-MM-DD
    const to = searchParams.get('to')

    const where: { userId?: string; expenseDate?: { gte?: Date; lte?: Date } } = {}
    if (session.user?.role === 'SALESMAN' && session.user?.id) {
      where.userId = session.user.id
    }
    if (from || to) {
      where.expenseDate = {}
      if (from) where.expenseDate.gte = new Date(from)
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        where.expenseDate.lte = toDate
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : null
    console.error('Error fetching expenses:', message, code ?? '', error)

    // Table or DB not ready (e.g. Turso not migrated)
    const isTableMissing =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2010')
    const isSqliteError = typeof message === 'string' && (message.includes('no such table') || message.includes('SQLITE_ERROR'))
    if (isTableMissing || isSqliteError) {
      return NextResponse.json(
        { error: 'Expenses table not available. Run database migrations (e.g. npm run db:sync:turso).' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch expenses',
        ...(process.env.NODE_ENV === 'development' && { details: message, code }),
      },
      { status: 500 }
    )
  }
}

// POST - Create expense (Admin or Salesman)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, category, expenseDate, image } = body

    if (amount == null || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        amount: Number(amount),
        description: description.trim(),
        category: category && String(category).trim() ? String(category).trim() : null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        image: image && String(image).trim() ? String(image).trim() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    })

    return NextResponse.json(expense)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : null
    console.error('Error creating expense:', message, code ?? '', error)
    return NextResponse.json(
      {
        error: 'Failed to create expense',
        ...(process.env.NODE_ENV === 'development' && { details: message, code }),
      },
      { status: 500 }
    )
  }
}
