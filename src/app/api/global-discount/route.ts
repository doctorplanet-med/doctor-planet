import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get active global discount (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const discount = await prisma.globalDiscount.findUnique({
      where: { id: 'main' }
    })

    if (!discount || !discount.isActive) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      })
    }

    // Check if discount is within date range (if dates are set)
    const now = new Date()
    if (discount.startDate && now < discount.startDate) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      })
    }
    if (discount.endDate && now > discount.endDate) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      })
    }

    return NextResponse.json({
      isActive: true,
      percentage: discount.percentage
    })
  } catch (error) {
    console.error('Failed to fetch global discount:', error)
    return NextResponse.json({ 
      isActive: false,
      percentage: 0 
    }, { status: 500 })
  }
}
