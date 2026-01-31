import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, image, uid } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create a consistent password based on Firebase UID
    const firebasePassword = `firebase_${uid}`
    const hashedPassword = await bcrypt.hash(firebasePassword, 12)

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Update existing user's info and password
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: image || user.image,
          password: hashedPassword, // Update password each time for Firebase users
        },
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          password: hashedPassword,
          role: 'USER',
        },
      })
    }

    return NextResponse.json({
      message: 'User authenticated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      // Return the password for NextAuth sign-in
      firebasePassword,
    })
  } catch (error) {
    console.error('Firebase auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
