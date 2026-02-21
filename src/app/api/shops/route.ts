import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all shops
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shops = await prisma.shop.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { 
            sales: true,
            udharTransactions: true
          }
        },
        sales: {
          where: { isPaid: false },
          select: {
            remainingAmount: true
          }
        },
        udharTransactions: {
          where: { status: { not: 'PAID' } },
          select: {
            remainingAmount: true
          }
        }
      }
    })

    // Calculate outstanding amounts
    const shopsWithOutstanding = shops.map(shop => ({
      ...shop,
      posOutstanding: shop.sales.reduce((sum, sale) => sum + (sale.remainingAmount || 0), 0),
      udharOutstanding: shop.udharTransactions.reduce((sum, t) => sum + t.remainingAmount, 0),
      sales: undefined,
      udharTransactions: undefined
    }))

    return NextResponse.json(shopsWithOutstanding)
  } catch (error) {
    console.error('Failed to fetch shops:', error)
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 })
  }
}

// POST - Create new shop
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, ownerName, phone, address, city, cnic, allowCredit, creditLimit, notes } = data

    if (!name) {
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 })
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        ownerName: ownerName || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        cnic: cnic || null,
        allowCredit: allowCredit || false,
        creditLimit: creditLimit || null,
        notes: notes || null,
      }
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('Failed to create shop:', error)
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 })
  }
}
