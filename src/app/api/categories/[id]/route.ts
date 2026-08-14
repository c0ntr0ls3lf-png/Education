import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Category, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'

function pickCategoryFields(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.slug !== undefined) data.slug = body.slug
  if (body.description !== undefined) data.description = body.description
  if (body.icon !== undefined) data.icon = body.icon
  if (body.color !== undefined) data.color = body.color
  if (body.order !== undefined) data.order = body.order
  if (body.isActive !== undefined) data.isActive = body.isActive
  return data
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const data = pickCategoryFields(body)

    const category = await Category.findByIdAndUpdate(id, data, { new: true }).lean()
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(toDoc(category))
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const category = await Category.findByIdAndDelete(id).lean()
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
