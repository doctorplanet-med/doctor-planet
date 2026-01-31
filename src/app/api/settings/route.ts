import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public endpoint to get site settings
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        siteName: 'Doctor Planet',
        siteTagline: 'Professional Medical Boutique',
        contactEmail: 'info@doctorplanet.com',
        contactPhone: '+92 300 1234567',
        contactAddress: 'Medical Plaza, Healthcare City',
        facebookUrl: null,
        instagramUrl: null,
        whatsappNumber: null,
        footerText: 'Your trusted partner for premium medical apparel and equipment.',
        announcementBar: null,
        announcementActive: false,
        freeShippingMinimum: 5000,
        shippingFee: 500,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
