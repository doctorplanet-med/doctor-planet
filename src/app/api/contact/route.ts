import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Submit contact message (public)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Create contact message
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      }
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: 'CONTACT_MESSAGE',
        title: 'New Contact Message',
        message: `${data.name} sent a message: ${data.subject}`,
        data: JSON.stringify({ messageId: message.id, email: data.email }),
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    })
  } catch (error) {
    console.error('Failed to save contact message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
