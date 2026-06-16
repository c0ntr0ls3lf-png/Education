import { NextResponse } from 'next/server'
import { connectDB, Quote, toDoc } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const quotes = await Quote.find(all ? {} : { isActive: true }).sort({ order: 1 }).lean()
    return NextResponse.json(toDoc(quotes))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { text, author, order } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Quote text is required' }, { status: 400 })
    }

    const quote = await Quote.create({
      text: text.trim(),
      author: author?.trim() || null,
      order: order ?? 0,
      isActive: true,
    })

    return NextResponse.json(toDoc(quote.toObject()))
  } catch {
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
