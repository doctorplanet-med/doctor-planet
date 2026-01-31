import prisma from '@/lib/prisma'
import AdminCategoriesList from '@/components/admin/admin-categories-list'

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return <AdminCategoriesList categories={categories} />
}
