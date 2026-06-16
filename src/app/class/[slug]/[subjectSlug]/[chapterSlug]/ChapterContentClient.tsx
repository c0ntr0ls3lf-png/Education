'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Lightbulb, CheckSquare, ChevronDown, Check, SlidersHorizontal, BarChart2 } from 'lucide-react'
import ExplanationTab from '@/components/content/ExplanationTab'
import CreativeTab from '@/components/content/CreativeTab'
import McqTab from '@/components/content/McqTab'

// ─── Types ──────────────────────────────────────────────
interface Explanation {
  id: string
  question: string
  solution?: string | null
  videoUrl?: string | null
  difficulty: string
  order: number
}

interface CreativeQuestion {
  id: string
  label: string
  question: string
  answer?: string | null
  marks: number
  difficulty: string
  explanation?: string | null
  subQuestionA?: string | null
  subQuestionB?: string | null
  subQuestionC?: string | null
  order: number
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface McqQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string | null
  marks: number
  difficulty: string
  order: number
  board_name?: string | null
  exam_year?: number | null
  sourceType?: string | null
}

interface ChapterContentClientProps {
  explanations: Explanation[]
  creativeQuestions: CreativeQuestion[]
  mcqQuestions: McqQuestion[]
  totalCqCount: number
  totalMcqCount: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ChapterContentClient({
  explanations,
  creativeQuestions,
  mcqQuestions,
  totalCqCount,
  totalMcqCount,
}: ChapterContentClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const explanationCount = explanations.length
  const creativeCount = creativeQuestions.length
  const mcqCount = mcqQuestions.length

  // Determine default tab based on URL or what has content
  const defaultTab =
    explanationCount > 0
      ? 'explanations'
      : mcqCount > 0
        ? 'mcq'
        : creativeCount > 0
          ? 'creative'
          : 'explanations'

  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  // Filters State
  const [boards, setBoards] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true)

  // Dropdown UI States
  const [boardOpen, setBoardOpen] = useState<boolean>(false)
  const [yearOpen, setYearOpen] = useState<boolean>(false)

  const boardDropdownRef = useRef<HTMLDivElement>(null)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  // Get current filter values from URL
  const selectedBoardSlug = searchParams.get('board') || ''
  const selectedYear = searchParams.get('year') || ''

  // Fetch filter options on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const res = await fetch('/api/questions/filters')
        if (res.ok) {
          const data = await res.json()
          setBoards(data.boards || [])
          setYears(data.years || [])
        }
      } catch (err) {
        console.error('Failed to load filters:', err)
      } finally {
        setIsLoadingFilters(false)
      }
    }
    loadFilters()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardDropdownRef.current && !boardDropdownRef.current.contains(event.target as Node)) {
        setBoardOpen(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setYearOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Find original board name from slug
  const matchedBoard = boards.find(b => slugify(b) === selectedBoardSlug)
  const displayBoardName = matchedBoard || ''

  const handleFilterChange = (key: 'board' | 'year', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Get stats values
  const isMcq = activeTab === 'mcq'
  const isCreative = activeTab === 'creative'
  const isFilterable = isMcq || isCreative

  const tabTotal = isMcq ? totalMcqCount : totalCqCount
  const tabShowing = isMcq ? mcqCount : creativeCount

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/10">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="explanations" className="gap-1 py-1.5 text-xs flex-1 sm:flex-none">
            <BookOpen className="h-3.5 w-3.5" />
            Main Book
            {explanationCount > 0 && (
              <span className="ml-1 h-4 min-w-[16px] inline-flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1">
                {explanationCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mcq" className="gap-1 py-1.5 text-xs flex-1 sm:flex-none">
            <CheckSquare className="h-3.5 w-3.5" />
            MCQ
            {mcqCount > 0 && (
              <span className="ml-1 h-4 min-w-[16px] inline-flex items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[9px] font-bold px-1">
                {mcqCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="creative" className="gap-1 py-1.5 text-xs flex-1 sm:flex-none">
            <Lightbulb className="h-3.5 w-3.5" />
            Creative
            {creativeCount > 0 && (
              <span className="ml-1 h-4 min-w-[16px] inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-bold px-1">
                {creativeCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>


      </div>

      {/* Dynamic Statistics Header */}
      {isFilterable && (
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 px-3.5 py-2 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Total Questions: <strong>{tabTotal}</strong></span>
          </div>
          <span className="text-emerald-200 dark:text-emerald-800">|</span>
          <span>Showing: <strong>{tabShowing}</strong></span>
          {(selectedBoardSlug || selectedYear) && (
            <>
              <span className="text-emerald-200 dark:text-emerald-800">|</span>
              {selectedBoardSlug && (
                <span className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-semibold">
                  Board: {displayBoardName}
                </span>
              )}
              {selectedYear && (
                <span className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-semibold ml-1">
                  Year: {selectedYear}
                </span>
              )}
            </>
          )}
        </div>
      )}

      <TabsContent value="explanations" className="mt-0">
        <ExplanationTab explanations={explanations} />
      </TabsContent>

      <TabsContent value="mcq" className="mt-0">
        <McqTab mcqQuestions={mcqQuestions} />
      </TabsContent>

      <TabsContent value="creative" className="mt-0">
        <CreativeTab creativeQuestions={creativeQuestions} />
      </TabsContent>
    </Tabs>
  )
}
