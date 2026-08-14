'use client'

import { useEffect, useCallback } from 'react'
import { X, FileText, BookOpen, CheckSquare, Lightbulb } from 'lucide-react'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  chapterName: string
  section: 'mainbook' | 'mcq' | 'cq'
}

const SECTION_CONFIG = {
  mainbook: {
    label: 'Main Book PDF',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
  },
  mcq: {
    label: 'MCQ PDF',
    icon: CheckSquare,
    color: 'from-teal-500 to-cyan-600',
  },
  cq: {
    label: 'Creative Questions PDF',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-500',
  },
}

/**
 * Wraps a PDF URL so it renders through Google Docs Viewer,
 * which strips the browser's native download toolbar.
 */
function getViewerUrl(rawUrl: string): string {
  if (rawUrl.includes('docs.google.com/viewer')) return rawUrl
  const encoded = encodeURIComponent(rawUrl)
  return `https://docs.google.com/viewer?embedded=true&url=${encoded}`
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  chapterName,
  section,
}: PdfViewerModalProps) {
  const config = SECTION_CONFIG[section]
  const Icon = config.icon

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const viewerUrl = getViewerUrl(pdfUrl)

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/85 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.18s ease' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      {/* Modal Panel */}
      <div
        className="flex flex-col w-full h-full max-w-5xl mx-auto my-4 sm:my-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ animation: 'slideUp 0.22s ease' }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r ${config.color} flex-shrink-0`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
                {config.label}
              </p>
              <h2 className="text-white font-bold text-sm sm:text-base leading-tight truncate max-w-[280px] sm:max-w-[500px]">
                {chapterName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-white/80 bg-black/25 rounded-full px-3 py-1.5">
              <FileText className="h-3 w-3" />
              Read Only
            </span>
            <button
              onClick={onClose}
              aria-label="Close PDF viewer"
              className="h-8 w-8 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors group"
            >
              <X className="h-4 w-4 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* ── PDF Iframe ──────────────────────────────────── */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          {/* Loading shimmer behind iframe */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500 pointer-events-none">
            <div className="h-16 w-16 rounded-2xl bg-gray-800 animate-pulse flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 animate-pulse">Loading PDF…</p>
          </div>

          <iframe
            src={viewerUrl}
            title={`${chapterName} — ${config.label}`}
            className="relative z-10 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 py-2 bg-gray-950 text-gray-500 text-[10px] flex-shrink-0 border-t border-gray-800">
          <FileText className="h-3 w-3" />
          <span>This document is protected — downloading or printing is not available</span>
        </div>
      </div>
    </div>
  )
}
