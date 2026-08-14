import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Category, Subcategory, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all categories with subcategories
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true'
    const all = searchParams.get('all') === 'true'

    const categories = await Category.find(all ? {} : { isActive: true }).sort({ order: 1 }).lean()

    let result: any = categories

    if (includeSubcategories) {
      const subcategories = await Subcategory.find(all ? {} : { isActive: true }).sort({ order: 1 }).lean()
      const subcategoriesByCategory = new Map<string, typeof subcategories>()
      
      for (const sub of subcategories) {
        const key = String(sub.categoryId)
        if (!subcategoriesByCategory.has(key)) subcategoriesByCategory.set(key, [])
        subcategoriesByCategory.get(key)!.push(sub)
      }

      result = categories.map(cat => ({
        ...cat,
        subcategories: subcategoriesByCategory.get(String(cat._id)) || []
      }))
    }

    return NextResponse.json(toDoc(result))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, slug, description, icon, color, order, isActive } = body

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || '',
      icon: icon || 'GraduationCap',
      color: color || 'from-emerald-500 to-teal-600',
      order: order ?? 0,
      isActive: isActive ?? true,
    })

    return NextResponse.json(toDoc(category.toObject()), { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating category:', error)
    const message = (error as { code?: number })?.code === 11000
      ? 'A category with this name or slug already exists'
      : 'Failed to create category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
