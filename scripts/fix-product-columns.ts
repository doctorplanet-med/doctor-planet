/**
 * One-time script: add missing Product customization columns and tables to SQLite.
 * Run: npx tsx scripts/fix-product-columns.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add Product columns if missing (SQLite has no IF NOT EXISTS for ADD COLUMN)
  const alters = [
    `ALTER TABLE Product ADD COLUMN hasCustomization INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE Product ADD COLUMN customizationFields TEXT`,
    `ALTER TABLE Product ADD COLUMN customizationPrice REAL`,
  ]
  for (const sql of alters) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log('OK:', sql.slice(0, 60) + '...')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('duplicate column name')) console.log('Skip (exists):', sql.slice(0, 50) + '...')
      else throw e
    }
  }

  // Create CustomizationCategory table if not exists
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomizationCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "CustomizationCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    console.log('OK: CustomizationCategory table')
  } catch (e) {
    console.log('CustomizationCategory:', e)
  }

  // Create CustomizationOption table if not exists
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomizationOption" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "categoryId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "CustomizationOption_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CustomizationCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    console.log('OK: CustomizationOption table')
  } catch (e) {
    console.log('CustomizationOption:', e)
  }

  console.log('Done. Product table now has hasCustomization, customizationFields, customizationPrice.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
