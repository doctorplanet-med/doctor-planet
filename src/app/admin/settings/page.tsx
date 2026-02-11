import prisma from '@/lib/prisma'
import AdminSettings from '@/components/admin/admin-settings'
import { ensureSiteSettingsHiddenDefaultColumn } from '@/lib/db-ensure'

export const dynamic = 'force-dynamic'

async function getSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      })
    }
    return settings
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)) || ''
    if (msg.includes('hiddenDefaultHeroBannerIds') || msg.includes('no such column')) {
      await ensureSiteSettingsHiddenDefaultColumn()
      let settings = await prisma.siteSettings.findUnique({
        where: { id: 'main' },
      })
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: { id: 'main' },
        })
      }
      return settings
    }
    throw e
  }
}

async function getCategories() {
  return prisma.category.findMany({
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
    take: 200,
  })
}

async function getDeals() {
  return prisma.deal.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
    take: 100,
  })
}

export default async function AdminSettingsPage() {
  const [settings, categories, products, deals] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getDeals(),
  ])
  return (
    <AdminSettings
      settings={settings}
      categories={categories}
      products={products}
      deals={deals}
    />
  )
}
