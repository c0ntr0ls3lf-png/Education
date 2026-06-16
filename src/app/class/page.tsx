import Link from 'next/link'
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AdBanner } from '@/components/shared/AdBanner'
import ClassSearchClient from './ClassSearchClient'

// ─── Types ──────────────────────────────────────────────
interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string | null
  icon?: string | null
  color?: string | null
  subjects: Array<{ id: string; name: string }>
}

// ─── Helper ─────────────────────────────────────────────
async function fetchClasses(): Promise<ClassItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001')
    const res = await fetch(new URL('/api/classes?include=subjects', baseUrl), {
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ─── Metadata ───────────────────────────────────────────
export const metadata = {
  title: 'Choose Your Class | EduLearn',
  description: 'Browse all classes from Class 1 to Class 12. Find subjects, chapters, and study materials for your class.',
}

// ─── Page ───────────────────────────────────────────────
export default async function ClassListingPage() {
  const classes = await fetchClasses()

  const totalSubjects = classes.reduce((acc, c) => acc + (c.subjects?.length || 0), 0)

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-teal-200 blur-2xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0">
            <GraduationCap className="mr-1 h-3.5 w-3.5" />
            Class 1 to 12
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your Class
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            Select your class to explore subjects, chapters, and study materials. Practice with MCQ questions, creative questions, and detailed explanations.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {classes.length} Classes
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {totalSubjects} Subjects
            </span>
          </div>
        </div>
      </section>

      {/* Search + Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Client Search with Grid */}
        <ClassSearchClient classes={classes} />

        {/* Ad Banner between sections */}
        <div className="my-8">
          <AdBanner location="content" />
        </div>
      </section>

      {/* Bottom Ad */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <AdBanner location="footer" />
      </section>
    </main>
  )
}
