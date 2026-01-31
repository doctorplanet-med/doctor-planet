import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Generate a unique barcode
function generateBarcode(): string {
  const prefix = 'DP' // Doctor Planet
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// POST - Generate barcodes for all products without one
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all products without barcode
    const productsWithoutBarcode = await prisma.product.findMany({
      where: {
        OR: [
          { barcode: null },
          { barcode: '' },
        ]
      },
      select: { id: true, name: true }
    })

    if (productsWithoutBarcode.length === 0) {
      return NextResponse.json({ 
        message: 'All products already have barcodes',
        updated: 0 
      })
    }

    // Generate unique barcodes for each
    const existingBarcodes = new Set<string>()
    const updates: { id: string; barcode: string }[] = []

    for (const product of productsWithoutBarcode) {
      let barcode: string
      do {
        barcode = generateBarcode()
      } while (existingBarcodes.has(barcode))
      
      existingBarcodes.add(barcode)
      updates.push({ id: product.id, barcode })
    }

    // Update products in batch
    const updatePromises = updates.map(({ id, barcode }) =>
      prisma.product.update({
        where: { id },
        data: { barcode }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: `Generated barcodes for ${updates.length} products`,
      updated: updates.length,
      products: updates.map(u => ({ id: u.id, barcode: u.barcode }))
    })
  } catch (error) {
    console.error('Error generating barcodes:', error)
    return NextResponse.json({ error: 'Failed to generate barcodes' }, { status: 500 })
  }
}
