'use client'

import { useState } from 'react'
import {
  Save, Trash2, X, Plus, GripVertical, ChevronDown, ChevronRight,
  Lightbulb, Youtube, FileText, UploadCloud, CheckCircle2, ArrowUp, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import QuestionEditor from './QuestionEditor'
import { htmlToPlainText } from '@/lib/html-utils'

export interface SubQuestion {
  id: string
  label: string      // ক, খ, গ...
  question: string
  solution: string
  videoUrl: string
}

export interface ExplanationFormData {
  type: 'single' | 'group'
  question: string
  solution: string
  videoUrl: string
  difficulty: string
  order: number | ''
  isActive: boolean
  subQuestions: string // JSON representation of SubQuestion[]
}

interface ExplanationEditorProps {
  initialData?: Partial<ExplanationFormData>
  chapterId: string
  onSave: (data: ExplanationFormData) => void
  onDelete?: () => void
  onCancel: () => void
  isSaving?: boolean
}

const EMPTY_EXP: ExplanationFormData = {
  type: 'single',
  question: '',
  solution: '',
  videoUrl: '',
  difficulty: 'medium',
  order: 0,
  isActive: true,
  subQuestions: '[]',
}

export default function ExplanationEditor({
  initialData, chapterId, onSave, onDelete, onCancel, isSaving,
}: ExplanationEditorProps) {
  const [form, setForm] = useState<ExplanationFormData>({ ...EMPTY_EXP, ...initialData })
  const [subQuestionList, setSubQuestionList] = useState<SubQuestion[]>(() => {
    try {
      return JSON.parse(form.subQuestions || '[]')
    } catch {
      return []
    }
  })
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({})
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const set = <K extends keyof ExplanationFormData>(key: K, val: ExplanationFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleSolution = (id: string) => {
    setOpenSolutions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const addSubQuestion = () => {
    const bengaliLabels = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']
    const nextLabel = bengaliLabels[subQuestionList.length] || String.fromCharCode(97 + subQuestionList.length)
    const newSub: SubQuestion = {
      id: `sub-${Date.now()}-${subQuestionList.length}-${Math.random().toString(36).substr(2, 9)}`,
      label: nextLabel,
      question: '',
      solution: '',
      videoUrl: '',
    }
    setSubQuestionList([...subQuestionList, newSub])
    setOpenSolutions((prev) => ({ ...prev, [newSub.id]: true }))
  }

  const updateSubQuestion = (subId: string, field: keyof SubQuestion, val: string) => {
    setSubQuestionList((list) =>
      list.map((sub) => (sub.id === subId ? { ...sub, [field]: val } : sub))
    )
  }

  const removeSubQuestion = (subId: string) => {
    setSubQuestionList((list) => list.filter((sub) => sub.id !== subId))
  }

  const moveSubQuestion = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= subQuestionList.length) return
    const updated = [...subQuestionList]
    const temp = updated[idx]
    updated[idx] = updated[newIdx]
    updated[newIdx] = temp
    setSubQuestionList(updated)
  }

  const handleBulkImport = () => {
    if (!bulkText.trim()) return

    const lines = bulkText.split('\n')
    const parsedSubs: SubQuestion[] = []
    let firstLine = ''

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // If it is the first line and not starting with a sub-question pattern
      if (!firstLine && !line.match(/^([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]/)) {
        firstLine = line
        continue
      }

      const subMatch = line.match(/^([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]+(.*)$/)
      if (subMatch) {
        parsedSubs.push({
          id: `sub-${Date.now()}-${parsedSubs.length}-${Math.random().toString(36).substr(2, 9)}`,
          label: subMatch[1],
          question: subMatch[2].trim(),
          solution: '',
          videoUrl: '',
        })
      } else {
        const inlineSubs = [...line.matchAll(/([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]+([^কখগঘঙচছজঝঞa-gA-G\n\r]*?)(?=(?:\s*[কখগঘঙচছজঝঞa-gA-G][\)\.\-\s])|$)/g)]
        if (inlineSubs.length > 0) {
          inlineSubs.forEach((m, idx) => {
            parsedSubs.push({
              id: `sub-${Date.now()}-${parsedSubs.length + idx}-${Math.random().toString(36).substr(2, 9)}`,
              label: m[1],
              question: m[2].trim(),
              solution: '',
              videoUrl: '',
            })
          })
        } else {
          const bengaliLabels = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']
          parsedSubs.push({
            id: `sub-${Date.now()}-${parsedSubs.length}-${Math.random().toString(36).substr(2, 9)}`,
            label: bengaliLabels[parsedSubs.length] || String.fromCharCode(97 + parsedSubs.length),
            question: line,
            solution: '',
            videoUrl: '',
          })
        }
      }
    }

    if (firstLine) {
      set('question', firstLine)
    }
    setSubQuestionList([...subQuestionList, ...parsedSubs])
    setBulkText('')
    setBulkImportOpen(false)
  }

  const handleSave = () => {
    const finalForm = {
      ...form,
      subQuestions: form.type === 'group' ? JSON.stringify(subQuestionList) : '[]',
      order: form.order === '' ? 0 : (parseInt(form.order as any) || 0)
    };

    if (form.type === 'group') {
      if (subQuestionList.length === 0) {
        alert('Add at least one sub-question (ক, খ, গ...)');
        return;
      }
      if (!htmlToPlainText(finalForm.question)) {
        finalForm.question = subQuestionList[0]?.question || 'Group question';
      }
    } else if (!htmlToPlainText(finalForm.question)) {
      alert('Question body is required');
      return;
    }

    onSave(finalForm);
  };

  const isGroup = form.type === 'group'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {initialData?.question ? 'Edit Main Book Q&A' : 'New Main Book Q&A'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Options Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between pb-3 border-b">
        <div className="space-y-0.5">
          <Label className="text-xs font-semibold text-muted-foreground">Question Layout Type</Label>
          <p className="text-[10px] text-muted-foreground/80">Group layout is perfect for subdivisions (e.g. 1. ক, খ, গ)</p>
        </div>
        <div className="flex gap-2 items-center">
          {isGroup && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulkImportOpen(true)}
              className="h-8 gap-1 border-dashed border-teal-500/50 hover:bg-teal-50 text-teal-600 dark:text-teal-400 text-xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Bulk Import
            </Button>
          )}
          <div className="flex rounded-lg border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => set('type', 'single')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                !isGroup ? "bg-white dark:bg-gray-800 text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Single Question
            </button>
            <button
              type="button"
              onClick={() => set('type', 'group')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                isGroup ? "bg-white dark:bg-gray-800 text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Group / Section
            </button>
          </div>
        </div>
      </div>

      {/* Main Question / Instruction Field */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {isGroup ? "Heading / Instruction" : "Question Body"}
        </Label>
        <QuestionEditor
          value={form.question}
          onChange={(v) => set('question', v)}
          label=""
          placeholder={isGroup ? "e.g. ১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:" : "Enter the question body..."}
          minHeight={100}
        />
      </div>

      {/* IF SINGLE: Show Solution & Video */}
      {!isGroup && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Solution / Explanation
              </Label>
              <Button
                type="button"
                variant={openSolutions['single'] ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSolution('single')}
                className={cn(
                  'h-7 text-xs gap-1',
                  openSolutions['single']
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                    : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                )}
              >
                <Lightbulb className="h-3 w-3" />
                {openSolutions['single'] ? 'Hide Solution' : 'Add Solution'}
              </Button>
            </div>
            {openSolutions['single'] && (
              <QuestionEditor
                value={form.solution}
                onChange={(v) => set('solution', v)}
                label=""
                placeholder="Enter the detailed solution or explanation..."
                minHeight={150}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              YouTube URL (Video Lecture)
            </Label>
            <div className="relative">
              <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-9 pl-8 text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => set('videoUrl', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* IF GROUP: Show Sub-questions List */}
      {isGroup && (
        <div className="space-y-4 pt-3 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Sub-questions (ক, খ, গ...)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSubQuestion}
              className="h-8 text-xs gap-1 border-dashed text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Sub-question
            </Button>
          </div>

          <div className="space-y-4 pl-3 border-l-2 border-muted">
            {subQuestionList.map((sub, sIdx) => {
              const isSubSolOpen = !!openSolutions[sub.id]
              return (
                <div
                  key={sub.id}
                  className="p-4 bg-muted/10 border rounded-xl space-y-3 relative hover:bg-muted/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 cursor-grab" />
                      <Input
                        value={sub.label}
                        onChange={(e) => updateSubQuestion(sub.id, 'label', e.target.value)}
                        placeholder="Label"
                        className="h-7 w-12 text-center text-xs font-bold bg-background"
                      />
                      <span className="text-[10px] text-muted-foreground/70">e.g. ক / a</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={sIdx === 0}
                        className="h-6 w-6 text-muted-foreground hover:bg-accent"
                        onClick={() => moveSubQuestion(sIdx, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={sIdx === subQuestionList.length - 1}
                        className="h-6 w-6 text-muted-foreground hover:bg-accent"
                        onClick={() => moveSubQuestion(sIdx, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeSubQuestion(sub.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Question Body</Label>
                    <QuestionEditor
                      value={sub.question}
                      onChange={(v) => updateSubQuestion(sub.id, 'question', v)}
                      placeholder="e.g. 2a + 3b"
                      minHeight={60}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                    <div className="flex-1 space-y-1 w-full">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Video URL</Label>
                      <div className="relative">
                        <Youtube className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={sub.videoUrl}
                          onChange={(e) => updateSubQuestion(sub.id, 'videoUrl', e.target.value)}
                          placeholder="Video URL for this part..."
                          className="h-8 pl-7 text-[11px]"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={isSubSolOpen ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSolution(sub.id)}
                      className={cn(
                        'h-8 gap-1 shrink-0 text-xs w-full sm:w-auto',
                        isSubSolOpen
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                          : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      )}
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      {isSubSolOpen ? 'Hide Solution' : 'Add Solution'}
                    </Button>
                  </div>

                  {isSubSolOpen && (
                    <div className="pt-2.5 border-t border-emerald-100 dark:border-emerald-900/30 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Solution for part {sub.label}
                      </Label>
                      <QuestionEditor
                        value={sub.solution}
                        onChange={(v) => updateSubQuestion(sub.id, 'solution', v)}
                        placeholder="Write step-by-step math steps for this sub-question..."
                        minHeight={80}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {subQuestionList.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-lg bg-card/25">
                <FileText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-1" />
                <p className="text-xs font-semibold text-muted-foreground">No sub-questions added yet</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSubQuestion}
                  className="h-7 text-xs text-emerald-600 hover:bg-emerald-50/50 mt-1.5"
                >
                  Click here to add the first sub-question (ক)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata Fields (Difficulty & Order) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
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

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Order / Position</Label>
          <Input
            type="number"
            className="h-9 text-sm"
            value={form.order}
            onChange={(e) => {
              const val = e.target.value;
              set('order', val === '' ? '' : parseInt(val) || 0);
            }}
          />
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

      {/* --- BULK IMPORT DIALOG --- */}
      <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-teal-600" />
              Smart Bulk Question Import
            </DialogTitle>
            <DialogDescription>
              Copy textbook pages and paste them below. The parser automatically structures questions and sub-questions!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-lg text-xs space-y-1 text-emerald-800 dark:text-emerald-300 leading-normal">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Matches Formats like:
              </p>
              <p>• <strong>১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:</strong> (First line: sets main heading/instruction)</p>
              <p>• <strong>ক) 2a + 3b</strong> or <strong>খ. (x + y)</strong> (Matches sub-questions)</p>
              <p>• <strong>ক) \sqrt{5} খ) \sqrt{7}</strong> (Inline sub-questions get automatically parsed!)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Paste Text Here</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:
ক) 2a + 3b
খ) x^2 + 2/y^2"
                rows={10}
                className="font-mono text-xs p-3 leading-relaxed focus-visible:ring-emerald-500/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkImportOpen(false)} className="h-9">
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={!bulkText.trim()}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Analyze & Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
