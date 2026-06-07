import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { name, slug } = await request.json()
    const sub = await prisma.subCategory.update({
      where: { id: params.subId },
      data: { name: name.trim(), slug: slug.trim() },
    })
    return NextResponse.json(sub)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE subcategory
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.subCategory.delete({ where: { id: params.subId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
