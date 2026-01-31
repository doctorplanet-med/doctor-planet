import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductDetail from '@/components/products/product-detail'

interface ProductPageProps {
  params: { slug: string }
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return product
}

async function getRelatedProducts(categoryId: string, productId: string) {
  return await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      isActive: true,
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    take: 4,
  })
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const images = JSON.parse(product.images)

  return {
    title: `${product.name} | Doctor Planet`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [images[0]],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
