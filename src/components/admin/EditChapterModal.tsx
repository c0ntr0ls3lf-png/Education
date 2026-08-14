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
  Sigma, ImagePlus, BookMarked, Youtube, Code, Settings
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
import { MathRenderer } from '@/components/exam/MathRenderer'
import { htmlToPlainText } from '@/lib/html-utils'
import MainBookQAEditor, { MainBookEntry } from './MainBookQAEditor'

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

interface McqSubQuestion {
  question: string
  options: McqOptionItem[]
  correctAnswer: string
}

type McqType = 'single' | 'multiple_statement' | 'stem_based'

interface McqForm {
  id?: string
  _key: string
  mcqType: McqType
  question: string
  options: McqOptionItem[]
  correctAnswer: string
  // multiple_statement fields
  statements: string[]        // ['stmt i', 'stmt ii', 'stmt iii']
  correctCombination: string  // e.g. 'i ও ii'
  // stem_based fields
  stem: string
  subMcqs: McqSubQuestion[]
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
  imageUrl?: string | null;
  imageVisible?: boolean;
  order: number | '';
  isActive: boolean;
  chapterType?: string;
  visibility?: boolean;
  /** Extended metadata stored as JSON string in description */
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  mainBookPdfUrl?: string | null;
  mcqPdfUrl?: string | null;
  cqPdfUrl?: string | null;
}

interface EditChapterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapter: ChapterData | null
  classes: ClassItem[]
  subjects: SubjectItem[]
  onSaved: () => void
}

type ChapterTab = 'general' | 'main_book' | 'creative_question' | 'mcq' | 'sidebar' | 'design' | 'seo'

// ─── Tab Configuration ─────────────────────────────────────────────────────

const TABS: { id: ChapterTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'general', label: 'General Info', icon: Settings, description: 'Basic details & classification' },
  { id: 'main_book', label: 'Main Book Q&A', icon: BookOpen, description: 'Manage main book Q&As' },
  { id: 'creative_question', label: 'Creative Questions', icon: Lightbulb, description: 'Manage creative questions' },
  { id: 'mcq', label: 'MCQs', icon: CheckSquare, description: 'Manage multiple-choice questions' },
  { id: 'sidebar', label: 'Sidebar Notes', icon: FileText, description: 'Notes & formulas widget' },
  { id: 'design', label: 'Design & Visibility', icon: Palette, description: 'Visuals, order, status' },
  { id: 'seo', label: 'SEO Settings', icon: Globe, description: 'Search engine optimization' },
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

export function RichTextEditor({
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isInternalChange = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHtmlMode, setIsHtmlMode] = useState(false)

  const syncFromEditor = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Sync external value without overwriting active edits
  useEffect(() => {
    if (isHtmlMode || !editorRef.current) return
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (isFocused) return
    if (editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value, isHtmlMode, isFocused])

  // Math builder states
  const [mathDialogOpen, setMathDialogOpen] = useState(false)
  const [formula, setFormula] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)

  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val)
    syncFromEditor()
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
    // Get HTML content from clipboard
    const html = e.clipboardData.getData('text/html')
    
    if (html) {
      e.preventDefault()
      // Insert raw HTML to preserve all structure including collapsible sections
      document.execCommand('insertHTML', false, html)
      syncFromEditor()
    } else {
      // Fallback to plain text if no HTML
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
      syncFromEditor()
    }
  }

  const openMathDialog = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0))
    } else {
      setSavedRange(null)
    }
    setFormula('')
    setMathDialogOpen(true)
  }

  const insertMathFormula = () => {
    if (!formula.trim()) return
    if (editorRef.current) {
      editorRef.current.focus()
    }
    const sel = window.getSelection()
    if (sel && savedRange) {
      sel.removeAllRanges()
      sel.addRange(savedRange)
    }

    // Insert LaTeX inline formula
    execCommand(
      'insertHTML',
      `<span class="math-formula inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-emerald-700 dark:text-emerald-300 text-sm" contenteditable="false">$${formula}$</span>&nbsp;`
    )
    setMathDialogOpen(false)
  }

  const handleInsertSymbol = (latex: string) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    setFormula(before + latex + after)

    // Reset focus and position cursor right after the inserted LaTeX snippet
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + latex.length, start + latex.length)
    }, 0)
  }

  const handleToggleHtml = () => {
    if (isHtmlMode) {
      // Switching from HTML -> Visual: push textarea value into contentEditable
      if (editorRef.current) {
        editorRef.current.innerHTML = value || ''
      }
    } else {
      syncFromEditor()
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
    ...(showMathButton ? [{ type: 'separator' as const }, { icon: Sigma as React.ElementType, label: 'Insert Math Formula', action: openMathDialog }] : []),
  ]

  const mathCategories = [
    {
      name: 'General',
      items: [
        { label: 'Fraction (ভগ্নাংশ)', latex: '\\frac{a}{b}' },
        { label: 'Square Root (বর্গমূল)', latex: '\\sqrt{x}' },
        { label: 'Exponent (পাওয়ার)', latex: 'a^b' },
        { label: 'Subscript (সাবস্ক্রিপ্ট)', latex: 'x_i' },
        { label: 'Plus-Minus (±)', latex: '\\pm' },
        { label: 'Multiplication (×)', latex: '\\times' },
        { label: 'Division (÷)', latex: '\\div' },
      ],
    },
    {
      name: 'Sets',
      items: [
        { label: 'Element Of (∈)', latex: '\\in' },
        { label: 'Not Element (∉)', latex: '\\notin' },
        { label: 'Union (∪)', latex: '\\cup' },
        { label: 'Intersection (∩)', latex: '\\cap' },
        { label: 'Subset (⊆)', latex: '\\subset' },
        { label: 'Empty Set (∅)', latex: '\\emptyset' },
        { label: 'Set Brackets ({x})', latex: '\\{x\\}' },
      ],
    },
    {
      name: 'Recurring',
      items: [
        { label: 'Single Dot (পৌনঃপুনিক)', latex: '\\dot{x}' },
        { label: 'Group Bar (পৌনঃপুনিক)', latex: '\\overline{xy}' },
        { label: 'Ex. 0.3 (পৌনঃপুনিক)', latex: '0.\\dot{3}' },
        { label: 'Ex. 0.35 (পৌনঃপুনিক)', latex: '0.\\overline{35}' },
      ],
    },
    {
      name: 'Symbols',
      items: [
        { label: 'Theta (θ)', latex: '\\theta' },
        { label: 'Alpha (α)', latex: '\\alpha' },
        { label: 'Beta (β)', latex: '\\beta' },
        { label: 'Pi (π)', latex: '\\pi' },
        { label: 'Not Equal (≠)', latex: '\\neq' },
        { label: 'Approx (≈)', latex: '\\approx' },
        { label: 'Greater/Equal (≥)', latex: '\\ge' },
        { label: 'Less/Equal (≤)', latex: '\\le' },
      ],
    },
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
          onInput={syncFromEditor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            syncFromEditor()
            setIsFocused(false)
          }}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className={
            'p-4 focus:outline-none text-sm leading-relaxed ' +
            'empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)] ' +
            '[&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-700 ' +
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 ' +
            '[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 ' +
            '[&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground'
          }
          style={{ minHeight: minHeight + 'px' }}
        />
      )}

      {/* Math Builder Dialog */}
      <Dialog open={mathDialogOpen} onOpenChange={setMathDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sigma className="h-5 w-5" />
              LaTeX Math Formula Builder
            </DialogTitle>
            <DialogDescription>
              Build mathematical equations visually. Select formulas from the categories below or type directly in LaTeX.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {/* Left: Input and Preview */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Type LaTeX Formula</Label>
                <textarea
                  ref={textareaRef}
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="e.g. \frac{a}{b} + c^2"
                  rows={4}
                  className="w-full p-2.5 text-xs font-mono border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Live KaTeX Preview</Label>
                <div className="min-h-[80px] p-3 rounded-md border bg-muted/20 flex items-center justify-center overflow-auto text-emerald-700 dark:text-emerald-300">
                  {formula.trim() ? (
                    <MathRenderer content={`$${formula}$`} />
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">Formula preview will render here...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick-Insert Shortcuts */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l pl-0 md:pl-4 pt-4 md:pt-0">
              <Label className="text-xs font-semibold text-muted-foreground">Quick Symbols & Templates</Label>
              <ScrollArea className="h-[220px] rounded-md border p-2 bg-muted/10">
                <div className="space-y-4">
                  {mathCategories.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-1">
                        {cat.items.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleInsertSymbol(item.latex)}
                            className="text-left text-[11px] px-2 py-1.5 rounded border bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 transition-colors font-sans truncate"
                            title={item.latex}
                          >
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
                              {item.latex}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              ({item.label.split(' ')[0]})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => setMathDialogOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              onClick={insertMathFormula}
              disabled={!formula.trim()}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Insert Formula
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(!item.question.trim())
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
      {/* Header (always visible, clickable to toggle collapse) */}
      <div 
        className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <Badge variant="outline" className="font-mono text-xs h-5 shrink-0">
            Q{index + 1}
          </Badge>
          <Badge variant="outline" className="text-xs h-5 shrink-0">
            Label: {item.label || 'A'}
          </Badge>
          {item.subQuestions.length > 0 && (
            <Badge variant="outline" className="text-xs h-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0">
              {item.subQuestions.length} sub-question(s)
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Closed Preview */}
      {!isOpen && (
        <div 
          className="px-4 py-2 text-xs text-muted-foreground bg-card cursor-pointer hover:bg-muted/10" 
          onClick={() => setIsOpen(true)}
        >
          {item.question.trim() ? (
            <div className="line-clamp-1" dangerouslySetInnerHTML={{ __html: item.question }} />
          ) : (
            <p className="italic">Click to add scenario / question...</p>
          )}
        </div>
      )}

      {/* Expanded Content */}
      {isOpen && (
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
      )}
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

// ─── MCQ Helpers ───────────────────────────────────────────────────────────

const MCQ_OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ']
const MCQ_ROMAN = ['i', 'ii', 'iii']
const COMBO_OPTIONS = [
  'i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii',
  'i only', 'ii only', 'iii only',
]

const MCQ_TYPE_CONFIG = [
  {
    key: 'single' as McqType,
    label: 'সাধারণ',
    sublabel: 'বহুনির্বাচনি',
    color: 'emerald',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-500 text-white',
    activeBtnClass: 'bg-emerald-600 border-emerald-600 text-white shadow',
    hoverClass: 'hover:border-emerald-400',
  },
  {
    key: 'multiple_statement' as McqType,
    label: 'বহুপদী',
    sublabel: 'সমাপ্তিসূচক',
    color: 'violet',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
    borderClass: 'border-violet-200 dark:border-violet-800',
    badgeClass: 'bg-violet-500 text-white',
    activeBtnClass: 'bg-violet-600 border-violet-600 text-white shadow',
    hoverClass: 'hover:border-violet-400',
  },
  {
    key: 'stem_based' as McqType,
    label: 'অভিন্ন তথ্যভিত্তিক',
    sublabel: 'বহুনির্বাচনি',
    color: 'amber',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-500 text-white',
    activeBtnClass: 'bg-amber-600 border-amber-600 text-white shadow',
    hoverClass: 'hover:border-amber-400',
  },
] as const

function makeDefaultSubMcq(): McqSubQuestion {
  return {
    question: '',
    options: MCQ_OPTION_LABELS.map((l) => ({ label: l, text: '' })),
    correctAnswer: 'ক',
  }
}

function makeDefaultMcq(type: McqType = 'single'): McqForm {
  return {
    _key: uniqueKey(),
    mcqType: type,
    question: '',
    options: MCQ_OPTION_LABELS.map((l) => ({ label: l, text: '' })),
    correctAnswer: 'ক',
    statements: ['', '', ''],
    correctCombination: '',
    stem: '',
    subMcqs: [makeDefaultSubMcq()],
    explanation: '',
    videoUrl: '',
    marks: 1,
    board_name: '',
    exam_year: new Date().getFullYear().toString(),
    sourceType: 'board',
  }
}

// ─── Shared Options Grid ───────────────────────────────────────────────────

const OPTION_COLOR_MAP = {
  emerald: {
    active: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700',
    btn: 'bg-emerald-500 border-emerald-500 text-white',
  },
  violet: {
    active: 'border-violet-300 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-700',
    btn: 'bg-violet-500 border-violet-500 text-white',
  },
  amber: {
    active: 'border-amber-300 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-700',
    btn: 'bg-amber-500 border-amber-500 text-white',
  },
} as const

type OptionColor = keyof typeof OPTION_COLOR_MAP

function OptionsGrid({
  options,
  correctAnswer,
  onOptionChange,
  onCorrectChange,
  colorClass,
}: {
  options: McqOptionItem[]
  correctAnswer: string
  onOptionChange: (idx: number, val: string) => void
  onCorrectChange: (label: string) => void
  colorClass: OptionColor
}) {
  const colors = OPTION_COLOR_MAP[colorClass]
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        👆 <strong>ক/খ/গ/ঘ</strong> বাটনে ক্লিক করুন → সঠিক উত্তর সেট হবে
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt, idx) => {
          const isCorrect = correctAnswer === opt.label
          return (
            <div
              key={opt.label}
              className={cn(
                'relative flex items-center gap-2 p-2 rounded-lg border-2 transition-all',
                isCorrect ? colors.active + ' shadow-sm' : 'border-input hover:border-muted-foreground/30'
              )}
            >
              {isCorrect && (
                <span className={cn(
                  'absolute -top-2.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10',
                  colorClass === 'emerald' ? 'bg-emerald-500 text-white' :
                  colorClass === 'violet'  ? 'bg-violet-500 text-white' :
                  'bg-amber-500 text-white'
                )}>
                  ✓ সঠিক উত্তর
                </span>
              )}
              <button
                type="button"
                onClick={() => onCorrectChange(opt.label)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all border-2 select-none',
                  isCorrect
                    ? colors.btn + ' scale-110 shadow-md'
                    : 'bg-muted border-muted text-muted-foreground hover:border-muted-foreground/60 hover:scale-105'
                )}
                title={isCorrect ? 'সঠিক উত্তর চিহ্নিত' : 'ক্লিক করুন সঠিক উত্তর সেট করতে'}
              >
                {opt.label}
              </button>
              <RichTextEditor
                value={opt.text}
                onChange={(v) => onOptionChange(idx, v)}
                placeholder={`বিকল্প ${opt.label}`}
                minHeight={36}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MCQ Item ──────────────────────────────────────────────────────────────

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
  const [isOpen, setIsOpen] = useState(!item.question.trim() && !item.stem?.trim())
  const typeCfg = MCQ_TYPE_CONFIG.find((t) => t.key === item.mcqType) ?? MCQ_TYPE_CONFIG[0]

  const setType = (t: McqType) => onChange({ ...item, mcqType: t })

  const updateOption = (idx: number, text: string) => {
    const opts = [...item.options]
    opts[idx] = { ...opts[idx], text }
    onChange({ ...item, options: opts })
  }

  const updateStatement = (idx: number, val: string) => {
    const stmts = [...item.statements]
    stmts[idx] = val
    onChange({ ...item, statements: stmts })
  }

  const updateSubMcq = (idx: number, field: keyof McqSubQuestion, val: any) => {
    const subs = item.subMcqs.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    onChange({ ...item, subMcqs: subs })
  }

  const updateSubOption = (subIdx: number, optIdx: number, val: string) => {
    const subs = item.subMcqs.map((s, i) => {
      if (i !== subIdx) return s
      const opts = s.options.map((o, j) => (j === optIdx ? { ...o, text: val } : o))
      return { ...s, options: opts }
    })
    onChange({ ...item, subMcqs: subs })
  }

  const addSubMcq = () =>
    onChange({ ...item, subMcqs: [...item.subMcqs, makeDefaultSubMcq()] })

  const removeSubMcq = (idx: number) => {
    if (item.subMcqs.length <= 1) return
    onChange({ ...item, subMcqs: item.subMcqs.filter((_, i) => i !== idx) })
  }

  const headerPreview = item.mcqType === 'stem_based'
    ? (item.stem || item.subMcqs[0]?.question || '')
    : item.question

  return (
    <div className={cn('rounded-xl border overflow-hidden transition-all', typeCfg.borderClass)}>
      {/* ── Header ── */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2.5 border-b cursor-pointer transition-colors',
          typeCfg.bgClass
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', typeCfg.badgeClass)}>
            Q{index + 1}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
            {typeCfg.label}
          </span>
          {headerPreview.trim() && (
            <span
              className="text-xs text-muted-foreground truncate max-w-[200px]"
              dangerouslySetInnerHTML={{ __html: headerPreview }}
            />
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Collapsed Preview ── */}
      {!isOpen && (
        <div
          className="px-4 py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/10"
          onClick={() => setIsOpen(true)}
        >
          {headerPreview.trim() ? (
            <div className="line-clamp-1" dangerouslySetInnerHTML={{ __html: headerPreview }} />
          ) : (
            <p className="italic">ক্লিক করুন প্রশ্ন যোগ করতে...</p>
          )}
        </div>
      )}

      {/* ── Expanded Content ── */}
      {isOpen && (
        <div className="p-4 space-y-5">

          {/* MCQ Type Selector */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">প্রশ্নের ধরন</p>
            <div className="grid grid-cols-3 gap-1.5">
              {MCQ_TYPE_CONFIG.map((cfg) => (
                <button
                  key={cfg.key}
                  type="button"
                  onClick={() => setType(cfg.key)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-center transition-all text-[10px] font-semibold leading-tight',
                    item.mcqType === cfg.key
                      ? cfg.activeBtnClass
                      : `border-input bg-background text-muted-foreground ${cfg.hoverClass} hover:bg-muted/30`
                  )}
                >
                  <span className="text-[11px] font-bold">{cfg.label}</span>
                  <span className="opacity-75">{cfg.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source Metadata */}
          <div className="p-3 bg-muted/10 rounded-lg border space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">উৎস তথ্য</p>
            <MetadataFields
              board_name={item.board_name || ''}
              exam_year={item.exam_year || ''}
              sourceType={(item.sourceType || 'board') as any}
              onChange={(field, val) => onChange({ ...item, [field]: val })}
            />
          </div>

          {/* ── SINGLE (সাধারণ) ── */}
          {item.mcqType === 'single' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">প্রশ্ন</Label>
                <RichTextEditor
                  value={item.question}
                  onChange={(v) => onChange({ ...item, question: v })}
                  placeholder="প্রশ্নটি লিখুন..."
                  minHeight={70}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">বিকল্পসমূহ</Label>
                <OptionsGrid
                  options={item.options}
                  correctAnswer={item.correctAnswer}
                  onOptionChange={updateOption}
                  onCorrectChange={(l) => onChange({ ...item, correctAnswer: l })}
                  colorClass="emerald"
                />
              </div>
            </div>
          )}

          {/* ── MULTIPLE STATEMENT (বহুপদী সমাপ্তিসূচক) ── */}
          {item.mcqType === 'multiple_statement' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">মূল প্রশ্ন</Label>
                <RichTextEditor
                  value={item.question}
                  onChange={(v) => onChange({ ...item, question: v })}
                  placeholder="প্রশ্নটি লিখুন যেটি নিচের বাক্যগুলো উল্লেখ করে..."
                  minHeight={60}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">বাক্যসমূহ (Statements)</Label>
                {item.statements.map((stmt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-2.5 shrink-0">
                      <span className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border-2 text-violet-700 border-violet-400 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-700'
                      )}>
                        {MCQ_ROMAN[i]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <RichTextEditor
                        value={stmt}
                        onChange={(v) => updateStatement(i, v)}
                        placeholder={`বাক্য ${MCQ_ROMAN[i]}...`}
                        minHeight={46}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">নিচের কোনটি সঠিক?</Label>
                <p className="text-[10px] text-muted-foreground -mt-1">সঠিক সমন্বয়টি ক্লিক করে নির্বাচন করুন</p>
                <div className="flex flex-wrap gap-2">
                  {COMBO_OPTIONS.map((combo) => (
                    <button
                      key={combo}
                      type="button"
                      onClick={() => onChange({ ...item, correctCombination: combo })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                        item.correctCombination === combo
                          ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                          : 'border-input bg-background text-foreground hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
                      )}
                    >
                      {combo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">বিকল্পসমূহ (A-D)</Label>
                <p className="text-[10px] text-muted-foreground -mt-1">ক-খ-গ-ঘ বিকল্পগুলো লিখুন এবং সঠিক উত্তর ক্লিক করুন</p>
                <OptionsGrid
                  options={item.options}
                  correctAnswer={item.correctAnswer}
                  onOptionChange={updateOption}
                  onCorrectChange={(l) => onChange({ ...item, correctAnswer: l })}
                  colorClass="violet"
                />
              </div>
            </div>
          )}

          {/* ── STEM BASED (অভিন্ন তথ্যভিত্তিক) ── */}
          {item.mcqType === 'stem_based' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">উদ্দীপক / অনুচ্ছেদ (Stem)</Label>
                <p className="text-[10px] text-muted-foreground -mt-1">নিচের সব প্রশ্নগুলো এই অনুচ্ছেদের উপর ভিত্তি করে তৈরি</p>
                <RichTextEditor
                  value={item.stem}
                  onChange={(v) => onChange({ ...item, stem: v })}
                  placeholder="অনুচ্ছেদ, তথ্য, বা চিত্রের বিবরণ লিখুন..."
                  minHeight={100}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    উপ-প্রশ্নসমূহ ({item.subMcqs.length}টি)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubMcq}
                    className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/30"
                  >
                    <Plus className="h-3 w-3" /> উপ-প্রশ্ন যোগ
                  </Button>
                </div>

                {item.subMcqs.map((sub, si) => (
                  <div
                    key={si}
                    className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        উপ-প্রশ্ন {si + 1}
                      </span>
                      {item.subMcqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubMcq(si)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <RichTextEditor
                      value={sub.question}
                      onChange={(v) => updateSubMcq(si, 'question', v)}
                      placeholder={`উপ-প্রশ্ন ${si + 1}...`}
                      minHeight={50}
                    />
                    <OptionsGrid
                      options={sub.options}
                      correctAnswer={sub.correctAnswer}
                      onOptionChange={(oi, val) => updateSubOption(si, oi, val)}
                      onCorrectChange={(l) => updateSubMcq(si, 'correctAnswer', l)}
                      colorClass="amber"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Explanation & Video ── */}
          <div className="space-y-2 pt-1 border-t">
            <Label className="text-xs font-semibold text-muted-foreground">ব্যাখ্যা (ঐচ্ছিক)</Label>
            <RichTextEditor
              value={item.explanation}
              onChange={(v) => onChange({ ...item, explanation: v })}
              placeholder="কেন এই উত্তরটি সঠিক তা ব্যাখ্যা করুন..."
              minHeight={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">ভিডিও লেকচার (ঐচ্ছিক)</Label>
            <div className="relative">
              <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={item.videoUrl}
                onChange={(e) => onChange({ ...item, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-9 pl-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MCQ Tab Editor ────────────────────────────────────────────────────────

const MCQ_CATEGORY_TABS = [
  { key: 'all', label: 'সকল MCQ' },
  { key: 'single', label: 'সাধারণ' },
  { key: 'multiple_statement', label: 'বহুপদী' },
  { key: 'stem_based', label: 'অভিন্ন তথ্যভিত্তিক' },
] as const

type McqCategoryFilter = (typeof MCQ_CATEGORY_TABS)[number]['key']

function McqEditor({
  items,
  onChange,
}: {
  items: McqForm[]
  onChange: (items: McqForm[]) => void
}) {
  const [categoryFilter, setCategoryFilter] = useState<McqCategoryFilter>('all')

  const addItem = (type: McqType = 'single') => {
    onChange([...items, makeDefaultMcq(type)])
    // Switch to that category tab so user sees the new item
    setCategoryFilter(type)
  }

  const updateItem = (key: string, updated: McqForm) => {
    onChange(items.map((i) => (i._key === key ? updated : i)))
  }

  const removeItem = (key: string) => {
    if (items.length <= 1) {
      toast.error('কমপক্ষে একটি MCQ থাকা দরকার')
      return
    }
    onChange(items.filter((i) => i._key !== key))
  }

  const visibleItems =
    categoryFilter === 'all'
      ? items
      : items.filter((i) => i.mcqType === categoryFilter)

  const counts = {
    all: items.length,
    single: items.filter((i) => i.mcqType === 'single').length,
    multiple_statement: items.filter((i) => i.mcqType === 'multiple_statement').length,
    stem_based: items.filter((i) => i.mcqType === 'stem_based').length,
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {MCQ_CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategoryFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                categoryFilter === tab.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background border-input text-muted-foreground hover:border-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span className={cn(
                'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1',
                categoryFilter === tab.key
                  ? 'bg-background/20 text-background'
                  : 'bg-muted text-muted-foreground'
              )}>
                {counts[tab.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Add Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addItem('single')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-400 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> সাধারণ MCQ
          </button>
          <button
            type="button"
            onClick={() => addItem('multiple_statement')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-violet-400 text-violet-700 dark:text-violet-400 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-950/40 text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> বহুপদী সমাপ্তিসূচক
          </button>
          <button
            type="button"
            onClick={() => addItem('stem_based')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-400 text-amber-700 dark:text-amber-400 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> অভিন্ন তথ্যভিত্তিক
          </button>
        </div>
      </div>

      {/* Empty State */}
      {visibleItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-muted-foreground border-2 border-dashed rounded-xl">
          <CheckSquare className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-semibold">
            {categoryFilter === 'all' ? 'কোনো MCQ নেই' : `কোনো ${MCQ_CATEGORY_TABS.find(t => t.key === categoryFilter)?.label} MCQ নেই`}
          </p>
          <p className="text-xs mt-1">উপরের বাটন ক্লিক করে MCQ যোগ করুন</p>
        </div>
      )}

      {/* MCQ List */}
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => {
          const globalIndex = items.indexOf(item)
          return (
            <motion.div
              key={item._key}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <McqItem
                item={item}
                index={globalIndex}
                onChange={(updated) => updateItem(item._key, updated)}
                onRemove={() => removeItem(item._key)}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {items.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-1">
          <span className="text-xs text-muted-foreground">
            মোট: {items.length}টি প্রশ্ন
            {counts.single > 0 && ` · সাধারণ: ${counts.single}`}
            {counts.multiple_statement > 0 && ` · বহুপদী: ${counts.multiple_statement}`}
            {counts.stem_based > 0 && ` · তথ্যভিত্তিক: ${counts.stem_based}`}
          </span>
        </div>
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

  const parseEntries = (desc: string): MainBookEntry[] => {
    try {
      const parsed = JSON.parse(desc)
      if (Array.isArray(parsed)) {
        return parsed.map((e: any, idx: number) => {
          if (e.type === 'single' || e.type === 'group') {
            return e as MainBookEntry
          }
          // Upgrade legacy entry
          return {
            id: e.id || `entry-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'single',
            question: e.question || '',
            solution: e.solution || '',
            videoUrl: e.videoUrl || '',
          }
        })
      }
      if (parsed && typeof parsed === 'object') {
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions.map((e: any, idx: number) => {
            if (e.type === 'single' || e.type === 'group') return e as MainBookEntry
            return {
              id: e.id || `entry-${Date.now()}-${idx}`,
              type: 'single',
              question: e.question || '',
              solution: e.solution || '',
              videoUrl: e.videoUrl || '',
            }
          })
        }
        // Handle corrupted numeric spread format
        const numericEntries = Object.entries(parsed)
          .filter(([key, val]) => /^\d+$/.test(key) && val && typeof val === 'object')
          .map(([_, val]) => val) as any[]
        if (numericEntries.length > 0) {
          return numericEntries.map((e: any, idx: number) => {
            if (e.type === 'single' || e.type === 'group') return e as MainBookEntry
            return {
              id: e.id || `entry-${Date.now()}-${idx}`,
              type: 'single',
              question: e.question || '',
              solution: e.solution || '',
              videoUrl: e.videoUrl || '',
            }
          })
        }
      }
    } catch { /* legacy plain text */ }

    if (desc && desc.trim()) {
      return [
        {
          id: `entry-${Date.now()}`,
          type: 'single',
          question: desc,
          solution: '',
          videoUrl: '',
        },
      ]
    }
    return []
  }

  const [mainBookEntries, setMainBookEntries] = useState<MainBookEntry[]>(() =>
    parseEntries(formData.description || '')
  )

  const syncEntries = (updated: MainBookEntry[]) => {
    setMainBookEntries(updated)
    onFormDataChange({ ...formData, description: JSON.stringify(updated) })
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
          <MainBookQAEditor
            entries={mainBookEntries}
            onChange={syncEntries}
          />
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
    imageUrl: '', imageVisible: true,
    order: 0, isActive: true, chapterType: 'main_book', visibility: true,
    metaTitle: '', metaDescription: '', keywords: '',
    mainBookPdfUrl: '', mcqPdfUrl: '', cqPdfUrl: '',
  })

  // Tab state
  const [activeTab, setActiveTab] = useState<ChapterTab>('general')

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
    if (tab === 'main_book' || tab === 'creative_question' || tab === 'mcq') {
      updateField('chapterType', tab)
    }
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
            imageUrl: data.imageUrl || '', imageVisible: data.imageVisible !== false,
            order: data.order ?? 0, isActive: data.isActive !== false,
            chapterType, visibility, metaTitle, metaDescription, keywords,
            mainBookPdfUrl: data.mainBookPdfUrl || '',
            mcqPdfUrl: data.mcqPdfUrl || '',
            cqPdfUrl: data.cqPdfUrl || '',
          }

          setFormData(loaded)
          setActiveTab((chapter as any)?.initialTab || 'general')

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
            // Parse options from JSON or fallback to legacy A/B/C/D fields
            let options: McqOptionItem[] = []
            if (m.options) {
              try { options = JSON.parse(m.options) } catch { options = [] }
            }
            if (options.length === 0) {
              options = [
                { label: 'ক', text: m.optionA || '' },
                { label: 'খ', text: m.optionB || '' },
                { label: 'গ', text: m.optionC || '' },
                { label: 'ঘ', text: m.optionD || '' }
              ]
            }
            // Parse statements
            let statements: string[] = ['', '', '']
            if (m.statements) {
              try { statements = JSON.parse(m.statements) } catch { statements = ['', '', ''] }
            }
            // Parse subMcqs
            let subMcqs: McqSubQuestion[] = [makeDefaultSubMcq()]
            if (m.subMcqs) {
              try {
                const parsed = JSON.parse(m.subMcqs)
                if (Array.isArray(parsed) && parsed.length > 0) subMcqs = parsed
              } catch { /* use default */ }
            }
            return {
              id: m.id,
              _key: uniqueKey(),
              mcqType: (m.mcqType as McqType) || 'single',
              question: m.question || '',
              options,
              correctAnswer: m.correctAnswer || 'ক',
              statements,
              correctCombination: m.correctCombination || '',
              stem: m.stem || '',
              subMcqs,
              explanation: m.explanation || '',
              videoUrl: m.videoUrl || '',
              marks: m.marks ?? 1,
              board_name: m.board_name || '',
              exam_year: m.exam_year ? String(m.exam_year) : '',
              sourceType: m.sourceType || 'board',
            }
          })
          setMcqs(loadedMcq.length > 0 ? loadedMcq : [makeDefaultMcq()])
          tabDataRef.current.mcqs = loadedMcq.length > 0 ? loadedMcq : [makeDefaultMcq()]

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
      setActiveTab('general')
      const defaultCq = [{ _key: uniqueKey(), label: 'A', question: '', answer: '', marks: 10, explanation: '', subQuestions: [] as { label: string; text: string }[], board_name: '', exam_year: new Date().getFullYear().toString(), sourceType: 'board' }]
      const defaultMcq = [makeDefaultMcq()]
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
          imageUrl: formData.imageUrl || null, imageVisible: formData.imageVisible !== false,
          order: formData.order, isActive: formData.isActive,
          mainBookPdfUrl: formData.mainBookPdfUrl || null,
          mcqPdfUrl: formData.mcqPdfUrl || null,
          cqPdfUrl: formData.cqPdfUrl || null,
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
    if (!/^[a-z0-9.-]+$/.test(formData.slug)) newErrors.slug = 'Only lowercase letters, numbers, hyphens, and dots allowed'
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Save Handler ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix the validation errors'); return }
    setSaving(true)

    // ── Sync live tab data into ref before saving ──
    tabDataRef.current.creativeQuestions = creativeQuestions
    tabDataRef.current.mcqs = mcqs

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
        imageUrl: formData.imageUrl || null, imageVisible: formData.imageVisible !== false,
        order: formData.order === '' ? 0 : (formData.order ?? 0), isActive: formData.isActive,
        mainBookPdfUrl: formData.mainBookPdfUrl || null,
        mcqPdfUrl: formData.mcqPdfUrl || null,
        cqPdfUrl: formData.cqPdfUrl || null,
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
      const cqToSave = tabDataRef.current.creativeQuestions
      if (cqToSave.some(cq => htmlToPlainText(cq.question))) {
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
          if (htmlToPlainText(cq.question)) {
            const filteredSubs = cq.subQuestions.filter(sq => htmlToPlainText(sq.text))
            const labelToSegment: Record<string, string> = {
              'ক': 'segmentK', 'খ': 'segmentKh', 'গ': 'segmentG', 'ঘ': 'segmentGh',
            }
            const segmentPayload: Record<string, string | null> = {
              segmentK: null, segmentKh: null, segmentG: null, segmentGh: null,
            }
            for (const sq of filteredSubs) {
              const key = labelToSegment[sq.label]
              if (key) segmentPayload[key] = sq.text
            }

            const res = await fetch('/api/creative-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapterId, label: cq.label, question: cq.question,
                answer: cq.answer, marks: cq.marks, explanation: cq.explanation,
                subQuestions: filteredSubs,
                subQuestionA: filteredSubs[0]?.text || null,
                subQuestionB: filteredSubs[1]?.text || null,
                subQuestionC: filteredSubs[2]?.text || null,
                ...segmentPayload,
                difficulty: 'medium', isActive: true,
                board_name: cq.board_name || null,
                exam_year: cq.exam_year ? parseInt(cq.exam_year) : null,
                sourceType: cq.sourceType || 'custom',
              }),
            })
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              toast.error(err.error || 'Failed to save a creative question')
            }
          }
        }
      }

      // Always save MCQs if any have content (regardless of active tab)
      const mcqToSave = tabDataRef.current.mcqs
      const hasContent = mcqToSave.some(m =>
        htmlToPlainText(m.question) ||
        htmlToPlainText(m.stem) ||
        m.statements?.some((s: string) => htmlToPlainText(s)) ||
        m.subMcqs?.some(s => htmlToPlainText(s.question))
      )
      if (hasContent) {
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
          const hasQ = htmlToPlainText(mcq.question) || htmlToPlainText(mcq.stem) || mcq.subMcqs?.some(s => htmlToPlainText(s.question))
          if (hasQ) {
            const isStem = mcq.mcqType === 'stem_based'
            const finalQuestion = isStem ? (mcq.stem || 'Stem Question') : mcq.question
            const finalOptionA = isStem ? 'N/A' : (mcq.options[0]?.text || '')
            const finalOptionB = isStem ? 'N/A' : (mcq.options[1]?.text || '')
            const finalOptionC = isStem ? null : (mcq.options[2]?.text || null)
            const finalOptionD = isStem ? null : (mcq.options[3]?.text || null)

            const res = await fetch('/api/mcq-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapterId,
                mcqType: mcq.mcqType || 'single',
                question: finalQuestion,
                options: JSON.stringify(mcq.options.filter(o => htmlToPlainText(o.text))),
                optionA: finalOptionA,
                optionB: finalOptionB,
                optionC: finalOptionC,
                optionD: finalOptionD,
                correctAnswer: mcq.correctAnswer,
                // multiple_statement
                statements: JSON.stringify(mcq.statements || []),
                correctCombination: mcq.correctCombination || null,
                // stem_based
                stem: mcq.stem || null,
                subMcqs: JSON.stringify(mcq.subMcqs || []),
                explanation: mcq.explanation,
                videoUrl: mcq.videoUrl || null,
                marks: mcq.marks,
                difficulty: 'medium',
                isActive: true,
                board_name: mcq.board_name || null,
                exam_year: mcq.exam_year ? parseInt(mcq.exam_year) : null,
                sourceType: mcq.sourceType || 'board',
              }),
            })
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              toast.error(err.error || 'Failed to save an MCQ question')
            }
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

          {/* ── Content (split layout with Left Sidebar & Right Panel) ── */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-[280px] shrink-0 border-r bg-muted/20 flex flex-col overflow-y-auto p-4 gap-1.5 max-sm:hidden">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 border-transparent'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-none">{tab.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{tab.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Panel */}
            <div ref={formRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {loading ? <FormSkeleton /> : (
                <>
                  {/* For Mobile: Simple Dropdown Selection instead of Left Sidebar */}
                  <div className="sm:hidden mb-4">
                    <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Editor Section</Label>
                    <Select value={activeTab} onValueChange={(v) => handleTabChange(v as ChapterTab)}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {TABS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeTab === 'general' && (
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

                      {/* SECTION 2: Classification */}
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
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'main_book' && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <SectionHeader icon={FileText} title="Main Book Content" description="Edit full chapter content with rich text, images, and math formulas" />
                      <div className="mt-5">
                        <TabPanel
                          activeTab="main_book"
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
                  )}

                  {activeTab === 'creative_question' && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <SectionHeader icon={Lightbulb} title="Creative Questions" description="Add and manage creative questions for this chapter" />
                      <div className="mt-5">
                        <TabPanel
                          activeTab="creative_question"
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
                  )}

                  {activeTab === 'mcq' && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <SectionHeader icon={CheckSquare} title="MCQ Questions" description="Add and manage multiple choice questions for this chapter" />
                      <div className="mt-5">
                        <TabPanel
                          activeTab="mcq"
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
                  )}

                  {activeTab === 'sidebar' && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <SectionHeader icon={BookMarked} title="Chapter Sidebar Content" description="Rich content displayed in a sticky sidebar widget on the chapter page — notes, formulas, tables, images, tips" />
                      <div className="mt-5">
                        <RichTextEditor
                          value={formData.sidebarContent || ''}
                          onChange={(v) => updateField('sidebarContent', v)}
                          placeholder="Write chapter notes, formulas, important instructions, or any content to show in the sidebar widget..."
                          minHeight={300}
                          showMathButton
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          This content appears as a sticky widget on the right side of the chapter page (desktop)
                          and as a floating button popup on mobile. Leave empty to hide the widget entirely.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'design' && (
                    <>
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
                              <Input id="display-order" type="number" min={0} max={999} value={formData.order ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateField('order', val === '' ? '' : parseInt(val) || 0);
                                }} className="h-10 pl-8" />
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

                      {/* SECTION 6: Chapter Image Settings */}
                      <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <SectionHeader icon={ImageIcon} title="Chapter Image" description="Add a preview image for this chapter" />
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="chapter-image-url" className="text-sm font-medium">Image URL</Label>
                            <Input
                              id="chapter-image-url"
                              value={formData.imageUrl || ''}
                              onChange={(e) => updateField('imageUrl', e.target.value)}
                              placeholder="Enter image URL (https://...)"
                              className="h-10"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-2">
                              {formData.imageVisible !== false ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                              <span className="text-sm font-medium">{formData.imageVisible !== false ? 'Show Image in UI' : 'Hide Image in UI'}</span>
                            </div>
                            <Switch
                              checked={formData.imageVisible !== false}
                              onCheckedChange={(v) => updateField('imageVisible', v)}
                            />
                          </div>
                          {formData.imageUrl && (
                            <div className="relative rounded-lg overflow-hidden border w-full max-h-36 flex items-center justify-center bg-muted/20">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full h-36 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              {formData.imageVisible === false && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">🙈 Hidden</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECTION 7: PDF Documents */}
                      <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <SectionHeader icon={FileText} title="PDF Documents" description="Add read-only PDFs for each section. Students can view but not download." />
                        <div className="mt-4 space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="mainbook-pdf-url" className="text-sm font-medium">Main Book PDF URL</Label>
                            <Input
                              id="mainbook-pdf-url"
                              value={formData.mainBookPdfUrl || ""}
                              onChange={(e) => updateField("mainBookPdfUrl", e.target.value)}
                              placeholder="https://example.com/main-book.pdf"
                              className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">Displays a Read Main Book PDF button under the Main Book tab</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mcq-pdf-url" className="text-sm font-medium">MCQ PDF URL</Label>
                            <Input
                              id="mcq-pdf-url"
                              value={formData.mcqPdfUrl || ""}
                              onChange={(e) => updateField("mcqPdfUrl", e.target.value)}
                              placeholder="https://example.com/mcq.pdf"
                              className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">Displays a Read MCQ PDF button under the MCQ tab</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cq-pdf-url" className="text-sm font-medium">Creative Questions PDF URL</Label>
                            <Input
                              id="cq-pdf-url"
                              value={formData.cqPdfUrl || ""}
                              onChange={(e) => updateField("cqPdfUrl", e.target.value)}
                              placeholder="https://example.com/creative.pdf"
                              className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">Displays a Read Creative Questions PDF button under the Creative tab</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'seo' && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <SectionHeader icon={Globe} title="SEO Settings" description="Optimize search engine visibility" />
                      <div className="mt-5 space-y-4">
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
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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
