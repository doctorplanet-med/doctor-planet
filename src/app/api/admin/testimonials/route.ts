import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all testimonials (admin - includes inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    })
    
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Get max order for new testimonial
    const maxOrder = await prisma.testimonial.aggregate({
      _max: { order: true }
    })
    
    // Ensure isActive defaults to true for new testimonials
    const isActive = data.isActive === false ? false : true
    
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role,
        image: data.image || null,
        content: data.content,
        rating: data.rating || 5,
        isActive: isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })
    
    console.log('Created testimonial:', testimonial.id, 'isActive:', testimonial.isActive)
    
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Failed to create testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
