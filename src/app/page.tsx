import HeroSection from '@/components/home/hero-section'
import CategoryCirclesSection from '@/components/home/category-circles-section'
import PromoBannerSection from '@/components/home/promo-banner-section'
import ExclusiveOffersSection from '@/components/home/exclusive-offers-section'
import DealsOffersSection from '@/components/home/deals-offers-section'
import FeaturedProducts from '@/components/home/featured-products'
import FeaturesSection from '@/components/home/features-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import NewsletterSection from '@/components/home/newsletter-section'
import prisma from '@/lib/prisma'
import { heroBanners as fallbackBanners } from '@/data/heroBanners'
import type { HeroBannerItem } from '@/data/heroBanners'

// Revalidate every 60 seconds for faster performance
export const revalidate = 60

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })
}

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { 
      featured: true,
      isActive: true 
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    take: 8
  })
}

async function getProductsOnSale() {
  return await prisma.product.findMany({
    where: { 
      isActive: true,
      salePrice: { not: null }
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 8
  })
}

async function getSettings() {
  const settings = await prisma.siteSettings.findFirst()
  return settings
}

async function getRandomProducts() {
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  })
  const shuffled = allProducts.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 7)
}

async function getActiveDeals() {
  const now = new Date()
  const allDeals = await prisma.deal.findMany({
    where: { isActive: true },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  const filtered = allDeals.filter((deal) => {
    if (deal.startDate && new Date(deal.startDate) > now) return false
    if (deal.endDate && new Date(deal.endDate) < now) return false
    return true
  }).slice(0, 8)
  if (filtered.length === 0) return []
  const productIds = [...new Set(filtered.flatMap((d) => d.items.map((i) => i.productId)))]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      images: true,
      stock: true,
    },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
  return filtered.map((deal) => ({
    ...deal,
    items: deal.items.map((item) => ({
      ...item,
      product: productMap[item.productId] ?? null,
    })),
  }))
}

async function getHeroBanners(): Promise<HeroBannerItem[]> {
  try {
    const now = new Date()
    const dbBanners = await prisma.heroBanner.findMany({
      where: {
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { order: 'asc' },
    })
    if (dbBanners.length === 0) {
      const settings = await prisma.siteSettings.findFirst({
        select: { hiddenDefaultHeroBannerIds: true },
      })
      const hidden: string[] = settings?.hiddenDefaultHeroBannerIds
        ? (JSON.parse(settings.hiddenDefaultHeroBannerIds) as string[])
        : []
      return fallbackBanners.filter((b) => !hidden.includes(b.id))
    }
    return dbBanners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      backgroundGradient: b.backgroundGradient ?? undefined,
      backgroundColor: b.backgroundColor ?? undefined,
      images: JSON.parse(b.images) as { mobile: string; tablet?: string; desktop: string },
    }))
  } catch {
    return fallbackBanners
  }
}

export default async function HomePage() {
  const [categories, featuredProducts, productsOnSale, activeDeals, settings, randomProducts, heroBanners] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProductsOnSale(),
    getActiveDeals(),
    getSettings(),
    getRandomProducts(),
    getHeroBanners(),
  ])

  return (
    <>
      <HeroSection settings={settings} randomProducts={randomProducts} banners={heroBanners}>
        <CategoryCirclesSection categories={categories} />
      </HeroSection>
      <PromoBannerSection />
      <ExclusiveOffersSection products={productsOnSale} />
      <DealsOffersSection deals={activeDeals} />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
