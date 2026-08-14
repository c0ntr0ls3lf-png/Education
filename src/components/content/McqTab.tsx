'use client'

import { useState, useMemo } from 'react'
import { CheckSquare, ChevronDown, ChevronUp, CheckCircle2, XCircle, Award, Youtube, Search, X, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  schoolName?: string | null
}

interface McqTabProps {
  mcqQuestions: McqQuestion[]
  isAdmin?: boolean
  onEdit?: (mcq: McqQuestion) => void
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

// ─── Source type badge colors ──────────────────────────
const sourceTypeLabels: Record<string, string> = {
  board: 'বোর্ড',
  school: 'স্কুল',
  model_test: 'মডেল টেস্ট',
  custom: 'কাস্টম',
}

// ─── Component ──────────────────────────────────────────
export default function McqTab({ mcqQuestions, isAdmin, onEdit }: McqTabProps) {
  // Single-open accordion — only one MCQ answer panel open at a time
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null)
  const [openExplanationId, setOpenExplanationId] = useState<string | null>(null)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  // Track student's selected answer per question: { questionId: selectedLabel }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})

  // ─── Search & Filter State ───────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState('all')
  const [filterBoard, setFilterBoard] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // ─── Derived unique values for dropdowns ────────────
  const { uniqueYears, uniqueBoards, uniqueSources } = useMemo(() => {
    const years = new Set<string>()
    const boards = new Set<string>()
    const sources = new Set<string>()
    mcqQuestions.forEach((q) => {
      if (q.exam_year) years.add(String(q.exam_year))
      if (q.board_name) boards.add(q.board_name)
      if (q.sourceType) sources.add(q.sourceType)
    })
    return {
      uniqueYears: Array.from(years).sort((a, b) => Number(b) - Number(a)),
      uniqueBoards: Array.from(boards).sort(),
      uniqueSources: Array.from(sources).sort(),
    }
  }, [mcqQuestions])

  // ─── Filtered questions ──────────────────────────────
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return mcqQuestions.filter((mcq) => {
      // Text search across question + options + school name + board
      const matchText = !q || [
        mcq.question,
        mcq.optionA, mcq.optionB, mcq.optionC, mcq.optionD,
        mcq.board_name, mcq.schoolName,
        mcq.exam_year ? String(mcq.exam_year) : '',
      ].some((field) => (field || '').toLowerCase().includes(q))

      const matchYear = filterYear === 'all' || String(mcq.exam_year) === filterYear
      const matchBoard = filterBoard === 'all' || (mcq.board_name || '').toLowerCase() === filterBoard.toLowerCase()
      const matchSource = filterSource === 'all' || mcq.sourceType === filterSource

      return matchText && matchYear && matchBoard && matchSource
    })
  }, [mcqQuestions, searchQuery, filterYear, filterBoard, filterSource])

  const hasActiveFilters = searchQuery || filterYear !== 'all' || filterBoard !== 'all' || filterSource !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear('all')
    setFilterBoard('all')
    setFilterSource('all')
  }

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
    <div className="space-y-3">
      {/* ─── Search & Filter Bar ─────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Main Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রশ্ন, বোর্ড, স্কুল বা সাল লিখে খুঁজুন..."
              className="pl-8 pr-8 h-9 text-sm bg-background border-border/60 focus:border-teal-400 dark:focus:border-teal-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 gap-1.5 shrink-0 text-xs ${showFilters ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' : ''}`}
          >
            <Filter className="h-3.5 w-3.5" />
            ফিল্টার
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Expandable Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
            {/* Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">সাল / Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="all">সকল সাল</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Board Filter */}
            {uniqueBoards.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">বোর্ড / Board</label>
                <select
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                  className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 max-w-[160px]"
                >
                  <option value="all">সকল বোর্ড</option>
                  {uniqueBoards.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Source Type Filter */}
            {uniqueSources.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ধরন / Type</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  <option value="all">সকল ধরন</option>
                  {uniqueSources.map((s) => (
                    <option key={s} value={s}>{sourceTypeLabels[s] || s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={clearFilters}
                  className="h-8 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors"
                >
                  <X className="h-3 w-3" />
                  ক্লিয়ার
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {hasActiveFilters && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-teal-600 dark:text-teal-400">{filteredQuestions.length}</span>
            {' '}টি প্রশ্ন পাওয়া গেছে (মোট {mcqQuestions.length}টির মধ্যে)
          </p>
        )}
      </div>

      {/* ─── No Results ──────────────────────────────────── */}
      {filteredQuestions.length === 0 && hasActiveFilters && (
        <div className="text-center py-8 border border-dashed border-border/40 rounded-xl">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground/60 mt-1">অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন</p>
          <button onClick={clearFilters} className="mt-3 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
            সব ফিল্টার সরিয়ে দিন
          </button>
        </div>
      )}

      {/* ─── MCQ List ────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredQuestions.map((mcq, index) => {
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
                          {isAdmin && onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); onEdit(mcq) }}
                              className="h-4 text-[9px] border-muted-foreground/20 hover:bg-muted text-muted-foreground hover:text-foreground px-1 flex items-center gap-0.5"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </Button>
                          )}
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
                          let icon: React.ReactNode = null

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
                        {getYoutubeEmbedUrl(mcq.videoUrl) ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 shadow-inner">
                            <iframe
                              src={getYoutubeEmbedUrl(mcq.videoUrl) || undefined}
                              title="Video Lecture"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Invalid video URL</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
