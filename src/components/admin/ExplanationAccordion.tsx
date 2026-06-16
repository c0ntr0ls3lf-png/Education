'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'
import QuestionEditor from './QuestionEditor'

interface ExplanationAccordionProps {
  solution: string
  tips: string
  videoUrl: string
  onChange: (field: 'solution' | 'tips' | 'videoUrl', value: string) => void
}

export default function ExplanationAccordion({
  solution, tips, videoUrl, onChange,
}: ExplanationAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="explanation" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:no-underline">
          Interactive Explanation &amp; Solution
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Solution editor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Detailed Solution
            </Label>
            <QuestionEditor
              value={solution}
              onChange={(v) => onChange('solution', v)}
              placeholder="Write step-by-step solution here... Supports LaTeX with $formula$"
              minHeight={120}
              label=""
            />
          </div>

          {/* Tips */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Extra Tips &amp; Hints
            </Label>
            <QuestionEditor
              value={tips}
              onChange={(v) => onChange('tips', v)}
              placeholder="Additional tips, common mistakes, memory tricks..."
              minHeight={80}
              label=""
            />
          </div>

          {/* Video URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Video Lecture URL
            </Label>
            <Input
              className="h-9 text-sm"
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => onChange('videoUrl', e.target.value)}
            />
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
              >
                Open Video
              </a>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
