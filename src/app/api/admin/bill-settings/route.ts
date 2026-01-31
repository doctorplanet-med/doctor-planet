import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch bill settings (admin and salesman can access)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await prisma.billSettings.findUnique({
      where: { id: 'main' }
    })

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.billSettings.create({
        data: { id: 'main' }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch bill settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update bill settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const settings = await prisma.billSettings.upsert({
      where: { id: 'main' },
      update: {
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        storePhone: data.storePhone,
        storeEmail: data.storeEmail,
        headerText: data.headerText,
        logoUrl: data.logoUrl,
        footerText: data.footerText,
        returnPolicy: data.returnPolicy,
        showLogo: data.showLogo,
        showStoreAddress: data.showStoreAddress,
        showStorePhone: data.showStorePhone,
        showReturnPolicy: data.showReturnPolicy,
        showBarcode: data.showBarcode,
        paperWidth: data.paperWidth,
        fontSize: data.fontSize,
      },
      create: {
        id: 'main',
        ...data,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update bill settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
