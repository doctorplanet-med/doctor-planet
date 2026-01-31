import HeroSection from '@/components/home/hero-section'
import CategoriesSection from '@/components/home/categories-section'
import FeaturedProducts from '@/components/home/featured-products'
import FeaturesSection from '@/components/home/features-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import NewsletterSection from '@/components/home/newsletter-section'
import prisma from '@/lib/prisma'

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

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts()
  ])

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
