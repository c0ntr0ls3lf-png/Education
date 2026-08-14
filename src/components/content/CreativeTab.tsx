'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MathRenderer } from '@/components/exam/MathRenderer'
import QuestionBadges from '@/components/shared/QuestionBadges'
import { ListChecks, Award, BookOpen, Youtube, ChevronDown, ChevronUp, Search, X, Filter } from 'lucide-react'

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
  schoolName?: string | null
}

interface CreativeTabProps {
  creativeQuestions: CreativeQuestion[]
  isAdmin?: boolean
  onEdit?: (cq: CreativeQuestion) => void
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

// ─── Source type labels ────────────────────────────────
const sourceTypeLabels: Record<string, string> = {
  board: 'বোর্ড',
  school: 'স্কুল',
  model_test: 'মডেল টেস্ট',
  custom: 'কাস্টম',
}

// ─── Component ──────────────────────────────────────────
export default function CreativeTab({ creativeQuestions, isAdmin, onEdit }: CreativeTabProps) {
  // Track open sub-answer per question card (accordion / radio style)
  // Value is the subIdx of the currently open sub-answer for each questionId, or -1 if none
  const [openSubAnswer, setOpenSubAnswer] = useState<Record<string, number>>({})
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  // Accordion toggle: clicking same sub closes it; clicking another opens it and closes the previous
  const toggleSubAnswer = (questionId: string, subIdx: number) => {
    setOpenSubAnswer((prev) => {
      const current = prev[questionId] ?? -1
      return {
        ...prev,
        [questionId]: current === subIdx ? -1 : subIdx,
      }
    })
  }

  // Helper to split question and answer from segment text
  const splitQuestionAndAnswer = (text: string) => {
    if (!text) return { question: '', answer: null }

    const delimiters = [
      '<hr>',
      '<hr />',
      '<strong>উত্তর:</strong>',
      '<strong>উত্তর :</strong>',
      '<b>উত্তর:</b>',
      '<b>উত্তর :</b>',
      'উত্তর:',
      'উত্তর :',
      '<strong>Ans:</strong>',
      '<strong>Answer:</strong>',
      'Ans:',
      'Answer:',
    ]

    for (const delimiter of delimiters) {
      if (text.includes(delimiter)) {
        const parts = text.split(delimiter)
        return {
          question: parts[0].trim(),
          answer: parts.slice(1).join(delimiter).trim(),
        }
      }
    }

    const regex = /(<p>)?\s*(উত্তর|Ans|Answer)\s*:\s*(<\/p>)?/i
    const match = text.match(regex)
    if (match && match.index !== undefined) {
      return {
        question: text.substring(0, match.index).trim(),
        answer: text.substring(match.index + match[0].length).trim(),
      }
    }

    return { question: text, answer: null }
  }

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
    creativeQuestions.forEach((q) => {
      if (q.exam_year) years.add(String(q.exam_year))
      if (q.board_name) boards.add(q.board_name)
      if (q.sourceType) sources.add(q.sourceType)
    })
    return {
      uniqueYears: Array.from(years).sort((a, b) => Number(b) - Number(a)),
      uniqueBoards: Array.from(boards).sort(),
      uniqueSources: Array.from(sources).sort(),
    }
  }, [creativeQuestions])

  // ─── Filtered questions ──────────────────────────────
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const sorted = [...creativeQuestions].sort((a, b) => {
      const labelCompare = a.label.localeCompare(b.label)
      if (labelCompare !== 0) return labelCompare
      return (a.order || 0) - (b.order || 0)
    })
    return sorted.filter((cq) => {
      // Text search: question, answer, sub-questions, board, school, year
      const matchText = !q || [
        cq.question,
        cq.answer,
        cq.board_name,
        cq.schoolName,
        cq.exam_year ? String(cq.exam_year) : '',
        cq.subQuestionA, cq.subQuestionB, cq.subQuestionC,
      ].some((field) => (field || '').toLowerCase().includes(q))

      const matchYear = filterYear === 'all' || String(cq.exam_year) === filterYear
      const matchBoard = filterBoard === 'all' || (cq.board_name || '').toLowerCase() === filterBoard.toLowerCase()
      const matchSource = filterSource === 'all' || cq.sourceType === filterSource

      return matchText && matchYear && matchBoard && matchSource
    })
  }, [creativeQuestions, searchQuery, filterYear, filterBoard, filterSource])

  const hasActiveFilters = searchQuery || filterYear !== 'all' || filterBoard !== 'all' || filterSource !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear('all')
    setFilterBoard('all')
    setFilterSource('all')
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
              className="pl-8 pr-8 h-9 text-sm bg-background border-border/60 focus:border-emerald-400 dark:focus:border-emerald-600"
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
            className={`h-9 gap-1.5 shrink-0 text-xs ${showFilters ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''}`}
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
                className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
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
                  className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 max-w-[160px]"
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
                  className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
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
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filteredQuestions.length}</span>
            {' '}টি প্রশ্ন পাওয়া গেছে (মোট {creativeQuestions.length}টির মধ্যে)
          </p>
        )}
      </div>

      {/* ─── No Results ──────────────────────────────────── */}
      {filteredQuestions.length === 0 && hasActiveFilters && (
        <div className="text-center py-8 border border-dashed border-border/40 rounded-xl">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground/60 mt-1">অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন</p>
          <button onClick={clearFilters} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            সব ফিল্টার সরিয়ে দিন
          </button>
        </div>
      )}

      {/* ─── Questions List ───────────────────────────────── */}
      <div className="space-y-2">
        {filteredQuestions.map((question, index) => {
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
                {/* Main Question Stem Row — Stimulus / Scenario */}
                <div
                  className="flex items-start gap-2 select-none px-2 py-1 -mx-2 -my-1 rounded-lg transition-colors"
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${config.bg} ${config.text} text-[10px] font-bold`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <MathRenderer
                        content={question.question}
                        className="text-sm leading-relaxed flex-1 min-w-[200px] font-semibold"
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
                      {hasVideo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); toggleVideo(question.id) }}
                          className="h-5 text-[9px] gap-1 px-1.5 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded"
                        >
                          <Youtube className="h-3 w-3" />
                          {isVideoVisible ? 'ভিডিও বন্ধ করুন' : 'ভিডিও ক্লাস'}
                        </Button>
                      )}
                      {isAdmin && onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onEdit(question) }}
                          className="h-5 text-[9px] border-muted-foreground/20 hover:bg-muted text-muted-foreground hover:text-foreground px-1.5 flex items-center gap-0.5"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Embedded Video Player */}
                {hasVideo && isVideoVisible && (
                  <div className="ml-7 border-t border-rose-100 dark:border-rose-900/30 pt-3 mt-2">
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

                {/* Sub Questions List (Always visible if they exist) */}
                {hasSubQuestions && (
                  <div className="ml-7 space-y-2 border-t border-dashed border-indigo-100 dark:border-indigo-950/30 pt-3">
                    <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <ListChecks className="h-2.5 w-2.5" />
                      উপ-প্রশ্নসমূহ (উত্তরের জন্য যেকোনো প্রশ্নে ক্লিক করুন)
                    </p>
                    <div className="space-y-2">
                      {subQs.map((sq, sqIdx) => {
                        const { question: qText, answer: aText } = splitQuestionAndAnswer(sq.text)
                        const isAnsOpen = (openSubAnswer[question.id] ?? -1) === sqIdx

                        return (
                          <div key={sqIdx} className="space-y-1.5">
                            {/* Question Row — accordion trigger */}
                            <div
                              onClick={() => aText && toggleSubAnswer(question.id, sqIdx)}
                              className={`flex items-start gap-2 rounded-lg p-2.5 border transition-all duration-150 ${
                                isAnsOpen
                                  ? 'bg-indigo-100/60 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40'
                                  : 'bg-indigo-50/30 dark:bg-indigo-950/5 border-indigo-100/40 dark:border-indigo-950/10'
                              } ${
                                aText
                                  ? 'cursor-pointer hover:bg-indigo-100/40 dark:hover:bg-indigo-900/10 active:scale-[0.99]'
                                  : 'cursor-default'
                              }`}
                            >
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors ${
                                isAnsOpen
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                              }`}>
                                {sq.label}
                              </span>
                              <MathRenderer
                                content={qText}
                                className="text-sm leading-relaxed text-foreground/90 flex-1 font-medium"
                              />
                              {aText && (
                                <div className="shrink-0 text-indigo-600 dark:text-indigo-400 flex items-center">
                                  {isAnsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </div>
                              )}
                            </div>

                            {/* Answer Box — slides in below the clicked question */}
                            {aText && isAnsOpen && (
                              <div className="ml-7 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/20 rounded-lg p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1 border-b border-emerald-100/50 dark:border-emerald-900/20 pb-1.5">
                                  <BookOpen className="h-3 w-3" />
                                  সমাধান ({sq.label}):
                                </p>
                                <MathRenderer
                                  content={aText}
                                  className="text-sm leading-relaxed text-foreground/90"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Model Answer Box for general questions without sub-questions */}
                {question.answer && !hasSubQuestions && (
                  <div className="ml-7 border-t border-dashed border-emerald-100 dark:border-emerald-950/30 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswer(question.id)}
                      className="h-6 text-[10px] gap-1 px-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {isAnswerVisible ? 'উত্তর বন্ধ করুন' : 'উত্তর দেখুন'}
                    </Button>
                    {isAnswerVisible && (
                      <div className="mt-2 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 space-y-2">
                        <MathRenderer
                          content={question.answer}
                          className="text-sm leading-relaxed text-foreground/90"
                        />
                      </div>
                    )}
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
