import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    
    console.log('Fetched active testimonials:', testimonials.length)
    
    // Return with no-cache headers
    return NextResponse.json(testimonials, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    // Return empty array instead of error to avoid breaking the frontend
    return NextResponse.json([])
  }
}
