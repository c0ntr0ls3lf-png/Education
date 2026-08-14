'use client'

import {
  GraduationCap, Briefcase, Library, University,
  BookOpen, Users, Award, Sparkles,
  ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface Subcategory {
  id: string; categoryId: string; name: string
  description: string; order: number; isActive: boolean
}
interface Category {
  id: string; name: string; slug: string; description: string
  icon: string; color: string; order: number; isActive: boolean
  subcategories?: Subcategory[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, Briefcase, Library, University,
  BookOpen, Users, Award, Sparkles,
}

interface CategorySidebarProps {
  // If passed from parent (preferred — avoids extra API call)
  categories?: Category[]
  loading?: boolean
  // Callbacks
  onCategoryClick?: (category: Category) => void
  onSubcategoryClick?: (subcategory: Subcategory) => void
  // Active state
  selectedCategoryId?: string
  selectedSubcategoryId?: string
}

export default function CategorySidebar({
  categories: externalCategories,
  loading: externalLoading,
  onCategoryClick,
  onSubcategoryClick,
  selectedCategoryId,
  selectedSubcategoryId,
}: CategorySidebarProps) {
  // Only fetch internally if parent didn't provide categories
  const [internalCategories, setInternalCategories] = useState<Category[]>([])
  const [internalLoading, setInternalLoading] = useState(!externalCategories)

  useEffect(() => {
    if (externalCategories) return  // parent is managing data
    fetch('/api/categories?includeSubcategories=true')
      .then(r => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      })
      .then(d => {
        if (Array.isArray(d)) {
          setInternalCategories(d)
        } else {
          setInternalCategories([])
        }
        setInternalLoading(false)
      })
      .catch(() => {
        setInternalCategories([])
        setInternalLoading(false)
      })
  }, [externalCategories])

  // Runtime safety: ensure categories is always an array
  const rawCategories = externalCategories ?? internalCategories
  const categories = Array.isArray(rawCategories) ? rawCategories : []
  const loading    = externalLoading    ?? internalLoading

  // Auto-expand the category that is selected (or first category)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCategoryId) {
      setExpandedId(selectedCategoryId)
    } else if (categories.length > 0 && !expandedId) {
      setExpandedId(categories[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, categories.length])

  const toggle = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id))

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
    </div>
  )

  if (categories.length === 0) return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Categories</h3>

      {categories.map(cat => {
        const Icon        = ICON_MAP[cat.icon] || GraduationCap
        const isExpanded  = expandedId === cat.id
        const hasSubs     = Array.isArray(cat.subcategories) && cat.subcategories.length > 0
        const isCatActive = selectedCategoryId === cat.id && !selectedSubcategoryId

        return (
          <div
            key={cat.id}
            className={[
              'rounded-xl border overflow-hidden transition-all duration-200',
              isCatActive
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
            ].join(' ')}
          >
            {/* ── Category header row ── */}
            <button
              onClick={() => {
                if (hasSubs) toggle(cat.id)
                onCategoryClick?.(cat)
              }}
              className={[
                'w-full px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer',
                isCatActive
                  ? 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className={[
                  'font-semibold text-sm truncate',
                  isCatActive
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-900 dark:text-white',
                ].join(' ')}>
                  {cat.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cat.description}</p>
              </div>
              {hasSubs && (
                <div className="shrink-0">
                  {isExpanded
                    ? <ChevronUp   className="h-4 w-4 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              )}
            </button>

            {/* ── Subcategories ── */}
            {hasSubs && isExpanded && (
              <div className="px-4 pb-3 pt-0 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5 mt-2">
                  {cat.subcategories!.map(sub => {
                    const isSubActive = selectedSubcategoryId === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSubcategoryClick?.(sub)}
                        className={[
                          'w-full text-left flex items-start gap-2 pl-2 rounded-lg p-2',
                          'transition-all duration-150',
                          isSubActive
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
                        ].join(' ')}
                      >
                        <div className={[
                          'h-1.5 w-1.5 rounded-full mt-[5px] flex-shrink-0 transition-colors',
                          isSubActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
                        ].join(' ')} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{sub.name}</p>
                          {sub.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
