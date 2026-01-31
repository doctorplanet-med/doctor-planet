import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Allow both ADMIN and SALESMAN to upload
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Check if we're on Vercel (read-only filesystem)
    const isVercel = process.env.VERCEL === '1'
    
    if (isVercel) {
      // On Vercel, return info for client-side Firebase upload
      // Convert file to base64 for preview
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      
      return NextResponse.json({ 
        error: 'Server upload not available on Vercel. Please use Firebase Storage.',
        useFirebase: true,
        filename: `products/${filename}`,
        contentType: file.type
      }, { status: 200 })
    }

    // Local development: save to public folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/products/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file. Please use Firebase Storage instead.',
      useFirebase: true 
    }, { status: 500 })
  }
}
