import { NextResponse } from 'next/server'
import { connectDB, BlogPost, toDoc } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const filter = all ? {} : { isActive: true }
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).lean()
    return NextResponse.json(toDoc(posts))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { title, content, coverImage, category, isActive } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)

    const post = await BlogPost.create({
      title: title.trim(),
      slug,
      content,
      coverImage: coverImage?.trim() || null,
      category: category?.trim() || 'General',
      isActive: isActive !== false,
    })

    return NextResponse.json(toDoc(post.toObject()))
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}
