import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Subcategory, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all subcategories
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const all = searchParams.get('all') === 'true'

    const query: Record<string, unknown> = all ? {} : { isActive: true }
    if (categoryId) query.categoryId = categoryId
    const subcategories = await Subcategory.find(query).sort({ order: 1 }).lean()

    return NextResponse.json(toDoc(subcategories))
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 })
  }
}

// POST create new subcategory
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { categoryId, name, description, order, isActive } = body

    if (!categoryId || !name?.trim()) {
      return NextResponse.json({ error: 'Main category and name are required' }, { status: 400 })
    }

    const subcategory = await Subcategory.create({
      categoryId,
      name: name.trim(),
      description: description?.trim() || '',
      order: order ?? 0,
      isActive: isActive ?? true,
    })

    return NextResponse.json(toDoc(subcategory.toObject()), { status: 201 })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 })
  }
}
