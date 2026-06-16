import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  ArrowRight,
  Lightbulb,
  CheckSquare,
  ListChecks,
  FileText,
  Play,
  GraduationCap,
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001')
    const decodedClassSlug = decodeURIComponent(classSlug)
    const decodedSubjectSlug = decodeURIComponent(subjectSlug)

    const classRes = await fetch(new URL('/api/classes?include=subjects', baseUrl), {
      cache: 'no-store',
    })
    if (!classRes.ok) return null
    const classes = await classRes.json()
    if (!Array.isArray(classes)) return null

    const classData = classes.find((c: { slug: string }) => c.slug === decodedClassSlug)
    if (!classData) return null

    const subject = classData.subjects?.find((s: { slug: string }) => s.slug === decodedSubjectSlug)
    if (!subject) return null

    const chapterRes = await fetch(
      new URL(`/api/chapters?subjectId=${subject.id}`, baseUrl),
      { cache: 'no-store' }
    )
    if (!chapterRes.ok) return null
    const chapters = await chapterRes.json()

    const chaptersWithCounts = await Promise.all(
      (Array.isArray(chapters) ? chapters : []).map(async (chapter: ChapterItem) => {
        try {
          const [explRes, creativeRes, mcqRes] = await Promise.all([
            fetch(new URL(`/api/explanations?chapterId=${chapter.id}`, baseUrl), {
              cache: 'no-store',
            }),
            fetch(new URL(`/api/creative-questions?chapterId=${chapter.id}`, baseUrl), {
              cache: 'no-store',
            }),
            fetch(new URL(`/api/mcq-questions?chapterId=${chapter.id}`, baseUrl), {
              cache: 'no-store',
            }),
          ])
          const explanations = explRes.ok ? await explRes.json() : []
          const creativeQuestions = creativeRes.ok ? await creativeRes.json() : []
          const mcqQuestions = mcqRes.ok ? await mcqRes.json() : []

          return {
            ...chapter,
            _count: {
              explanations: Array.isArray(explanations) ? explanations.length : 0,
              creativeQuestions: Array.isArray(creativeQuestions) ? creativeQuestions.length : 0,
              mcqQuestions: Array.isArray(mcqQuestions) ? mcqQuestions.length : 0,
            },
          }
        } catch {
          return {
            ...chapter,
            _count: { explanations: 0, creativeQuestions: 0, mcqQuestions: 0 },
          }
        }
      })
    )

    return {
      subject: { ...subject, chapters: chaptersWithCounts },
      classData: { id: classData.id, name: classData.name, slug: classData.slug },
    }
  } catch {
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

      {/* Gradient Header with Subject Info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 sm:p-8`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                {renderSubjectIcon(subject.slug, 'h-6 w-6 text-white')}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {subject.name}
                </h1>
                <p className="text-white/80 text-sm sm:text-base mt-0.5">
                  {subject.chapters?.length || 0} Chapters available
                </p>
              </div>
            </div>

            {/* Content Type Pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer px-3 py-1.5 text-sm font-medium gap-1.5">
                <BookOpen className="h-4 w-4" />
                Main Book
              </Badge>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer px-3 py-1.5 text-sm font-medium gap-1.5">
                <Lightbulb className="h-4 w-4" />
                Creative Q
              </Badge>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer px-3 py-1.5 text-sm font-medium gap-1.5">
                <ListChecks className="h-4 w-4" />
                MCQ
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Cards Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {subject.chapters && subject.chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {subject.chapters.map((chapter, index) => {
              const explanationCount = chapter._count?.explanations || 0
              const creativeCount = chapter._count?.creativeQuestions || 0
              const mcqCount = chapter._count?.mcqQuestions || 0

              return (
                <Link
                  key={chapter.id}
                  href={`/class/${classData.slug}/${subject.slug}/${chapter.slug}`}
                >
                  <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      {/* Chapter Number */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-sm font-bold">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                            {chapter.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                        Explore {chapter.name} — study materials, explanations, and practice questions
                      </p>

                      {/* Content Type Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-0 text-xs px-2 py-0.5 hover:bg-teal-100">
                          <BookOpen className="mr-1 h-3 w-3" />
                          Main Book
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0 text-xs px-2 py-0.5 hover:bg-purple-100">
                          <Lightbulb className="mr-1 h-3 w-3" />
                          Creative
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0 text-xs px-2 py-0.5 hover:bg-orange-100">
                          <ListChecks className="mr-1 h-3 w-3" />
                          MCQ
                        </Badge>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          {explanationCount > 0 && (
                            <span className="flex items-center gap-1" title="Explanations">
                              <FileText className="h-3.5 w-3.5" />
                              Exp
                            </span>
                          )}
                          <span className="flex items-center gap-1" title="PDF available">
                            <FileText className="h-3.5 w-3.5" />
                            PDF
                          </span>
                          <span className="flex items-center gap-1" title="Video available">
                            <Play className="h-3.5 w-3.5" />
                            Video
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs px-2 py-0.5 hover:bg-green-100">
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
