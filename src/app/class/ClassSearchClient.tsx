'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight, GraduationCap } from 'lucide-react'

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
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by class name, number, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10 h-12 text-base rounded-xl border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400"
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
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Showing {filteredClasses.length} of {classes.length} classes
        </p>
      )}

      {/* Class Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No classes found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredClasses.map((cls) => (
            <Link key={cls.id} href={`/class/${cls.slug}`}>
              <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {cls.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 text-foreground">{cls.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {cls.description || `${cls.subjects?.length || 0} subjects to explore`}
                  </p>
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {cls.subjects?.length || 0} Subjects
                  </Badge>
                  <div className="mt-3 flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
