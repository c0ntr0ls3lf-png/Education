'use client'

interface QuestionBadgesProps {
  board_name?: string | null
  boardName?: string | null
  board?: string | null
  exam_year?: number | null
  questionYear?: number | null
  year?: string | number | null
  sourceType?: string | null
  showHighlight?: boolean
}

/**
 * Displays source metadata badges for a question:
 * - Board/School name badge
 * - Year badge
 * - 🔥 Latest Board Question badge (if current year board question)
 */
export default function QuestionBadges({
  board_name,
  boardName,
  board,
  exam_year,
  questionYear,
  year,
  sourceType,
  showHighlight = true,
}: QuestionBadgesProps) {
  const resolvedBoardName = board_name || boardName || board || null;
  const rawYear = exam_year ?? questionYear ?? year ?? null;
  const resolvedYear = typeof rawYear === 'string' ? parseInt(rawYear, 10) : rawYear;

  if (!resolvedBoardName && !resolvedYear && !sourceType) return null

  const currentYear = new Date().getFullYear()
  const isCurrentYearBoard =
    showHighlight &&
    sourceType === 'board' &&
    resolvedYear === currentYear

  const hasValidName = resolvedBoardName && resolvedBoardName.trim().length > 0

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Board/School Name Badge */}
      {hasValidName && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border bg-indigo-50/70 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/30 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-indigo-100/50"
        >
          {resolvedBoardName}
        </span>
      )}

      {/* Year Badge */}
      {resolvedYear != null && !isNaN(resolvedYear) && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border bg-amber-50/70 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-amber-100/50"
        >
          {resolvedYear}
        </span>
      )}

      {/* Latest Board Question Highlight */}
      {isCurrentYearBoard && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm animate-pulse"
        >
          🔥 Latest Board Question
        </span>
      )}
    </div>
  )
}
