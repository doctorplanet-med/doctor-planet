import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Fetch all salesmen
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const salesmen = await prisma.user.findMany({
      where: { role: 'SALESMAN' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        address: true,
        cnic: true,
        gender: true,
        granterName: true,
        granterPhone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { posSales: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get sales totals for each salesman
    const salesmenWithStats = await Promise.all(
      salesmen.map(async (salesman) => {
        const salesTotal = await prisma.pOSSale.aggregate({
          where: { salesmanId: salesman.id },
          _sum: { total: true },
          _count: true,
        })
        return {
          ...salesman,
          totalSales: salesTotal._sum.total || 0,
          salesCount: salesTotal._count || 0,
        }
      })
    )

    return NextResponse.json(salesmenWithStats)
  } catch (error) {
    console.error('Failed to fetch salesmen:', error)
    return NextResponse.json({ error: 'Failed to fetch salesmen' }, { status: 500 })
  }
}

// POST - Create new salesman
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create salesman
    const salesman = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        image: data.image || null,
        address: data.address || null,
        cnic: data.cnic || null,
        gender: data.gender || null,
        granterName: data.granterName || null,
        granterPhone: data.granterPhone || null,
        role: 'SALESMAN',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        address: true,
        cnic: true,
        gender: true,
        granterName: true,
        granterPhone: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(salesman)
  } catch (error) {
    console.error('Failed to create salesman:', error)
    return NextResponse.json({ error: 'Failed to create salesman' }, { status: 500 })
  }
}
