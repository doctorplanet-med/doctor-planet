import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductDetail from '@/components/products/product-detail'

// Revalidate every 60 seconds for better performance
export const revalidate = 60

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
      customizationCategories: {
        include: {
          options: true,
        },
        orderBy: {
          order: 'asc',
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
    return {
      title: 'Product Not Found',
    }
  }

  const images = JSON.parse(product.images)
  
  // Parse tags for SEO keywords
  let keywords: string[] = [product.name, product.category.name, 'Doctor Planet']
  if (product.tags) {
    try {
      const productTags = JSON.parse(product.tags)
      if (Array.isArray(productTags)) {
        keywords = [...keywords, ...productTags]
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Create enhanced description with tags
  const descriptionText = product.description.substring(0, 155)
  const enhancedDescription = product.tags 
    ? `${descriptionText}... Keywords: ${keywords.join(', ')}`
    : descriptionText

  return {
    title: `${product.name} | Doctor Planet`,
    description: enhancedDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [images[0]],
      siteName: 'Doctor Planet',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [images[0]],
    },
    other: {
      'product:price:amount': String(product.salePrice || product.price),
      'product:price:currency': 'PKR',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:category': product.category.name,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
