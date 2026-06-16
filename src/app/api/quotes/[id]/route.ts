import { NextResponse } from 'next/server'
import { connectDB, Quote, toDoc } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const { text, author, order, isActive } = body

    const quote = await Quote.findByIdAndUpdate(id, {
      ...(text !== undefined && { text: text.trim() }),
      ...(author !== undefined && { author: author?.trim() || null }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    }, { new: true }).lean()

    return NextResponse.json(toDoc(quote))
  } catch {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    await Quote.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
