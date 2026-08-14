import { notFound } from 'next/navigation'
import {
  BookOpen,
  Atom,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  Microscope,
  Monitor,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { AdBanner } from '@/components/shared/AdBanner'
import ChapterContentClient from './ChapterContentClient'
import ChapterNotesWidget from '@/components/content/ChapterNotesWidget'
import { connectDB, waitForSeed, Class, Subject, Chapter, Explanation, CreativeQuestion, McqQuestion, toDoc } from '@/lib/db'

const subjectGradientMap: Record<string, string> = {
  physics: 'from-indigo-500 to-purple-600',
  math: 'from-emerald-500 to-teal-600',
  mathematics: 'from-emerald-500 to-teal-600',
  chemistry: 'from-orange-500 to-red-500',
  geography: 'from-green-500 to-emerald-600',
  english: 'from-rose-500 to-pink-600',
  biology: 'from-teal-500 to-cyan-600',
  ict: 'from-slate-500 to-gray-600',
  computer: 'from-slate-500 to-gray-600',
  science: 'from-lime-500 to-green-600',
  bangla: 'from-amber-500 to-orange-600',
  bengali: 'from-amber-500 to-orange-600',
  history: 'from-yellow-500 to-amber-600',
  social: 'from-violet-500 to-purple-600',
  hindi: 'from-amber-500 to-orange-600',
  evs: 'from-cyan-500 to-sky-600',
}

const subjectIconMap: Record<string, LucideIcon> = {
  physics: Atom,
  math: Calculator,
  mathematics: Calculator,
  chemistry: FlaskConical,
  geography: Globe,
  english: Languages,
  biology: Microscope,
  ict: Monitor,
  computer: Monitor,
  science: Microscope,
  botany: Leaf,
  zoology: Leaf,
}

function getSubjectGradient(slug: string): string {
  const key = slug.toLowerCase()
  for (const [pattern, gradient] of Object.entries(subjectGradientMap)) {
    if (key.includes(pattern)) return gradient
  }
  return 'from-emerald-500 to-teal-600'
}

function getSubjectIcon(slug: string): LucideIcon {
  const key = slug.toLowerCase()
  for (const [pattern, icon] of Object.entries(subjectIconMap)) {
    if (key.includes(pattern)) return icon
  }
  return BookOpen
}

function renderSubjectIcon(slug: string, className: string) {
  const IconComponent = getSubjectIcon(slug)
  return <IconComponent className={className} />
}

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
    let rawEntries: any[] = []
    if (Array.isArray(parsed)) {
      rawEntries = parsed
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        rawEntries = parsed.questions
      } else {
        // Handle corrupted format: {"0": {...}, "1": {...}, chapterType: "main_book", ...}
        rawEntries = Object.entries(parsed)
          .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object')
          .map(([_, val]) => val)
      }
    }

    const flatEntries: { question: string; videoUrl: string; solution: string }[] = []
    rawEntries.forEach((entry) => {
      if (entry.type === 'group' && Array.isArray(entry.subQuestions)) {
        entry.subQuestions.forEach((sub: any) => {
          const labelPrefix = sub.label ? `<strong>${sub.label})</strong> ` : ''
          const parentHeading = entry.question 
            ? `<div class="text-xs text-muted-foreground/80 font-medium mb-1 border-b border-muted pb-1">${entry.question}</div>` 
            : ''
          const combinedQuestion = `${parentHeading}<div>${labelPrefix}${sub.question}</div>`
          
          flatEntries.push({
            question: combinedQuestion,
            solution: sub.solution || '',
            videoUrl: sub.videoUrl || '',
          })
        })
      } else {
        flatEntries.push({
          question: entry.question || '',
          solution: entry.solution || '',
          videoUrl: entry.videoUrl || '',
        })
      }
    })
    return flatEntries
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
  mainBookPdfUrl?: string | null
  mcqPdfUrl?: string | null
  cqPdfUrl?: string | null
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
    await connectDB()

    const decodedClassSlug = decodeURIComponent(classSlug)
    const decodedSubjectSlug = decodeURIComponent(subjectSlug)
    const decodedChapterSlug = decodeURIComponent(chapterSlug)

    // Find class by slug (only needed fields)
    const cls = await Class.findOne({ slug: decodedClassSlug, isActive: true })
      .select('_id name slug')
      .lean()
    if (!cls) return null

    // Find subject by slug (only needed fields)
    const subject = await Subject.findOne({ classId: String(cls._id), slug: decodedSubjectSlug, isActive: true })
      .select('_id name slug')
      .lean()
    if (!subject) return null

    // Find chapter by slug (only needed fields)
    const chapter = await Chapter.findOne({ subjectId: String(subject._id), slug: decodedChapterSlug, isActive: true })
      .select('_id name slug subjectId description sidebarContent mainBookPdfUrl mcqPdfUrl cqPdfUrl')
      .lean()
    if (!chapter) return null

    const id = String(chapter._id)
    const currentYear = new Date().getFullYear();

    const matchCq: Record<string, any> = { chapterId: id };
    if (board && board !== 'all') {
      matchCq.board_name = { $regex: new RegExp('^' + board.replace(/-/g, ' ') + '$', 'i') };
    }
    if (year && year !== 'all') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        matchCq.exam_year = parsedYear;
      }
    }

    const matchMcq: Record<string, any> = { chapterId: id };
    if (board && board !== 'all') {
      matchMcq.board_name = { $regex: new RegExp('^' + board.replace(/-/g, ' ') + '$', 'i') };
    }
    if (year && year !== 'all') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        matchMcq.exam_year = parsedYear;
      }
    }

    const cqPipeline: Record<string, unknown>[] = [
      { $match: matchCq },
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                { case: { $and: [ { $eq: ['$sourceType', 'board'] }, { $eq: ['$exam_year', currentYear] } ] }, then: 1 },
                { case: { $eq: ['$sourceType', 'board'] }, then: 2 },
                { case: { $eq: ['$sourceType', 'school'] }, then: 3 },
                { case: { $eq: ['$sourceType', 'model_test'] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      { $sort: { sortPriority: 1, exam_year: -1, order: 1, label: 1 } },
      { $project: { sortPriority: 0 } },
    ];
    const mcqPipeline: Record<string, unknown>[] = [
      { $match: matchMcq },
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                { case: { $and: [ { $eq: ['$sourceType', 'board'] }, { $eq: ['$exam_year', currentYear] } ] }, then: 1 },
                { case: { $eq: ['$sourceType', 'board'] }, then: 2 },
                { case: { $eq: ['$sourceType', 'school'] }, then: 3 },
                { case: { $eq: ['$sourceType', 'model_test'] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      { $sort: { sortPriority: 1, exam_year: -1, order: 1 } },
      { $project: { sortPriority: 0 } },
    ];

    const [explanations, cqs, mcqs, totalCqCount, totalMcqCount] = await Promise.all([
      Explanation.find({ chapterId: id }).sort({ order: 1 }).lean(),
      CreativeQuestion.aggregate(cqPipeline as any),
      McqQuestion.aggregate(mcqPipeline as any),
      CreativeQuestion.countDocuments({ chapterId: id }),
      McqQuestion.countDocuments({ chapterId: id })
    ]);

    const classData = {
      id: String(cls._id),
      name: cls.name,
      slug: cls.slug
    }

    const subjectData = {
      id: String(subject._id),
      name: subject.name,
      slug: subject.slug
    }

    const chapterWithContent = {
      ...chapter,
      explanations,
      creativeQuestions: cqs,
      mcqQuestions: mcqs,
      totalCqCount,
      totalMcqCount,
      subject: {
        ...subjectData,
        class: classData
      }
    }

    return toDoc<{ chapter: ChapterData; classData: { id: string; name: string; slug: string }; subjectData: { id: string; name: string; slug: string } }>({
      chapter: chapterWithContent,
      classData,
      subjectData
    })
  } catch (err) {
    console.error('fetchChapterData direct DB error:', err)
    return null
  }
}

// ─── Lightweight fetch just for metadata (no question data) ─────────
async function fetchChapterMeta(
  classSlug: string,
  subjectSlug: string,
  chapterSlug: string,
): Promise<{ chapterName: string; subjectName: string; description?: string | null } | null> {
  try {
    await connectDB()
    const decodedClassSlug = decodeURIComponent(classSlug)
    const decodedSubjectSlug = decodeURIComponent(subjectSlug)
    const decodedChapterSlug = decodeURIComponent(chapterSlug)

    const cls = await Class.findOne({ slug: decodedClassSlug, isActive: true }).select('_id').lean()
    if (!cls) return null
    const subject = await Subject.findOne({ classId: String(cls._id), slug: decodedSubjectSlug, isActive: true }).select('_id name').lean()
    if (!subject) return null
    const chapter = await Chapter.findOne({ subjectId: String(subject._id), slug: decodedChapterSlug, isActive: true }).select('name description').lean()
    if (!chapter) return null
    return { chapterName: (chapter as any).name, subjectName: (subject as any).name, description: (chapter as any).description }
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
  const meta = await fetchChapterMeta(slug, subjectSlug, chapterSlug)
  if (!meta) {
    return { title: 'Chapter Not Found | EduLearn' }
  }
  return {
    title: `${meta.chapterName} - ${meta.subjectName} | EduLearn`,
    description: getDescriptionSummary(meta.description, `Study ${meta.chapterName} with explanations, MCQ questions, and creative questions.`),
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
  const gradient = getSubjectGradient(subjectData.slug)

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
    <main className="min-h-screen bg-white dark:bg-gray-950">
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

      {/* Simple Header — matches Subject → Chapters page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${gradient} text-white flex items-center justify-center`}>
            {renderSubjectIcon(subjectData.slug, 'h-5 w-5 text-white')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {chapter.name}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
          {totalQuestions > 0
            ? `${totalQuestions} questions available — Main Book, MCQ, and Creative`
            : 'Study materials and practice questions for this chapter'}
        </p>
      </div>

      {/* Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
        <div className="flex-1 min-w-0">
          <ChapterContentClient
            explanations={allExplanations}
            creativeQuestions={chapter.creativeQuestions || []}
            mcqQuestions={chapter.mcqQuestions || []}
            totalCqCount={chapter.totalCqCount ?? creativeCount}
            totalMcqCount={chapter.totalMcqCount ?? mcqCount}
            mainBookPdfUrl={chapter.mainBookPdfUrl ?? null}
            mcqPdfUrl={chapter.mcqPdfUrl ?? null}
            cqPdfUrl={chapter.cqPdfUrl ?? null}
            chapterName={chapter.name}
            subjectName={subjectData.name}
            subjectSlug={subjectData.slug}
          />

          {/* Ad between content */}
          <div className="mt-6">
            <AdBanner location="content" />
          </div>
        </div>
      </div>

      {/* Chapter Notes — fixed toggle tab + slide sidebar */}
      <ChapterNotesWidget content={chapter.sidebarContent} />

      {/* AI Math Solver removed */}
    </main>
  )
}
