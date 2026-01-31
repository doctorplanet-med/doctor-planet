import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Verify token (for backward compatibility with links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 })
  }
}

// POST - Verify 6-digit code
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Find user with valid code
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetToken: code,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    return NextResponse.json({ valid: true, userId: user.id })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
