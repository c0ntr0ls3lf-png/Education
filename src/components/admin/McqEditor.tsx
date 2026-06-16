'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import QuestionEditor from './QuestionEditor'
import MetadataFields from './MetadataFields'
import ExplanationAccordion from './ExplanationAccordion'

// ─── Types ─────────────────────────────────────────────────────────────────

interface SubMcq {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
}

export interface McqFormData {
  // Core
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  mcqType: 'single' | 'multiple_statement' | 'stem_based'
  // Multiple statement
  statements: string // JSON
  correctCombination: string
  // Stem based
  stem: string
  subMcqs: string // JSON
  // Metadata
  year: string
  board: string
  schoolName: string
  board_name: string
  exam_year: string
  sourceType: string
  // Explanation
  explanation: string
  tips: string
  videoUrl: string
  // Other
  marks: number
  difficulty: string
}

interface McqEditorProps {
  initialData?: Partial<McqFormData>
  chapterId: string
  onSave: (data: McqFormData) => void
  onDelete?: () => void
  onCancel: () => void
  isSaving?: boolean
}

const EMPTY_MCQ: McqFormData = {
  question: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: 'A', mcqType: 'single',
  statements: '["","",""]', correctCombination: '',
  stem: '', subMcqs: '[]',
  year: '', board: '', schoolName: '',
  board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'custom',
  explanation: '', tips: '', videoUrl: '',
  marks: 1, difficulty: 'medium',
}

export default function McqEditor({
  initialData, chapterId, onSave, onDelete, onCancel, isSaving,
}: McqEditorProps) {
  const [form, setForm] = useState<McqFormData>({ ...EMPTY_MCQ, ...initialData })
  const [subMcqList, setSubMcqList] = useState<SubMcq[]>(() => {
    try { return JSON.parse(form.subMcqs || '[]') } catch { return [] }
  })
  const [stmtList, setStmtList] = useState<string[]>(() => {
    try { return JSON.parse(form.statements || '["","",""]') } catch { return ['', '', ''] }
  })

  const set = <K extends keyof McqFormData>(key: K, val: McqFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    const finalForm = { ...form };
    // Map metadata fields to legacy fields for compatibility
    finalForm.board = form.board_name;
    finalForm.year = form.exam_year;
    if (form.mcqType === 'stem_based') {
      finalForm.subMcqs = JSON.stringify(subMcqList);
    }
    if (form.mcqType === 'multiple_statement') {
      finalForm.statements = JSON.stringify(stmtList);
    }
    onSave(finalForm);
  }

  // ─── Sub-MCQ helpers ───────────────────────────────────────────────────

  const addSubMcq = () => {
    setSubMcqList([
      ...subMcqList,
      { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' },
    ])
  }

  const updateSubMcq = (idx: number, field: keyof SubMcq, val: string) => {
    setSubMcqList((list) =>
      list.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    )
  }

  const removeSubMcq = (idx: number) => {
    setSubMcqList((list) => list.filter((_, i) => i !== idx))
  }

  // ─── Statement helpers ─────────────────────────────────────────────────

  const updateStatement = (idx: number, val: string) => {
    setStmtList((list) => list.map((s, i) => (i === idx ? val : s)))
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {initialData?.question ? 'Edit MCQ Question' : 'New MCQ Question'}
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

      {/* MCQ Type Selector */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Question Type
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            ['single', 'Single Choice'],
            ['multiple_statement', 'Multiple Statements'],
            ['stem_based', 'Stem-Based'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => set('mcqType', key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                form.mcqType === key
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-background border-input hover:border-emerald-300 text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── SINGLE CHOICE ─────────────────────────────────────────── */}
      {form.mcqType === 'single' && (
        <div className="space-y-4">
          <QuestionEditor
            value={form.question}
            onChange={(v) => set('question', v)}
            label="Question"
            placeholder="Enter the question..."
            minHeight={80}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set('correctAnswer', opt)}
                  className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    form.correctAnswer === opt
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'border-muted-foreground/30 text-muted-foreground hover:border-emerald-400'
                  }`}
                >
                  {opt}
                </button>
                <QuestionEditor
                  value={form[`option${opt}` as keyof McqFormData] as string}
                  onChange={(v) => set(`option${opt}` as keyof McqFormData, v)}
                  placeholder={`Option ${opt}`}
                  minHeight={40}
                  label=""
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MULTIPLE STATEMENTS ───────────────────────────────────── */}
      {form.mcqType === 'multiple_statement' && (
        <div className="space-y-4">
          <QuestionEditor
            value={form.question}
            onChange={(v) => set('question', v)}
            label="Main Question"
            placeholder="Enter the question that references the statements below..."
            minHeight={60}
          />

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Statements
            </Label>
            {stmtList.map((stmt, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-2 shrink-0 font-mono">
                  {['i', 'ii', 'iii'][i]}
                </Badge>
                <QuestionEditor
                  value={stmt}
                  onChange={(v) => updateStatement(i, v)}
                  placeholder={`Statement ${['i', 'ii', 'iii'][i]}...`}
                  minHeight={50}
                  label=""
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Correct Combination
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                'i only', 'ii only', 'iii only',
                'i & ii', 'i & iii', 'ii & iii',
                'i, ii & iii',
              ].map((combo) => (
                <button
                  key={combo}
                  type="button"
                  onClick={() => set('correctCombination', combo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.correctCombination === combo
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-input hover:border-emerald-300'
                  }`}
                >
                  {combo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── STEM-BASED ────────────────────────────────────────────── */}
      {form.mcqType === 'stem_based' && (
        <div className="space-y-4">
          <QuestionEditor
            value={form.stem}
            onChange={(v) => set('stem', v)}
            label="Common Stem (Paragraph / Image)"
            placeholder="Enter the shared paragraph, data table, or image URL that all sub-questions reference..."
            minHeight={100}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sub-Questions ({subMcqList.length})
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubMcq}>
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </div>

            {subMcqList.map((sub, idx) => (
              <div
                key={idx}
                className="rounded-lg border p-4 space-y-3 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Q{idx + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeSubMcq(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <QuestionEditor
                  value={sub.question}
                  onChange={(v) => updateSubMcq(idx, 'question', v)}
                  placeholder="Sub-question..."
                  minHeight={50}
                  label=""
                />
                <div className="grid grid-cols-2 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <div key={opt} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateSubMcq(idx, 'correctAnswer', opt)}
                        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                          sub.correctAnswer === opt
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-muted-foreground/30 text-muted-foreground hover:border-emerald-400'
                        }`}
                      >
                        {opt}
                      </button>
                      <QuestionEditor
                        value={sub[`option${opt}`]}
                        onChange={(v) => updateSubMcq(idx, `option${opt}` as keyof SubMcq, v)}
                        placeholder={`Option ${opt}`}
                        minHeight={36}
                        label=""
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Video Lecture URL
        </Label>
        <Input
          className="h-9 text-sm"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.videoUrl}
          onChange={(e) => set('videoUrl', e.target.value)}
        />
      </div>

      {/* Explanation Accordion */}
      <ExplanationAccordion
        solution={form.explanation}
        tips={form.tips}
        videoUrl={form.videoUrl}
        onChange={(field, val) => {
          if (field === 'solution') set('explanation', val)
          else if (field === 'tips') set('tips', val)
          else set('videoUrl', val)
        }}
      />

      {/* Marks & Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Marks</Label>
          <Input
            type="number"
            className="h-9 text-sm"
            value={form.marks}
            onChange={(e) => set('marks', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Difficulty</Label>
          <Select value={form.difficulty} onValueChange={(v) => set('difficulty', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
