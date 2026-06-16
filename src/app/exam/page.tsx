'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen,
  Clock,
  Target,
  Users,
  Trophy,
  ArrowRight,
  Zap,
  PenTool,
  GraduationCap,
  Star,
  TrendingUp,
  Play,
} from 'lucide-react'
import { ExamCreator } from '@/components/exam/ExamCreator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Exam {
  id: string
  title: string
  slug: string
  description?: string
  type: string
  sourceType: string
  totalQuestions: number
  duration: number
  difficulty: string
  marksPerQuestion: number
  timerPerQuestion?: number
  attemptCount: number
  avgScore: number
  createdAt: string
}

interface Attempt {
  id: string
  examId: string
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  completedAt: string
  exam: {
    id: string
    title: string
    type: string
    difficulty: string
    totalQuestions: number
  }
}

export default function ExamPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, attemptsRes] = await Promise.all([
          fetch('/api/exams'),
          fetch('/api/exams/attempts'),
        ])
        const examsData = await examsRes.json()
        const attemptsData = await attemptsRes.json()
        setExams(examsData.exams || [])
        setAttempts(attemptsData.attempts || [])
      } catch (error) {
        // fetch error handled silently
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleGenerateExam = async (config: {
    sourceType: string
    sourceIds: string[]
    questionCount: number
    examType: string
    difficulty: string
  }) => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: config.sourceType,
          sourceIds: config.sourceIds,
          questionCount: config.questionCount,
          examType: config.examType,
          difficulty: config.difficulty,
        }),
      })
      const data = await res.json()
      if (data.exam) {
        router.push(`/exam/${data.exam.id}`)
      }
    } catch (error) {
      // generation error handled silently
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const remainingMins = mins % 60
      return `${hrs}h ${remainingMins}m`
    }
    return `${mins} min`
  }

  const featuredExams = exams.slice(0, 4)
  const mcqExams = exams.filter(e => e.type === 'mcq')
  const creativeExams = exams.filter(e => e.type === 'creative')

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTItNmgydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Practice Makes Perfect
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Take an Exam
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
              Test your knowledge with MCQ and Creative exams. Track your progress and improve your scores.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#create">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 shadow-lg">
                  <Zap className="w-5 h-5" />
                  Create Custom Exam
                </Button>
              </Link>
              <Link href="#exams">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <Play className="w-5 h-5" />
                  Browse Exams
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
          >
            {[
              { icon: BookOpen, label: 'Total Exams', value: exams.length.toString() },
              { icon: Target, label: 'MCQ Exams', value: mcqExams.length.toString() },
              { icon: PenTool, label: 'Creative Exams', value: creativeExams.length.toString() },
              { icon: Trophy, label: 'Attempts', value: attempts.length.toString() },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-1 text-emerald-200" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-emerald-200">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Exam Types Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold">Exam Types</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-600 transition-colors">
                        MCQ Exam
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Multiple choice questions with timer. Test your speed and accuracy with auto-graded results.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Auto-graded</Badge>
                        <Badge variant="outline" className="text-xs">Timed</Badge>
                        <Badge variant="outline" className="text-xs">Instant Results</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
                      <PenTool className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-teal-600 transition-colors">
                        Creative Exam
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Written/descriptive questions where you write detailed answers. Practice your writing skills.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Written</Badge>
                        <Badge variant="outline" className="text-xs">Auto-save</Badge>
                        <Badge variant="outline" className="text-xs">Model Answers</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Create Custom Exam */}
        <section id="create">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold">Create Custom Exam</h2>
          </div>
          <Card className="border-2">
            <CardContent className="p-6">
              <ExamCreator onGenerate={handleGenerateExam} isGenerating={isGenerating} />
            </CardContent>
          </Card>
        </section>

        {/* Available Exams */}
        <section id="exams">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold">Available Exams</h2>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Exams</TabsTrigger>
              <TabsTrigger value="mcq">MCQ</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
            </TabsList>

            {['all', 'mcq', 'creative'].map(tab => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(tab === 'all' ? exams : tab === 'mcq' ? mcqExams : creativeExams)
                      .map((exam, idx) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link href={`/exam/${exam.id}`}>
                          <Card className="h-full hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-lg cursor-pointer group">
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {exam.type === 'mcq' ? (
                                    <Target className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <PenTool className="w-5 h-5 text-teal-500" />
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      exam.type === 'mcq'
                                        ? 'border-emerald-300 text-emerald-600'
                                        : 'border-teal-300 text-teal-600'
                                    }`}
                                  >
                                    {exam.type === 'mcq' ? 'MCQ' : 'Creative'}
                                  </Badge>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    exam.difficulty === 'easy'
                                      ? 'border-green-300 text-green-600'
                                      : exam.difficulty === 'hard'
                                        ? 'border-red-300 text-red-600'
                                        : exam.difficulty === 'mixed'
                                          ? 'border-purple-300 text-purple-600'
                                          : 'border-amber-300 text-amber-600'
                                  }`}
                                >
                                  {exam.difficulty}
                                </Badge>
                              </div>
                              <h3 className="font-semibold group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {exam.title}
                              </h3>
                              {exam.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {exam.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {exam.totalQuestions}Q
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(exam.duration)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {exam.attemptCount} attempts
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 text-amber-500" />
                                  Avg: {exam.avgScore}%
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                    {(tab === 'all' ? exams : tab === 'mcq' ? mcqExams : creativeExams).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No exams available yet.</p>
                        <p className="text-sm text-muted-foreground">Create a custom exam above to get started!</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">Recent Attempts</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attempts.map((attempt, idx) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/exam/results/${attempt.id}`}>
                    <Card className="hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-lg cursor-pointer group">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {attempt.exam.title}
                          </h3>
                          <Badge
                            className={`text-xs ${
                              attempt.percentage >= 70
                                ? 'bg-emerald-500'
                                : attempt.percentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                          >
                            {attempt.percentage}%
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {attempt.score}/{attempt.totalMarks}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(attempt.timeTaken / 60)}m
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full ${
                              attempt.percentage >= 70
                                ? 'bg-emerald-500'
                                : attempt.percentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${attempt.percentage}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
