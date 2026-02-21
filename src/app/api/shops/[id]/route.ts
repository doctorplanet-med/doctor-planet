import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch single shop
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Failed to fetch shop:', error)
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}

// PATCH - Update shop
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, ownerName, phone, address, city, cnic, allowCredit, creditLimit, currentCredit, isActive, notes } = data

    const shop = await prisma.shop.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(ownerName !== undefined && { ownerName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(cnic !== undefined && { cnic }),
        ...(allowCredit !== undefined && { allowCredit }),
        ...(creditLimit !== undefined && { creditLimit }),
        ...(currentCredit !== undefined && { currentCredit }),
        ...(isActive !== undefined && { isActive }),
        ...(notes !== undefined && { notes }),
      }
    })

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Failed to update shop:', error)
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}

// DELETE - Delete shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.shop.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete shop:', error)
    return NextResponse.json({ error: 'Failed to delete shop' }, { status: 500 })
  }
}
