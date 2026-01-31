import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

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
        message: 'If an account with that email exists, we sent a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

    // Send email
    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Doctor Planet <onboarding@resend.dev>'
      const testEmail = process.env.RESEND_TEST_EMAIL
      const toEmail = testEmail || email

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: testEmail ? '[TEST] Reset Your Password - Doctor Planet' : 'Reset Your Password - Doctor Planet',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
              .btn { display: inline-block; background: #8B0000; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
              .warning { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏥 Doctor Planet</h1>
              </div>
              <div class="content">
                <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                
                <p>Hi ${user.name || 'there'},</p>
                
                <p>We received a request to reset your password for your Doctor Planet account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="btn">Reset My Password</a>
                </div>
                
                <div class="warning">
                  ⏰ <strong>This link will expire in 1 hour.</strong><br>
                  If you didn't request this password reset, you can safely ignore this email.
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #8B0000; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    }

    return NextResponse.json({ 
      message: 'If an account with that email exists, we sent a password reset link.' 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
