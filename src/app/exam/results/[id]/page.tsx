'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  AlertCircle,
  Share2,
  RotateCcw,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExamResultCard } from '@/components/exam/ExamResultCard'

interface AttemptData {
  attempt: {
    id: string
    examId: string
    answers: string
    score: number
    totalMarks: number
    correctCount: number
    wrongCount: number
    percentage: number
    timeTaken: number
    rank: number | null
    status: string
    completedAt: string
    exam: {
      id: string
      title: string
      type: string
      difficulty: string
      totalQuestions: number
      marksPerQuestion: number
    }
  }
}

export default function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await fetch(`/api/exams/attempt?id=${id}`)
        const data = await res.json()
        if (data.error) {
          setError(data.error)
        } else {
          setAttemptData(data)
        }
      } catch (err) {
        setError('Failed to load results')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttempt()
  }, [id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Exam Result - ${attemptData?.attempt.exam.title}`,
        text: `I scored ${attemptData?.attempt.percentage}% on ${attemptData?.attempt.exam.title}!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleRetry = () => {
    if (attemptData?.attempt.examId) {
      router.push(`/exam/${attemptData.attempt.examId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !attemptData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Results Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The results you are looking for do not exist.'}</p>
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

  const { attempt } = attemptData
  const { exam } = attempt
  const answers = JSON.parse(attempt.answers || '{}')
  const skippedCount = exam.totalQuestions - attempt.correctCount - attempt.wrongCount

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/exam">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </Button>
        </Link>

        {/* Result Card */}
        <ExamResultCard
          score={attempt.score}
          totalMarks={attempt.totalMarks}
          correctCount={attempt.correctCount}
          wrongCount={attempt.wrongCount}
          skippedCount={skippedCount}
          percentage={attempt.percentage}
          timeTaken={attempt.timeTaken}
          rank={attempt.rank || undefined}
          examTitle={exam.title}
          examType={exam.type}
          onShare={handleShare}
          onRetry={handleRetry}
        />

        {/* Answers Summary for MCQ */}
        {exam.type === 'mcq' && Object.keys(answers).length > 0 && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Answer Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: exam.totalQuestions }, (_, i) => {
                    const answer = answers[Object.keys(answers)[i]]
                    return (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs"
                      >
                        Q{i + 1}: {answer || '—'}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
