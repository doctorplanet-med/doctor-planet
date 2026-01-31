import prisma from '@/lib/prisma'
import AdminSettings from '@/components/admin/admin-settings'

async function getSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'main' },
  })

  // Create default settings if not exists
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: 'main' },
    })
  }

  return settings
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return <AdminSettings settings={settings} />
}
