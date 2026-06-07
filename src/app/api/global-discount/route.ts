import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 10 // Maximum 10 seconds
export const revalidate = 30 // Cache for 30 seconds

// GET - Get active global discount (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const discount = await prisma.globalDiscount.findUnique({
      where: { id: 'main' },
      select: {
        isActive: true,
        percentage: true,
        startDate: true,
        endDate: true,
      }
    })

    if (!discount || !discount.isActive) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
    }

    // Check if discount is within date range (if dates are set)
    const now = new Date()
    if (discount.startDate && now < discount.startDate) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
    }
    if (discount.endDate && now > discount.endDate) {
      return NextResponse.json({ 
        isActive: false,
        percentage: 0 
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
    }

    return NextResponse.json({
      isActive: true,
      percentage: discount.percentage
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Failed to fetch global discount:', error)
    // Return inactive on error to prevent breaking the site
    return NextResponse.json({ 
      isActive: false,
      percentage: 0 
    }, { 
      status: 200, // Return 200 instead of 500 to prevent breaking frontend
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    })
  }
}
