import prisma from '@/lib/prisma'
import AdminCategoriesList from '@/components/admin/admin-categories-list'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return <AdminCategoriesList categories={categories} />
}
