import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { message: 'You are already subscribed!' },
          { status: 200 }
        )
      } else {
        // Reactivate subscription
        await prisma.subscriber.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true }
        })
        return NextResponse.json({ message: 'Welcome back! Subscription reactivated.' })
      }
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: {
        email: email.toLowerCase(),
      }
    })

    return NextResponse.json({ message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
