'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Share2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react'

interface ExamResultCardProps {
  score: number
  totalMarks: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  percentage: number
  timeTaken: number
  rank?: number
  totalParticipants?: number
  examTitle?: string
  examType?: string
  difficultyBreakdown?: {
    easy: { correct: number; total: number }
    medium: { correct: number; total: number }
    hard: { correct: number; total: number }
  }
  onShare?: () => void
  onRetry?: () => void
}

export function ExamResultCard({
  score,
  totalMarks,
  correctCount,
  wrongCount,
  skippedCount,
  percentage,
  timeTaken,
  rank,
  totalParticipants,
  examTitle,
  examType,
  difficultyBreakdown,
  onShare,
  onRetry,
}: ExamResultCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  // Animated counter effect
  useEffect(() => {
    const duration = 1500
    const steps = 60
    const scoreStep = score / steps
    const percentStep = percentage / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      if (current >= steps) {
        setAnimatedScore(score)
        setAnimatedPercentage(percentage)
        clearInterval(interval)
      } else {
        setAnimatedScore(Math.round(scoreStep * current))
        setAnimatedPercentage(Math.round(percentStep * current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [score, percentage])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getGradeInfo = () => {
    if (percentage >= 90) return { grade: 'A+', label: 'Excellent!', color: 'text-emerald-500' }
    if (percentage >= 80) return { grade: 'A', label: 'Great!', color: 'text-emerald-500' }
    if (percentage >= 70) return { grade: 'B', label: 'Good', color: 'text-teal-500' }
    if (percentage >= 60) return { grade: 'C', label: 'Average', color: 'text-amber-500' }
    if (percentage >= 50) return { grade: 'D', label: 'Below Average', color: 'text-orange-500' }
    return { grade: 'F', label: 'Needs Improvement', color: 'text-red-500' }
  }

  const gradeInfo = getGradeInfo()

  // Circular progress SVG
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">{examTitle || 'Exam Results'}</h2>
                {examType && (
                  <Badge className="bg-white/20 text-white border-white/30 mt-1">
                    {examType === 'mcq' ? 'MCQ Exam' : 'Creative Exam'}
                  </Badge>
                )}
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <Trophy className="w-12 h-12 text-yellow-300" />
              </motion.div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Circular Progress Ring */}
              <div className="relative">
                <svg width="160" height="160" className="-rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={
                      percentage >= 70
                        ? 'text-emerald-500'
                        : percentage >= 50
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                      strokeDasharray: circumference,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className={`text-4xl font-bold ${gradeInfo.color}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {animatedPercentage}%
                  </motion.span>
                  <span className="text-sm text-muted-foreground font-medium">{gradeInfo.label}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 text-center"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{correctCount}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 text-center"
                >
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{wrongCount}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center"
                >
                  <MinusCircle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{skippedCount}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-4 text-center"
                >
                  <Clock className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{formatTime(timeTaken)}</p>
                  <p className="text-xs text-muted-foreground">Time Taken</p>
                </motion.div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Score</span>
                <span className="font-bold">
                  {animatedScore}/{totalMarks}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    percentage >= 70
                      ? 'bg-emerald-500'
                      : percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Rank */}
            {rank && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-3"
              >
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">
                  Rank: #{rank} {totalParticipants ? `out of ${totalParticipants}` : ''}
                </span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Difficulty Breakdown */}
      {difficultyBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold">Performance by Difficulty</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Easy', data: difficultyBreakdown.easy, color: 'bg-green-500' },
                  { label: 'Medium', data: difficultyBreakdown.medium, color: 'bg-amber-500' },
                  { label: 'Hard', data: difficultyBreakdown.hard, color: 'bg-red-500' },
                ].map(({ label, data, color }) => {
                  const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className={`h-full rounded-full ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grade Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${gradeInfo.color} bg-white dark:bg-card shadow-sm`}
                >
                  {gradeInfo.grade}
                </div>
                <div>
                  <p className="font-semibold text-lg">{gradeInfo.label}</p>
                  <p className="text-sm text-muted-foreground">
                    You scored {score} out of {totalMarks} marks
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {onShare && (
                  <Button variant="outline" size="sm" onClick={onShare} className="gap-1">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                )}
                {onRetry && (
                  <Button size="sm" onClick={onRetry} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold">Tips for Improvement</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {percentage < 50 && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Review the chapters where you scored the lowest and practice more questions.
                </li>
              )}
              {wrongCount > correctCount && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Focus on understanding concepts rather than memorizing answers.
                </li>
              )}
              {skippedCount > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Try to attempt all questions — there&apos;s no negative marking!
                </li>
              )}
              {percentage >= 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Great job! Try increasing the difficulty level for a bigger challenge.
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                Practice regularly with timed exams to improve speed and accuracy.
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
