import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Generate a unique barcode
async function generateBarcode(): Promise<string> {
  const prefix = 'DP' // Doctor Planet
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const barcode = `${prefix}${timestamp}${random}`
  
  // Check if barcode already exists
  const existing = await prisma.product.findUnique({ where: { barcode } })
  if (existing) {
    return generateBarcode() // Recursively generate a new one
  }
  
  return barcode
}

// GET - Fetch all products (admin and salesman can access)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Allow both ADMIN and SALESMAN to create products
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      costPrice,
      price,
      salePrice,
      categoryId,
      stock,
      images,
      sizes,
      colors,
      colorImages,
      colorSizeStock,
      sizeChartImage,
      isActive,
      isFeatured,
      barcode,
      sku,
      company,
    } = body

    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Product slug already exists' }, { status: 400 })
    }

    // Check if barcode is provided and unique
    let finalBarcode = barcode
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode } })
      if (existingBarcode) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 })
      }
    } else {
      // Auto-generate barcode if not provided
      finalBarcode = await generateBarcode()
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        costPrice: costPrice || 0,
        price,
        salePrice,
        categoryId,
        stock,
        images,
        sizes,
        colors,
        colorImages,
        colorSizeStock,
        sizeChartImage: sizeChartImage || null,
        isActive: isActive ?? true,
        featured: isFeatured ?? false,
        barcode: finalBarcode,
        sku: sku || null,
        company: company || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
