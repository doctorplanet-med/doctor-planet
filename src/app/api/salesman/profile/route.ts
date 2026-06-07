import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch salesman's own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SALESMAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        createdAt: true,
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT - Update profile picture only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SALESMAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Salesman can only update their profile picture
    if (!data.image) {
      return NextResponse.json(
        { error: 'Only profile picture can be updated' },
        { status: 400 }
      )
    }

    const profile = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: data.image },
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
        createdAt: true,
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
