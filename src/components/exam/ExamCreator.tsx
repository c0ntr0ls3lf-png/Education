'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Layers,
  GraduationCap,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

interface ExamConfig {
  sourceType: 'chapter' | 'subject' | 'class'
  sourceIds: string[]
  questionCount: number
  examType: 'mcq' | 'creative'
  difficulty: 'mixed'
}

interface ExamCreatorProps {
  onGenerate: (config: ExamConfig) => void
  isGenerating?: boolean
  defaultClassId?: string
}

interface ClassItem {
  id: string
  name: string
  number: number
  icon?: string
}

interface SubjectItem {
  id: string
  name: string
  classId: string
  icon?: string
}

interface ChapterItem {
  id: string
  name: string
  subjectId: string
}

const questionCounts = [10, 20, 50, 100]

const examTypes = [
  { value: 'mcq' as const, label: 'MCQ Exam', icon: Target, desc: 'Multiple choice questions' },
  { value: 'creative' as const, label: 'Creative Exam', icon: Sparkles, desc: 'Written/descriptive answers' },
]



export function ExamCreator({ onGenerate, isGenerating = false, defaultClassId }: ExamCreatorProps) {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingChapters, setLoadingChapters] = useState(false)

  const [config, setConfig] = useState<ExamConfig>({
    sourceType: 'subject',
    sourceIds: [],
    questionCount: 20,
    examType: 'mcq',
    difficulty: 'mixed' as const,
  })

  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all')

  // Sync defaultClassId
  useEffect(() => {
    if (defaultClassId) {
      setSelectedClassId(defaultClassId)
    }
  }, [defaultClassId])

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/classes')
        if (res.ok) {
          const data = await res.json()
          setClasses(Array.isArray(data) ? data : [])
        }
      } catch {} finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [])

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([])
      setChapters([])
      return
    }
    setLoadingSubjects(true)
    setSelectedSubjectId('')
    setSelectedChapterId('all')
    setChapters([])
    fetch(`/api/subjects?classId=${selectedClassId}&include=chapters`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setSubjects(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoadingSubjects(false))
  }, [selectedClassId])

  // Fetch chapters when subject changes (for single-chapter mode)
  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([])
      setSelectedChapterId('all')
      return
    }
    // Find the subject's chapters from the already-loaded data
    const subj = subjects.find(s => s.id === selectedSubjectId)
    if (subj && (subj as any).chapters) {
      setChapters((subj as any).chapters)
    } else {
      setLoadingChapters(true)
      fetch(`/api/chapters?subjectId=${selectedSubjectId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => setChapters(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingChapters(false))
    }
    setSelectedChapterId('all')
  }, [selectedSubjectId, subjects])

  // Update sourceIds when selections change
  useEffect(() => {
    if (!selectedClassId) {
      setConfig(prev => ({ ...prev, sourceType: 'class', sourceIds: [] }))
      return
    }

    const chapter = chapters.find(c => c.id === selectedChapterId)
    if (chapter && selectedChapterId !== 'all') {
      // Single chapter selected
      setConfig(prev => ({ ...prev, sourceType: 'chapter', sourceIds: [chapter.id] }))
    } else if (selectedSubjectId) {
      // Entire subject selected (all chapters)
      setConfig(prev => ({ ...prev, sourceType: 'subject', sourceIds: [selectedSubjectId] }))
    } else {
      // Entire class selected (all subjects)
      setConfig(prev => ({ ...prev, sourceType: 'class', sourceIds: [selectedClassId] }))
    }
  }, [selectedClassId, selectedSubjectId, selectedChapterId, chapters])

  const handleGenerate = () => {
    onGenerate(config)
  }

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)
  const selectedChapter = chapters.find(c => c.id === selectedChapterId)

  const getSourceLabel = () => {
    if (selectedChapter && selectedChapterId !== 'all') return selectedChapter.name
    if (selectedSubject) return `${selectedSubject.name} (All Chapters)`
    if (selectedClass) return `Class ${selectedClass.number} ${selectedClass.name}`
    return '—'
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Select Class */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Step 1: Select Class
        </h3>
        <Select
          value={selectedClassId}
          onValueChange={setSelectedClassId}
          disabled={loadingClasses}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Choose a class'} />
          </SelectTrigger>
          <SelectContent>
            {classes.map(cls => {
              const isDisabled = defaultClassId ? cls.id !== defaultClassId : false
              return (
                <SelectItem key={cls.id} value={cls.id} disabled={isDisabled}>
                  <span className="flex items-center gap-2">
                    {cls.icon && <span>{cls.icon}</span>}
                    <span>Class {cls.number} - {cls.name}</span>
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Step 4: Exam Type */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Step 4: Exam Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examTypes.map(type => {
            const Icon = type.icon
            const isSelected = config.examType === type.value
            return (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setConfig(prev => ({ ...prev, examType: type.value }))}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md'
                    : 'border-muted hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`font-semibold ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Step 5: Question Count */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Step 6: Number of Questions
        </h3>
        <div className="flex flex-wrap gap-3">
          {questionCounts.map(count => {
            const isSelected = config.questionCount === count
            return (
              <motion.button
                key={count}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfig(prev => ({ ...prev, questionCount: count }))}
                className={`px-6 py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-md'
                    : 'border-muted hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground'
                }`}
              >
                {count}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Summary & Generate */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-lg">Exam Summary</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {getSourceLabel()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {config.questionCount} Questions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {config.examType === 'mcq' ? 'MCQ' : 'Creative'}
                </Badge>

              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedClassId}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-8"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Exam
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
