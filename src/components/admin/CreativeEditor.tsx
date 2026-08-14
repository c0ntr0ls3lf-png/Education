'use client'

import { useState } from 'react'
import { Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import QuestionEditor from './QuestionEditor'
import MetadataFields from './MetadataFields'
import { htmlToPlainText } from '@/lib/html-utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CqFormData {
  // Core
  label: string
  question: string
  answer: string
  marks: number | ''
  difficulty: string
  // Metadata
  year: string
  board: string
  schoolName: string
  board_name: string
  exam_year: string
  sourceType: string
  // CQ Segments (ক/খ/গ/ঘ)
  segmentK: string
  segmentKh: string
  segmentG: string
  segmentGh: string
  solutionK: string
  solutionKh: string
  solutionG: string
  solutionGh: string
  marksK: number | ''
  marksKh: number | ''
  marksG: number | ''
  marksGh: number | ''
  // Explanation
  explanation: string
  tips: string
  videoUrl: string
}

interface CreativeEditorProps {
  initialData?: Partial<CqFormData>
  chapterId: string
  onSave: (data: CqFormData) => void
  onDelete?: () => void
  onCancel: () => void
  isSaving?: boolean
}

const EMPTY_CQ: CqFormData = {
  label: '', question: '', answer: '', marks: 10, difficulty: 'medium',
  year: '', board: '', schoolName: '',
  board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'custom',
  segmentK: '', segmentKh: '', segmentG: '', segmentGh: '',
  solutionK: '', solutionKh: '', solutionG: '', solutionGh: '',
  marksK: 2, marksKh: 3, marksG: 4, marksGh: 4,
  explanation: '', tips: '', videoUrl: '',
}

const SEGMENTS = [
  { key: 'segmentK' as const, solutionKey: 'solutionK' as const, marksKey: 'marksK' as const, label: 'ক (Ka)', color: 'emerald' },
  { key: 'segmentKh' as const, solutionKey: 'solutionKh' as const, marksKey: 'marksKh' as const, label: 'খ (Kha)', color: 'blue' },
  { key: 'segmentG' as const, solutionKey: 'solutionG' as const, marksKey: 'marksG' as const, label: 'গ (Ga)', color: 'amber' },
  { key: 'segmentGh' as const, solutionKey: 'solutionGh' as const, marksKey: 'marksGh' as const, label: 'ঘ (Gha)', color: 'purple' },
] as const

const segmentColors: Record<string, string> = {
  emerald: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10',
  blue: 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10',
  amber: 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10',
  purple: 'border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/10',
}

const badgeColors: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function CreativeEditor({
  initialData, chapterId, onSave, onDelete, onCancel, isSaving,
}: CreativeEditorProps) {
  const [form, setForm] = useState<CqFormData>({ ...EMPTY_CQ, ...initialData })

  const set = <K extends keyof CqFormData>(key: K, val: CqFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    const finalForm = { ...form };
    finalForm.marks = form.marks === '' ? 10 : (parseInt(form.marks as any) || 10);
    finalForm.marksK = form.marksK === '' ? 2 : (parseInt(form.marksK as any) || 2);
    finalForm.marksKh = form.marksKh === '' ? 3 : (parseInt(form.marksKh as any) || 3);
    finalForm.marksG = form.marksG === '' ? 4 : (parseInt(form.marksG as any) || 4);
    finalForm.marksGh = form.marksGh === '' ? 4 : (parseInt(form.marksGh as any) || 4);
    finalForm.board = form.board_name;
    finalForm.year = form.exam_year;

    if (!htmlToPlainText(finalForm.question)) {
      alert('Stimulus / scenario text is required');
      return;
    }

    onSave(finalForm as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {initialData?.question ? 'Edit Creative Question' : 'New Creative Question'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Question Metadata
        </p>
        <MetadataFields
          board_name={form.board_name}
          exam_year={form.exam_year}
          sourceType={form.sourceType as any}
          onChange={(field, val) => set(field, val)}
        />
      </div>

      {/* Label & Main Stem */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Label</Label>
          <Input
            className="h-9 text-sm"
            placeholder="e.g. A, B, C..."
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
          />
        </div>
        <div className="sm:col-span-3 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Total Marks</Label>
          <Input
            type="number"
            className="h-9 text-sm"
            value={form.marks ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              set('marks', val === '' ? '' : parseInt(val) || 0);
            }}
          />
        </div>
      </div>

      {/* Stimulus / Scenario (Stem) */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Stimulus / Scenario
        </p>
        <QuestionEditor
          value={form.question}
          onChange={(v) => set('question', v)}
          label=""
          placeholder="Enter the stimulus, scenario, or context for this creative question..."
          minHeight={100}
        />
      </div>

      {/* 4 Segment Blocks */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Step-by-Step Sections
        </p>

        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            className={`rounded-lg border-2 p-4 space-y-4 ${segmentColors[seg.color]}`}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <Badge className={badgeColors[seg.color]}>
                {seg.label}
              </Badge>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Marks:</Label>
                <Input
                  type="number"
                  className="h-7 w-16 text-xs text-center"
                  value={form[seg.marksKey] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    set(seg.marksKey, val === '' ? '' : parseInt(val) || 0);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">প্রশ্ন / Question</Label>
              <QuestionEditor
                value={form[seg.key]}
                onChange={(v) => set(seg.key, v)}
                label=""
                placeholder={`Enter the ${seg.label} section question...`}
                minHeight={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">সমাধান / Solution</Label>
              <QuestionEditor
                value={form[seg.solutionKey]}
                onChange={(v) => set(seg.solutionKey, v)}
                label=""
                placeholder={`Enter the ${seg.label} section solution...`}
                minHeight={60}
              />
            </div>
          </div>
        ))}
      </div>

      {/* YouTube URL (stored in explanation field) */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          YouTube URL (Video Lecture)
        </Label>
        <Input
          className="h-9 text-sm"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.explanation}
          onChange={(e) => set('explanation', e.target.value)}
        />
      </div>

      {/* Answer */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Full Model Answer
        </Label>
        <QuestionEditor
          value={form.answer}
          onChange={(v) => set('answer', v)}
          label=""
          placeholder="Write the complete model answer for this question..."
          minHeight={120}
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Difficulty</Label>
        <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
          <SelectTrigger className="h-9 text-sm w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Question'}
        </Button>
        {onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
