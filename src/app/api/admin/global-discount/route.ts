import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get global discount settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let discount = await prisma.globalDiscount.findUnique({
      where: { id: 'main' }
    })

    // Create default if doesn't exist
    if (!discount) {
      discount = await prisma.globalDiscount.create({
        data: {
          id: 'main',
          isActive: false,
          percentage: 0,
        }
      })
    }

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Failed to fetch global discount:', error)
    return NextResponse.json({ error: 'Failed to fetch discount' }, { status: 500 })
  }
}

// PUT - Update global discount settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const data = await request.json()
    const { isActive, percentage, startDate, endDate } = data

    // Validate percentage
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 })
    }

    // Upsert the discount (create if doesn't exist, update if it does)
    const discount = await prisma.globalDiscount.upsert({
      where: { id: 'main' },
      update: {
        isActive: isActive ?? false,
        percentage: percentage ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: session.user.email || session.user.name,
        updatedAt: new Date(),
      },
      create: {
        id: 'main',
        isActive: isActive ?? false,
        percentage: percentage ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: session.user.email || session.user.name,
      }
    })

    console.log(`Admin ${session.user.email} updated global discount: ${percentage}% - Active: ${isActive}`)

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Failed to update global discount:', error)
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 })
  }
}
