import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ClipboardCheck,
  Zap,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { connectDB, Class, Subject, BlogPost as BlogPostModel, Notice as NoticeModel, toDoc } from '@/lib/db'
import HomeClient from '@/components/home/HomeClient'
import BlogNoticeSection from '@/components/home/BlogNoticeSection'

// Enable ISR (revalidate every 30 minutes)
export const revalidate = 1800

// ─── Data Types ──────────────────────────────────────────────
interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string
  icon?: string
  color?: string
  categoryId?: string | null
  subcategoryId?: string | null
  subjects: Array<{ id: string; name: string }>
}

interface BlogPostItem {
  id: string
  title: string
  slug: string
  content: string
  coverImage?: string | null
  category?: string | null
  createdAt: string
}

interface NoticeItem {
  id: string
  title: string
  content: string
  category: string
  isImportant: boolean
  createdAt: string
}

// ─── Auto Sync Notices (Runs in background, throttled to once per hour) ───
async function syncNoticesIfNeeded() {
  try {
    const latestNotice = await NoticeModel.findOne().sort({ createdAt: -1 }).select('createdAt').lean()
    const oneHour = 60 * 60 * 1000

    if (!latestNotice || (Date.now() - new Date(latestNotice.createdAt).getTime() > oneHour)) {
      console.log('🔄 Triggering automatic Bangladesh education notice sync...')
      const Parser = require('rss-parser')
      const parser = new Parser()
      const feed = await parser.parseURL('https://www.prothomalo.com/stories.rss')

      const isEducationNotice = (item: any) => {
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

      const filteredItems = feed.items.filter(isEducationNotice)
      const itemsToProcess = filteredItems.slice(0, 8)

      for (const item of itemsToProcess) {
        if (!item.title) continue
        const existing = await NoticeModel.findOne({ title: item.title.trim() })
        if (existing) continue

        const title = item.title.trim()
        const baseSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9\u0980-\u09ff]+/g, '-')
          .replace(/(^-|-$)/g, '')
        const slug = `${baseSlug || 'notice'}-${Date.now().toString().slice(-4)}`
        const rawContent = item.content || item.contentSnippet || ''
        const content = `<p>${rawContent.replace(/<[^>]*>/g, ' ').substring(0, 500).trim()}...</p>`

        // Category Classification
        const text = `${title} ${rawContent}`.toLowerCase()
        let category: 'academic' | 'exam' | 'admission' | 'general' = 'general'
        if (text.includes('ভর্তি') || text.includes('admission') || text.includes('ভর্তি পরীক্ষা')) {
          category = 'admission'
        } else if (text.includes('পরীক্ষা') || text.includes('exam') || text.includes('রুটিন') || text.includes('fresult') || text.includes('hsc') || text.includes('ssc')) {
          category = 'exam'
        } else if (text.includes('ক্লাস') || text.includes('সিলেবাস') || text.includes('পাঠ্যপুস্তক') || text.includes('শিক্ষাবর্ষ') || text.includes('ছুটি') || text.includes('শিক্ষাপ্রতিষ্ঠান')) {
          category = 'academic'
        }

        const isImportant = title.includes('ভর্তি') || title.includes('ফলাফল') || title.includes('রুটিন') || title.includes('আহ্বান')

        await NoticeModel.create({
          title,
          slug,
          content,
          category,
          isImportant,
          isActive: true,
          createdAt: new Date(item.pubDate || new Date()),
        })
      }
      console.log('✅ Automatic notice sync completed successfully.')
    }
  } catch (err: any) {
    console.error('Error during auto notice sync:', err.message)
  }
}

// ─── Server Data Fetching (direct DB query — no internal HTTP) ─
async function fetchData() {
  try {
    await connectDB()

    const classes = await Class.find({ isActive: true }).sort({ number: 1 }).lean()
    const subjects = await Subject.find({ isActive: true }).sort({ order: 1 }).lean()
    const blogPosts = await BlogPostModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean()
    const notices = await NoticeModel.find({ isActive: true }).sort({ isImportant: -1, createdAt: -1 }).limit(10).lean()

    // Group subjects by classId
    const subjectsByClass = new Map<string, typeof subjects>()
    for (const s of subjects) {
      const key = String(s.classId)
      if (!subjectsByClass.has(key)) subjectsByClass.set(key, [])
      subjectsByClass.get(key)!.push(s)
    }

    const result = classes.map(cls => ({
      ...cls,
      subjects: subjectsByClass.get(String(cls._id)) || [],
    }))

    return {
      classes: toDoc<ClassItem[]>(result),
      blogPosts: toDoc<BlogPostItem[]>(blogPosts),
      notices: toDoc<NoticeItem[]>(notices),
    }
  } catch (err) {
    console.error('fetchData error:', err)
    return { classes: [], blogPosts: [], notices: [] }
  }
}

// ─── Page Component ──────────────────────────────────────────
export default async function HomePage() {
  const data = await fetchData()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:via-gray-950 dark:to-gray-950">
        {/* Subtle background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Learn Smarter with{' '}
                <span className="text-emerald-600 dark:text-emerald-400">EduLMS</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                A comprehensive Learning Management System for Classes 1-12 with advanced math editor, talk support, interactive exams, and progress tracking
              </p>

              {/* Feature List */}
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Zap className="h-4 w-4" />
                  </span>
                  Live Content
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  Class Subjects &amp; Courses
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  Practice &amp; Exams &amp; Progress
                </li>
              </ul>
            </div>

            {/* Right Column - Math Card */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Decorative animated floating shapes with letters */}
                <div
                  className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500 rounded-lg opacity-20 animate-float-rotate pointer-events-none flex items-center justify-center"
                  style={{ '--r': '12deg', animationDelay: '0s' } as React.CSSProperties}
                >
                  <span className="text-white font-bold text-2xl">a</span>
                </div>
                <div
                  className="absolute -bottom-3 -left-3 w-16 h-16 bg-emerald-500 rounded-lg opacity-20 animate-float-rotate pointer-events-none flex items-center justify-center"
                  style={{ '--r': '-15deg', animationDelay: '1.5s' } as React.CSSProperties}
                >
                  <span className="text-white font-bold text-2xl">b</span>
                </div>
                <div
                  className="absolute -bottom-3 -right-3 w-16 h-16 bg-emerald-500 rounded-lg opacity-20 animate-float-rotate pointer-events-none flex items-center justify-center"
                  style={{ '--r': '8deg', animationDelay: '3s' } as React.CSSProperties}
                >
                  <span className="text-white font-bold text-2xl">c</span>
                </div>

                <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 shadow-xl">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Live Math Rendering</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-inner border border-gray-100 dark:border-gray-800">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Quadratic Formula</p>
                          <div className="text-2xl sm:text-3xl text-gray-900 dark:text-white font-serif">
                            x = (-b &plusmn; &radic;(b&sup2; - 4ac)) / 2a
                          </div>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Euler&apos;s Identity</p>
                          <div className="text-2xl sm:text-3xl text-gray-900 dark:text-white font-serif text-center">
                            e<sup>i&pi;</sup> + 1 = 0
                          </div>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Integration</p>
                          <div className="text-xl sm:text-2xl text-gray-900 dark:text-white font-serif text-center">
                            &int;<sub>a</sub><sup>b</sup> f(x) dx = F(b) - F(a)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Real-time LaTeX &amp; KaTeX rendering</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BROWSE CLASSES SECTION ═══════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 px-3 py-1 text-sm font-medium">
                Free Access - No Sign Up Required
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Browse All Classes</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Select your class to explore subjects. All educational content is completely free
            </p>
          </div>

          <HomeClient classes={data.classes} />
        </div>
      </section>

      {/* ═══════════ BLOG + NOTICE BOARD SECTION ═══════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Latest articles, study tips, and important notices — all in one place
            </p>
          </div>

          <BlogNoticeSection
            posts={data.blogPosts ?? []}
            notices={data.notices ?? []}
          />
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} EduLMS. Your class to start learning - It&apos;s completely free!
          </p>
        </div>
      </footer>
    </div>
  )
}
