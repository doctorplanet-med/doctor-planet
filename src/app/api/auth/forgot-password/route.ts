import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we sent a verification code.' 
      })
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode()
    // Code expires in 2 minutes
    const codeExpiry = new Date(Date.now() + 2 * 60 * 1000)

    // Save code to user (using resetToken field)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: verificationCode,
        resetTokenExpiry: codeExpiry,
      },
    })

    // Send verification code email
    await sendVerificationCodeEmail(
      email,
      user.name || 'there',
      verificationCode
    )

    return NextResponse.json({ 
      message: 'If an account with that email exists, we sent a verification code.',
      success: true
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
