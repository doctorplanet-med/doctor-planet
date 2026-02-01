import HeroSection from '@/components/home/hero-section'
import CategoriesSection from '@/components/home/categories-section'
import DealsSection from '@/components/home/deals-section'
import FeaturedProducts from '@/components/home/featured-products'
import FeaturesSection from '@/components/home/features-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import NewsletterSection from '@/components/home/newsletter-section'
import prisma from '@/lib/prisma'

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

async function getSettings() {
  const settings = await prisma.siteSettings.findFirst()
  return settings
}

async function getRandomProducts() {
  // Get all active products
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
  
  // Shuffle and take 7 random products
  const shuffled = allProducts.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 7)
}

export default async function HomePage() {
  const [categories, featuredProducts, settings, randomProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getSettings(),
    getRandomProducts()
  ])

  return (
    <>
      <HeroSection settings={settings} randomProducts={randomProducts} />
      <CategoriesSection categories={categories} />
      <DealsSection />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
