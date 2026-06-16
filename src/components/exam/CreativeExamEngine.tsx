'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  PenTool,
} from 'lucide-react'
import { MathRenderer } from './MathRenderer'
import QuestionBadges from '@/components/shared/QuestionBadges'

export interface CreativeQuestion {
  id: string
  label: string
  question: string
  answer?: string
  marks: number
  difficulty: string
  explanation?: string
  boardName?: string | null
  questionYear?: number | null
  sourceType?: string | null
}

interface CreativeExamEngineProps {
  questions: CreativeQuestion[]
  examTitle?: string
  duration?: number
  onComplete: (results: CreativeExamResult) => void
}

export interface CreativeExamResult {
  totalMarks: number
  timeTaken: number
  answers: Record<string, string>
  answeredCount: number
  totalQuestions: number
}

export function CreativeExamEngine({
  questions,
  examTitle,
  duration = 3600,
  onComplete,
}: CreativeExamEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set([questions[0]?.id]))
  const [timeLeft, setTimeLeft] = useState(duration)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [examStartTime] = useState(Date.now())
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-save every 5 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      const hasAnswers = Object.keys(answers).some(k => answers[k]?.trim())
      if (hasAnswers) {
        setLastSaved(new Date())
      }
    }, 5000)

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [answers])

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)

    setIsSubmitted(true)

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    const timeTaken = Math.round((Date.now() - examStartTime) / 1000)
    const answeredCount = questions.filter(q => answers[q.id]?.trim()).length

    const result: CreativeExamResult = {
      totalMarks,
      timeTaken,
      answers,
      answeredCount,
      totalQuestions: questions.length,
    }

    onComplete(result)
  }, [questions, answers, examStartTime, onComplete])

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isSubmitted, duration, handleSubmit])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const answeredCount = questions.filter(q => answers[q.id]?.trim()).length
  const progressPercentage = (answeredCount / questions.length) * 100
  const timerPercentage = (timeLeft / duration) * 100
  const timerColor =
    timeLeft <= 300
      ? 'text-red-500'
      : timeLeft <= 600
        ? 'text-amber-500'
        : 'text-emerald-500'
  const timerBarColor =
    timeLeft <= 300
      ? '[&>div]:bg-red-500'
      : timeLeft <= 600
        ? '[&>div]:bg-amber-500'
        : '[&>div]:bg-emerald-500'

  // Submitted state
  if (isSubmitted) {
    return (
      <div className="space-y-6">
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
                <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                Exam Submitted!
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Your answers have been recorded successfully.
              </p>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">{answeredCount}/{questions.length} Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">Time: {formatTime(Math.round((Date.now() - examStartTime) / 1000))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Answers</h3>
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-l-4 ${answers[q.id]?.trim() ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{q.label || `Q${idx + 1}`}</Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          q.difficulty === 'easy'
                            ? 'border-green-300 text-green-600'
                            : q.difficulty === 'hard'
                              ? 'border-red-300 text-red-600'
                              : 'border-amber-300 text-amber-600'
                        }`}
                      >
                        {q.difficulty}
                      </Badge>
                      <QuestionBadges
                        boardName={q.boardName}
                        questionYear={q.questionYear}
                        sourceType={q.sourceType}
                      />
                    </div>
                    <Badge variant="outline">{q.marks} marks</Badge>
                  </div>
                  <MathRenderer content={q.question} className="text-sm" />
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your Answer:</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {answers[q.id]?.trim() || <span className="text-amber-500 italic">Not answered</span>}
                    </p>
                  </div>
                  {q.answer && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Model Answer:</p>
                      <MathRenderer content={q.answer} className="text-sm" />
                    </div>
                  )}
                  {q.explanation && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">Explanation:</p>
                      <MathRenderer content={q.explanation} className="text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-emerald-500" />
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
        {lastSaved && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Save className="w-3 h-3" />
            Auto-saved at {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isExpanded = expandedQuestions.has(q.id)
          const hasAnswer = answers[q.id]?.trim()

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className={`transition-all ${isExpanded ? 'ring-2 ring-emerald-200 dark:ring-emerald-800' : ''}`}>
                <CardHeader
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleQuestion(q.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {hasAnswer ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Badge variant="outline" className="font-semibold">
                          {q.label || `Q${idx + 1}`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            q.difficulty === 'easy'
                              ? 'border-green-300 text-green-600'
                              : q.difficulty === 'hard'
                                ? 'border-red-300 text-red-600'
                                : 'border-amber-300 text-amber-600'
                          }`}
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.marks} marks
                        </Badge>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="px-4 pb-4 pt-0 space-y-4">
                        <div className="border-t pt-4">
                          <MathRenderer content={q.question} className="text-base leading-relaxed mb-4" />
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Your Answer
                            </label>
                            <Textarea
                              value={answers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Write your answer here..."
                              className="min-h-[150px] resize-y focus:ring-emerald-500"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Mark distribution: {q.marks} marks</span>
                              <span>{(answers[q.id] || '').length} characters</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4 flex justify-center">
        <Button
          onClick={() => setShowConfirmDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-8 py-3 shadow-lg"
          size="lg"
        >
          <Send className="w-5 h-5" />
          Submit Exam
        </Button>
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
