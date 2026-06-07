import HeroSection from '@/components/home/hero-section'
import CategoryGridSection from '@/components/home/category-grid-section'
import SubCategoryFeatureSection from '@/components/home/subcategory-feature-section'
import PromoBannerSection from '@/components/home/promo-banner-section'
import ExclusiveOffersSection from '@/components/home/exclusive-offers-section'
import DealsOffersSection from '@/components/home/deals-offers-section'
import FeaturedProducts from '@/components/home/featured-products'
import AllProductsSection from '@/components/home/all-products-section'
import FeaturesSection from '@/components/home/features-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import NewsletterSection from '@/components/home/newsletter-section'
import prisma from '@/lib/prisma'
import { heroBanners as fallbackBanners } from '@/data/heroBanners'
import type { HeroBannerItem } from '@/data/heroBanners'

// Cache for 5 minutes — home page data doesn't change that frequently
export const revalidate = 300
export const maxDuration = 60 // Maximum execution time

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      take: 20,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getSettings() {
  try {
    return await prisma.siteSettings.findFirst()
  } catch { return null }
}

// Single query for ALL products — filtered in memory to avoid multiple round-trips to Turso
async function getAllHomeProducts() {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  } catch { return [] }
}

async function getActiveDeals() {
  try {
    const now = new Date()
    const allDeals = await prisma.deal.findMany({
      where: { isActive: true },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit deals
    })
    const filtered = allDeals.filter((deal) => {
      if (deal.startDate && new Date(deal.startDate) > now) return false
      if (deal.endDate && new Date(deal.endDate) < now) return false
      return true
    }).slice(0, 8)
    if (filtered.length === 0) return []
    const productIds = Array.from(new Set(filtered.flatMap((d) => d.items.map((i) => i.productId))))
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
      startDate: deal.startDate ? deal.startDate.toISOString() : null,
      endDate: deal.endDate ? deal.endDate.toISOString() : null,
      items: deal.items.map((item) => ({
        ...item,
        product: productMap[item.productId] ?? null,
      })),
    }))
  } catch (error) {
    console.error('Error fetching deals:', error)
    return []
  }
}

async function getHeroBanners(): Promise<HeroBannerItem[]> {
  try {
    const now = new Date()
    const dbBanners = await prisma.heroBanner.findMany({
      where: {
        isActive: true,
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
  // Only 4 DB round-trips instead of 12 — all product filtering happens in memory
  const [categories, allProductsRaw, activeDeals, settings, heroBanners] = await Promise.all([
    getCategories(),
    getAllHomeProducts(),
    getActiveDeals(),
    getSettings(),
    getHeroBanners(),
  ])

  // Filter products in memory — zero extra DB calls
  const allProducts       = allProductsRaw.slice(0, 8)
  const featuredProducts  = allProductsRaw.filter(p => p.featured).slice(0, 8)
  const productsOnSale    = allProductsRaw.filter(p => p.salePrice != null).slice(0, 8)
  const newArrivalProducts  = allProductsRaw.filter(p => (p as any).isNewArrival).slice(0, 8)
  const collectionProducts  = allProductsRaw.filter(p => (p as any).isCollection).slice(0, 8)
  const bestSellingProducts = allProductsRaw.filter(p =>
    (p as any).isBestSelling && p.category.name.toLowerCase().includes('scrub')
  ).slice(0, 8)
  const microStretchProducts = allProductsRaw.filter(p =>
    (p as any).subCategory?.name?.toLowerCase().includes('flexon')
  ).slice(0, 8)
  const randomProducts = [...allProductsRaw].sort(() => Math.random() - 0.5).slice(0, 7)

  return (
    <>
      <HeroSection settings={settings} randomProducts={randomProducts} banners={heroBanners} />

      {/* Shop by Category heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-secondary-200" />
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 whitespace-nowrap">
            Shop by Category
          </h2>
          <div className="flex-1 h-px bg-secondary-200" />
        </div>
      </div>

      {/* Category grid — full width, zero gap */}
      <CategoryGridSection categories={categories} />

      {/* Flexon — products from that subcategory across Male & Female */}
      <SubCategoryFeatureSection
        title="Flexon Scrubs"
        products={microStretchProducts}
        viewAllHref="/products"
      />

      {/* New Arrivals */}
      <SubCategoryFeatureSection
        title="New Arrivals"
        products={newArrivalProducts}
        viewAllHref="/products"
      />

      {/* Collection */}
      <SubCategoryFeatureSection
        title="Collection"
        products={collectionProducts}
        viewAllHref="/products"
      />

      {/* Best Selling Scrubs — Men + Women Scrubs only */}
      <SubCategoryFeatureSection
        title="Best Selling Scrubs"
        products={bestSellingProducts}
        viewAllHref="/products"
      />

      <PromoBannerSection />
      <ExclusiveOffersSection products={productsOnSale} />
      <DealsOffersSection deals={activeDeals} />
      <FeaturedProducts products={featuredProducts} />
      <AllProductsSection products={allProducts} />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
