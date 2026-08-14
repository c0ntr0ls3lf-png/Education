'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon,
  Code, Sigma, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  Table as TableIcon, HelpCircle, Eraser, Quote, Sparkles, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MathRenderer } from '@/components/exam/MathRenderer'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  showMathButton?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content here...',
  minHeight = 350,
  showMathButton = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isInternalChange = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHtmlMode, setIsHtmlMode] = useState(false)

  // Math builder states
  const [mathDialogOpen, setMathDialogOpen] = useState(false)
  const [formula, setFormula] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)

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

  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val)
    syncFromEditor()
    editorRef.current?.focus()
  }

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g., https://example.com):')
    if (url) {
      let fullUrl = url.trim()
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = 'https://' + fullUrl
      }
      execCommand('createLink', fullUrl)
    }
  }

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) execCommand('insertImage', url)
  }

  const handleInsertList = (type: 'ul' | 'ol') => {
    execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html')
    if (html) {
      e.preventDefault()
      document.execCommand('insertHTML', false, html)
      syncFromEditor()
    } else {
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

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + latex.length, start + latex.length)
    }, 0)
  }

  const handleToggleHtml = () => {
    if (isHtmlMode) {
      if (editorRef.current) {
        editorRef.current.innerHTML = value || ''
      }
    } else {
      syncFromEditor()
    }
    setIsHtmlMode(!isHtmlMode)
  }

  // Formatting helpers
  const handleHeading = (tag: string) => {
    execCommand('formatBlock', `<${tag}>`)
  }

  const handleHighlight = () => {
    const color = prompt('Enter background color name/hex (e.g. yellow, #ff00ff) or leave empty to default yellow:', 'yellow')
    execCommand('backColor', color || 'yellow')
  }

  const handleInsertTable = () => {
    const rowsInput = prompt('Enter number of rows:', '3')
    const colsInput = prompt('Enter number of columns:', '3')
    const rows = parseInt(rowsInput || '0')
    const cols = parseInt(colsInput || '0')

    if (rows > 0 && cols > 0) {
      let tableHtml = '<table class="w-full border-collapse border border-gray-300 dark:border-gray-700 my-4 text-sm">'
      tableHtml += '<thead><tr class="bg-muted/40">'
      for (let c = 0; c < cols; c++) {
        tableHtml += `<th class="border border-gray-300 dark:border-gray-700 p-2.5 font-semibold text-left">Header ${c + 1}</th>`
      }
      tableHtml += '</tr></thead><tbody>'
      for (let r = 0; r < rows; r++) {
        tableHtml += '<tr>'
        for (let c = 0; c < cols; c++) {
          tableHtml += `<td class="border border-gray-300 dark:border-gray-700 p-2.5">Row ${r + 1} Col ${c + 1}</td>`
        }
        tableHtml += '</tr>'
      }
      tableHtml += '</tbody></table>&nbsp;'
      execCommand('insertHTML', tableHtml)
    }
  }

  const handleInsertFAQ = () => {
    const question = prompt('Enter FAQ Question:')
    const answer = prompt('Enter FAQ Answer:')
    if (question && answer) {
      const faqHtml = `
        <details class="border border-gray-200 dark:border-gray-800 rounded-xl my-4 overflow-hidden group">
          <summary class="flex items-center justify-between p-4 font-semibold text-sm cursor-pointer select-none bg-muted/20 hover:bg-muted/40 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <span>${question}</span>
            <span class="text-xs transition-transform duration-200 group-open:rotate-180">▼</span>
          </summary>
          <div class="p-4 text-sm leading-relaxed text-muted-foreground border-t border-gray-200 dark:border-gray-800 bg-background">
            ${answer}
          </div>
        </details>&nbsp;
      `
      execCommand('insertHTML', faqHtml)
    }
  }

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
      'rounded-lg border transition-all duration-200 overflow-hidden flex flex-col',
      isFocused
        ? 'border-emerald-500/50 ring-2 ring-emerald-500/10 shadow-sm'
        : 'border-input hover:border-muted-foreground/25'
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b flex-wrap">
        <button type="button" onClick={() => handleHeading('h2')} title="Heading 1" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Heading1 className="h-4 w-4" /></button>
        <button type="button" onClick={() => handleHeading('h3')} title="Heading 2" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => handleHeading('p')} title="Paragraph" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground font-semibold text-xs">P</button>
        
        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" onClick={() => execCommand('bold')} title="Bold" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('italic')} title="Italic" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('underline')} title="Underline" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Underline className="h-4 w-4" /></button>
        <button type="button" onClick={handleHighlight} title="Highlight / Mark" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground font-semibold text-xs border border-muted-foreground/20 px-1 bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700">Mark</button>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" onClick={() => execCommand('justifyLeft')} title="Align Left" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><AlignLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Align Center" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><AlignCenter className="h-4 w-4" /></button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Align Right" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><AlignRight className="h-4 w-4" /></button>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" onClick={() => handleInsertList('ul')} title="Bullet List" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><List className="h-4 w-4" /></button>
        <button type="button" onClick={() => handleInsertList('ol')} title="Numbered List" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><ListOrdered className="h-4 w-4" /></button>

        <div className="w-px h-5 bg-border mx-1" />

        <button type="button" onClick={handleInsertLink} title="Insert Link" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Link2 className="h-4 w-4" /></button>
        <button type="button" onClick={handleInsertImage} title="Insert Image" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><ImageIcon className="h-4 w-4" /></button>
        <button type="button" onClick={handleInsertTable} title="Insert Table" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><TableIcon className="h-4 w-4" /></button>
        <button type="button" onClick={handleInsertFAQ} title="Insert FAQ Accordion" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><HelpCircle className="h-4 w-4" /></button>

        {showMathButton && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <button type="button" onClick={openMathDialog} title="Insert Math Formula" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Sigma className="h-4 w-4" /></button>
          </>
        )}

        <button type="button" onClick={() => execCommand('removeFormat')} title="Clear Formatting" disabled={isHtmlMode} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground ml-1"><Eraser className="h-4 w-4" /></button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* HTML/Code Toggle */}
        <button
          type="button"
          onClick={handleToggleHtml}
          title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to Custom HTML'}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border border-border bg-background',
            isHtmlMode
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800'
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
          ref={textareaRef}
          className="w-full p-4 text-sm font-mono leading-relaxed focus:outline-none resize-y bg-background border-0 outline-none"
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
          className={cn(
            'p-4 focus:outline-none text-sm leading-relaxed overflow-y-auto outline-none',
            'empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]',
            '[&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-700',
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
            '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3 [&_img]:mx-auto [&_img]:block',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3',
            '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2',
            '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1.5',
            '[&_p]:my-2 [&_p]:leading-relaxed',
            '[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:my-3 [&_table_td]:border [&_table_td]:border-border [&_table_td]:p-2 [&_table_th]:border [&_table_th]:border-border [&_table_th]:p-2 [&_table_th]:bg-muted/40 [&_table_th]:font-semibold',
            '[&_details]:border [&_details]:border-border [&_details]:rounded-xl [&_details]:my-3 [&_details_summary]:p-3 [&_details_summary]:font-medium [&_details_summary]:bg-muted/10'
          )}
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
                  {mathCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 border-b pb-0.5">{cat.name}</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {cat.items.map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            type="button"
                            onClick={() => handleInsertSymbol(item.latex)}
                            className="text-left text-[11px] p-1 rounded hover:bg-accent text-foreground transition-colors truncate"
                            title={item.latex}
                          >
                            <span className="font-mono text-muted-foreground/80 mr-1.5">{item.latex}</span>
                            <span className="text-muted-foreground">({item.label.split(' ')[0]})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setMathDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={insertMathFormula} className="bg-emerald-600 hover:bg-emerald-700 text-white">Insert Formula</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
