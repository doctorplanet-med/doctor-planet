import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all team members (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const members = await prisma.teamMember.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const maxOrder = await prisma.teamMember.aggregate({
      _max: { order: true }
    })

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio,
        image: data.image || null,
        isFounder: data.isFounder || false,
        isActive: data.isActive ?? true,
        email: data.email || null,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        order: (maxOrder._max.order || 0) + 1,
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Failed to create team member:', error)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
