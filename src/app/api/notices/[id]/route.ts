import { NextResponse } from 'next/server'
import { connectDB, Notice, toDoc } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const notice = await Notice.findById(id).lean()

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json(toDoc(notice))
  } catch (error) {
    console.error('Error fetching notice:', error)
    return NextResponse.json({ error: 'Failed to fetch notice' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const { title, content, category, isImportant, isActive } = body

    if (!title?.trim() || !content?.trim() || !category) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 })
    }

    const updated = await Notice.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content,
        category,
        isImportant: isImportant === true,
        isActive: isActive !== false,
      },
      { new: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json(toDoc(updated))
  } catch (error) {
    console.error('Error updating notice:', error)
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const deleted = await Notice.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Notice deleted successfully' })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}
