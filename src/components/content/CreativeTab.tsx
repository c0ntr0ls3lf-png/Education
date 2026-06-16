'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MathRenderer } from '@/components/exam/MathRenderer'
import QuestionBadges from '@/components/shared/QuestionBadges'
import { ListChecks, Award, BookOpen, Youtube, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────
interface CreativeQuestion {
  id: string
  label: string
  question: string
  answer?: string | null
  marks: number
  difficulty: string
  explanation?: string | null // Stores YouTube URL
  subQuestionA?: string | null
  subQuestionB?: string | null
  subQuestionC?: string | null
  subQuestions?: string | null // JSON array: [{"label":"ক","text":"..."},...]
  order: number
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface CreativeTabProps {
  creativeQuestions: CreativeQuestion[]
}

// ─── Label config ───────────────────────────────────────
const labelConfig: Record<string, { bg: string; text: string; border: string }> = {
  A: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
  },
  B: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800/60',
  },
  C: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  D: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/60',
  },
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

// ─── Component ──────────────────────────────────────────
export default function CreativeTab({ creativeQuestions }: CreativeTabProps) {
  // Single-open accordion — only one panel open at a time per group
  const [openSubQsId, setOpenSubQsId] = useState<string | null>(null)
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  const toggleSubQs = (id: string) => {
    if (openSubQsId === id) {
      setOpenSubQsId(null)
    } else {
      // Open this question's sub-questions, close any previously open model answer
      setOpenSubQsId(id)
      setOpenAnswerId(null)
      setOpenVideoId(null)
    }
  }

  const toggleAnswer = (id: string) => {
    if (openAnswerId === id) {
      setOpenAnswerId(null)
      setOpenVideoId(null)
    } else {
      // Open this model answer, close any other
      setOpenAnswerId(id)
      setOpenVideoId(null)
    }
  }

  const toggleVideo = (id: string) => {
    setOpenVideoId((prev) => (prev === id ? null : id))
  }

  if (creativeQuestions.length === 0) {
    return (
      <div className="text-center py-8">
        <ListChecks className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No creative questions available</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Creative questions for this chapter will be added soon.</p>
      </div>
    )
  }

  // Sort questions by label then order
  const sortedQuestions = [...creativeQuestions].sort((a, b) => {
    const labelCompare = a.label.localeCompare(b.label)
    if (labelCompare !== 0) return labelCompare
    return (a.order || 0) - (b.order || 0)
  })

  return (
    <div className="space-y-2">
      {sortedQuestions.map((question, index) => {
        const isSubQsVisible = openSubQsId === question.id
        const isAnswerVisible = openAnswerId === question.id
        const isVideoVisible = openVideoId === question.id
        const config = labelConfig[question.label.toUpperCase()] || labelConfig.A

        let subQs: { label: string; text: string }[] = []
        if (question.subQuestions) {
          try {
            const parsed = JSON.parse(question.subQuestions)
            if (Array.isArray(parsed) && parsed.length > 0) {
              subQs = parsed.filter((sq: any) => sq.text?.trim())
            }
          } catch { /* fallback */ }
        }
        if (subQs.length === 0) {
          if (question.subQuestionA) subQs.push({ label: 'ক', text: question.subQuestionA })
          if (question.subQuestionB) subQs.push({ label: 'খ', text: question.subQuestionB })
          if (question.subQuestionC) subQs.push({ label: 'গ', text: question.subQuestionC })
        }

        const hasSubQuestions = subQs.length > 0
        const videoUrl = question.explanation || ''
        const hasVideo = !!getYoutubeEmbedUrl(videoUrl)

        return (
          <Card
            key={question.id}
            className={`border ${config.border} bg-card shadow-sm overflow-hidden`}
          >
            <CardContent className="p-3 space-y-3">
              {/* Main Question Stem Row — clickable to toggle sub-questions */}
              <div
                className={`flex items-start gap-2 select-none px-2 py-1 -mx-2 -my-1 rounded-lg transition-colors ${
                  hasSubQuestions 
                    ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10' 
                    : 'cursor-default'
                }`}
                onClick={() => hasSubQuestions && toggleSubQs(question.id)}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${config.bg} ${config.text} text-[10px] font-bold`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <MathRenderer
                      content={question.question}
                      className="text-sm leading-relaxed flex-1 min-w-[200px]"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <QuestionBadges
                        board_name={question.board_name}
                        exam_year={question.exam_year}
                        sourceType={question.sourceType}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[9px] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 h-5 px-1.5">
                      <Award className="mr-0.5 h-2 w-2" />
                      {question.marks}m
                    </Badge>
                  </div>
                </div>
                {/* Chevron indicator — only for questions with sub-questions */}
                {hasSubQuestions && (
                  <div className="shrink-0 self-start pt-1">
                    {isSubQsVisible ? (
                      <ChevronUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              {/* Sub Questions List (Collapsible, hidden by default) */}
              {hasSubQuestions && isSubQsVisible && (
                <div className="ml-7 space-y-1.5 border-t border-dashed border-indigo-100 dark:border-indigo-950/30 pt-3">
                  <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                    <ListChecks className="h-2.5 w-2.5" />
                    Sub Questions (Click any to show Model Answer)
                  </p>
                  <div className="space-y-1.5">
                    {subQs.map((sq, sqIdx) => (
                      <div
                        key={sqIdx}
                        onClick={() => toggleAnswer(question.id)}
                        className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-lg p-2 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-all border border-indigo-100/50 dark:border-indigo-950/20"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold">
                          {sq.label}
                        </span>
                        <MathRenderer
                          content={sq.text}
                          className="text-sm leading-relaxed text-foreground/90 flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Answer Box (Toggled on click of sub-question) */}
              {question.answer && isAnswerVisible && (
                <div className="ml-7 border-t border-dashed border-emerald-100 dark:border-emerald-950/30 pt-3">
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 space-y-2">
                    {/* Model Answer Header Row */}
                    <div className="flex items-center justify-between border-b border-emerald-100/50 dark:border-emerald-900/20 pb-1.5">
                      <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="h-2.5 w-2.5" />
                        Model Answer
                      </p>
                      {hasVideo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVideo(question.id)}
                          className="h-6 text-[10px] gap-1 px-2 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Youtube className="h-3.5 w-3.5" />
                          {isVideoVisible ? 'Hide Video' : 'Video Lecture'}
                        </Button>
                      )}
                    </div>

                    {/* MathRenderer of Answer */}
                    <MathRenderer
                      content={question.answer}
                      className="text-sm leading-relaxed text-foreground/90"
                    />

                    {/* Embedded Video Player */}
                    {hasVideo && isVideoVisible && (
                      <div className="border-t border-rose-100 dark:border-rose-900/30 pt-3 mt-2">
                        <p className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Youtube className="h-3.5 w-3.5" />
                          Video Lecture
                        </p>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 shadow-inner">
                          <iframe
                            src={getYoutubeEmbedUrl(videoUrl) || ''}
                            title="Video Lecture"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      </div>
                    )}
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
