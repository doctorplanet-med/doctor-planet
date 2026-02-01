import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import ProductsContent from '@/components/products/products-content'

// Revalidate every 30 seconds for better performance
export const revalidate = 30

interface ProductsPageProps {
  searchParams: { category?: string; featured?: string; search?: string }
}

async function getProducts(searchParams: ProductsPageProps['searchParams']) {
  const where: any = { isActive: true }

  if (searchParams.category) {
    where.category = { slug: searchParams.category }
  }

  if (searchParams.featured === 'true') {
    where.featured = true
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
    ]
  }

  return await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  })
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])

  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsContent
        products={products}
        categories={categories}
        currentCategory={searchParams.category}
        searchQuery={searchParams.search}
      />
    </Suspense>
  )
}

function ProductsLoadingSkeleton() {
  return (
    <div className="min-h-screen pt-0 sm:pt-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-secondary-200 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-square bg-secondary-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-1/2" />
                  <div className="h-6 bg-secondary-200 rounded" />
                  <div className="h-5 bg-secondary-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
