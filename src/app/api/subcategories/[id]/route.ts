import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Subcategory, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'

function pickSubcategoryFields(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  if (body.categoryId !== undefined) data.categoryId = body.categoryId
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.order !== undefined) data.order = body.order
  if (body.isActive !== undefined) data.isActive = body.isActive
  return data
}

// PUT update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const data = pickSubcategoryFields(body)

    const subcategory = await Subcategory.findByIdAndUpdate(id, data, { new: true }).lean()
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    return NextResponse.json(toDoc(subcategory))
  } catch (error) {
    console.error('Error updating subcategory:', error)
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 })
  }
}

// DELETE subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const subcategory = await Subcategory.findByIdAndDelete(id).lean()
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 })
  }
}
