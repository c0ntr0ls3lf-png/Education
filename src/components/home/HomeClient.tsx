'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen, GraduationCap, ArrowRight, X,
  SlidersHorizontal,
  GraduationCap as GradIcon, Briefcase, Library,
  University, Users, Award, Sparkles, Loader2,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import CategorySidebar from './CategorySidebar'

// ─── Types ────────────────────────────────────────────────────────
interface ClassItem {
  id: string; name: string; slug: string; number: number
  description?: string; icon?: string; color?: string
  categoryId?: string | null; subcategoryId?: string | null
  subjects: Array<{ id: string; name: string }>
}
interface Subcategory {
  id: string; categoryId: string; name: string
  description: string; order: number; isActive: boolean
}
interface Category {
  id: string; name: string; slug: string; description: string
  icon: string; color: string; order: number; isActive: boolean
  subcategories?: Subcategory[]
}
interface HomeClientProps { classes: ClassItem[] }

// ─── Icon map ─────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap: GradIcon, Briefcase, Library, University,
  BookOpen, Users, Award, Sparkles,
}

// ─── Color gradients for class cards ───────────────────────────────
const CLASS_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-600',
  'from-red-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-yellow-600',
  'from-violet-500 to-purple-600',
  'from-teal-500 to-green-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
]

// ─── Mobile Category Filter Panel ────────────────────────────────
function MobileCategoryPanel({
  categories, loading,
  selectedCategory, selectedSubcategory,
  onCategory, onSubcategory, onClear,
}: {
  categories: Category[]; loading: boolean
  selectedCategory: Category | null
  selectedSubcategory: Subcategory | null
  onCategory: (c: Category) => void
  onSubcategory: (s: Subcategory) => void
  onClear: () => void
}) {
  // Runtime safety: ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : []
  const subcats = Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : []

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
      <span className="text-sm text-gray-400">Loading categories…</span>
    </div>
  )

  if (safeCategories.length === 0) return null

  return (
    <div className="space-y-3">

      {/* ── Row 1: Main category chips — all visible, wrap ── */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest
                      text-gray-400 dark:text-gray-500 mb-1.5 px-0.5">
          Main Category
        </p>
        <div className="flex flex-wrap gap-1.5">

          {safeCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon] || GradIcon
            const isActive = selectedCategory?.id === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onCategory(cat)}
                className={[
                  'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold',
                  'border transition-all duration-200 active:scale-95',
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400',
                ].join(' ')}
              >
                <Icon className="h-2.5 w-2.5" />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Row 2: Subcategory chips — visible after category select ── */}
      {selectedCategory && subcats.length > 0 && (
        <div>
          {/* Divider with label */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <ChevronRight className="h-3 w-3 text-emerald-500" />
            <p className="text-[9px] font-bold uppercase tracking-widest
                          text-emerald-500 dark:text-emerald-400">
              {selectedCategory.name}
            </p>
            <div className="flex-1 h-px bg-emerald-100 dark:bg-emerald-900/50" />
          </div>

          <div className="flex flex-wrap gap-1.5">

            {subcats.map(sub => {
              const isSub = selectedSubcategory?.id === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => onSubcategory(sub)}
                  className={[
                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
                    'border transition-all duration-200 active:scale-95',
                    isSub
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400',
                  ].join(' ')}
                >
                  <span className={[
                    'h-1 w-1 rounded-full flex-shrink-0',
                    isSub ? 'bg-white' : 'bg-teal-400',
                  ].join(' ')} />
                  {sub.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main HomeClient ──────────────────────────────────────────────
export default function HomeClient({ classes }: HomeClientProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  useEffect(() => {
    fetch('/api/categories?includeSubcategories=true')
      .then(r => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      })
      .then((d: unknown) => {
        if (!Array.isArray(d)) {
          console.warn('Categories API returned non-array:', d)
          setCategories([])
        } else {
          const cats = d as Category[]
          setCategories(cats)
          // Default select "Secondary Education" on load
          let foundSub: Subcategory | null = null
          let foundParent: Category | null = null
          for (const cat of cats) {
            if (cat.name === 'Secondary Education') {
              foundParent = cat
              break
            }
            if (cat.subcategories) {
              const sub = cat.subcategories.find(s => s.name === 'Secondary Education')
              if (sub) {
                foundSub = sub
                foundParent = cat
                break
              }
            }
          }
          if (foundSub) {
            setSelectedSubcategory(foundSub)
            setSelectedCategory(foundParent)
          } else if (foundParent) {
            setSelectedCategory(foundParent)
          }
        }
        setCatLoading(false)
      })
      .catch(() => {
        setCategories([])
        setCatLoading(false)
      })
  }, [])

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat)
    setSelectedSubcategory(null)
  }
  const handleSubcategoryClick = (sub: Subcategory) => {
    const parent = categories.find(c => c.id === sub.categoryId)
    if (parent) setSelectedCategory(parent)
    setSelectedSubcategory(sub)
  }
  // Reset = go back to Secondary Education (or first category if not found)
  const handleClearFilter = () => {
    setSelectedSubcategory(null)
    if (categories.length > 0) {
      const secondaryEducation = categories.find(c => c.name === 'Secondary Education')
      setSelectedCategory(secondaryEducation || categories[0])
    }
  }

  // ── Filter ───────────────────────────────────────────────────────
  const displayClasses = (() => {
    if (selectedSubcategory) return classes.filter(c => c.subcategoryId === selectedSubcategory.id)
    if (selectedCategory)    return classes.filter(c => c.categoryId    === selectedCategory.id)
    // Default: filter to Secondary Education (classes 6-10) by class number
    return classes.filter(c => c.number >= 6 && c.number <= 10)
  })()

  const activeLabel = selectedSubcategory?.name ?? selectedCategory?.name ?? null

  return (
    <div>
      {/* ══ MOBILE / TABLET filter panel (hidden lg+) ═══════════════ */}
      <div className="lg:hidden mb-6">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800
                        bg-white dark:bg-gray-900 shadow-sm overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2
                          bg-gradient-to-r from-emerald-50 to-teal-50
                          dark:from-emerald-950/40 dark:to-teal-950/40
                          border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center">
                <SlidersHorizontal className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-white">
                Category Filter
              </span>
              {activeLabel && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full
                                  bg-emerald-100 dark:bg-emerald-900/50
                                  text-emerald-700 dark:text-emerald-300 font-semibold">
                  {activeLabel}
                </span>
              )}
            </div>

            {activeLabel && (
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-0.5 text-[10px] text-gray-400
                           hover:text-red-500 dark:hover:text-red-400
                           px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30
                           transition-all border border-transparent
                           hover:border-red-200 dark:hover:border-red-800 font-medium"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Panel body — chips */}
          <div className="p-3">
            <MobileCategoryPanel
              categories={categories}
              loading={catLoading}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategory={handleCategoryClick}
              onSubcategory={handleSubcategoryClick}
              onClear={handleClearFilter}
            />
          </div>

          {/* Panel footer — result count */}
          {!catLoading && (
            <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800
                            bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {activeLabel ? `Filtered: ${activeLabel}` : 'All classes'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {displayClasses.length} class{displayClasses.length !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══ CONTENT GRID ═════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Classes col ─────────────────────────────────────────── */}
        <div className="lg:col-span-3">

          {/* Desktop active filter badge */}
          {activeLabel && (
            <div className="hidden lg:flex mb-5 items-center justify-between gap-4
                            px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl
                            border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeLabel}</p>
                <span className="text-xs text-gray-400">
                  · {displayClasses.length} class{displayClasses.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-1.5 text-xs text-gray-500
                           hover:text-gray-800 dark:hover:text-gray-200
                           px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-colors border border-transparent
                           hover:border-gray-200 dark:hover:border-gray-700"
              >
                <X className="h-3.5 w-3.5" /> Show All
              </button>
            </div>
          )}

          {/* Classes grid */}
          {displayClasses.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {displayClasses.map((cls, index) => {
                const colorClass = CLASS_COLORS[index % CLASS_COLORS.length];
                return (
                  <Link key={cls.id} href={`/class/${cls.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl shadow-md
                                    hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                                    bg-white dark:bg-gray-900 h-full">
                      <div className={`bg-gradient-to-r ${colorClass}
                                      px-4 py-3.5 flex items-center justify-between`}>
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-lg bg-white/20
                                          flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base leading-tight">
                              {cls.name}
                            </h3>
                            <p className="text-white/75 text-xs mt-0.5">
                              {cls.subjects?.length || 0} Subjects
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/60
                                              group-hover:text-white group-hover:translate-x-1
                                              transition-all shrink-0" />
                      </div>
                      <div className="px-4 py-3.5">
                        <p className="text-gray-500 dark:text-gray-400 text-xs
                                      leading-relaxed mb-3 line-clamp-2">
                          {cls.description
                            || `Explore ${cls.name} subjects, chapters, and study materials`}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1
                                           text-emerald-600 dark:text-emerald-400 font-medium">
                            <BookOpen className="h-3 w-3" />
                            {cls.subjects?.length || 0} Subjects
                          </span>
                          <Badge className="bg-orange-100 text-orange-700
                                            dark:bg-orange-900/30 dark:text-orange-400
                                            border-0 text-xs px-2 py-0.5 hover:bg-orange-100">
                            Free
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center
                              rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <GraduationCap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              {activeLabel ? (
                <>
                  <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
                    &ldquo;{activeLabel}&rdquo; তে কোনো ক্লাস পাওয়া যায়নি
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 max-w-xs mx-auto">
                    এই category-তে এখনো কোনো class assign করা হয়নি।
                  </p>
                  <button
                    onClick={handleClearFilter}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-emerald-600 hover:bg-emerald-700 text-white text-sm
                               font-semibold transition-all active:scale-95"
                  >
                    <X className="h-4 w-4" />
                    সব ক্লাস দেখাও
                  </button>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  কোনো ক্লাস পাওয়া যায়নি।
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Desktop sidebar ──────────────────────────────────────── */}
        <div className="hidden lg:block lg:col-span-1">
          <CategorySidebar
            categories={categories}
            loading={catLoading}
            onCategoryClick={handleCategoryClick}
            onSubcategoryClick={handleSubcategoryClick}
            selectedCategoryId={selectedCategory?.id}
            selectedSubcategoryId={selectedSubcategory?.id}
          />
        </div>
      </div>
    </div>
  )
}
