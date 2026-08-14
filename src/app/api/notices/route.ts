import { NextResponse } from 'next/server'
import { connectDB, Notice, toDoc } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const filter = all ? {} : { isActive: true }
    const notices = await Notice.find(filter).sort({ isImportant: -1, createdAt: -1 }).lean()
    return NextResponse.json(toDoc(notices))
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { title, content, category, isImportant, isActive } = body

    if (!title?.trim() || !content?.trim() || !category) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)

    const notice = await Notice.create({
      title: title.trim(),
      slug,
      content,
      category,
      isImportant: isImportant === true,
      isActive: isActive !== false,
    })

    return NextResponse.json(toDoc(notice.toObject()))
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
