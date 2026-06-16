import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Atom,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  Microscope,
  Monitor,
  Music,
  Palette,
  Dumbbell,
  Leaf,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

// ─── Types ──────────────────────────────────────────────
interface SubjectItem {
  id: string
  name: string
  slug: string
  classId: string
  description?: string | null
  icon?: string | null
  color?: string | null
  chapters: Array<{ id: string; name: string }>
}

interface ClassData {
  id: string
  name: string
  slug: string
  number: number
  description?: string | null
  subjects: SubjectItem[]
}

// ─── Icon Mapping ───────────────────────────────────────
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
  music: Music,
  art: Palette,
  pe: Dumbbell,
  science: Microscope,
  botany: Leaf,
  zoology: Leaf,
}

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

// ─── Helpers ────────────────────────────────────────────
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

function getSubjectGradient(slug: string): string {
  const key = slug.toLowerCase()
  for (const [pattern, gradient] of Object.entries(subjectGradientMap)) {
    if (key.includes(pattern)) return gradient
  }
  return 'from-emerald-500 to-teal-600'
}

async function fetchClassBySlug(slug: string): Promise<ClassData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001')
    const res = await fetch(new URL('/api/classes?include=subjects', baseUrl), {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data)) return null
    const classItem = data.find((c: ClassData) => c.slug === slug)
    if (!classItem) return null

    // Fetch subjects with chapters for accurate chapter counts
    if (classItem.id) {
      const subjectsRes = await fetch(
        new URL(`/api/subjects?classId=${classItem.id}&include=chapters`, baseUrl),
        { cache: 'no-store' }
      )
      if (subjectsRes.ok) {
        const subjects = await subjectsRes.json()
        if (Array.isArray(subjects)) {
          classItem.subjects = subjects
        }
      }
    }

    return classItem
  } catch {
    return null
  }
}

// ─── Metadata ───────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const classData = await fetchClassBySlug(slug)
  if (!classData) {
    return { title: 'Class Not Found | EduLMS' }
  }
  return {
    title: `${classData.name} - Subjects | EduLMS`,
    description: classData.description || `Explore all subjects for ${classData.name}. Study chapters, practice MCQs, and more.`,
  }
}

// ─── Page ───────────────────────────────────────────────
export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const classData = await fetchClassBySlug(slug)

  if (!classData) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: classData.name, href: `/class/${classData.slug}` },
          ]}
        />
      </div>

      {/* Simple Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {classData.name} — Subjects
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
          Select a subject to explore its chapters
        </p>
      </div>

      {/* Subject Cards Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {classData.subjects && classData.subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {classData.subjects.map((subject) => {
              const gradient = getSubjectGradient(subject.slug)

              return (
                <Link
                  key={subject.id}
                  href={`/class/${classData.slug}/${subject.slug}`}
                >
                  <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 h-full">
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                          {renderSubjectIcon(subject.slug, 'h-5 w-5 text-white')}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg leading-tight">
                            {subject.name}
                          </h3>
                          <p className="text-white/80 text-sm mt-0.5">
                            {subject.chapters?.length || 0} Chapters
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* White Content Area */}
                    <div className="px-5 py-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">
                        Explore {subject.name} chapters, lessons, and study materials
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <BookOpen className="h-3.5 w-3.5" />
                          {subject.chapters?.length || 0} Chapters
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
            <h3 className="text-lg font-medium text-gray-500">No subjects available</h3>
            <p className="text-sm text-gray-400 mt-1">Subjects will be added soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}
