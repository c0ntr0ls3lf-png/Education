'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Timer,
  Zap,
  Youtube,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { MathRenderer } from './MathRenderer'
import QuestionBadges from '@/components/shared/QuestionBadges'

export interface McqQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string
  videoUrl?: string
  marks: number
  difficulty: string
}

// Extended interface for questions with source metadata
export interface McqQuestionExtended extends McqQuestion {
  boardName?: string | null
  questionYear?: number | null
  sourceType?: string | null
}

interface McqExamEngineProps {
  questions: McqQuestion[]
  timerPerQuestion?: number
  examTitle?: string
  onComplete: (results: McqExamResult) => void
}

// Extend McqQuestion for source metadata
export interface McqQuestionExtended extends McqQuestion {
  boardName?: string | null
  questionYear?: number | null
  sourceType?: string | null
}

export interface McqExamResult {
  score: number
  totalMarks: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  percentage: number
  timeTaken: number
  answers: Record<string, string>
  questionResults: Array<{
    questionId: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
    timeSpent: number
  }>
}

export function McqExamEngine({
  questions,
  timerPerQuestion = 50,
  examTitle,
  onComplete,
}: McqExamEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(timerPerQuestion)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [examStartTime] = useState(Date.now())
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({})
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [videoExpandedIds, setVideoExpandedIds] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentQuestion = questions[currentIndex]

  // Initialize question start time
  useEffect(() => {
    if (currentQuestion && !isSubmitted) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestion.id]: Date.now(),
      }))
    }
  }, [currentIndex, currentQuestion, isSubmitted])

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this question, move to next
          handleTimeUp()
          return timerPerQuestion
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex, isSubmitted, timerPerQuestion])

  const handleTimeUp = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      // Record time spent
      if (currentQuestion) {
        const timeSpent = Math.round((Date.now() - (questionStartTimes[currentQuestion.id] || Date.now())) / 1000)
        setQuestionTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }))
      }
      setCurrentIndex(prev => prev + 1)
      setTimeLeft(timerPerQuestion)
    } else {
      // Last question, auto submit
      handleSubmit()
    }
  }, [currentIndex, questions.length, timerPerQuestion])

  const handleSelectAnswer = (option: string) => {
    if (isSubmitted) return
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))
  }

  const handleNext = () => {
    if (currentQuestion) {
      const timeSpent = Math.round((Date.now() - (questionStartTimes[currentQuestion.id] || Date.now())) / 1000)
      setQuestionTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }))
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setTimeLeft(timerPerQuestion)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion) {
      const timeSpent = Math.round((Date.now() - (questionStartTimes[currentQuestion.id] || Date.now())) / 1000)
      setQuestionTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }))
    }
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setTimeLeft(timerPerQuestion)
    }
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    // Record time for current question
    if (currentQuestion) {
      const timeSpent = Math.round((Date.now() - (questionStartTimes[currentQuestion.id] || Date.now())) / 1000)
      setQuestionTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }))
    }

    setIsSubmitted(true)

    let correctCount = 0
    let wrongCount = 0
    let score = 0

    const questionResults = questions.map(q => {
      const selectedAnswer = answers[q.id] || ''
      const isCorrect = selectedAnswer === q.correctAnswer
      if (isCorrect) {
        correctCount++
        score += q.marks
      } else if (selectedAnswer) {
        wrongCount++
      }
      return {
        questionId: q.id,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeSpent: questionTimes[q.id] || 0,
      }
    })

    const skippedCount = questions.length - correctCount - wrongCount
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    const timeTaken = Math.round((Date.now() - examStartTime) / 1000)

    const result: McqExamResult = {
      score,
      totalMarks,
      correctCount,
      wrongCount,
      skippedCount,
      percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
      timeTaken,
      answers,
      questionResults,
    }

    onComplete(result)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const timerPercentage = (timeLeft / timerPerQuestion) * 100
  const timerColor =
    timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-amber-500' : 'text-emerald-500'
  const timerBarColor =
    timeLeft <= 10
      ? '[&>div]:bg-red-500'
      : timeLeft <= 20
        ? '[&>div]:bg-amber-500'
        : '[&>div]:bg-emerald-500'

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / questions.length) * 100

  const optionLabels = ['A', 'B', 'C', 'D'] as const
  const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const

  // YouTube embed helper
  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/, // raw video ID
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }
    return null
  }

  // Submitted state - show results review
  if (isSubmitted) {
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length
    const wrongCount = questions.filter(q => answers[q.id] && answers[q.id] !== q.correctAnswer).length
    const skippedCount = questions.filter(q => !answers[q.id]).length
    const score = questions.filter(q => answers[q.id] === q.correctAnswer).reduce((sum, q) => sum + q.marks, 0)

    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Trophy className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                Exam Completed!
              </h2>
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-300 mb-4">
                {score}/{totalMarks}
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">{correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">{wrongCount} Wrong</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium">{skippedCount} Skipped</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Question Review</h3>
          {questions.map((q, idx) => {
            const selectedAnswer = answers[q.id]
            const isCorrect = selectedAnswer === q.correctAnswer
            const isSkipped = !selectedAnswer

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`border-l-4 ${
                    isCorrect
                      ? 'border-l-emerald-500'
                      : isSkipped
                        ? 'border-l-amber-500'
                        : 'border-l-red-500'
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isCorrect ? 'default' : isSkipped ? 'secondary' : 'destructive'}
                          className={
                            isCorrect
                              ? 'bg-emerald-500'
                              : isSkipped
                                ? 'bg-amber-500'
                                : ''
                          }
                        >
                          Q{idx + 1}
                        </Badge>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : isSkipped ? (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {(q as McqQuestionExtended).boardName && (
                          <QuestionBadges
                            boardName={(q as McqQuestionExtended).boardName}
                            questionYear={(q as McqQuestionExtended).questionYear}
                            sourceType={(q as McqQuestionExtended).sourceType}
                          />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {q.marks} mark{q.marks > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <MathRenderer content={q.question} className="text-sm" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {optionKeys.map((key, optIdx) => {
                        const isSelected = selectedAnswer === key.replace('option', '')[0]
                        const isCorrectOption = q.correctAnswer === key.replace('option', '')[0]
                        return (
                          <div
                            key={key}
                            className={`p-2 rounded-lg text-sm border ${
                              isCorrectOption
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                                : isSelected && !isCorrectOption
                                  ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700'
                                  : 'bg-muted/50 border-transparent'
                            }`}
                          >
                            <span className="font-medium mr-1">{optionLabels[optIdx]}.</span>
                            <MathRenderer content={(q as any)[key]} className="inline text-sm" />
                            {isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 inline ml-1 text-emerald-500" />
                            )}
                            {isSelected && !isCorrectOption && (
                              <XCircle className="w-4 h-4 inline ml-1 text-red-500" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">Explanation:</p>
                        <MathRenderer content={q.explanation} className="text-muted-foreground" />
                      </div>
                    )}

                    {/* Video Lecture */}
                    {q.videoUrl && (
                      <div className="mt-2">
                        <button
                          onClick={() => setVideoExpandedIds(prev => {
                            const next = new Set(prev)
                            if (next.has(q.id)) next.delete(q.id)
                            else next.add(q.id)
                            return next
                          })}
                          className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                        >
                          {videoExpandedIds.has(q.id) ? (
                            <><ChevronUp className="h-3.5 w-3.5" /> Hide Video Lecture</>
                          ) : (
                            <><Youtube className="h-3.5 w-3.5" /> Video Lecture</>
                          )}
                        </button>
                        {videoExpandedIds.has(q.id) && (
                          <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 shadow-inner">
                            <iframe
                              src={getYoutubeEmbedUrl(q.videoUrl) || ''}
                              title="Video Lecture"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Exam-taking state
  return (
    <div className="space-y-4">
      {/* Header: Progress & Timer */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {answeredCount}/{questions.length} answered
            </Badge>
          </div>
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timerColor}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <Progress value={timerPercentage} className={`h-2 ${timerBarColor}`} />
        <Progress value={progressPercentage} className="h-1 mt-1 [&>div]:bg-emerald-500" />
      </div>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => {
              if (currentQuestion) {
                const timeSpent = Math.round((Date.now() - (questionStartTimes[currentQuestion.id] || Date.now())) / 1000)
                setQuestionTimes(prev => ({ ...prev, [currentQuestion.id]: timeSpent }))
              }
              setCurrentIndex(idx)
              setTimeLeft(timerPerQuestion)
            }}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
              idx === currentIndex
                ? 'bg-emerald-500 text-white scale-110 shadow-lg'
                : answers[q.id]
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <CardContent className="p-6 space-y-6">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300">
                    {currentIndex + 1}
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        currentQuestion?.difficulty === 'easy'
                          ? 'border-green-300 text-green-600'
                          : currentQuestion?.difficulty === 'hard'
                            ? 'border-red-300 text-red-600'
                            : 'border-amber-300 text-amber-600'
                      }`}
                    >
                      {currentQuestion?.difficulty}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion?.marks} mark{currentQuestion?.marks !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Question Text */}
              <div className="text-lg leading-relaxed">
                <MathRenderer content={currentQuestion?.question || ''} />
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {optionKeys.map((key, optIdx) => {
                  const optionValue = optionLabels[optIdx]
                  const isSelected = answers[currentQuestion?.id] === optionValue
                  const optionText = currentQuestion ? (currentQuestion as any)[key] : ''

                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectAnswer(optionValue)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                          : 'border-muted hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {optionValue}
                        </div>
                        <MathRenderer content={optionText} className="flex-1" />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Zap className="w-5 h-5 text-emerald-500" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Timer className="w-4 h-4" />
            Total: {formatTime(Math.round((Date.now() - examStartTime) / 1000))}
          </div>
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowConfirmDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                  <h3 className="text-lg font-bold">Submit Exam?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You have answered {answeredCount} out of {questions.length} questions.
                    {answeredCount < questions.length && (
                      <span className="text-amber-500 block mt-1">
                        {questions.length - answeredCount} question(s) are unanswered!
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Continue Exam
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      handleSubmit()
                    }}
                  >
                    Submit Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
