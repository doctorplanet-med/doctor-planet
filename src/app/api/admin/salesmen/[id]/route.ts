import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET - Get single salesman details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const salesman = await prisma.user.findUnique({
      where: { id: params.id, role: 'SALESMAN' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        posSales: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            receiptNumber: true,
            total: true,
            createdAt: true,
          }
        }
      }
    })

    if (!salesman) {
      return NextResponse.json({ error: 'Salesman not found' }, { status: 404 })
    }

    return NextResponse.json(salesman)
  } catch (error) {
    console.error('Failed to fetch salesman:', error)
    return NextResponse.json({ error: 'Failed to fetch salesman' }, { status: 500 })
  }
}

// PUT - Update salesman
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Check if email is being changed and if new email exists
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      image: data.image,
      address: data.address,
      cnic: data.cnic,
      gender: data.gender,
      granterName: data.granterName,
      granterPhone: data.granterPhone,
      isActive: data.isActive,
    }

    // Only update password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    const salesman = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Failed to update salesman:', error)
    return NextResponse.json({ error: 'Failed to update salesman' }, { status: 500 })
  }
}

// DELETE - Delete salesman
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if salesman has any sales
    const salesCount = await prisma.pOSSale.count({
      where: { salesmanId: params.id }
    })

    if (salesCount > 0) {
      // Soft delete by deactivating instead
      await prisma.user.update({
        where: { id: params.id },
        data: { isActive: false }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Salesman deactivated (has sales history)' 
      })
    }

    // Hard delete if no sales
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete salesman:', error)
    return NextResponse.json({ error: 'Failed to delete salesman' }, { status: 500 })
  }
}
