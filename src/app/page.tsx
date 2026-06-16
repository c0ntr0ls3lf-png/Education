import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  FileText,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── Data Types ──────────────────────────────────────────────
interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string
  icon?: string
  color?: string
  subjects: Array<{ id: string; name: string }>
}

// ─── Server Data Fetching ────────────────────────────────────
async function safeJson<T>(response: PromiseSettledResult<Response>): Promise<T | null> {
  if (response.status === 'fulfilled' && response.value.ok) {
    try {
      return (await response.value.json()) as T
    } catch {
      return null
    }
  }
  return null
}

async function fetchData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001')

  const classesRes = await Promise.allSettled([
    fetch(new URL('/api/classes?include=subjects', baseUrl), { next: { revalidate: 0 } }),
  ])

  const classesData = await safeJson<ClassItem[]>(classesRes[0])

  return {
    classes: Array.isArray(classesData) ? classesData : [],
  }
}

// ─── Class Card Colors ───────────────────────────────────────
const classColors = [
  'from-emerald-500 to-emerald-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
  'from-sky-500 to-sky-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-rose-500 to-rose-600',
  'from-pink-500 to-pink-600',
  'from-violet-500 to-violet-600',
  'from-purple-500 to-purple-600',
  'from-indigo-500 to-indigo-600',
  'from-lime-500 to-lime-600',
]

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
                  style={{ '--r': '12deg' as any, animationDelay: '0s' as any }}
                >
                  <span className="text-white font-bold text-2xl">a</span>
                </div>
                <div
                  className="absolute -bottom-3 -left-3 w-16 h-16 bg-emerald-500 rounded-lg opacity-20 animate-float-rotate pointer-events-none flex items-center justify-center"
                  style={{ '--r': '-15deg' as any, animationDelay: '1.5s' as any }}
                >
                  <span className="text-white font-bold text-2xl">b</span>
                </div>
                <div
                  className="absolute -bottom-3 -right-3 w-16 h-16 bg-emerald-500 rounded-lg opacity-20 animate-float-rotate pointer-events-none flex items-center justify-center"
                  style={{ '--r': '8deg' as any, animationDelay: '3s' as any }}
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

          {data.classes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {data.classes.map((cls, index) => (
                <Link key={cls.id} href={`/class/${cls.slug}`}>
                  <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${classColors[index % classColors.length]} p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/10`}>
                    {/* Decorative circle */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

                    <div className="relative">
                      <p className="text-4xl sm:text-5xl font-extrabold text-white mb-1">{cls.number}</p>
                      <p className="text-white/90 font-semibold text-base sm:text-lg">Class {cls.number}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-white/70 text-xs sm:text-sm">{cls.subjects?.length || 0} Subjects</span>
                        <Badge className="bg-white/20 text-white border-0 text-xs hover:bg-white/30">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <GraduationCap className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No classes available yet. Check back soon!</p>
              <Link href="/api/seed">
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Seed Database
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Powerful tools designed to help students learn more effectively
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Comprehensive Content',
                description: 'Detailed explanations, chapter notes, and study materials for all subjects from Class 1 to 12.',
                color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
              },
              {
                icon: ClipboardCheck,
                title: 'Interactive Exams',
                description: 'MCQ exams with per-question timer and Creative exams with auto-save. Instant results and analysis.',
                color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
              },
              {
                icon: Award,
                title: 'Progress Tracking',
                description: 'Track your scores, review answers, see detailed analytics, and earn achievements as you learn.',
                color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
              },
              {
                icon: Clock,
                title: 'Study Anytime',
                description: 'Access all content 24/7. Study at your own pace with no time restrictions or deadlines.',
                color: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
              },
              {
                icon: Users,
                title: 'Free for Everyone',
                description: 'No sign-up required to access content. All educational materials are completely free for all students.',
                color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
              },
              {
                icon: Sparkles,
                title: 'Math Rendering',
                description: 'Beautiful KaTeX-powered math rendering with live preview. Perfect formulas every time.',
                color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
              },
            ].map((feature) => (
              <Card key={feature.title} className="group border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
