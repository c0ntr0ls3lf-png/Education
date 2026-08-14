import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  ArrowRight,
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
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { connectDB, waitForSeed, Class, Subject, Chapter, Explanation, CreativeQuestion, McqQuestion, toDoc } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 60

// ─── Types ──────────────────────────────────────────────
interface ChapterItem {
  id: string
  name: string
  slug: string
  subjectId: string
  description?: string | null
  icon?: string | null
  color?: string | null
  order: number
  _count?: {
    explanations: number
    creativeQuestions: number
    mcqQuestions: number
  }
}

interface SubjectData {
  id: string
  name: string
  slug: string
  classId: string
  description?: string | null
  icon?: string | null
  color?: string | null
  chapters: ChapterItem[]
  class: { id: string; name: string; slug: string }
}

// ─── Subject Gradients ─────────────────────────────────
const subjectGradientMap: Record<string, string> = {
  physics: 'from-indigo-500 to-purple-700',
  math: 'from-emerald-500 to-teal-700',
  mathematics: 'from-emerald-500 to-teal-700',
  chemistry: 'from-orange-500 to-red-600',
  geography: 'from-green-500 to-emerald-700',
  english: 'from-rose-500 to-pink-700',
  biology: 'from-teal-500 to-cyan-700',
  ict: 'from-slate-500 to-gray-700',
  computer: 'from-slate-500 to-gray-700',
  science: 'from-lime-500 to-green-700',
  bangla: 'from-amber-500 to-orange-700',
  bengali: 'from-amber-500 to-orange-700',
  history: 'from-yellow-500 to-amber-700',
  social: 'from-violet-500 to-purple-700',
  hindi: 'from-amber-500 to-orange-700',
  evs: 'from-cyan-500 to-sky-700',
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
  return 'from-emerald-500 to-teal-700'
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

// ─── Helpers ────────────────────────────────────────────
async function fetchSubjectWithChapters(
  classSlug: string,
  subjectSlug: string
): Promise<{ subject: SubjectData; classData: { id: string; name: string; slug: string } } | null> {
  try {
    await connectDB()

    const decodedClassSlug = decodeURIComponent(classSlug)
    const decodedSubjectSlug = decodeURIComponent(subjectSlug)

    // Find class by slug
    const cls = await Class.findOne({ slug: decodedClassSlug, isActive: true })
      .select('_id name slug number description')
      .lean()
    if (!cls) return null

    // Find subject by slug
    const subject = await Subject.findOne({ classId: String(cls._id), slug: decodedSubjectSlug, isActive: true })
      .select('_id name slug classId description icon color')
      .lean()
    if (!subject) return null

    // Fetch chapters for this subject (lean + only needed fields)
    const chapters = await Chapter.find({ subjectId: String(subject._id), isActive: true })
      .sort({ order: 1 })
      .select('_id name slug subjectId description icon color order')
      .lean()

    // Use countDocuments — much faster than fetching all docs just for counting
    const chapterIds = chapters.map(ch => String(ch._id))
    const [explCounts, creativeCounts, mcqCounts] = await Promise.all([
      Explanation.aggregate([
        { $match: { chapterId: { $in: chapterIds } } },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
      ]),
      CreativeQuestion.aggregate([
        { $match: { chapterId: { $in: chapterIds } } },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
      ]),
      McqQuestion.aggregate([
        { $match: { chapterId: { $in: chapterIds } } },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
      ]),
    ])

    const explMap = new Map(explCounts.map((r: any) => [r._id, r.count]))
    const cqMap   = new Map(creativeCounts.map((r: any) => [r._id, r.count]))
    const mcqMap  = new Map(mcqCounts.map((r: any) => [r._id, r.count]))

    const chaptersWithCounts = chapters.map(chapter => {
      const key = String(chapter._id)
      return {
        ...chapter,
        _count: {
          explanations: (explMap.get(key) as number) || 0,
          creativeQuestions: (cqMap.get(key) as number) || 0,
          mcqQuestions: (mcqMap.get(key) as number) || 0,
        }
      }
    })

    const classData = {
      id: String(cls._id),
      name: cls.name,
      slug: cls.slug
    }

    return toDoc<{ subject: SubjectData; classData: { id: string; name: string; slug: string } }>({
      subject: {
        ...subject,
        chapters: chaptersWithCounts,
        class: classData
      },
      classData
    })
  } catch (err) {
    console.error('fetchSubjectWithChapters direct DB error:', err)
    return null
  }
}

// ─── Metadata ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subjectSlug: string }>
}) {
  const { slug, subjectSlug } = await params
  const data = await fetchSubjectWithChapters(slug, subjectSlug)
  if (!data) {
    return { title: 'Subject Not Found | EduLMS' }
  }
  return {
    title: `${data.subject.name} - ${data.classData.name} | EduLMS`,
    description: data.subject.description || `Explore chapters of ${data.subject.name} for ${data.classData.name}`,
  }
}

// ─── Page ───────────────────────────────────────────────
export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; subjectSlug: string }>
}) {
  const { slug, subjectSlug } = await params
  const data = await fetchSubjectWithChapters(slug, subjectSlug)

  if (!data) {
    notFound()
  }

  const { subject, classData } = data
  const gradient = getSubjectGradient(subject.slug)

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: classData.name, href: `/class/${classData.slug}` },
            { label: subject.name },
          ]}
        />
      </div>

      {/* Simple Header — matches Class > Subject page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${gradient} text-white flex items-center justify-center`}>
            {renderSubjectIcon(subject.slug, 'h-5 w-5 text-white')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {subject.name} — Chapters
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
          Select a chapter to explore study materials and practice questions
        </p>
      </div>

      {/* Chapter Cards Grid — matches Class > Subject card layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {subject.chapters && subject.chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {subject.chapters.map((chapter) => {
              const explanationCount = chapter._count?.explanations || 0
              const creativeCount = chapter._count?.creativeQuestions || 0
              const mcqCount = chapter._count?.mcqQuestions || 0
              const totalContent = explanationCount + creativeCount + mcqCount

              return (
                <Link
                  key={chapter.id}
                  href={`/class/${classData.slug}/${subject.slug}/${chapter.slug}`}
                >
                  <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 h-full">
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg leading-tight">
                            {chapter.name}
                          </h3>
                          <p className="text-white/80 text-sm mt-0.5">
                            {totalContent > 0 ? `${totalContent} Questions` : 'Study Materials'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* White Content Area */}
                    <div className="px-5 py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">
                        Explore {chapter.name} — explanations, MCQ, and creative questions
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <BookOpen className="h-3.5 w-3.5" />
                          {explanationCount > 0 ? `${explanationCount} Main Book` : 'Main Book'}
                        </span>
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 text-xs px-2 py-0.5 hover:bg-orange-100">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No chapters available</h3>
            <p className="text-sm text-gray-400 mt-1">Chapters will be added soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}
