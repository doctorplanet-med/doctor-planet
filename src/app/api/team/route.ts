import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cachedJson } from '@/lib/cache-headers'

export const dynamic = 'force-dynamic'

// GET - Fetch all active team members (public)
export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: [
        { isFounder: 'desc' },
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        image: true,
        isFounder: true,
        email: true,
        phone: true,
        linkedin: true,
        instagram: true,
        facebook: true,
      }
    })

    return cachedJson(members, 300)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json([])
  }
}
