'use client'

import { useState, useMemo } from 'react'
import { Search, X, BookOpen, ArrowRight, GraduationCap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string | null
  icon?: string | null
  color?: string | null
  subjects: Array<{ id: string; name: string }>
}

interface ClassSearchClientProps {
  classes: ClassItem[]
}

export default function ClassSearchClient({ classes }: ClassSearchClientProps) {
  const [search, setSearch] = useState('')

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes
    const q = search.toLowerCase().trim()
    return classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(q) ||
        cls.number.toString().includes(q) ||
        cls.description?.toLowerCase().includes(q) ||
        cls.subjects?.some((s) => s.name.toLowerCase().includes(q))
    )
  }, [classes, search])

  return (
    <>
      {/* Search Bar */}
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by class name, number, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Results count */}
      {search.trim() && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Showing {filteredClasses.length} of {classes.length} classes
        </p>
      )}

      {/* Class Grid — matches Class > Subject card layout */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No classes found</h3>
          <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredClasses.map((cls) => (
            <Link key={cls.id} href={`/class/${cls.slug}`}>
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-900 h-full">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {cls.name}
                      </h3>
                      <p className="text-white/80 text-sm mt-0.5">
                        {cls.subjects?.length || 0} Subjects
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* White Content Area */}
                <div className="px-5 py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    {cls.description || `Explore ${cls.name} subjects, chapters, and study materials`}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <BookOpen className="h-3.5 w-3.5" />
                      {cls.subjects?.length || 0} Subjects
                    </span>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 text-xs px-2 py-0.5 hover:bg-orange-100">
                      Free
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
