import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Toggle item in wishlist (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ inWishlist: false, message: 'Removed from wishlist' })
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      })
      return NextResponse.json({ inWishlist: true, message: 'Added to wishlist' })
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error)
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 })
  }
}
