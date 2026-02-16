import prisma from '@/lib/prisma'

/** Ensure SiteSettings has hiddenDefaultHeroBannerIds (for DBs created before this column existed). Idempotent. */
export async function ensureSiteSettingsHiddenDefaultColumn(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE SiteSettings ADD COLUMN hiddenDefaultHeroBannerIds TEXT;`
    )
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      return
    }
    throw e
  }
}

/** Create HeroBanner table if missing (e.g. db push never run). Idempotent. */
export async function ensureHeroBannerTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HeroBanner" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "subtitle" TEXT NOT NULL,
      "ctaText" TEXT NOT NULL,
      "ctaLink" TEXT NOT NULL,
      "backgroundGradient" TEXT,
      "backgroundColor" TEXT,
      "images" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "isActive" INTEGER NOT NULL DEFAULT 1,
      "startDate" TEXT,
      "endDate" TEXT,
      "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
      "updatedAt" TEXT NOT NULL
    );
  `)
}

/** Ensure HeroBanner has isActive column (for DBs created before this field). Idempotent. */
export async function ensureHeroBannerIsActiveColumn(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE HeroBanner ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1;`
    )
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      return
    }
    throw e
  }
}

/** Ensure Product has sizeChartImage column (for DBs created before this field). Idempotent. */
export async function ensureProductSizeChartColumn(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE Product ADD COLUMN sizeChartImage TEXT;`
    )
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase()
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      return
    }
    throw e
  }
}

/** Create PromoBanner table if missing. Idempotent. */
export async function ensurePromoBannerTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PromoBanner" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "imageUrl" TEXT NOT NULL,
      "linkUrl" TEXT NOT NULL DEFAULT '/',
      "alt" TEXT NOT NULL DEFAULT 'Promo',
      "order" INTEGER NOT NULL DEFAULT 0,
      "isActive" INTEGER NOT NULL DEFAULT 1,
      "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
      "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}
