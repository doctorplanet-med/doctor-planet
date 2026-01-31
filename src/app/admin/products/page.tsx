import prisma from '@/lib/prisma'
import AdminProductsList from '@/components/admin/admin-products-list'

export const dynamic = 'force-dynamic'

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: {
        select: { name: true, slug: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function getCategories() {
  return await prisma.category.findMany()
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return <AdminProductsList products={products} categories={categories} />
}
