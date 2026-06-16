'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  BookOpen, Hash, Type, SlidersHorizontal, Eye, EyeOff,
  ChevronDown, ChevronRight, Bold, Italic, Underline,
  List, ListOrdered, Link2, ImageIcon, Smile, Palette,
  Save, Trash2, X, Loader2, AlertTriangle,
  CheckCircle, Clock, Globe, FileText,
  Lightbulb, CheckSquare, Plus, GripVertical,
  Sigma, ImagePlus, BookMarked, Youtube, Code
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import MetadataFields from './MetadataFields'

// ─── Types ────────────────────────────────────────────────────────────────

interface ClassItem {
  id: string; name: string; slug: string; number: number;
  description?: string; icon?: string; color?: string; order: number; isActive: boolean;
}

interface SubjectItem {
  id: string; name: string; slug: string; classId: string;
  description?: string; icon?: string; color?: string; order: number; isActive: boolean;
}

interface CreativeQuestionForm {
  id?: string
  _key: string
  label: string
  question: string
  answer: string
  marks: number
  explanation: string
  subQuestions: { label: string; text: string }[]
  board_name?: string
  exam_year?: string
  sourceType?: string
}

interface McqOptionItem {
  label: string
  text: string
}

interface McqForm {
  id?: string
  _key: string
  question: string
  options: McqOptionItem[]
  correctAnswer: string
  explanation: string
  videoUrl: string
  marks: number
  board_name?: string
  exam_year?: string
  sourceType?: string
}

interface ChapterData {
  id?: string;
  name: string;
  slug: string;
  subjectId: string;
  description?: string;
  sidebarContent?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  chapterType?: string;
  visibility?: boolean;
  /** Extended metadata stored as JSON string in description */
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

interface EditChapterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapter: ChapterData | null
  classes: ClassItem[]
  subjects: SubjectItem[]
  onSaved: () => void
}

type ChapterTab = 'main_book' | 'creative_question' | 'mcq'

// ─── Tab Configuration ─────────────────────────────────────────────────────

const TABS: { id: ChapterTab; label: string; icon: React.ElementType }[] = [
  { id: 'main_book', label: 'Main Book', icon: BookOpen },
  { id: 'creative_question', label: 'Creative Question', icon: Lightbulb },
  { id: 'mcq', label: 'MCQ', icon: CheckSquare },
]

const EMOJIS = [
  '📖', '📘', '📗', '📕', '📚', '📝', '✏️', '🎯', '💡', '🌟',
  '⭐', '🔥', '🎨', '🎭', '🎪', '🎤', '🎧', '🎵', '🎶', '🎬',
  '🏆', '🥇', '🥈', '🥉', '🏅', '🎯', '🎲', '🧩', '📐', '📏',
  '🔬', '🔭', '🧪', '🧬', '💻', '🖥️', '📱', '🌐', '📊', '📈',
  '🎓', '🏫', '📋', '📁', '🗂️', '📌', '📍', '✂️', '🔗', '📎',
  '💎', '🔮', '🌈', '⚡', '🌍', '🎉', '🎊', '✨', '💫', '🎈',
]

const LABEL_OPTIONS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
}

let keyCounter = 0
function uniqueKey(): string {
  return `_k_${++keyCounter}_${Date.now()}`
}

// ─── Segmented Tab Control ────────────────────────────────────────────────

function SegmentedTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ChapterTab
  onTabChange: (tab: ChapterTab) => void
}) {
  return (
    <div className="inline-flex items-center bg-muted/60 rounded-xl p-1 w-full sm:w-auto" role="tablist">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial',
              isActive
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-emerald-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            <span className="relative z-10 sm:hidden">
              {tab.label === 'Creative Question' ? 'Creative' : tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Source Type Badges ────────────────────────────────────────────────────

function SourceBadgeSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const SOURCE_TYPES = [
    { value: 'board', label: 'Board' },
    { value: 'school', label: 'School' },
    { value: 'model_test', label: 'Model Test' },
    { value: 'custom', label: 'Custom' },
  ]
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium mr-1">Source:</span>
      {SOURCE_TYPES.map((st) => (
        <button
          key={st.value}
          type="button"
          onClick={() => onChange(st.value)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all border ${
            value === st.value
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-background border-input hover:border-emerald-300 text-foreground'
          }`}
        >
          {st.label}
        </button>
      ))}
    </div>
  )
}

// ─── Rich Text Editor Component ────────────────────────────────────────────

function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write chapter content here...',
  minHeight = 300,
  showMathButton = false,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  showMathButton?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isHtmlMode, setIsHtmlMode] = useState(false)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
    editorRef.current?.focus()
  }

  const handleInsertLink = () => {
    const url = prompt('Enter URL:')
    if (url) execCommand('createLink', url)
  }

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) execCommand('insertImage', url)
  }

  const handleInsertList = (type: 'ul' | 'ol') => {
    execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleInsertMath = () => {
    const formula = prompt('Enter LaTeX formula (e.g. \\frac{a}{b} or E=mc^2):')
    if (formula) {
      execCommand('insertHTML', `<span class="math-formula inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-emerald-700 dark:text-emerald-300 text-sm" contenteditable="false">$${formula}$</span>`)
    }
  }

  const handleToggleHtml = () => {
    if (isHtmlMode) {
      // Switching from HTML -> Visual: push textarea value into contentEditable
      if (editorRef.current) {
        editorRef.current.innerHTML = value
      }
    }
    setIsHtmlMode(!isHtmlMode)
  }

  const toolbarButtons: ({
    icon: React.ElementType; label: string; action: () => void
  } | { type: 'separator' })[] = [
    { icon: Bold, label: 'Bold', action: () => execCommand('bold') },
    { icon: Italic, label: 'Italic', action: () => execCommand('italic') },
    { icon: Underline, label: 'Underline', action: () => execCommand('underline') },
    { type: 'separator' },
    { icon: List, label: 'Bullet List', action: () => handleInsertList('ul') },
    { icon: ListOrdered, label: 'Numbered List', action: () => handleInsertList('ol') },
    { type: 'separator' },
    { icon: Link2, label: 'Insert Link', action: handleInsertLink },
    { icon: ImageIcon, label: 'Insert Image', action: handleInsertImage },
    ...(showMathButton ? [{ type: 'separator' as const }, { icon: Sigma as React.ElementType, label: 'Insert Math Formula', action: handleInsertMath }] : []),
  ]

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200 overflow-hidden',
      isFocused
        ? 'border-emerald-500/50 ring-2 ring-emerald-500/10 shadow-sm'
        : 'border-input hover:border-muted-foreground/25'
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b flex-wrap">
        {toolbarButtons.map((btn, idx) => {
          if ('type' in btn && btn.type === 'separator') {
            return <div key={idx} className="w-px h-5 bg-border mx-1" />
          }
          if ('type' in btn) return null
          const Icon = btn.icon
          return (
            <button
              key={idx} type="button" onClick={btn.action} title={btn.label}
              disabled={isHtmlMode}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                isHtmlMode
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* HTML/Code Toggle */}
        <button
          type="button"
          onClick={handleToggleHtml}
          title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to Custom HTML'}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
            isHtmlMode
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <Code className="h-3.5 w-3.5" />
          {isHtmlMode ? 'HTML' : 'Visual'}
        </button>
      </div>

      {/* Editor Area */}
      {isHtmlMode ? (
        <textarea
          className="w-full p-4 text-sm font-mono leading-relaxed focus:outline-none resize-y bg-background"
          style={{ minHeight: minHeight + 'px' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML) }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className={
            'p-4 focus:outline-none text-sm leading-relaxed ' +
            'empty:before:text-muted-foreground/50 ' +
            '[&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-700 ' +
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 ' +
            '[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 ' +
            '[&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground'
          }
          style={{ minHeight: minHeight + 'px' }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  )
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────

function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-14 w-14 text-2xl flex items-center justify-center rounded-xl hover:bg-accent transition-all hover:scale-105">
          {value || <Smile className="h-6 w-6 text-muted-foreground" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex items-center gap-2 mb-2">
          <Smile className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Choose an icon</p>
        </div>
        <Separator className="mb-3" />
        <div className="grid grid-cols-10 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji} type="button" onClick={() => onChange(emoji)}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-md text-base transition-all',
                'hover:bg-accent hover:scale-110',
                value === emoji && 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500/50 scale-110'
              )}
            >{emoji}</button>
          ))}
        </div>
        {value && (
          <>
            <Separator className="mt-3 mb-2" />
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => onChange('')}>Clear selection</Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Color Picker ──────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const presetColors = [
    '#10B981', '#059669', '#047857', '#34D399', '#6EE7B7',
    '#0F172A', '#1E293B', '#334155', '#475569', '#64748B',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#14B8A6', '#06B6D4', '#0EA5E9',
  ]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-14 w-14 flex items-center justify-center rounded-xl hover:scale-105 transition-all overflow-hidden relative">
          <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: value || '#10B981' }} />
          <Palette className="h-5 w-5 relative z-10 text-white drop-shadow-sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Choose a color</p>
        </div>
        <Separator className="mb-3" />
        <div className="grid grid-cols-5 gap-2 mb-3">
          {presetColors.map((color) => (
            <button key={color} type="button" onClick={() => onChange(color)}
              className={cn('h-8 w-full rounded-lg transition-all hover:scale-110 ring-offset-2 ring-offset-background', value === color && 'ring-2 ring-emerald-500 scale-110')}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md border shrink-0" style={{ backgroundColor: value || '#10B981' }} />
          <Input type="color" value={value || '#10B981'} onChange={(e) => onChange(e.target.value)} className="h-8 flex-1 cursor-pointer" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// ─── Form Skeleton ────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Card 1: Basic Info */}
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-32 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      {/* Card 2: Classification */}
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-28 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      {/* Card 3: Content Editor */}
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-24 mb-5" />
        <Skeleton className="h-10 w-64 rounded-lg mb-4" />
        <Skeleton className="h-[500px] rounded-lg" />
      </div>

      {/* Card 4: Visual Settings */}
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-28 mb-5" />
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <Skeleton className="h-16 w-16 rounded-xl" />
          <Skeleton className="h-16 flex-1 rounded-xl" />
        </div>
      </div>

      {/* Card 5: Advanced Settings */}
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-32 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between pt-2">
        <Skeleton className="h-9 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}

// ─── Creative Question Editor Item ─────────────────────────────────────────

const BANGLA_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']

function CreativeQuestionItem({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: CreativeQuestionForm
  index: number
  onChange: (item: CreativeQuestionForm) => void
  onRemove: () => void
}) {
  const addSubQuestion = () => {
    const nextLabel = BANGLA_LABELS[item.subQuestions.length] || `(${item.subQuestions.length + 1})`
    onChange({ ...item, subQuestions: [...item.subQuestions, { label: nextLabel, text: '' }] })
  }

  const removeSubQuestion = (idx: number) => {
    const updated = item.subQuestions.filter((_, i) => i !== idx)
    // Re-label
    const relabeled = updated.map((sq, i) => ({ ...sq, label: BANGLA_LABELS[i] || `(${i + 1})` }))
    onChange({ ...item, subQuestions: relabeled })
  }

  const updateSubQuestion = (idx: number, text: string) => {
    const updated = [...item.subQuestions]
    updated[idx] = { ...updated[idx], text }
    onChange({ ...item, subQuestions: updated })
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          <Badge variant="outline" className="font-mono text-xs h-5">
            Q{index + 1}
          </Badge>
          <Badge variant="outline" className="text-xs h-5">
            Label: {item.label || 'A'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {/* Question + Metadata inline (board/school name & year alongside question) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Question</Label>
            <RichTextEditor value={item.question} onChange={(v) => onChange({ ...item, question: v })}
              placeholder="Enter the creative question..." minHeight={70} />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Metadata</Label>
            <div className="rounded-lg border bg-muted/10 p-2.5 space-y-2">
              <MetadataFields
                board_name={item.board_name || ''}
                exam_year={item.exam_year || ''}
                sourceType={(item.sourceType || 'custom') as any}
                onChange={(field, val) => onChange({ ...item, [field]: val })}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Sub-questions */}
        <div className="space-y-3 border-l-2 border-emerald-300 pl-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Sub Questions ({item.subQuestions.length})</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addSubQuestion} className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700">
              <Plus className="h-3 w-3" /> Add Sub Question
            </Button>
          </div>
          <div className="space-y-2">
            {item.subQuestions.map((sq, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs h-5 shrink-0">{sq.label}</Badge>
                <RichTextEditor value={sq.text} onChange={(v) => updateSubQuestion(idx, v)}
                  placeholder={`Sub-question ${sq.label}...`} minHeight={40} />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeSubQuestion(idx)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {item.subQuestions.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No sub-questions added. Click &quot;Add Sub Question&quot; to add.</p>
            )}
          </div>
        </div>

        {/* Model Answer */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Model Answer
          </Label>
          <RichTextEditor value={item.answer} onChange={(v) => onChange({ ...item, answer: v })}
            placeholder="Write the complete model answer for this question..." minHeight={100} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">YouTube URL (Video Lecture)</Label>
          <Input value={item.explanation || ''} onChange={(e) => onChange({ ...item, explanation: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..." />
        </div>
      </div>
    </div>
  )
}

// ─── Creative Question Tab Editor ──────────────────────────────────────────

function CreativeQuestionEditor({
  items,
  onChange,
}: {
  items: CreativeQuestionForm[]
  onChange: (items: CreativeQuestionForm[]) => void
}) {
  const addItem = () => {
    const labels = LABEL_OPTIONS.map(o => o.value)
    const usedLabels = items.map(i => i.label)
    const nextLabel = labels.find(l => !usedLabels.includes(l)) || 'A'
    onChange([...items, {
      _key: uniqueKey(), label: nextLabel, question: '', answer: '',
      marks: 10, explanation: '', subQuestions: [],
    }])
  }

  const updateItem = (key: string, updated: CreativeQuestionForm) => {
    onChange(items.map(i => i._key === key ? updated : i))
  }

  const removeItem = (key: string) => {
    if (items.length <= 1) {
      toast.error('At least one question is required')
      return
    }
    onChange(items.filter(i => i._key !== key))
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <Lightbulb className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">No creative questions yet</p>
          <p className="text-xs mt-1">Click the button below to add your first question</p>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item._key}
            layout
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CreativeQuestionItem
              item={item} index={index}
              onChange={(updated) => updateItem(item._key, updated)}
              onRemove={() => removeItem(item._key)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <Button variant="outline" size="sm" onClick={addItem} className="gap-2 w-full border-dashed">
        <Plus className="h-4 w-4" /> Add Creative Question
      </Button>
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">{items.length} question{items.length !== 1 ? 's' : ''} added</p>
      )}
    </div>
  )
}

// ─── MCQ Editor Item ───────────────────────────────────────────────────────

const MCQ_OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function McqItem({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: McqForm
  index: number
  onChange: (item: McqForm) => void
  onRemove: () => void
}) {
  const [isOpen, setIsOpen] = useState(!item.question.trim())

  const addOption = () => {
    const nextLabel = MCQ_OPTION_LABELS[item.options.length] || `(${item.options.length + 1})`
    onChange({ ...item, options: [...item.options, { label: nextLabel, text: '' }] })
  }

  const removeOption = (idx: number) => {
    if (item.options.length <= 2) {
      toast.error('At least 2 options are required')
      return
    }
    const removedLabel = item.options[idx].label
    const updated = item.options.filter((_, i) => i !== idx)
    // Re-label
    const relabeled = updated.map((opt, i) => ({ ...opt, label: MCQ_OPTION_LABELS[i] || `(${i + 1})` }))
    // Fix correctAnswer if removed
    let newCorrectAnswer = item.correctAnswer
    if (newCorrectAnswer === removedLabel) {
      newCorrectAnswer = relabeled[0]?.label || 'A'
    } else {
      // Re-map correctAnswer to new label
      const oldIdx = item.options.findIndex(o => o.label === item.correctAnswer)
      if (oldIdx > idx) {
        newCorrectAnswer = relabeled[oldIdx - 1]?.label || relabeled[0]?.label || 'A'
      }
    }
    onChange({ ...item, options: relabeled, correctAnswer: newCorrectAnswer })
  }

  const updateOption = (idx: number, text: string) => {
    const updated = [...item.options]
    updated[idx] = { ...updated[idx], text }
    onChange({ ...item, options: updated })
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          <Badge variant="outline" className="font-mono text-xs h-5">
            Q{index + 1}
          </Badge>
          {item.correctAnswer && (
            <Badge variant="outline" className="text-xs h-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              ✓ {item.correctAnswer}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs h-5">{item.marks || 1} mark(s)</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Metadata: Board/School Name, Year, Source Type */}
      <div className="px-4 py-2 bg-muted/10 border-b space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Source Metadata</p>
        <MetadataFields
          board_name={item.board_name || ''}
          exam_year={item.exam_year || ''}
          sourceType={(item.sourceType || 'custom') as any}
          onChange={(field, val) => onChange({ ...item, [field]: val })}
        />
      </div>

      {/* Question - always visible, clickable to toggle */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {item.question.trim() ? (
              <p className="text-sm leading-relaxed text-foreground line-clamp-2">{item.question}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Click to add question...</p>
            )}
          </div>
          <span className="shrink-0 mt-0.5">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-emerald-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </div>
      </div>

      {/* Editing fields - shown on expand */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Question</Label>
            <RichTextEditor value={item.question} onChange={(v) => onChange({ ...item, question: v })}
              placeholder="Enter the MCQ question..." minHeight={60} />
          </div>

          {/* Dynamic Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Options ({item.options.length})</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700">
                <Plus className="h-3 w-3" /> Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {item.options.map((opt, idx) => (
                <div key={idx} className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border transition-all',
                  item.correctAnswer === opt.label
                    ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700'
                    : 'border-input'
                )}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...item, correctAnswer: opt.label })}
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all',
                      item.correctAnswer === opt.label
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                    )}
                    title={item.correctAnswer === opt.label ? 'Correct answer' : 'Set as correct'}
                  >
                    {opt.label}
                  </button>
                  <RichTextEditor value={opt.text} onChange={(v) => updateOption(idx, v)}
                    placeholder={`Option ${opt.label}`} minHeight={36} />
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeOption(idx)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Explanation (optional)</Label>
            <RichTextEditor value={item.explanation} onChange={(v) => onChange({ ...item, explanation: v })}
              placeholder="Explain why this answer is correct..." minHeight={50} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Video Lecture (optional)</Label>
            <div className="relative">
              <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={item.videoUrl} onChange={(e) => onChange({ ...item, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..." className="h-9 pl-8" />
            </div>
            <p className="text-xs text-muted-foreground">Paste a YouTube video URL for a video lecture related to this question</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MCQ Tab Editor ────────────────────────────────────────────────────────

function McqEditor({
  items,
  onChange,
}: {
  items: McqForm[]
  onChange: (items: McqForm[]) => void
}) {
  const addItem = () => {
    onChange([...items, {
      _key: uniqueKey(), question: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
      ],
      correctAnswer: 'A', explanation: '', videoUrl: '', marks: 1,
    }])
  }

  const updateItem = (key: string, updated: McqForm) => {
    onChange(items.map(i => i._key === key ? updated : i))
  }

  const removeItem = (key: string) => {
    if (items.length <= 1) {
      toast.error('At least one MCQ is required')
      return
    }
    onChange(items.filter(i => i._key !== key))
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <CheckSquare className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">No MCQs yet</p>
          <p className="text-xs mt-1">Click the button below to add your first MCQ</p>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item._key}
            layout
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <McqItem
              item={item} index={index}
              onChange={(updated) => updateItem(item._key, updated)}
              onRemove={() => removeItem(item._key)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <Button variant="outline" size="sm" onClick={addItem} className="gap-2 w-full border-dashed">
        <Plus className="h-4 w-4" /> Add MCQ
      </Button>
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">{items.length} question{items.length !== 1 ? 's' : ''} added</p>
      )}
    </div>
  )
}

// ─── Tab Panel ─────────────────────────────────────────────────────────────

function TabPanel({
  activeTab,
  formData,
  creativeQuestions,
  mcqs,
  onFormDataChange,
  onCreativeQuestionsChange,
  onMcqsChange,
  isEdit,
}: {
  activeTab: ChapterTab
  formData: ChapterData
  creativeQuestions: CreativeQuestionForm[]
  mcqs: McqForm[]
  onFormDataChange: (data: ChapterData) => void
  onCreativeQuestionsChange: (items: CreativeQuestionForm[]) => void
  onMcqsChange: (items: McqForm[]) => void
  isEdit: boolean
}) {
  // ─── Main Book Q&A entries ────────────────────────────────────────
  interface MainBookEntry {
    question: string
    videoUrl: string
    solution: string
  }

  const parseEntries = (desc: string): MainBookEntry[] => {
    try {
      const parsed = JSON.parse(desc)
      if (Array.isArray(parsed)) return parsed
      // If it's an object with a `questions` array, extract that
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions
        }
        // Handle corrupted format: {"0": {...}, "1": {...}, chapterType: "main_book", ...}
        // where array was spread into numeric keys alongside metadata
        const numericEntries = Object.entries(parsed)
          .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object')
          .map(([_, val]) => val) as MainBookEntry[]
        if (numericEntries.length > 0) return numericEntries
      }
    } catch { /* not JSON, treat as legacy */ }
    // Legacy: if description has content, treat as single entry question
    if (desc && desc.trim()) return [{ question: desc, videoUrl: '', solution: '' }]
    return [{ question: '', videoUrl: '', solution: '' }]
  }

  const [mainBookEntries, setMainBookEntries] = useState<MainBookEntry[]>(() =>
    parseEntries(formData.description || '')
  )
  const [openSolutions, setOpenSolutions] = useState<Record<number, boolean>>({})

  const syncEntries = (updated: MainBookEntry[]) => {
    setMainBookEntries(updated)
    onFormDataChange({ ...formData, description: JSON.stringify(updated) })
  }

  const updateEntry = (idx: number, field: keyof MainBookEntry, value: string) => {
    const updated = mainBookEntries.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    syncEntries(updated)
  }

  const addEntry = () => {
    syncEntries([...mainBookEntries, { question: '', videoUrl: '', solution: '' }])
  }

  const removeEntry = (idx: number) => {
    syncEntries(mainBookEntries.filter((_, i) => i !== idx))
    setOpenSolutions((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }

  const toggleSolution = (idx: number) => {
    setOpenSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'main_book' && (
          <div className="space-y-4">
            {mainBookEntries.map((entry, idx) => (
              <div key={idx} className="rounded-xl border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <Badge variant="outline" className="font-mono text-xs h-5">
                      Q{idx + 1}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeEntry(idx)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Row 1: Question + Video URL + Solution Toggle */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground">Question</Label>
                    <RichTextEditor
                      value={entry.question}
                      onChange={(v) => updateEntry(idx, 'question', v)}
                      placeholder="Enter the question..."
                      minHeight={80}
                      showMathButton
                    />
                  </div>

                  <div className="flex items-end gap-3">
                    {/* Video Lecture URL */}
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Video Lecture</Label>
                      <div className="relative">
                        <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={entry.videoUrl}
                          onChange={(e) => updateEntry(idx, 'videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="h-9 pl-8"
                        />
                      </div>
                    </div>

                    {/* Solution Toggle Button */}
                    <Button
                      type="button"
                      variant={openSolutions[idx] ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSolution(idx)}
                      className={cn(
                        'h-9 gap-1.5 shrink-0',
                        openSolutions[idx]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50'
                      )}
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      {openSolutions[idx] ? 'Hide Solution' : 'Solution'}
                    </Button>
                  </div>

                  {/* Row 2: Solution (collapsible like FAQ) */}
                  <AnimatePresence>
                    {openSolutions[idx] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-2 border-t">
                          <Label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Solution
                          </Label>
                          <RichTextEditor
                            value={entry.solution}
                            onChange={(v) => updateEntry(idx, 'solution', v)}
                            placeholder="Write the detailed solution, step-by-step reasoning, formulas..."
                            minHeight={100}
                            showMathButton
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addEntry}
              className="w-full h-11 gap-2 border-dashed text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50"
            >
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
        )}

        {activeTab === 'creative_question' && (
          <CreativeQuestionEditor
            items={creativeQuestions}
            onChange={onCreativeQuestionsChange}
          />
        )}

        {activeTab === 'mcq' && (
          <McqEditor
            items={mcqs}
            onChange={onMcqsChange}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function EditChapterModal({
  open, onOpenChange, chapter, classes, subjects, onSaved,
}: EditChapterModalProps) {
  const isEdit = !!chapter?.id && chapter.id !== 'new'
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ChapterData>({
    name: '', slug: '', subjectId: '', description: '', sidebarContent: '', icon: '', color: '#10B981',
    order: 0, isActive: true, chapterType: 'main_book', visibility: true,
    metaTitle: '', metaDescription: '', keywords: '',
  })

  // Tab state
  const [activeTab, setActiveTab] = useState<ChapterTab>('main_book')

  // Creative Questions & MCQs
  const [creativeQuestions, setCreativeQuestions] = useState<CreativeQuestionForm[]>([])
  const [mcqs, setMcqs] = useState<McqForm[]>([])

  // UI state
  const [seoExpanded, setSeoExpanded] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Selected class ID for dependent subject dropdown
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  // ─── Fetch subjects by class using TanStack Query ────────────────
  const subjectsQuery = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return []
      const res = await fetch(`/api/subjects?classId=${selectedClassId}`)
      if (!res.ok) throw new Error('Failed to fetch subjects')
      const data: SubjectItem[] = await res.json()
      return data
    },
    enabled: !!selectedClassId,
    staleTime: 30000,
  })

  // Preserved tab data (so switching tabs doesn't lose data)
  const tabDataRef = useRef<{
    creativeQuestions: CreativeQuestionForm[]
    mcqs: McqForm[]
  }>({ creativeQuestions: [], mcqs: [] })

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const initialDataRef = useRef<string>('')

  // ─── Tab Change Handler ─────────────────────────────────────────────
  const handleTabChange = (tab: ChapterTab) => {
    // Save current tab data to ref before switching
    if (activeTab === 'creative_question') {
      tabDataRef.current.creativeQuestions = creativeQuestions
    } else if (activeTab === 'mcq') {
      tabDataRef.current.mcqs = mcqs
    }

    // Restore data for the tab we're switching to
    if (tab === 'creative_question') {
      setCreativeQuestions(tabDataRef.current.creativeQuestions)
    } else if (tab === 'mcq') {
      setMcqs(tabDataRef.current.mcqs)
    }

    setActiveTab(tab)
    updateField('chapterType', tab)
  }

  // ─── Load Chapter Data ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    if (isEdit && chapter?.id) {
      setLoading(true)
      // Fetch chapter + its creative questions + mcqs
      Promise.all([
        fetch(`/api/chapters/${chapter.id}`).then(r => r.json()),
        fetch(`/api/creative-questions?chapterId=${chapter.id}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/mcq-questions?chapterId=${chapter.id}`).then(r => r.ok ? r.json() : []),
      ])
        .then(([data, cqData, mcqData]) => {
          let metaTitle = '', metaDescription = '', keywords = ''
          let chapterType = 'main_book', visibility = true

          if (data.description) {
            try {
              const parsed = JSON.parse(data.description)
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                metaTitle = parsed.metaTitle || ''
                metaDescription = parsed.metaDescription || ''
                keywords = parsed.keywords || ''
                chapterType = parsed.chapterType || 'main_book'
                visibility = parsed.visibility !== false
              }
            } catch { /* plain text */ }
          }

          const loaded: ChapterData = {
            id: data.id, name: data.name || '', slug: data.slug || '',
            subjectId: data.subjectId || '', description: data.description || '',
            sidebarContent: data.sidebarContent || '', icon: data.icon || '', color: data.color || '#10B981',
            order: data.order ?? 0, isActive: data.isActive !== false,
            chapterType, visibility, metaTitle, metaDescription, keywords,
          }

          setFormData(loaded)
          setActiveTab((chapterType as ChapterTab) || 'main_book')

          // Derive selectedClassId from subjects prop for initial lookup
          if (data.subjectId) {
            const subject = subjects.find((s: SubjectItem) => s.id === data.subjectId)
            if (subject) setSelectedClassId(subject.classId)
          }

          // Load creative questions
          const loadedCq: CreativeQuestionForm[] = (cqData || []).map((cq: any) => {
            // Parse subQuestions from JSON or fallback to legacy fields
            let subQuestions: { label: string; text: string }[] = []
            if (cq.subQuestions) {
              try {
                subQuestions = JSON.parse(cq.subQuestions)
              } catch { subQuestions = [] }
            }
            // Fallback: if no dynamic subQuestions, build from legacy A/B/C
            if (subQuestions.length === 0) {
              if (cq.subQuestionA) subQuestions.push({ label: 'ক', text: cq.subQuestionA })
              if (cq.subQuestionB) subQuestions.push({ label: 'খ', text: cq.subQuestionB })
              if (cq.subQuestionC) subQuestions.push({ label: 'গ', text: cq.subQuestionC })
            }
            return {
              id: cq.id, _key: uniqueKey(), label: cq.label || 'A',
              question: cq.question || '', answer: cq.answer || '',
              marks: cq.marks ?? 10, explanation: cq.explanation || '',
              subQuestions,
              board_name: cq.board_name || '',
              exam_year: cq.exam_year ? String(cq.exam_year) : '',
              sourceType: cq.sourceType || 'custom',
            }
          })
          setCreativeQuestions(loadedCq.length > 0 ? loadedCq : [{
            _key: uniqueKey(), label: 'A', question: '', answer: '',
            marks: 10, explanation: '', subQuestions: [],
            board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board'
          }])
          tabDataRef.current.creativeQuestions = loadedCq.length > 0 ? loadedCq : [{
            _key: uniqueKey(), label: 'A', question: '', answer: '',
            marks: 10, explanation: '', subQuestions: [],
            board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board'
          }]

          // Load MCQs
          const loadedMcq: McqForm[] = (mcqData || []).map((m: any) => {
            // Parse options from JSON or fallback to legacy fields
            let options: McqOptionItem[] = []
            if (m.options) {
              try {
                options = JSON.parse(m.options)
              } catch { options = [] }
            }
            // Fallback: if no dynamic options, build from legacy A/B/C/D
            if (options.length === 0) {
              if (m.optionA) options.push({ label: 'A', text: m.optionA })
              if (m.optionB) options.push({ label: 'B', text: m.optionB })
              if (m.optionC) options.push({ label: 'C', text: m.optionC })
              if (m.optionD) options.push({ label: 'D', text: m.optionD })
            }
            if (options.length === 0) {
              options = [{ label: 'A', text: '' }, { label: 'B', text: '' }]
            }
            return {
              id: m.id, _key: uniqueKey(), question: m.question || '',
              options,
              correctAnswer: m.correctAnswer || 'A', explanation: m.explanation || '',
              videoUrl: m.videoUrl || '',
              marks: m.marks ?? 1,
              board_name: m.board_name || '',
              exam_year: m.exam_year ? String(m.exam_year) : '',
              sourceType: m.sourceType || 'custom',
            }
          })
          setMcqs(loadedMcq.length > 0 ? loadedMcq : [{
            _key: uniqueKey(), question: '',
            options: [{ label: 'A', text: '' }, { label: 'B', text: '' }],
            correctAnswer: 'A', explanation: '', videoUrl: '', marks: 1,
            board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board'
          }])
          tabDataRef.current.mcqs = loadedMcq.length > 0 ? loadedMcq : [{
            _key: uniqueKey(), question: '',
            options: [{ label: 'A', text: '' }, { label: 'B', text: '' }],
            correctAnswer: 'A', explanation: '', videoUrl: '', marks: 1,
            board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board'
          }]

          initialDataRef.current = JSON.stringify(loaded)
          setUnsavedChanges(false)
          setSlugManuallyEdited(false)
          setLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load chapter data')
          setLoading(false)
        })
    } else {
      // Reset for new chapter
      const initial: ChapterData = {
        name: '', slug: '', subjectId: chapter?.subjectId || '',
        description: '', sidebarContent: '', icon: '', color: '#10B981',
        order: 0, isActive: true, chapterType: 'main_book', visibility: true,
        metaTitle: '', metaDescription: '', keywords: '',
      }

      // Derive selectedClassId for new chapters too
      if (chapter?.subjectId) {
        const subject = subjects.find((s: SubjectItem) => s.id === chapter.subjectId)
        if (subject) setSelectedClassId(subject.classId)
      } else {
        setSelectedClassId('')
      }
      setFormData(initial)
      setActiveTab('main_book')
      const defaultCq = [{ _key: uniqueKey(), label: 'A', question: '', answer: '', marks: 10, explanation: '', subQuestions: [] as { label: string; text: string }[], board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board' }]
      const defaultMcq = [{ _key: uniqueKey(), question: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }], correctAnswer: 'A', explanation: '', videoUrl: '', marks: 1, board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board' }]
      setCreativeQuestions(defaultCq)
      setMcqs(defaultMcq)
      tabDataRef.current = { creativeQuestions: defaultCq, mcqs: defaultMcq }
      initialDataRef.current = JSON.stringify(initial)
      setUnsavedChanges(false)
      setSlugManuallyEdited(false)
      setErrors({})
      setLoading(false)
    }
  }, [open, chapter?.id, isEdit])

  // ─── Unsaved Changes Detection ──────────────────────────────────────
  useEffect(() => {
    const current = JSON.stringify(formData)
    setUnsavedChanges(current !== initialDataRef.current)
  }, [formData])

  // ─── Slug Auto-generation ───────────────────────────────────────────
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const generated = generateSlug(formData.name)
      if (generated !== formData.slug) {
        setFormData((prev) => ({ ...prev, slug: generated }))
      }
    }
  }, [formData.name, slugManuallyEdited])

  // ─── Auto-save ──────────────────────────────────────────────────────
  const performAutoSave = useCallback(async () => {
    if (!isEdit || !formData.id) return
    setAutoSaveStatus('saving')
    try {
      const metadata: Record<string, unknown> = {}
      if (formData.chapterType) metadata.chapterType = formData.chapterType
      if (formData.visibility !== undefined) metadata.visibility = formData.visibility
      if (formData.metaTitle) metadata.metaTitle = formData.metaTitle
      if (formData.metaDescription) metadata.metaDescription = formData.metaDescription
      if (formData.keywords) metadata.keywords = formData.keywords

      let description = formData.description || ''
      if (Object.keys(metadata).length > 0) {
        if (description) {
          try {
            const existing = JSON.parse(description)
            if (existing && typeof existing === 'object') {
              description = JSON.stringify({ ...existing, ...metadata })
            }
          } catch { description = JSON.stringify({ content: description, ...metadata }) }
        } else { description = JSON.stringify(metadata) }
      }

      const res = await fetch(`/api/chapters/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, slug: formData.slug, subjectId: formData.subjectId,
          description, sidebarContent: formData.sidebarContent, icon: formData.icon, color: formData.color,
          order: formData.order, isActive: formData.isActive,
        }),
      })

      if (res.ok) { setAutoSaveStatus('saved'); setTimeout(() => setAutoSaveStatus('idle'), 2000) }
      else throw new Error('Auto-save failed')
    } catch { setAutoSaveStatus('error'); setTimeout(() => setAutoSaveStatus('idle'), 3000) }
  }, [formData, isEdit])

  useEffect(() => {
    if (!isEdit || !unsavedChanges) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => performAutoSave(), 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [formData, unsavedChanges, isEdit, performAutoSave])

  // ─── Validation ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Chapter name is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = 'Only lowercase letters, numbers, and hyphens allowed'
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Save Handler ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix the validation errors'); return }
    setSaving(true)

    try {
      // Build description with metadata (store questions array separately)
      const metadata: Record<string, unknown> = {}
      if (formData.chapterType) metadata.chapterType = formData.chapterType
      if (formData.visibility !== undefined) metadata.visibility = formData.visibility
      if (formData.metaTitle) metadata.metaTitle = formData.metaTitle
      if (formData.metaDescription) metadata.metaDescription = formData.metaDescription
      if (formData.keywords) metadata.keywords = formData.keywords

      let description = formData.description || ''
      if (Object.keys(metadata).length > 0) {
        if (description) {
          try {
            const existing = JSON.parse(description)
            if (existing && typeof existing === 'object') {
              if (Array.isArray(existing)) {
                // existing is a questions array — store as { questions: [...], ...metadata }
                description = JSON.stringify({ questions: existing, ...metadata })
              } else {
                // existing is an object (may have questions + metadata)
                description = JSON.stringify({ ...existing, ...metadata })
              }
            }
          } catch { description = JSON.stringify({ content: description, ...metadata }) }
        } else { description = JSON.stringify(metadata) }
      }

      const payload = {
        name: formData.name, slug: formData.slug, subjectId: formData.subjectId,
        description, sidebarContent: formData.sidebarContent, icon: formData.icon, color: formData.color,
        order: formData.order, isActive: formData.isActive,
      }

      let res
      if (isEdit && formData.id) {
        res = await fetch(`/api/chapters/${formData.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/chapters', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save chapter')
        setSaving(false)
        return
      }

      const savedChapter = await res.json()
      const chapterId = savedChapter.id || formData.id

      // Always save creative questions if any have content (regardless of active tab)
      const cqToSave = activeTab === 'creative_question' ? creativeQuestions : tabDataRef.current.creativeQuestions
      if (cqToSave.some(cq => cq.question.trim())) {
        try {
          const existingRes = await fetch(`/api/creative-questions?chapterId=${chapterId}`)
          if (existingRes.ok) {
            const existing = await existingRes.json()
            for (const eq of existing) {
              await fetch(`/api/creative-questions/${eq.id}`, { method: 'DELETE' }).catch(() => {})
            }
          }
        } catch { /* ignore */ }

        for (const cq of cqToSave) {
          if (cq.question.trim()) {
            await fetch('/api/creative-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapterId, label: cq.label, question: cq.question,
                answer: cq.answer, marks: cq.marks, explanation: cq.explanation,
                subQuestions: cq.subQuestions.filter(sq => sq.text.trim()),
                subQuestionA: cq.subQuestions[0]?.text || null,
                subQuestionB: cq.subQuestions[1]?.text || null,
                subQuestionC: cq.subQuestions[2]?.text || null,
                difficulty: 'medium', isActive: true,
                board_name: cq.board_name || null,
                exam_year: cq.exam_year ? parseInt(cq.exam_year) : null,
                sourceType: cq.sourceType || 'custom',
              }),
            }).catch(() => {})
          }
        }
      }

      // Always save MCQs if any have content (regardless of active tab)
      const mcqToSave = activeTab === 'mcq' ? mcqs : tabDataRef.current.mcqs
      if (mcqToSave.some(m => m.question.trim())) {
        try {
          const existingRes = await fetch(`/api/mcq-questions?chapterId=${chapterId}`)
          if (existingRes.ok) {
            const existing = await existingRes.json()
            for (const em of existing) {
              await fetch(`/api/mcq-questions/${em.id}`, { method: 'DELETE' }).catch(() => {})
            }
          }
        } catch { /* ignore */ }

        for (const mcq of mcqToSave) {
          if (mcq.question.trim()) {
            await fetch('/api/mcq-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapterId, question: mcq.question,
                options: mcq.options.filter(o => o.text.trim()),
                optionA: mcq.options[0]?.text || '',
                optionB: mcq.options[1]?.text || '',
                optionC: mcq.options[2]?.text || null,
                optionD: mcq.options[3]?.text || null,
                correctAnswer: mcq.correctAnswer, explanation: mcq.explanation,
                videoUrl: mcq.videoUrl || null,
                marks: mcq.marks, difficulty: 'medium', isActive: true,
                board_name: mcq.board_name || null,
                exam_year: mcq.exam_year ? parseInt(mcq.exam_year) : null,
                sourceType: mcq.sourceType || 'custom',
              }),
            }).catch(() => {})
          }
        }
      }

      toast.success(isEdit ? 'Chapter updated successfully' : 'Chapter created successfully')
      setUnsavedChanges(false)
      onOpenChange(false)
      onSaved()
    } catch { toast.error('Something went wrong while saving') }
    finally { setSaving(false) }
  }

  // ─── Delete Handler ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!formData.id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/chapters/${formData.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Chapter deleted successfully')
        setDeleteConfirmOpen(false)
        onOpenChange(false)
        onSaved()
      } else toast.error('Failed to delete chapter')
    } catch { toast.error('Something went wrong while deleting') }
    finally { setDeleting(false) }
  }

  // ─── Field Update Helper ────────────────────────────────────────────
  const updateField = <K extends keyof ChapterData>(key: K, value: ChapterData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  // ─── Save Status Badge ──────────────────────────────────────────────
  const renderSaveStatus = () => {
    if (!isEdit) return null
    const statusConfig = {
      idle: { icon: Clock, text: 'Auto-save idle', className: 'text-muted-foreground' },
      saving: { icon: Loader2, text: 'Saving...', className: 'text-amber-500' },
      saved: { icon: CheckCircle, text: 'Saved', className: 'text-emerald-500' },
      error: { icon: AlertTriangle, text: 'Save failed', className: 'text-destructive' },
    }
    const config = statusConfig[autoSaveStatus]
    const Icon = config.icon
    return (
      <div className={cn('flex items-center gap-1.5 text-xs transition-all duration-300', config.className)}>
        <Icon className={cn('h-3.5 w-3.5', autoSaveStatus === 'saving' && 'animate-spin')} />
        <span>{config.text}</span>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={open} onOpenChange={(v) => {
        if (!v && unsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
        onOpenChange(v)
      }}>
        <DialogContent className="w-[98vw] sm:max-w-[2200px] 2xl:max-w-[2400px] max-sm:w-full p-0 gap-0 rounded-2xl shadow-2xl border flex flex-col max-h-[95vh]" showCloseButton={false}>
          {/* ── Header (sticky) ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {isEdit ? 'Edit Chapter' : 'Create Chapter'}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {isEdit ? 'Update chapter details and settings' : 'Add a new chapter to your LMS'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {renderSaveStatus()}
              {unsavedChanges && (
                <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertTriangle className="h-3 w-3" /> Unsaved
                </Badge>
              )}
              <Button size="icon" variant="ghost" onClick={() => {
                if (unsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
                onOpenChange(false)
              }} className="h-8 w-8 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Content (scrollable body) ── */}
          <div ref={formRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              {loading ? <FormSkeleton /> : (
                <>
                  {/* SECTION 1: Basic Information */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={Type} title="Basic Information" description="Set the chapter name and URL slug" />
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="chapter-name" className="text-sm font-medium">
                          Chapter Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input id="chapter-name" value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="e.g. Quadratic Equations"
                            className={cn('h-10 pr-8 transition-all', errors.name && 'border-destructive ring-destructive/20')}
                          />
                          {formData.name && <div className="absolute inset-y-0 right-2 flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500" /></div>}
                        </div>
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chapter-slug" className="text-sm font-medium">
                          Slug <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input id="chapter-slug" value={formData.slug}
                            onChange={(e) => { updateField('slug', e.target.value); setSlugManuallyEdited(true) }}
                            placeholder="quadratic-equations"
                            className={cn('h-10 pl-8 font-mono text-sm transition-all', errors.slug && 'border-destructive ring-destructive/20')}
                          />
                          <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
                        {!slugManuallyEdited && formData.name && <p className="text-xs text-muted-foreground mt-1">Auto-generated from name</p>}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Classification (no more Chapter Type dropdown) */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={BookMarked} title="Classification" description="Assign the chapter to a class and subject" />
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Class</Label>
                        <Select
                          value={selectedClassId}
                          onValueChange={(classId) => {
                            setSelectedClassId(classId)
                            updateField('subjectId', '')
                            // Auto-select if only one subject for this class
                            const filtered = subjectsQuery.data?.filter(s => s.classId === classId) || []
                            if (filtered.length === 1) updateField('subjectId', filtered[0].id)
                          }}
                        >
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                <span className="flex items-center gap-2">{cls.icon && <span>{cls.icon}</span>}<span>{cls.name}</span></span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Subject <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.subjectId}
                          onValueChange={(v) => updateField('subjectId', v)}
                          disabled={!selectedClassId || subjectsQuery.isLoading}
                        >
                          <SelectTrigger className={cn('h-10', errors.subjectId && 'border-destructive ring-destructive/20')}>
                            <SelectValue placeholder={
                              !selectedClassId
                                ? 'Select a class first'
                                : subjectsQuery.isLoading
                                  ? 'Loading subjects...'
                                  : subjectsQuery.data?.length === 0
                                    ? 'No subjects available'
                                    : 'Select subject'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectsQuery.isLoading ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : subjectsQuery.data?.length === 0 ? (
                              <div className="py-4 text-center text-sm text-muted-foreground">
                                {selectedClassId ? 'No subjects for this class' : 'Select a class first'}
                              </div>
                            ) : (
                              (subjectsQuery.data || []).map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  <span className="flex items-center gap-2">{sub.icon && <span>{sub.icon}</span>}<span>{sub.name}</span></span>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {errors.subjectId && <p className="text-xs text-destructive mt-1">{errors.subjectId}</p>}
                        {subjectsQuery.isLoading && selectedClassId && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading subjects...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Tabbed Content Editor */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={activeTab === 'main_book' ? FileText : activeTab === 'creative_question' ? Lightbulb : CheckSquare}
                      title={activeTab === 'main_book' ? 'Main Book Content' : activeTab === 'creative_question' ? 'Creative Questions' : 'MCQ Questions'}
                      description={
                        activeTab === 'main_book' ? 'Edit full chapter content with rich text, images, and math formulas'
                          : activeTab === 'creative_question' ? 'Add and manage creative questions for this chapter'
                          : 'Add and manage multiple choice questions for this chapter'
                      }
                    />
                    <div className="mt-4 space-y-5">
                      <SegmentedTabs activeTab={activeTab} onTabChange={handleTabChange} />
                      <TabPanel
                        activeTab={activeTab}
                        formData={formData}
                        creativeQuestions={creativeQuestions}
                        mcqs={mcqs}
                        onFormDataChange={setFormData}
                        onCreativeQuestionsChange={setCreativeQuestions}
                        onMcqsChange={setMcqs}
                        isEdit={isEdit}
                      />
                    </div>
                  </div>

                  {/* SECTION 4: Visual Settings */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={Palette} title="Visual Settings" description="Customize the chapter icon and accent color" />
                    <div className="mt-4 flex items-center gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Icon</Label>
                        <EmojiPicker value={formData.icon || ''} onChange={(emoji) => updateField('icon', emoji)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Color</Label>
                        <ColorPicker value={formData.color || '#10B981'} onChange={(color) => updateField('color', color)} />
                      </div>
                      <div className="flex-1 min-h-[88px] flex items-center">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50 border w-full">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
                            style={{ backgroundColor: formData.color || '#10B981' }}>
                            <span className="filter brightness-200">{formData.icon || '📄'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{formData.name || 'Chapter Preview'}</p>
                            <p className="text-xs text-muted-foreground truncate">/{formData.slug || 'chapter-slug'}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs"
                            style={{ backgroundColor: `${formData.color || '#10B981'}15`, color: formData.color || '#10B981', borderColor: `${formData.color || '#10B981'}30` }}
                          >
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: Advanced Settings */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={SlidersHorizontal} title="Advanced Settings" description="Configure display order, status, and visibility" />
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="display-order" className="text-sm font-medium">Display Order</Label>
                        <div className="relative">
                          <Input id="display-order" type="number" min={0} max={999} value={formData.order}
                            onChange={(e) => updateField('order', parseInt(e.target.value) || 0)} className="h-10 pl-8" />
                          <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full transition-colors', formData.isActive ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                            <span className="text-sm font-medium">{formData.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <Switch checked={formData.isActive} onCheckedChange={(v) => updateField('isActive', v)} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Visibility</Label>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-2">
                            {formData.visibility !== false ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm font-medium">{formData.visibility !== false ? 'Visible' : 'Hidden'}</span>
                          </div>
                          <Switch checked={formData.visibility !== false} onCheckedChange={(v) => updateField('visibility', v)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: Chapter Sidebar Content */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SectionHeader icon={BookMarked} title="Chapter Sidebar Content" description="Rich content displayed in a sticky sidebar widget on the chapter page — notes, formulas, tables, images, tips" />
                    <div className="mt-4">
                      <RichTextEditor
                        value={formData.sidebarContent || ''}
                        onChange={(v) => updateField('sidebarContent', v)}
                        placeholder="Write chapter notes, formulas, important instructions, or any content to show in the sidebar widget..."
                        minHeight={200}
                        showMathButton
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This content appears as a sticky widget on the right side of the chapter page (desktop)
                        and as a floating button popup on mobile. Leave empty to hide the widget entirely.
                      </p>
                    </div>
                  </div>

                  {/* SECTION 7: SEO (Collapsible) */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <Collapsible open={seoExpanded} onOpenChange={setSeoExpanded}>
                      <CollapsibleTrigger asChild>
                        <div className="w-full flex items-center justify-between cursor-pointer group">
                          <SectionHeader icon={Globe} title="SEO Settings" description="Optimize search engine visibility" />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn('text-xs transition-all',
                              (formData.metaTitle || formData.metaDescription || formData.keywords)
                                ? 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'
                                : 'text-muted-foreground'
                            )}>
                              {(formData.metaTitle || formData.metaDescription || formData.keywords) ? 'Configured' : 'Optional'}
                            </Badge>
                            {seoExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" /> : <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="meta-title" className="text-sm font-medium">Meta Title</Label>
                            <Input id="meta-title" value={formData.metaTitle || ''}
                              onChange={(e) => updateField('metaTitle', e.target.value)}
                              placeholder="e.g. Quadratic Equations - Chapter 4 | EduLMS" className="h-10" />
                            <p className="text-xs text-muted-foreground">Recommended: 50-60 characters. {formData.metaTitle?.length || 0}/60</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta-description" className="text-sm font-medium">Meta Description</Label>
                            <Textarea id="meta-description" value={formData.metaDescription || ''}
                              onChange={(e) => updateField('metaDescription', e.target.value)}
                              placeholder="A brief description for search engine results..." rows={3} className="resize-none" />
                            <p className="text-xs text-muted-foreground">Recommended: 150-160 characters. {formData.metaDescription?.length || 0}/160</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keywords" className="text-sm font-medium">Keywords</Label>
                            <Input id="keywords" value={formData.keywords || ''}
                              onChange={(e) => updateField('keywords', e.target.value)}
                              placeholder="quadratic equations, algebra, mathematics, class 10" className="h-10" />
                            <p className="text-xs text-muted-foreground">Comma-separated list of relevant keywords</p>
                          </div>
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </>
              )}
            </div>

          {/* ── Footer (sticky) ── */}
          {!loading && (
            <div className="flex items-center justify-between px-8 py-4 border-t bg-background shrink-0">
              <div>{isEdit && (
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(true)}
                  className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5">
                  <Trash2 className="h-4 w-4" /> Delete Chapter
                </Button>
              )}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  if (unsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return
                  onOpenChange(false)
                }} className="h-9">Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}
                  className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEdit ? 'Save Changes' : 'Create Chapter'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl shadow-xl">
          <div className="flex flex-col items-center text-center py-2">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold mb-2">Delete Chapter</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-1">Are you sure you want to delete</DialogDescription>
            <p className="text-sm font-medium text-foreground mb-4">&ldquo;{formData.name || 'this chapter'}&rdquo;?</p>
            <p className="text-xs text-muted-foreground mb-6">This action cannot be undone. All associated content will also be deleted.</p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1 h-10 gap-2" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
