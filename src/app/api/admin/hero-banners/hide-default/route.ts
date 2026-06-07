import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ensureSiteSettingsHiddenDefaultColumn } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

async function getSettingsWithEnsure() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 'main' } })
    }
    return settings
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)) || ''
    if (msg.includes('hiddenDefaultHeroBannerIds') || msg.includes('no such column')) {
      await ensureSiteSettingsHiddenDefaultColumn()
      let settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
      if (!settings) {
        settings = await prisma.siteSettings.create({ data: { id: 'main' } })
      }
      return settings
    }
    throw e
  }
}

/** POST: add a default banner id to the hidden list so it no longer shows on home or in admin list */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : null
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const settings = await getSettingsWithEnsure()

    const hidden: string[] = settings.hiddenDefaultHeroBannerIds
      ? (JSON.parse(settings.hiddenDefaultHeroBannerIds) as string[])
      : []
    if (hidden.includes(id)) {
      return NextResponse.json({ ok: true })
    }

    await prisma.siteSettings.update({
      where: { id: 'main' },
      data: { hiddenDefaultHeroBannerIds: JSON.stringify([...hidden, id]) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error hiding default banner:', error)
    return NextResponse.json({ error: 'Failed to hide default banner' }, { status: 500 })
  }
}
