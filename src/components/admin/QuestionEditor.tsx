'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon,
  Sigma, Code, Eye, EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MathRenderer } from '@/components/exam/MathRenderer'

interface QuestionEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  label?: string
}

export default function QuestionEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  minHeight = 100,
  label,
}: QuestionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const emitChange = useCallback((html: string) => {
    isInternalChange.current = true
    onChange(html)
  }, [onChange])

  const syncFromEditor = useCallback(() => {
    if (editorRef.current) {
      emitChange(editorRef.current.innerHTML)
    }
  }, [emitChange])

  // Sync external value into the editor without fighting user input
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
    syncFromEditor()
  }

  const handleInsertMath = () => {
    const display = confirm('Block-level formula? (Cancel for inline)')
    const formula = prompt(
      display
        ? 'Enter LaTeX formula (block): e.g. \\int_0^1 x^2 dx'
        : 'Enter LaTeX formula (inline): e.g. \\frac{a}{b}'
    )
    if (!formula) return

    const delim = display ? '$$' : '$'
    const cls = display
      ? 'math-block block text-center my-2 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-emerald-700 dark:text-emerald-300 text-sm'
      : 'math-inline inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-emerald-700 dark:text-emerald-300 text-sm'
    execCommand(
      'insertHTML',
      `<span class="${cls}" contenteditable="false">${delim}${formula}${delim}</span>&nbsp;`
    )
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

  const toolbarButtons: (
    | { icon: React.ElementType; label: string; action: () => void }
    | { type: 'separator' }
  )[] = [
    { icon: Bold, label: 'Bold', action: () => execCommand('bold') },
    { icon: Italic, label: 'Italic', action: () => execCommand('italic') },
    { icon: Underline, label: 'Underline', action: () => execCommand('underline') },
    { type: 'separator' },
    { icon: List, label: 'Bullet List', action: () => handleInsertList('ul') },
    { icon: ListOrdered, label: 'Numbered List', action: () => handleInsertList('ol') },
    { type: 'separator' },
    { icon: Link2, label: 'Insert Link', action: handleInsertLink },
    { icon: ImageIcon, label: 'Insert Image', action: handleInsertImage },
    { type: 'separator' },
    { icon: Sigma, label: 'Insert LaTeX Formula', action: handleInsertMath },
  ]

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      )}

      <div
        className={cn(
          'rounded-lg border transition-all duration-200 overflow-hidden',
          isFocused
            ? 'border-emerald-500/50 ring-2 ring-emerald-500/10 shadow-sm'
            : 'border-input hover:border-muted-foreground/25'
        )}
      >
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
                key={idx}
                type="button"
                onClick={btn.action}
                title={btn.label}
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

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleToggleHtml}
            title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Code'}
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

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Hide Preview' : 'Show LaTeX Preview'}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
              showPreview
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Preview
          </button>
        </div>

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
            onBlur={() => {
              syncFromEditor()
              setIsFocused(false)
            }}
            onFocus={() => setIsFocused(true)}
            onPaste={handlePaste}
            data-placeholder={placeholder}
            className={cn(
              'p-4 focus:outline-none text-sm leading-relaxed min-h-[80px]',
              'empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]',
              '[&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-700',
              '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
              '[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2',
              '[&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground'
            )}
            style={{ minHeight: minHeight + 'px' }}
          />
        )}
      </div>

      {showPreview && value && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 p-3">
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">
            LaTeX Preview
          </p>
          <MathRenderer content={value} className="text-sm" />
        </div>
      )}
    </div>
  )
}
