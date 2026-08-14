'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, GripVertical, ChevronDown, ChevronRight, X,
  Lightbulb, Youtube, FileText, UploadCloud, CheckCircle2,
  ArrowUp, ArrowDown, HelpCircle, LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { RichTextEditor } from './EditChapterModal'

export interface SubQuestion {
  id: string
  label: string      // ক, খ, গ...
  question: string
  solution: string
  videoUrl: string
}

export interface MainBookEntry {
  id: string
  type: 'single' | 'group'
  question: string   // Question text (for 'single') or Heading/Instruction (for 'group')
  solution: string   // (for 'single')
  videoUrl: string   // (for 'single')
  subQuestions?: SubQuestion[] // (for 'group')
}

interface MainBookQAEditorProps {
  entries: MainBookEntry[]
  onChange: (updated: MainBookEntry[]) => void
}

export default function MainBookQAEditor({ entries, onChange }: MainBookQAEditorProps) {
  const [openEntries, setOpenEntries] = useState<Record<string, boolean>>({})
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({})
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const toggleEntry = (id: string) => {
    setOpenEntries((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSolution = (id: string) => {
    setOpenSolutions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const updateEntry = (id: string, updatedFields: Partial<MainBookEntry>) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    onChange(updated)
  }

  const addEntry = () => {
    const newId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newEntry: MainBookEntry = {
      id: newId,
      type: 'single',
      question: '',
      solution: '',
      videoUrl: '',
    }
    onChange([...entries, newEntry])
    setOpenEntries((prev) => ({ ...prev, [newId]: true }))
  }

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id))
  }

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= entries.length) return
    const updated = [...entries]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    onChange(updated)
  }

  // --- Sub-question operations ---
  const addSubQuestion = (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return

    const subQuestions = entry.subQuestions || []
    // Auto-generate next Bengali alphabetical label (ক, খ, গ, ঘ, ঙ, চ, ছ, জ, ঝ, ঞ)
    const bengaliLabels = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']
    const nextLabel = bengaliLabels[subQuestions.length] || String.fromCharCode(97 + subQuestions.length)

    const newSub: SubQuestion = {
      id: `sub-${Date.now()}-${subQuestions.length}-${Math.random().toString(36).substr(2, 9)}`,
      label: nextLabel,
      question: '',
      solution: '',
      videoUrl: '',
    }

    updateEntry(entryId, {
      subQuestions: [...subQuestions, newSub],
    })
  }

  const updateSubQuestion = (entryId: string, subId: string, updatedFields: Partial<SubQuestion>) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry || !entry.subQuestions) return

    const updatedSubs = entry.subQuestions.map((sub) =>
      sub.id === subId ? { ...sub, ...updatedFields } : sub
    )
    updateEntry(entryId, { subQuestions: updatedSubs })
  }

  const removeSubQuestion = (entryId: string, subId: string) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry || !entry.subQuestions) return

    updateEntry(entryId, {
      subQuestions: entry.subQuestions.filter((sub) => sub.id !== subId),
    })
  }

  const moveSubQuestion = (entryId: string, index: number, direction: 'up' | 'down') => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry || !entry.subQuestions) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= entry.subQuestions.length) return
    const updatedSubs = [...entry.subQuestions]
    const temp = updatedSubs[index]
    updatedSubs[index] = updatedSubs[newIndex]
    updatedSubs[newIndex] = temp
    updateEntry(entryId, { subQuestions: updatedSubs })
  }

  // --- Bulk Import Parsing ---
  const handleBulkImport = () => {
    if (!bulkText.trim()) return

    const lines = bulkText.split('\n')
    const parsedEntries: MainBookEntry[] = []
    let currentGroup: MainBookEntry | null = null

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // Regex matches lines starting with Bengali or English numerals: e.g. "১.", "1.", "১৫."
      const parentMatch = line.match(/^([১২৩৪৫৬৭৮৯০\d]+)[\.\-\s]+(.*)$/)
      if (parentMatch) {
        const num = parentMatch[1]
        const rest = parentMatch[2].trim()

        // Check if there are inline sub-questions on the same line (e.g. "ক) \sqrt{5} খ) \sqrt{7}")
        const inlineSubs = [...rest.matchAll(/([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]+([^কখগঘঙচছজঝঞa-gA-G\n\r]*?)(?=(?:\s*[কখগঘঙচছজঝঞa-gA-G][\)\.\-\s])|$)/g)]

        if (inlineSubs.length > 0) {
          const firstSubIndex = rest.search(/[কখগঘঙচছজঝঞa-gA-G][\)\.\-\s]/)
          const mainInstruction = firstSubIndex > 0 ? rest.substring(0, firstSubIndex).trim() : rest

          currentGroup = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'group',
            question: `${num}. ${mainInstruction}`,
            solution: '',
            videoUrl: '',
            subQuestions: inlineSubs.map((m, idx) => ({
              id: `sub-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
              label: m[1],
              question: m[2].trim(),
              solution: '',
              videoUrl: '',
            })),
          }
          parsedEntries.push(currentGroup)
        } else {
          // Normal group header or standalone question
          currentGroup = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'group',
            question: `${num}. ${rest}`,
            solution: '',
            videoUrl: '',
            subQuestions: [],
          }
          parsedEntries.push(currentGroup)
        }
      } else {
        // Line does not start with a number. Is it a sub-question (e.g., "ক) 2a + 3b")?
        const subMatch = line.match(/^([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]+(.*)$/)
        if (subMatch && currentGroup && currentGroup.type === 'group') {
          currentGroup.subQuestions!.push({
            id: `sub-${Date.now()}-${currentGroup.subQuestions!.length}-${Math.random().toString(36).substr(2, 9)}`,
            label: subMatch[1],
            question: subMatch[2].trim(),
            solution: '',
            videoUrl: '',
          })
        } else {
          // Search for multiple sub-questions inline (e.g. "ক) 2a খ) 3b") on a standalone line
          const inlineSubs = [...line.matchAll(/([কখগঘঙচছজঝঞa-gA-G])[\)\.\-\s]+([^কখগঘঙচছজঝঞa-gA-G\n\r]*?)(?=(?:\s*[কখগঘঙচছজঝঞa-gA-G][\)\.\-\s])|$)/g)]
          if (inlineSubs.length > 0 && currentGroup && currentGroup.type === 'group') {
            inlineSubs.forEach((m, idx) => {
              currentGroup!.subQuestions!.push({
                id: `sub-${Date.now()}-${currentGroup!.subQuestions!.length + idx}-${Math.random().toString(36).substr(2, 9)}`,
                label: m[1],
                question: m[2].trim(),
                solution: '',
                videoUrl: '',
              })
            })
          } else {
            // Standalone line without any active group context, parse as single question
            parsedEntries.push({
              id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'single',
              question: line,
              solution: '',
              videoUrl: '',
            })
            currentGroup = null
          }
        }
      }
    }

    // Cleanup: convert groups with 0 sub-questions to single questions
    const finalEntries: MainBookEntry[] = parsedEntries.map((e) => {
      if (e.type === 'group' && (!e.subQuestions || e.subQuestions.length === 0)) {
        return {
          id: e.id,
          type: 'single' as const,
          question: e.question,
          solution: '',
          videoUrl: '',
        }
      }
      return e
    })

    onChange([...entries, ...finalEntries])
    setBulkText('')
    setBulkImportOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-muted-foreground/10 mb-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 text-white border-0 font-mono">
            {entries.length} Parent Entries
          </Badge>
          <Badge className="bg-teal-500 text-white border-0 font-mono">
            {entries.reduce((acc, curr) => acc + (curr.type === 'group' ? curr.subQuestions?.length || 0 : 1), 0)} Total Qs
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBulkImportOpen(true)}
            className="h-9 gap-1.5 border-dashed border-teal-500/50 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-teal-600 dark:text-teal-400"
          >
            <UploadCloud className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addEntry}
            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const isExpanded = !!openEntries[entry.id]
          const isGroup = entry.type === 'group'

          return (
            <div
              key={entry.id}
              className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Header Bar */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 border-b cursor-pointer transition-colors",
                  isExpanded ? "bg-muted/40" : "bg-muted/10 hover:bg-muted/20"
                )}
                onClick={() => toggleEntry(entry.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0 cursor-grab" />
                  <Badge variant="outline" className="font-mono text-xs h-5 shrink-0 bg-emerald-50/55 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                    Q{idx + 1}
                  </Badge>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                    {isGroup ? 'Group / Section' : 'Single'}
                  </span>

                  {/* Tiny inline preview of the question */}
                  {!isExpanded && (
                    <div
                      className="text-xs text-muted-foreground truncate max-w-md ml-2"
                      dangerouslySetInnerHTML={{ __html: entry.question || 'No question text yet...' }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Order controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    className="h-7 w-7 text-muted-foreground hover:bg-accent"
                    onClick={() => moveEntry(idx, 'up')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={idx === entries.length - 1}
                    className="h-7 w-7 text-muted-foreground hover:bg-accent"
                    onClick={() => moveEntry(idx, 'down')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => toggleEntry(entry.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Body Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 border-t bg-card/50">
                      {/* Entry Type Select and Description info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between pb-3 border-b">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-semibold text-muted-foreground">Question Layout Type</Label>
                          <p className="text-[10px] text-muted-foreground/80">Group layout is perfect for subdivisions (e.g. 1. ক, খ, গ)</p>
                        </div>
                        <div className="flex rounded-lg border bg-muted/40 p-0.5 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => updateEntry(entry.id, { type: 'single', subQuestions: undefined })}
                            className={cn(
                              "px-3 py-1 text-xs font-medium rounded-md transition-all",
                              !isGroup ? "bg-white dark:bg-gray-800 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Single Question
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEntry(entry.id, { type: 'group', subQuestions: entry.subQuestions || [] })}
                            className={cn(
                              "px-3 py-1 text-xs font-medium rounded-md transition-all",
                              isGroup ? "bg-white dark:bg-gray-800 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Group / Section
                          </button>
                        </div>
                      </div>

                      {/* Parent / Main Instruction Field */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          {isGroup ? "Main Heading / Instruction" : "Question Body"}
                        </Label>
                        <RichTextEditor
                          value={entry.question}
                          onChange={(v) => updateEntry(entry.id, { question: v })}
                          placeholder={isGroup ? "e.g. ১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:" : "e.g. ৩. a - b = 4 হলে, a + b এর মান কত?"}
                          minHeight={80}
                          showMathButton
                        />
                      </div>

                      {/* IF SINGLE: Show Solution & Video */}
                      {!isGroup && (
                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col sm:flex-row items-end gap-3">
                            <div className="flex-1 space-y-1.5 w-full">
                              <Label className="text-xs font-semibold text-muted-foreground">Video Lecture URL</Label>
                              <div className="relative">
                                <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  value={entry.videoUrl}
                                  onChange={(e) => updateEntry(entry.id, { videoUrl: e.target.value })}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="h-9 pl-8 text-xs"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant={openSolutions[entry.id] ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleSolution(entry.id)}
                              className={cn(
                                'h-9 gap-1.5 shrink-0 self-start sm:self-auto w-full sm:w-auto',
                                openSolutions[entry.id]
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                                  : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                              )}
                            >
                              <Lightbulb className="h-4 w-4" />
                              {openSolutions[entry.id] ? 'Hide Solution' : 'Add Solution'}
                            </Button>
                          </div>

                          <AnimatePresence>
                            {openSolutions[entry.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/30 space-y-2">
                                  <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    Detailed Solution
                                  </Label>
                                  <RichTextEditor
                                    value={entry.solution}
                                    onChange={(v) => updateEntry(entry.id, { solution: v })}
                                    placeholder="Write the step-by-step reasoning or mathematical equations here..."
                                    minHeight={120}
                                    showMathButton
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* IF GROUP: Show Sub-questions Section */}
                      {isGroup && (
                        <div className="space-y-4 pt-3 border-t border-muted-foreground/10">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                              Sub-questions (ক, খ, গ...)
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSubQuestion(entry.id)}
                              className="h-7 text-xs gap-1 border-dashed text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Sub-question
                            </Button>
                          </div>

                          <div className="space-y-3 pl-3 border-l-2 border-muted">
                            {(entry.subQuestions || []).map((sub, sIdx) => {
                              const isSubSolOpen = !!openSolutions[sub.id]
                              return (
                                <div
                                  key={sub.id}
                                  className="p-3 bg-muted/20 border rounded-lg space-y-3 relative hover:bg-muted/30 transition-all"
                                >
                                  {/* Sub-header row */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 cursor-grab" />
                                      <Input
                                        value={sub.label}
                                        onChange={(e) => updateSubQuestion(entry.id, sub.id, { label: e.target.value })}
                                        placeholder="Label"
                                        className="h-6 w-12 text-center text-xs font-bold bg-white dark:bg-gray-800"
                                      />
                                      <span className="text-[10px] text-muted-foreground/70">e.g. ক / a</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={sIdx === 0}
                                        className="h-6 w-6 text-muted-foreground hover:bg-accent"
                                        onClick={() => moveSubQuestion(entry.id, sIdx, 'up')}
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={sIdx === (entry.subQuestions || []).length - 1}
                                        className="h-6 w-6 text-muted-foreground hover:bg-accent"
                                        onClick={() => moveSubQuestion(entry.id, sIdx, 'down')}
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                        onClick={() => removeSubQuestion(entry.id, sub.id)}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Question content */}
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-semibold text-muted-foreground">Question Body</Label>
                                    <RichTextEditor
                                      value={sub.question}
                                      onChange={(v) => updateSubQuestion(entry.id, sub.id, { question: v })}
                                      placeholder="e.g. 2a + 3b"
                                      minHeight={60}
                                      showMathButton
                                    />
                                  </div>

                                  {/* Sub Action buttons (solution and video) */}
                                  <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                                    <div className="flex-1 space-y-1 w-full">
                                      <Label className="text-[10px] font-semibold text-muted-foreground">Video URL</Label>
                                      <div className="relative">
                                        <Youtube className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                          value={sub.videoUrl}
                                          onChange={(e) => updateSubQuestion(entry.id, sub.id, { videoUrl: e.target.value })}
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

                                  {/* Expandable sub-solution */}
                                  <AnimatePresence>
                                    {isSubSolOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pt-2.5 border-t border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                                          <Label className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            Solution for part {sub.label}
                                          </Label>
                                          <RichTextEditor
                                            value={sub.solution}
                                            onChange={(v) => updateSubQuestion(entry.id, sub.id, { solution: v })}
                                            placeholder="Write step-by-step math steps for this sub-question..."
                                            minHeight={80}
                                            showMathButton
                                          />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}

                            {(entry.subQuestions || []).length === 0 && (
                              <div className="text-center py-6 border border-dashed rounded-lg bg-card/20">
                                <HelpCircle className="h-7 w-7 text-muted-foreground/30 mx-auto mb-1" />
                                <p className="text-xs font-medium text-muted-foreground">No sub-questions added yet</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addSubQuestion(entry.id)}
                                  className="h-7 text-xs text-emerald-600 hover:bg-emerald-50/50 mt-1.5"
                                >
                                  Click here to add the first sub-question (ক)
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card">
            <LayoutGrid className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No Q&A Entries Yet</p>
            <p className="text-xs text-muted-foreground/75 mt-1 mb-4">You can add entries manually or import them in bulk from textbook text.</p>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBulkImportOpen(true)}
                className="h-9 gap-1 border-dashed border-teal-500/50 hover:bg-teal-50 text-teal-600"
              >
                <UploadCloud className="h-4 w-4" />
                Bulk Import
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addEntry}
                className="h-9 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>
        )}
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
              Copy textbook pages (e.g. math exercises) and paste them below. The parser automatically structures questions and sub-questions!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-lg text-xs space-y-1 text-emerald-800 dark:text-emerald-300 leading-normal">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Matches Formats like:
              </p>
              <p>• <strong>১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:</strong> (Starts with a number: sets group heading)</p>
              <p>• <strong>ক) 2a + 3b</strong> or <strong>খ. (x + y)</strong> (Starts with letter: sets sub-questions)</p>
              <p>• <strong>৫. প্রমাণ করো ... ক) \sqrt{5} খ) \sqrt{7}</strong> (Inline sub-questions get automatically parsed!)</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Paste Text Here</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="১. সূত্রের সাহায্যে বর্গ নির্ণয় করো:
ক) 2a + 3b
খ) x^2 + 2/y^2

৩. a - b = 4 এবং ab = 60 হলে, a + b এর মান কত?"
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
