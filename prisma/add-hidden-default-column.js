/**
 * One-time script: add hiddenDefaultHeroBannerIds to SiteSettings if missing.
 * Run: node prisma/add-hidden-default-column.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // SQLite: add column if not present (ALTER TABLE supports ADD COLUMN)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE SiteSettings ADD COLUMN hiddenDefaultHeroBannerIds TEXT;`
  )
  console.log('Added column hiddenDefaultHeroBannerIds to SiteSettings.')
}

main()
  .catch((e) => {
    const msg = (e.message || String(e)).toLowerCase()
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      console.log('Column hiddenDefaultHeroBannerIds already exists. Nothing to do.')
      process.exit(0)
    }
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
