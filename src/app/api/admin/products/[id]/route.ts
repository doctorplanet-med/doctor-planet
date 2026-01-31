import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PATCH - Update product (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Allow both ADMIN and SALESMAN to update products
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      stock, isActive, costPrice, price, salePrice, name, description, 
      colorSizeStock, barcode, sku, company 
    } = body

    const updateData: any = {}

    if (stock !== undefined) updateData.stock = stock
    if (isActive !== undefined) updateData.isActive = isActive
    if (costPrice !== undefined) updateData.costPrice = costPrice
    if (price !== undefined) updateData.price = price
    if (salePrice !== undefined) updateData.salePrice = salePrice
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (colorSizeStock !== undefined) updateData.colorSizeStock = colorSizeStock
    if (sku !== undefined) updateData.sku = sku
    if (company !== undefined) updateData.company = company

    // Check barcode uniqueness if being updated
    if (barcode !== undefined) {
      if (barcode) {
        const existingBarcode = await prisma.product.findFirst({
          where: { 
            barcode,
            NOT: { id: params.id }
          }
        })
        if (existingBarcode) {
          return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 })
        }
      }
      updateData.barcode = barcode
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// PUT - Full product update
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Allow both ADMIN and SALESMAN to update products
    if (!session || !['ADMIN', 'SALESMAN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, slug, description, costPrice, price, salePrice, 
      categoryId, stock, isActive, featured, images,
      sizes, colors, colorImages, colorSizeStock,
      barcode, sku, company
    } = body

    // Check barcode uniqueness if being updated
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { 
          barcode,
          NOT: { id: params.id }
        }
      })
      if (existingBarcode) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 })
      }
    }

    // Check slug uniqueness if being updated
    if (slug) {
      const existingSlug = await prisma.product.findFirst({
        where: { 
          slug,
          NOT: { id: params.id }
        }
      })
      if (existingSlug) {
        return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        costPrice: costPrice || 0,
        price,
        salePrice: salePrice || null,
        categoryId,
        stock: stock || 0,
        isActive: isActive !== undefined ? isActive : true,
        featured: featured || false,
        images,
        sizes: sizes || null,
        colors: colors || null,
        colorImages: colorImages || null,
        colorSizeStock: colorSizeStock || null,
        barcode: barcode || null,
        sku: sku || null,
        company: company || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only ADMIN can delete products
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const forceDelete = searchParams.get('force') === 'true'

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete cart items first (these are temporary and can be removed)
    await prisma.cartItem.deleteMany({
      where: { productId: params.id }
    })

    // If force delete, remove all related records first
    if (forceDelete) {
      // Delete order items
      try {
        await prisma.orderItem.deleteMany({
          where: { productId: params.id }
        })
      } catch (e) {
        // Ignore
      }

      // Delete POS sale items
      try {
        await prisma.$executeRaw`DELETE FROM POSSaleItem WHERE productId = ${params.id}`
      } catch (e) {
        // Ignore - table might not exist
      }
    }

    // Try to delete the product
    try {
      await prisma.product.delete({
        where: { id: params.id },
      })
      return NextResponse.json({ success: true, deleted: true })
    } catch (deleteError: any) {
      // If foreign key constraint error
      if (deleteError.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Product has order history. Use Force Delete to remove it completely.',
          hasOrderHistory: true
        }, { status: 400 })
      }
      throw deleteError
    }
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
