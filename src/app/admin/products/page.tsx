import prisma from '@/lib/prisma'
import AdminProductsList from '@/components/admin/admin-products-list'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds
export const maxDuration = 60 // Maximum execution time of 60 seconds

async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to 100 products for better performance
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return <AdminProductsList products={products} categories={categories} />
}
