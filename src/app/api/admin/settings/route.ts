import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ensureSiteSettingsHiddenDefaultColumn } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || ''
    if (msg.includes('hiddenDefaultHeroBannerIds') || msg.includes('no such column')) {
      try {
        await ensureSiteSettingsHiddenDefaultColumn()
        let settings = await prisma.siteSettings.findUnique({
          where: { id: 'main' },
        })
        if (!settings) {
          settings = await prisma.siteSettings.create({
            data: { id: 'main' },
          })
        }
        return NextResponse.json(settings)
      } catch (e) {
        console.error('Error fetching settings:', e)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
      }
    }
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        siteName: body.siteName,
        siteTagline: body.siteTagline,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroBannerImage: body.heroBannerImage,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactAddress: body.contactAddress,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        whatsappNumber: body.whatsappNumber,
        freeShippingMinimum: body.freeShippingMinimum,
        shippingFee: body.shippingFee,
        announcementBar: body.announcementBar,
        announcementActive: body.announcementActive,
        footerText: body.footerText,
        hiddenDefaultHeroBannerIds: body.hiddenDefaultHeroBannerIds,
      },
      create: {
        id: 'main',
        ...body,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
