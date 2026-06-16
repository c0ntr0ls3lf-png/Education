'use client'

import { useState } from 'react'
import { CheckSquare, ChevronDown, ChevronUp, CheckCircle2, XCircle, Award, Youtube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MathRenderer } from '@/components/exam/MathRenderer'
import QuestionBadges from '@/components/shared/QuestionBadges'

// ─── Types ──────────────────────────────────────────────
interface McqQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC?: string | null
  optionD?: string | null
  options?: string | null // JSON array: [{"label":"A","text":"..."},...]
  correctAnswer: string
  explanation?: string | null
  videoUrl?: string | null
  marks: number
  difficulty: string
  order: number
  // Source metadata
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface McqTabProps {
  mcqQuestions: McqQuestion[]
}

// ─── Difficulty config ──────────────────────────────────
const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  hard: { label: 'Hard', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

// ─── YouTube video ID extractor ────────────────────────
function getYoutubeEmbedUrl(url: string): string | null {
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

// ─── Helper: get options from MCQ (dynamic or legacy) ──
function getOptionsFromMcq(mcq: McqQuestion): { label: string; text: string }[] {
  // Try dynamic options first
  if (mcq.options) {
    try {
      const parsed = JSON.parse(mcq.options)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch { /* fallback to legacy */ }
  }
  // Fallback to legacy optionA/B/C/D
  const options: { label: string; text: string }[] = []
  if (mcq.optionA) options.push({ label: 'A', text: mcq.optionA })
  if (mcq.optionB) options.push({ label: 'B', text: mcq.optionB })
  if (mcq.optionC) options.push({ label: 'C', text: mcq.optionC })
  if (mcq.optionD) options.push({ label: 'D', text: mcq.optionD })
  return options
}

// ─── Component ──────────────────────────────────────────
export default function McqTab({ mcqQuestions }: McqTabProps) {
  // Single-open accordion — only one MCQ answer panel open at a time
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null)
  const [openExplanationId, setOpenExplanationId] = useState<string | null>(null)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  // Track student's selected answer per question: { questionId: selectedLabel }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})

  const toggleAnswer = (id: string) => {
    if (openAnswerId === id) {
      // Close this answer panel
      setOpenAnswerId(null)
      setOpenExplanationId(null)
      setOpenVideoId(null)
    } else {
      // Open this one, close the previous
      setOpenAnswerId(id)
      setOpenExplanationId(null)
      setOpenVideoId(null)
    }
  }

  const handleOptionClick = (e: React.MouseEvent, questionId: string, selectedLabel: string) => {
    e.stopPropagation()
    // Only allow one attempt per question
    if (selectedAnswers[questionId]) return
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedLabel }))
  }

  const toggleExpand = (id: string) => {
    setOpenExplanationId((prev) => (prev === id ? null : id))
  }

  const toggleVideo = (id: string) => {
    setOpenVideoId((prev) => (prev === id ? null : id))
  }

  if (mcqQuestions.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No MCQ questions available</p>
        <p className="text-xs text-muted-foreground/60 mt-1">MCQ questions for this chapter will be added soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {mcqQuestions.map((mcq, index) => {
        const isAnswerVisible = openAnswerId === mcq.id
        const isExpanded = openExplanationId === mcq.id
        const difficulty = difficultyConfig[mcq.difficulty] || difficultyConfig.medium
        const correctOption = mcq.correctAnswer?.toUpperCase() || ''
        const options = getOptionsFromMcq(mcq)
        const hasAttempted = !!selectedAnswers[mcq.id]

        return (
          <Card
            key={mcq.id}
            className="border border-teal-200/60 dark:border-teal-900/40 rounded-lg bg-card shadow-sm overflow-hidden"
          >
            <CardContent className="p-0">
              {/* Question - clickable to toggle answer */}
              <div
                className="px-3 py-2 cursor-pointer select-none hover:bg-muted/30 transition-colors"
                onClick={() => toggleAnswer(mcq.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: number + question text & badges below */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <MathRenderer content={mcq.question} className="text-sm leading-relaxed flex-1 min-w-[200px]" />
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                          <QuestionBadges
                            board_name={mcq.board_name}
                            exam_year={mcq.exam_year}
                            sourceType={mcq.sourceType}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 h-4 px-1">
                          <Award className="mr-0.5 h-2 w-2" />
                          {mcq.marks}m
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* Right: chevron only */}
                  <div className="flex items-center shrink-0 self-start pt-0.5">
                    {openAnswerId === mcq.id ? (
                      <ChevronUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Options - hidden by default, shown on click */}
              {isAnswerVisible && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                  <div className="ml-7">
                    {/* Options Grid - Interactive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {options.map((option) => {
                        const isCorrect = option.label === correctOption
                        const isSelected = selectedAnswers[mcq.id] === option.label

                        // Determine visual state
                        let containerClass = 'bg-card border-border/50 hover:border-border cursor-pointer'
                        let labelClass = 'bg-muted text-muted-foreground'
                        let textClass = 'text-foreground/80'
                        let icon = null

                        if (hasAttempted) {
                          if (isCorrect) {
                            // Correct answer: always green
                            containerClass = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                            labelClass = 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                            textClass = 'text-emerald-800 dark:text-emerald-200 font-medium'
                            icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          } else if (isSelected) {
                            // Wrong selected option: red
                            containerClass = 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700'
                            labelClass = 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            textClass = 'text-red-800 dark:text-red-200'
                            icon = <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                          } else {
                            // Unselected wrong option: dimmed
                            containerClass = 'bg-card border-border/30 opacity-50'
                            labelClass = 'bg-muted text-muted-foreground'
                            textClass = 'text-foreground/50'
                          }
                        }

                        return (
                          <div
                            key={option.label}
                            onClick={(e) => handleOptionClick(e, mcq.id, option.label)}
                            className={`relative flex items-start gap-2 p-2 rounded-lg border transition-all duration-200 ${containerClass}`}
                          >
                            {/* Option label */}
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${labelClass}`}
                            >
                              {option.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <MathRenderer
                                content={option.text}
                                className={`text-sm leading-relaxed ${textClass}`}
                              />
                            </div>
                            {/* Indicator icon */}
                            {icon}
                          </div>
                        )
                      })}
                    </div>

                    {/* Feedback message after attempt */}
                    {hasAttempted && (
                      <div className="mt-2">
                        {selectedAnswers[mcq.id] === correctOption ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Correct! Well done.
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-medium">
                            <XCircle className="h-3.5 w-3.5" />
                            Incorrect. The correct answer is <span className="font-bold">Option {correctOption}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation & Video Lecture toggles */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {mcq.explanation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(mcq.id) }}
                          className="h-7 text-[10px] gap-1 px-2 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Hide Explanation
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              Show Explanation
                            </>
                          )}
                        </Button>
                      )}
                  {mcq.videoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); toggleVideo(mcq.id) }}
                          className="h-7 text-[10px] gap-1 px-2 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          {openVideoId === mcq.id ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Hide Video
                            </>
                          ) : (
                            <>
                              <Youtube className="h-3 w-3" />
                              Video
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Explanation (expandable) */}
              {mcq.explanation && isExpanded && (
                <div className="border-t border-teal-100 dark:border-teal-900/30 bg-teal-50/50 dark:bg-teal-950/10 px-3 sm:px-4 py-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 mb-1.5 uppercase tracking-wide">
                        Explanation
                      </p>
                      <MathRenderer
                        content={mcq.explanation}
                        className="text-sm leading-relaxed text-foreground/90"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Lecture (expandable) */}
              {mcq.videoUrl && openVideoId === mcq.id && (
                <div className="border-t border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 px-3 sm:px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Youtube className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 mb-2 uppercase tracking-wide">
                        Video Lecture
                      </p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 shadow-inner">
                        <iframe
                          src={getYoutubeEmbedUrl(mcq.videoUrl) || ''}
                          title="Video Lecture"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
