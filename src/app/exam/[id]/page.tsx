'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Clock,
  Target,
  PenTool,
  BookOpen,
  AlertCircle,
  Play,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { McqExamEngine, type McqExamResult, type McqQuestion } from '@/components/exam/McqExamEngine'
import { CreativeExamEngine, type CreativeExamResult, type CreativeQuestion } from '@/components/exam/CreativeExamEngine'

interface ExamData {
  exam: {
    id: string
    title: string
    description?: string
    type: string
    sourceType: string
    totalQuestions: number
    duration: number
    timerPerQuestion?: number
    difficulty: string
    marksPerQuestion: number
  }
  mcqQuestions: McqQuestion[]
  creativeQuestions: CreativeQuestion[]
}

export default function ExamTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exams/${id}`)
        const data = await res.json()
        if (data.error) {
          setError(data.error)
        } else {
          setExamData(data)
        }
      } catch (err) {
        setError('Failed to load exam')
      } finally {
        setIsLoading(false)
      }
    }
    fetchExam()
  }, [id])

  const handleMcqComplete = async (result: McqExamResult) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/exams/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: id,
          answers: result.answers,
          score: result.score,
          totalMarks: result.totalMarks,
          correctCount: result.correctCount,
          wrongCount: result.wrongCount,
          percentage: result.percentage,
          timeTaken: result.timeTaken,
        }),
      })
      const data = await res.json()
      if (data.attempt) {
        setSubmittedAttemptId(data.attempt.id)
      }
    } catch (err) {
      // submit error handled silently
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreativeComplete = async (result: CreativeExamResult) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/exams/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: id,
          answers: result.answers,
          score: result.answeredCount * (examData?.exam.marksPerQuestion || 10),
          totalMarks: result.totalMarks,
          correctCount: result.answeredCount,
          wrongCount: 0,
          percentage: result.totalQuestions > 0
            ? Math.round((result.answeredCount / result.totalQuestions) * 100)
            : 0,
          timeTaken: result.timeTaken,
        }),
      })
      const data = await res.json()
      if (data.attempt) {
        setSubmittedAttemptId(data.attempt.id)
      }
    } catch (err) {
      // submit error handled silently
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !examData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The exam you are looking for does not exist.'}</p>
            <Link href="/exam">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Exams
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show submission success
  if (submittedAttemptId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-bold">Exam Submitted!</h2>
              <p className="text-muted-foreground">
                Your answers have been recorded. View your detailed results now.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href={`/exam/results/${submittedAttemptId}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    View Results
                  </Button>
                </Link>
                <Link href="/exam">
                  <Button variant="outline">
                    Back to Exams
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const exam = examData.exam

  // Pre-exam screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/exam">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Exams
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2">
              <CardContent className="p-8 space-y-6">
                {/* Exam Icon */}
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center ${
                    exam.type === 'mcq'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50'
                      : 'bg-teal-100 dark:bg-teal-900/50'
                  }`}>
                    {exam.type === 'mcq' ? (
                      <Target className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <PenTool className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                </div>

                {/* Exam Info */}
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{exam.title}</h1>
                  {exam.description && (
                    <p className="text-muted-foreground">{exam.description}</p>
                  )}
                </div>

                {/* Exam Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold">{exam.totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold">{Math.round(exam.duration / 60)} min</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold">{exam.marksPerQuestion * exam.totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className={
                    exam.type === 'mcq'
                      ? 'border-emerald-300 text-emerald-600'
                      : 'border-teal-300 text-teal-600'
                  }>
                    {exam.type === 'mcq' ? 'MCQ' : 'Creative'}
                  </Badge>
                  <Badge variant="outline" className={
                    exam.difficulty === 'easy'
                      ? 'border-green-300 text-green-600'
                      : exam.difficulty === 'hard'
                        ? 'border-red-300 text-red-600'
                        : exam.difficulty === 'mixed'
                          ? 'border-purple-300 text-purple-600'
                          : 'border-amber-300 text-amber-600'
                  }>
                    {exam.difficulty}
                  </Badge>
                  {exam.timerPerQuestion && (
                    <Badge variant="outline">
                      {exam.timerPerQuestion}s per question
                    </Badge>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Instructions</h3>
                  <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
                    {exam.type === 'mcq' ? (
                      <>
                        <li>• Each question has {exam.timerPerQuestion || 50} seconds</li>
                        <li>• Select one option (A, B, C, or D)</li>
                        <li>• Auto-move to next question when timer ends</li>
                        <li>• No negative marking for wrong answers</li>
                        <li>• You can navigate between questions</li>
                      </>
                    ) : (
                      <>
                        <li>• Write detailed answers for each question</li>
                        <li>• Answers are auto-saved every 5 seconds</li>
                        <li>• Pay attention to mark distribution</li>
                        <li>• Review model answers after submission</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Start Button */}
                <Button
                  onClick={() => setHasStarted(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 py-6 text-lg"
                  size="lg"
                >
                  <Play className="w-6 h-6" />
                  Start Exam
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Exam in progress
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Exam Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/exam">
              <Button variant="ghost" size="sm" className="shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base truncate">{exam.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {exam.type === 'mcq' ? 'MCQ' : 'Creative'}
                </Badge>
                <Badge variant="outline" className="text-xs">{exam.difficulty}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Engine */}
        {isSubmitting ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Submitting your exam...</p>
            </div>
          </div>
        ) : exam.type === 'mcq' ? (
          <McqExamEngine
            questions={examData.mcqQuestions}
            timerPerQuestion={exam.timerPerQuestion || 50}
            examTitle={exam.title}
            onComplete={handleMcqComplete}
          />
        ) : (
          <CreativeExamEngine
            questions={examData.creativeQuestions}
            examTitle={exam.title}
            duration={exam.duration}
            onComplete={handleCreativeComplete}
          />
        )}
      </div>
    </div>
  )
}
