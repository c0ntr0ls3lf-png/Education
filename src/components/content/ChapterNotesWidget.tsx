'use client'

import { useState, useEffect, useRef } from 'react'
import { BookOpen, X } from 'lucide-react'

interface ChapterNotesWidgetProps {
  content: string | null | undefined
}

function sanitizeHtml(html: string): string {
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  s = s.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  s = s.replace(/(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
    (m) => m.replace(/javascript:/gi, ''))
  s = s.replace(/<iframe\b(?![\s\S]*?youtube\.com)[\s\S]*?<\/iframe>/gi, '')
  s = s.replace(/background-color\s*:\s*[^;'"]+[;'"]/gi, '')
  s = s.replace(/\bcolor\s*:\s*(white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))[;'"]/gi, '')
  return s
}

export default function ChapterNotesWidget({ content }: ChapterNotesWidgetProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const hasContent = !!(content && content.trim())
  const sanitizedContent = hasContent ? sanitizeHtml(content!) : ''

  // Only render on client to avoid SSR mismatch with fixed positioning
  useEffect(() => { setMounted(true) }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // slight delay so the open-click itself doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [open])

  if (!mounted) return null

  return (
    <>
      {/* ── Floating Pill Button — bottom-right ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '16px',
          zIndex: 9999,
          transition: 'transform 0.2s ease',
        }}
      >
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle Chapter Notes"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          style={{
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            borderRadius: '50%',
            width: '52px',
            height: '52px',
            background: open
              ? 'linear-gradient(135deg, #047857, #065f46)'
              : 'linear-gradient(135deg, #059669, #10b981)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(5,150,105,0.55), 0 2px 8px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {open ? (
            <X style={{ width: 20, height: 20 }} />
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.03em', lineHeight: 1 }}>
              Note
            </span>
          )}
        </button>
      </div>

      {/* ── Sidebar panel ── */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed',
          top: 0,
          right: open ? '0px' : '-340px',
          width: '320px',
          height: '100vh',
          transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 9998,
          backgroundColor: '#111827',
          borderLeft: '1px solid #1f2937',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #1f2937',
          backgroundColor: '#1f2937',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen style={{ width: 16, height: 16, color: '#34d399' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb' }}>
              Chapter Notes
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#374151 transparent',
        }}>
          {hasContent ? (
            <div
              className="prose prose-sm prose-invert max-w-none
                prose-headings:text-gray-100 prose-headings:font-semibold
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:text-gray-300
                prose-strong:text-gray-100
                prose-a:text-emerald-400
                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500
                prose-blockquote:text-gray-300 prose-blockquote:not-italic
                prose-code:text-emerald-400 prose-code:text-xs
                [&_*]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 32 }}>
              No notes available.
            </p>
          )}
        </div>
      </div>

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
      )}
    </>
  )
}
