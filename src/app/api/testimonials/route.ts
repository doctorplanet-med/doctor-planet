import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { cachedJson } from '@/lib/cache-headers'

export const dynamic = 'force-dynamic'

// GET - Fetch all active testimonials (public)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        role: true,
        image: true,
        content: true,
        rating: true,
      }
    })
    
    return cachedJson(testimonials, 60)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    // Return empty array instead of error to avoid breaking the frontend
    return NextResponse.json([])
  }
}
