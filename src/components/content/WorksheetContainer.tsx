'use client'

import React from 'react'

interface WorksheetContainerProps {
  subjectName?: string
  subjectSlug?: string
  chapterName?: string
  activeTab?: string
  children: React.ReactNode
}

/**
 * Educational Worksheet Paper Container
 * Modeled after traditional Bangladesh printed lecture sheets & worksheets
 * Features:
 * - Cream paper worksheet background
 * - Subject-specific uppercase watermark
 * - Corner educational line-art / doodles (books, calculator, formulas, compass)
 * - Section type header ("TYPE: MAIN BOOK", "TYPE: MCQ", "TYPE: CQ")
 * - Worksheet footer brand badge
 */
export default function WorksheetContainer({
  subjectName = 'Education',
  subjectSlug = 'math',
  chapterName = '',
  activeTab = 'explanations',
  children,
}: WorksheetContainerProps) {
  const upperSubject = subjectName.toUpperCase()

  // Format type title based on active tab
  const tabTypeTitle =
    activeTab === 'mcq'
      ? 'MULTIPLE CHOICE QUESTIONS (MCQ)'
      : activeTab === 'creative'
      ? 'CREATIVE QUESTIONS (CQ)'
      : 'MAIN BOOK & EXPLANATIONS'

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 border-amber-950/15 dark:border-slate-800 bg-[#FAF8F2] dark:bg-[#0B1329] text-gray-900 dark:text-gray-100">
      
      {/* ─── Outer Double Sheet Border ─── */}
      <div className="absolute inset-1.5 rounded-xl border border-dashed border-amber-900/20 dark:border-slate-700/60 pointer-events-none z-10" />

      {/* ─── Center Diagonal Subject Watermark ─── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <div className="transform -rotate-45 opacity-[0.06] dark:opacity-[0.05] text-center font-black tracking-widest uppercase text-6xl sm:text-8xl md:text-9xl text-amber-950 dark:text-slate-100 font-sans leading-none whitespace-nowrap">
          {upperSubject}
        </div>
      </div>

      {/* ─── TOP LEFT DOODLE (Books & Pencil & Lightbulb) ─── */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 opacity-30 dark:opacity-20 pointer-events-none select-none z-0 hidden sm:block">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-900 dark:text-slate-300">
          {/* Books */}
          <rect x="15" y="55" width="45" height="12" rx="2" />
          <rect x="20" y="43" width="40" height="12" rx="2" />
          <rect x="18" y="31" width="38" height="12" rx="2" />
          {/* Pencil */}
          <path d="M65 25 L85 45 L50 80 L30 80 L30 60 Z" />
          <path d="M60 30 L80 50" />
          {/* Lightbulb */}
          <path d="M70 15 A 10 10 0 1 1 80 25 C 80 28 77 30 75 32 L 75 36 L 65 36 L 65 32 C 63 30 60 28 60 25 A 10 10 0 0 1 70 15 Z" />
        </svg>
      </div>

      {/* ─── TOP RIGHT DOODLE (Calculator & Math Symbols) ─── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-30 dark:opacity-20 pointer-events-none select-none z-0 hidden sm:block">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-900 dark:text-slate-300">
          {/* Calculator */}
          <rect x="45" y="15" width="40" height="55" rx="5" />
          <rect x="52" y="22" width="26" height="12" rx="2" />
          <circle cx="56" cy="43" r="2" fill="currentColor" />
          <circle cx="65" cy="43" r="2" fill="currentColor" />
          <circle cx="74" cy="43" r="2" fill="currentColor" />
          <circle cx="56" cy="53" r="2" fill="currentColor" />
          <circle cx="65" cy="53" r="2" fill="currentColor" />
          <circle cx="74" cy="53" r="2" fill="currentColor" />
          <circle cx="56" cy="62" r="2" fill="currentColor" />
          <circle cx="65" cy="62" r="2" fill="currentColor" />
          <circle cx="74" cy="62" r="2" fill="currentColor" />
          {/* Sigma & Integral */}
          <path d="M15 25 L32 25 L20 37 L32 49 L15 49" />
          <path d="M22 60 C 27 60 25 70 25 75 C 25 80 23 88 18 88" />
        </svg>
      </div>

      {/* ─── BOTTOM LEFT DOODLE (Triangle Ruler & Compass & Formula) ─── */}
      <div className="absolute bottom-12 left-4 sm:left-6 opacity-30 dark:opacity-20 pointer-events-none select-none z-0 hidden sm:block">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-900 dark:text-slate-300">
          {/* Set Square Triangle */}
          <polygon points="15,85 15,25 75,85" />
          <polygon points="25,75 25,45 55,75" />
          {/* Compass */}
          <path d="M60 20 L40 65 M60 20 L80 65" />
          <circle cx="60" cy="20" r="4" fill="currentColor" />
          <path d="M48 45 L72 45" />
        </svg>
      </div>

      {/* ─── BOTTOM RIGHT DOODLE (Magnifying Glass & Globe & Pi) ─── */}
      <div className="absolute bottom-12 right-4 sm:right-6 opacity-30 dark:opacity-20 pointer-events-none select-none z-0 hidden sm:block">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-900 dark:text-slate-300">
          {/* Magnifying Glass */}
          <circle cx="65" cy="35" r="20" />
          <path d="M51 49 L30 70" strokeWidth="4" />
          {/* Pi Symbol */}
          <path d="M15 65 L40 65 M23 65 L23 85 M34 65 L34 85" strokeWidth="3" />
        </svg>
      </div>

      {/* ─── WORKSHEET CONTENT CONTAINER ─── */}
      <div className="relative z-10 p-4 sm:p-8 lg:p-10">
        
        {/* ─── HEADER SHEET TITLE ("TYPE-1 / TYPE-2" style) ─── */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-200/60 dark:bg-slate-800/80 border border-amber-900/20 dark:border-slate-700 text-amber-950 dark:text-amber-300 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            {tabTypeTitle}
          </div>

          <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white underline decoration-amber-500/40 decoration-wavy underline-offset-8">
            {chapterName || subjectName}
          </h2>

          <div className="mt-2 text-xs font-medium text-amber-900/70 dark:text-slate-400">
            {subjectName} • Chapter Resource &amp; Solution Sheet
          </div>
        </div>

        {/* ─── MAIN DYNAMIC CONTENT ─── */}
        <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-xl p-4 sm:p-6 border border-amber-900/10 dark:border-slate-800 shadow-inner">
          {children}
        </div>

        {/* ─── FOOTER BRAND BANNER ("Follow MATHEMATICS for more" style) ─── */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-amber-100/80 dark:bg-slate-800/90 border border-amber-900/20 dark:border-slate-700 text-amber-900 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs">
            <span>EduLMS Practice Sheet</span>
            <span className="text-amber-400">•</span>
            <span className="text-emerald-700 dark:text-emerald-400">{subjectName}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
