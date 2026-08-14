'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Youtube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MathRenderer } from '@/components/exam/MathRenderer'
import VideoPlayer from './VideoPlayer'

// ─── Types ──────────────────────────────────────────────
interface Explanation {
  id: string
  question: string
  solution?: string | null
  videoUrl?: string | null
  difficulty: string
  order: number
  type?: 'single' | 'group' | null
  subQuestions?: string | null
}

interface ExplanationTabProps {
  explanations: Explanation[]
  isAdmin?: boolean
  onEdit?: (exp: Explanation) => void
}

// ─── YouTube embed helper ────────────────────────────────
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
}

// ─── Component ──────────────────────────────────────────
export default function ExplanationTab({ explanations, isAdmin, onEdit }: ExplanationTabProps) {
  // openId: which parent question is open (shows solution or sub-questions list)
  const [openId, setOpenId] = useState<string | null>(null)
  // openSubId: which sub-question solution is open (independent from parent)
  const [openSubId, setOpenSubId] = useState<string | null>(null)
  // openVideoId: which parent video is showing inline
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  const toggleParent = (id: string) => {
    setOpenId((prev) => {
      if (prev === id) {
        // Closing — also close any open sub/video for this parent
        setOpenSubId(null)
        setOpenVideoId(null)
        return null
      }
      // Opening a new parent — close sub and video
      setOpenSubId(null)
      setOpenVideoId(null)
      return id
    })
  }

  const toggleSub = (subId: string) => {
    setOpenSubId((prev) => (prev === subId ? null : subId))
  }

  const toggleVideo = (id: string) => {
    setOpenVideoId((prev) => (prev === id ? null : id))
  }

  if (explanations.length === 0) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No explanations available</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Explanations for this chapter will be added soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {explanations.map((explanation, index) => {
        const isExpanded = openId === explanation.id
        const isVideoVisible = openVideoId === explanation.id

        let subQs: { id?: string; label: string; question?: string; text?: string; solution?: string; videoUrl?: string }[] = []
        if (explanation.subQuestions) {
          try {
            const parsed = JSON.parse(explanation.subQuestions)
            if (Array.isArray(parsed) && parsed.length > 0) {
              subQs = parsed.filter((sq: any) => sq.question?.trim() || sq.text?.trim())
            }
          } catch { /* fallback */ }
        }

        const hasSubQuestions = subQs.length > 0
        // Row is clickable if it has a solution, sub-questions, or a video
        const isClickable = hasSubQuestions || !!explanation.solution || !!explanation.videoUrl

        return (
          <Card
            key={explanation.id}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
          >
            <CardContent className="p-0">

              {/* ══ Question Row — entire row is clickable to toggle ══ */}
              <div
                className={`px-3 py-2 select-none transition-colors ${
                  isClickable
                    ? 'cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
                    : 'cursor-default'
                }`}
                onClick={() => isClickable && toggleParent(explanation.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Number badge + question text */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {index + 1}
                    </span>
                    <MathRenderer
                      content={explanation.question}
                      className="text-sm leading-relaxed flex-1"
                    />
                  </div>

                  {/* Edit button + chevron */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start pt-0.5">
                    {isAdmin && onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onEdit(explanation) }}
                        className="h-5 text-[9px] gap-1 border-muted-foreground/20 text-muted-foreground hover:text-foreground px-1.5"
                      >
                        <span>✏️ Edit</span>
                      </Button>
                    )}
                    {isClickable && (
                      isExpanded
                        ? <ChevronUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* ══ SINGLE question: solution panel ══════════════════ */}
              {!hasSubQuestions && isExpanded && (
                <div className="border-t border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 px-3 sm:px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                          Solution
                        </p>
                        {explanation.videoUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); toggleVideo(explanation.id) }}
                            className="h-6 text-[10px] gap-1 px-2 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Youtube className="h-3 w-3" />
                            {isVideoVisible ? 'Hide Video' : 'Video Lecture'}
                          </Button>
                        )}
                      </div>

                      {/* Solution text */}
                      {explanation.solution && (
                        <MathRenderer
                          content={explanation.solution}
                          className="text-sm leading-relaxed text-foreground/90"
                        />
                      )}

                      {/* Inline video (no solution) — use VideoPlayer */}
                      {!explanation.solution && explanation.videoUrl && (
                        <VideoPlayer url={explanation.videoUrl} title={`Explanation ${index + 1}`} compact />
                      )}

                      {/* Embedded YouTube player (solution + video) */}
                      {explanation.solution && explanation.videoUrl && isVideoVisible && (
                        <div className="border-t border-rose-100 dark:border-rose-900/30 pt-2">
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 shadow-inner">
                            <iframe
                              src={getYoutubeEmbedUrl(explanation.videoUrl) || explanation.videoUrl}
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
                </div>
              )}

              {/* ══ GROUP: sub-questions list (shown when parent is open) ══ */}
              {hasSubQuestions && isExpanded && (
                <div className="border-t border-dashed border-gray-100 dark:border-gray-800 px-3 pt-3 pb-2 space-y-1.5">
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 uppercase tracking-wide flex items-center gap-1 ml-7">
                    <Lightbulb className="h-2.5 w-2.5" />
                    Sub Questions — click to show solution
                  </p>

                  {subQs.map((sq, sqIdx) => {
                    const subId = `${explanation.id}-${sq.id || sqIdx}`
                    const isSubExpanded = openSubId === subId
                    const subClickable = !!(sq.solution || sq.videoUrl)

                    return (
                      <div key={sq.id || sqIdx} className="ml-7 space-y-1.5">
                        {/* Sub-question row — clickable */}
                        <div
                          className={`flex items-start gap-2 bg-muted/10 p-2 rounded-lg border transition-colors ${
                            subClickable
                              ? 'cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
                              : 'cursor-default'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (subClickable) toggleSub(subId)
                          }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-100/50 dark:bg-emerald-950/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {sq.label}
                          </span>
                          <MathRenderer
                            content={sq.question || sq.text || ''}
                            className="text-sm leading-relaxed flex-1"
                          />
                          {subClickable && (
                            isSubExpanded
                              ? <ChevronUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 self-start mt-0.5" />
                              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 self-start mt-0.5" />
                          )}
                        </div>

                        {/* Sub solution (expandable) */}
                        {subClickable && isSubExpanded && (
                          <div className="ml-7 bg-emerald-50/30 dark:bg-emerald-950/5 border border-dashed rounded-lg p-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            {sq.solution && (
                              <MathRenderer
                                content={sq.solution}
                                className="text-sm leading-relaxed text-foreground/85"
                              />
                            )}
                            {sq.videoUrl && (
                              <div className="mt-2">
                                <VideoPlayer url={sq.videoUrl} title={`Part ${sq.label}`} compact />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
