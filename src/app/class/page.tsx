import { GraduationCap } from 'lucide-react'
import { AdBanner } from '@/components/shared/AdBanner'
import ClassSearchClient from './ClassSearchClient'
import { connectDB, waitForSeed, Class, Subject, toDoc } from '@/lib/db'

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
    await connectDB()

    const classes = await Class.find({ isActive: true })
      .sort({ number: 1 })
      .select('_id name slug number description icon color')
      .lean()
    const subjects = await Subject.find({ isActive: true })
      .sort({ order: 1 })
      .select('_id name classId')
      .lean()

    // Group subjects by classId
    const subjectsByClass = new Map<string, typeof subjects>()
    for (const s of subjects) {
      const key = String(s.classId)
      if (!subjectsByClass.has(key)) subjectsByClass.set(key, [])
      subjectsByClass.get(key)!.push(s)
    }

    const result = classes.map(cls => ({
      ...cls,
      subjects: subjectsByClass.get(String(cls._id)) || []
    }))

    return toDoc<ClassItem[]>(result)
  } catch (err) {
    console.error('fetchClasses direct DB error:', err)
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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Simple Header — matches Class > Subject page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            All Classes
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
          Select your class to explore subjects and study materials
        </p>
      </div>

      {/* Search + Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <ClassSearchClient classes={classes} />

        {/* Ad Banner between sections */}
        <div className="mt-8">
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
