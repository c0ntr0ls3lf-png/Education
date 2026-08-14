import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { connectDB, Notice, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'

const parser = new Parser()

function isEducationNotice(item: any): boolean {
  const link = (item.link || '').toLowerCase()
  const title = (item.title || '').toLowerCase()
  const categories = (item.categories || []).map((c: string) => c.toLowerCase())

  const hasEduKeyword = 
    link.includes('/education/') ||
    link.includes('/chakri/') ||
    categories.includes('education') ||
    categories.includes('শিক্ষা') ||
    categories.includes('পরীক্ষা') ||
    categories.includes('ভর্তি') ||
    categories.includes('শিক্ষাপ্রতিষ্ঠান') ||
    title.includes('শিক্ষা') ||
    title.includes('পরীক্ষা') ||
    title.includes('ভর্তি') ||
    title.includes('এইচএসসি') ||
    title.includes('এসএসসি') ||
    title.includes('পরীক্ষার্থী') ||
    title.includes('শিক্ষার্থী') ||
    title.includes('বৃত্তি') ||
    title.includes('বিশ্ববিদ্যালয়')

  const isExcluded = 
    link.includes('/sports/') || 
    link.includes('/lifestyle/') || 
    link.includes('/politics/') || 
    link.includes('/entertainment/') || 
    link.includes('/world/') ||
    categories.includes('রাজনীতি') ||
    categories.includes('ফুটবল') ||
    categories.includes('খেলা') ||
    categories.includes('বিনোদন')

  return hasEduKeyword && !isExcluded
}

function getNoticeCategory(title: string, content: string): 'academic' | 'exam' | 'admission' | 'general' {
  const text = `${title} ${content}`.toLowerCase()
  if (text.includes('ভর্তি') || text.includes('admission') || text.includes('ভর্তি পরীক্ষা')) {
    return 'admission'
  }
  if (text.includes('পরীক্ষা') || text.includes('exam') || text.includes('রুটিন') || text.includes('ফলাফল') || text.includes('result') || text.includes('hsc') || text.includes('ssc')) {
    return 'exam'
  }
  if (text.includes('ক্লাস') || text.includes('সিলেবাস') || text.includes('পাঠ্যপুস্তক') || text.includes('শিক্ষাবর্ষ') || text.includes('ছুটি') || text.includes('শিক্ষাপ্রতিষ্ঠান')) {
    return 'academic'
  }
  return 'general'
}

export async function GET() {
  try {
    await connectDB()

    console.log('📡 Fetching RSS feed from Prothom Alo...')
    const feed = await parser.parseURL('https://www.prothomalo.com/stories.rss')
    console.log(`✅ Fetched ${feed.items.length} items.`)

    let newCount = 0
    const filteredItems = feed.items.filter(isEducationNotice)
    console.log(`Filtered ${filteredItems.length} education-related items.`)

    // Process up to 8 items
    const itemsToProcess = filteredItems.slice(0, 8)

    for (const item of itemsToProcess) {
      if (!item.title) continue

      const title = item.title.trim()
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      if (!baseSlug) {
        baseSlug = 'notice-' + Date.now().toString().slice(-4)
      }
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

      const existing = await Notice.findOne({ title })
      if (existing) continue

      const rawContent = item.content || item.contentSnippet || ''
      const content = `<p>${rawContent.replace(/<[^>]*>/g, ' ').substring(0, 500).trim()}...</p>`

      const category = getNoticeCategory(title, rawContent)
      const isImportant = title.toLowerCase().includes('গুরুত্বপূর্ণ') || 
                          title.includes('ভর্তি') || 
                          title.includes('ফলাফল') || 
                          title.includes('রুটিন') ||
                          title.includes('আহ্বান')

      await Notice.create({
        title,
        slug,
        content,
        category,
        isImportant,
        isActive: true,
        createdAt: new Date(item.pubDate || new Date()),
      })
      newCount++
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${filteredItems.length} education items. Added ${newCount} new notices.`,
    })
  } catch (error: any) {
    console.error('Error fetching RSS notices:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}
