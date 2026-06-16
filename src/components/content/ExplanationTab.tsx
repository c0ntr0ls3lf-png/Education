'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

interface ExplanationTabProps {
  explanations: Explanation[]
}

// ─── Difficulty config ──────────────────────────────────
const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  hard: { label: 'Hard', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

// ─── Component ──────────────────────────────────────────
export default function ExplanationTab({ explanations }: ExplanationTabProps) {
  // Single-open accordion: only one solution visible at a time
  const [openId, setOpenId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
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
        const difficulty = difficultyConfig[explanation.difficulty] || difficultyConfig.medium

        return (
          <Card
            key={explanation.id}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-200"
          >
            <CardContent className="p-0">
              {/* Question Section - Compact Row */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: number + question text */}
                  <div className="flex items-center gap-2 min-w-0" style={{ maxWidth: '65%' }}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {index + 1}
                    </span>
                    <MathRenderer content={explanation.question} className="text-sm leading-snug" />
                  </div>
                  {/* Right: action buttons — always fixed to right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {explanation.solution && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(explanation.id)}
                        className="h-6 text-[10px] gap-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
                        <span>{isExpanded ? 'Hide' : 'Show'}</span>
                      </Button>
                    )}
                    {explanation.videoUrl && (
                      <VideoPlayer url={explanation.videoUrl} title={`Explanation ${index + 1}`} compact />
                    )}
                  </div>
                </div>
              </div>

              {/* Solution Section (Expandable) */}
              {explanation.solution && isExpanded && (
                <div className="border-t border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 px-3 sm:px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 uppercase tracking-wide">
                        Solution
                      </p>
                      <MathRenderer content={explanation.solution} className="text-sm leading-relaxed text-foreground/90" />
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
