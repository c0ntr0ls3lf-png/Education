import { notFound } from 'next/navigation'
import { BookOpen, Lightbulb, CheckSquare, ListChecks, FileQuestion } from 'lucide-react'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { AdBanner } from '@/components/shared/AdBanner'
import { Badge } from '@/components/ui/badge'
import ChapterContentClient from './ChapterContentClient'
import ChapterNotesWidget from '@/components/content/ChapterNotesWidget'

/** Safely extract readable text from description (handles JSON Q&A entries + HTML) */
function getDescriptionSummary(desc: string | null | undefined, fallback: string): string {
  if (!desc || !desc.trim()) return fallback
  // Check if it's JSON (Main Book Q&A entries)
  try {
    const parsed = JSON.parse(desc)
    // Handle array format: [{question: "...", ...}]
    if (Array.isArray(parsed)) {
      const firstQ = parsed[0]?.question || ''
      const text = firstQ.replace(/<[^>]*>/g, '').trim()
      if (text) return `${parsed.length} question${parsed.length > 1 ? 's' : ''} — ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`
      return `${parsed.length} question${parsed.length > 1 ? 's' : ''} in this chapter`
    }
    // Handle object format: {questions: [...], metaTitle: "...", ...}
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        const firstQ = parsed.questions[0]?.question || ''
        const text = firstQ.replace(/<[^>]*>/g, '').trim()
        if (text) return `${parsed.questions.length} question${parsed.questions.length > 1 ? 's' : ''} — ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`
        return `${parsed.questions.length} question${parsed.questions.length > 1 ? 's' : ''} in this chapter`
      }
      // Handle corrupted format: {"0": {...}, "1": {...}, chapterType: "main_book", ...}
      const numericEntries = Object.entries(parsed)
        .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object')
      if (numericEntries.length > 0) {
        const firstQ = (numericEntries[0][1] as any)?.question || ''
        const text = firstQ.replace(/<[^>]*>/g, '').trim()
        if (text) return `${numericEntries.length} question${numericEntries.length > 1 ? 's' : ''} — ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`
        return `${numericEntries.length} question${numericEntries.length > 1 ? 's' : ''} in this chapter`
      }
    }
  } catch { /* not JSON, treat as plain/HTML */ }
  // Strip HTML tags for plain text
  const text = desc.replace(/<[^>]*>/g, '').trim()
  return text.slice(0, 200) || fallback
}

/** Parse Main Book entries from chapter.description (handles array + object + corrupted formats) */
function parseMainBookEntries(desc: string | null | undefined): { question: string; videoUrl: string; solution: string }[] {
  if (!desc || !desc.trim()) return []
  try {
    const parsed = JSON.parse(desc)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions
      }
      // Handle corrupted format: {"0": {...}, "1": {...}, chapterType: "main_book", ...}
      const numericEntries = Object.entries(parsed)
        .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object')
        .map(([_, val]) => val) as { question: string; videoUrl: string; solution: string }[]
      if (numericEntries.length > 0) return numericEntries
    }
  } catch { /* not JSON */ }
  return []
}

// ─── Types ──────────────────────────────────────────────
interface Explanation {
  id: string
  question: string
  solution?: string | null
  videoUrl?: string | null
  difficulty: string
  order: number
}

interface CreativeQuestion {
  id: string
  label: string
  question: string
  answer?: string | null
  marks: number
  difficulty: string
  explanation?: string | null
  subQuestionA?: string | null
  subQuestionB?: string | null
  subQuestionC?: string | null
  order: number
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface McqQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string | null
  marks: number
  difficulty: string
  order: number
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface ChapterData {
  id: string
  name: string
  slug: string
  subjectId: string
  description?: string | null
  sidebarContent?: string | null
  explanations: Explanation[]
  creativeQuestions: CreativeQuestion[]
  mcqQuestions: McqQuestion[]
  totalCqCount?: number
  totalMcqCount?: number
  subject: {
    id: string
    name: string
    slug: string
    class: { id: string; name: string; slug: string }
  }
}

// ─── Helpers ────────────────────────────────────────────
async function fetchChapterData(
  classSlug: string,
  subjectSlug: string,
  chapterSlug: string,
  board?: string,
  year?: string
): Promise<{ chapter: ChapterData; classData: { id: string; name: string; slug: string }; subjectData: { id: string; name: string; slug: string } } | null> {
  try {
    const decodedClassSlug = decodeURIComponent(classSlug)
    const decodedSubjectSlug = decodeURIComponent(subjectSlug)
    const decodedChapterSlug = decodeURIComponent(chapterSlug)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001')

    // Find class by slug
    const classRes = await fetch(new URL('/api/classes?include=subjects', baseUrl), {
      next: { revalidate: 0 },
    })
    if (!classRes.ok) return null
    const classes = await classRes.json()
    if (!Array.isArray(classes)) return null

    const classData = classes.find((c: { slug: string }) => c.slug === decodedClassSlug)
    if (!classData) return null

    // Find subject by slug
    const subject = classData.subjects?.find((s: { slug: string }) => s.slug === decodedSubjectSlug)
    if (!subject) return null

    // Fetch chapters for this subject and find by slug
    const chaptersRes = await fetch(
      new URL(`/api/chapters?subjectId=${subject.id}`, baseUrl),
      { next: { revalidate: 0 } }
    )
    if (!chaptersRes.ok) return null
    const chapters = await chaptersRes.json()
    if (!Array.isArray(chapters)) return null

    const chapter = chapters.find((ch: { slug: string }) => ch.slug === decodedChapterSlug)
    if (!chapter) return null

    // Fetch chapter content
    const contentUrl = new URL(`/api/chapters/${chapter.id}?include=content`, baseUrl)
    if (board) contentUrl.searchParams.set('board', board)
    if (year) contentUrl.searchParams.set('year', year)

    const contentRes = await fetch(
      contentUrl,
      { next: { revalidate: 0 } }
    )
    if (!contentRes.ok) return null
    const chapterWithContent = await contentRes.json()

    return {
      chapter: {
        ...chapterWithContent,
        subject: {
          id: subject.id,
          name: subject.name,
          slug: subject.slug,
          class: { id: classData.id, name: classData.name, slug: classData.slug },
        },
      },
      classData: { id: classData.id, name: classData.name, slug: classData.slug },
      subjectData: { id: subject.id, name: subject.name, slug: subject.slug },
    }
  } catch {
    return null
  }
}

// ─── Metadata ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subjectSlug: string; chapterSlug: string }>
}) {
  const { slug, subjectSlug, chapterSlug } = await params
  const data = await fetchChapterData(slug, subjectSlug, chapterSlug)
  if (!data) {
    return { title: 'Chapter Not Found | EduLearn' }
  }
  return {
    title: `${data.chapter.name} - ${data.subjectData.name} | EduLearn`,
    description: getDescriptionSummary(data.chapter.description, `Study ${data.chapter.name} with explanations, MCQ questions, and creative questions.`),
  }
}

// ─── Page ───────────────────────────────────────────────
export default async function ChapterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; subjectSlug: string; chapterSlug: string }>
  searchParams: Promise<{ board?: string; year?: string }>
}) {
  const { slug, subjectSlug, chapterSlug } = await params
  const { board, year } = await searchParams
  const data = await fetchChapterData(slug, subjectSlug, chapterSlug, board, year)

  if (!data) {
    notFound()
  }

  const { chapter, classData, subjectData } = data

  // Parse Main Book entries from chapter.description (handles array + object formats)
  const mainBookEntries = parseMainBookEntries(chapter.description)
  
  // Merge Main Book entries into explanations array
  const allExplanations = [
    ...(chapter.explanations || []),
    ...mainBookEntries.map((entry, idx) => ({
      id: `mainbook-${idx}`,
      question: entry.question || '',
      solution: entry.solution || null,
      videoUrl: entry.videoUrl || null,
      difficulty: 'medium',
      order: idx,
    })),
  ]

  const explanationCount = allExplanations.length
  const creativeCount = chapter.creativeQuestions?.length || 0
  const mcqCount = chapter.mcqQuestions?.length || 0
  const totalQuestions = explanationCount + creativeCount + mcqCount

  return (
    <main className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: classData.name, href: `/class/${classData.slug}` },
            { label: subjectData.name, href: `/class/${classData.slug}/${subjectData.slug}` },
            { label: chapter.name },
          ]}
        />
      </div>

      {/* Chapter Header - Compact */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  {chapter.name}
                </h1>
                <span className="text-white/60 hidden sm:inline">|</span>
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <FileQuestion className="h-3.5 w-3.5" />
                  {totalQuestions} Total
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-xs flex-wrap">
                {explanationCount > 0 && (
                  <Badge className="bg-white/15 text-white border-0 text-[10px] h-5 px-1.5">
                    <BookOpen className="mr-0.5 h-2.5 w-2.5" />
                    {explanationCount} Main Book
                  </Badge>
                )}
                {mcqCount > 0 && (
                  <Badge className="bg-white/15 text-white border-0 text-[10px] h-5 px-1.5">
                    <CheckSquare className="mr-0.5 h-2.5 w-2.5" />
                    {mcqCount} MCQ
                  </Badge>
                )}
                {creativeCount > 0 && (
                  <Badge className="bg-white/15 text-white border-0 text-[10px] h-5 px-1.5">
                    <Lightbulb className="mr-0.5 h-2.5 w-2.5" />
                    {creativeCount} Creative
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area - Compact */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex-1 min-w-0">
          <ChapterContentClient
            explanations={allExplanations}
            creativeQuestions={chapter.creativeQuestions || []}
            mcqQuestions={chapter.mcqQuestions || []}
            totalCqCount={chapter.totalCqCount ?? creativeCount}
            totalMcqCount={chapter.totalMcqCount ?? mcqCount}
          />

          {/* Ad between content */}
          <div className="mt-6">
            <AdBanner location="content" />
          </div>
        </div>
      </div>

      {/* Chapter Notes — fixed toggle tab + slide sidebar (desktop) / bottom sheet (mobile) */}
      <ChapterNotesWidget content={chapter.sidebarContent} />
    </main>
  )
}
