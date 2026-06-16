'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, GraduationCap, BookOpen, Layers, FileText,
  Lightbulb, CheckSquare, ClipboardList, Megaphone, Users, Settings,
  Bell, Search, Menu, X, Plus, Pencil, Trash2, ChevronDown,
  ArrowLeft, TrendingUp, Eye, Activity, ChevronRight, CheckCircle,
  AlertCircle, RefreshCw, Quote
} from 'lucide-react'
import EditChapterModal from '@/components/admin/EditChapterModal'
import McqEditor from '@/components/admin/McqEditor'
import type { McqFormData } from '@/components/admin/McqEditor'
import CreativeEditor from '@/components/admin/CreativeEditor'
import type { CqFormData } from '@/components/admin/CreativeEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────
interface ClassItem {
  id: string; name: string; slug: string; number: number;
  description?: string; icon?: string; color?: string; order: number; isActive: boolean;
}
interface SubjectItem {
  id: string; name: string; slug: string; classId: string;
  description?: string; icon?: string; color?: string; order: number; isActive: boolean;
  class?: { id: string; name: string }
}
interface ChapterItem {
  id: string; name: string; slug: string; subjectId: string;
  description?: string; icon?: string; color?: string; order: number; isActive: boolean;
  subject?: {
    id: string;
    name: string;
    classId?: string;
    class?: { id: string; name: string }
  }
}
interface McqItem {
  id: string; chapterId: string; question: string; optionA: string; optionB: string;
  optionC: string | null; optionD: string | null; options?: string | null; correctAnswer: string; explanation?: string;
  marks: number; difficulty: string; tags?: string; order: number; isActive: boolean;
}
interface CreativeItem {
  id: string; chapterId: string; label: string; question: string; answer?: string;
  marks: number; difficulty: string; explanation?: string; tags?: string; order: number; isActive: boolean;
}
interface ExplanationItem {
  id: string; chapterId: string; question: string; solution?: string;
  videoUrl?: string; difficulty: string; tags?: string; order: number; isActive: boolean;
}
interface AdItem {
  id: string; name: string; slug: string; location: string; type: string;
  code?: string; imageUrl?: string; linkUrl?: string; provider?: string;
  isActive: boolean; impressions: number; clicks: number;
}
interface UserItem {
  id: string; name?: string; email: string; role: string; image?: string; phone?: string; classId?: string; createdAt: string;
  password?: string;
}
interface ExamItem {
  id: string; title: string; slug: string; type: string; totalQuestions: number;
  duration: number; difficulty: string; isActive: boolean;
  _count?: { attempts: number }
}
interface QuoteItem {
  id: string; text: string; author?: string; order: number; isActive: boolean;
  createdAt: string;
}
interface Stats {
  totalClasses: number; totalSubjects: number; totalChapters: number;
  totalExplanations: number; totalCreativeQuestions: number; totalMcqQuestions: number;
  totalQuestions: number; totalUsers: number; totalExams: number; totalExamAttempts: number;
  totalTestimonials?: number;
  totalFaqs?: number;
}

type ViewType = 'dashboard' | 'classes' | 'subjects' | 'chapters' | 'explanations' |
  'creative-questions' | 'mcq-questions' | 'exams' | 'ads' | 'users' | 'settings' | 'quotes'

// ─── Navigation Items ─────────────────────────────────────────
const navItems: { key: ViewType; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'classes', label: 'Classes', icon: <GraduationCap className="h-4 w-4" /> },
  { key: 'subjects', label: 'Subjects', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'chapters', label: 'Chapters', icon: <Layers className="h-4 w-4" /> },
  { key: 'quotes', label: 'Quotes', icon: <Quote className="h-4 w-4" /> },
  { key: 'ads', label: 'Ads', icon: <Megaphone className="h-4 w-4" /> },
  { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
]

const viewLabels: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  classes: 'Class Management',
  subjects: 'Subject Management',
  chapters: 'Chapter Management',
  explanations: 'Explanation Management',
  'creative-questions': 'Creative Questions',
  'mcq-questions': 'MCQ Questions',
  exams: 'Exam Management',
  ads: 'Ad Management',
  quotes: 'Quote Management',
  users: 'User Management',
  settings: 'Site Settings',
}

// ─── Helper ───────────────────────────────────────────────────
const difficultyColor = (d: string) => {
  switch (d) {
    case 'easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
}

export default function AdminPage() {
  const { toast } = useToast()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [mcqQuestions, setMcqQuestions] = useState<McqItem[]>([])
  const [creativeQuestions, setCreativeQuestions] = useState<CreativeItem[]>([])
  const [explanations, setExplanations] = useState<ExplanationItem[]>([])
  const [ads, setAds] = useState<AdItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [exams, setExams] = useState<ExamItem[]>([])
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})

  // Filter states
  const [filterClassId, setFilterClassId] = useState('all')
  const [filterSubjectId, setFilterSubjectId] = useState('all')
  const [filterChapterId, setFilterChapterId] = useState('all')

  // User filter states
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userClassFilter, setUserClassFilter] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHash, setPasswordHash] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Chapter modal state (uses premium EditChapterModal component)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [chapterEditing, setChapterEditing] = useState<ChapterItem | null>(null)

  // MCQ / CQ editor states
  const [mcqEditorOpen, setMcqEditorOpen] = useState(false)
  const [mcqEditing, setMcqEditing] = useState<McqItem | null>(null)
  const [mcqSaving, setMcqSaving] = useState(false)
  const [cqEditorOpen, setCqEditorOpen] = useState(false)
  const [cqEditing, setCqEditing] = useState<CreativeItem | null>(null)
  const [cqSaving, setCqSaving] = useState(false)

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [])

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/classes?include=subjects')
      if (res.ok) setClasses(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterClassId && filterClassId !== 'all'
        ? `/api/subjects?classId=${filterClassId}&include=chapters`
        : '/api/subjects?include=chapters'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
        // Also fetch all classes for the dropdown
        const cRes = await fetch('/api/classes')
        if (cRes.ok) setClasses(await cRes.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterClassId])

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterSubjectId && filterSubjectId !== 'all'
        ? `/api/chapters?subjectId=${filterSubjectId}`
        : '/api/chapters'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setChapters(data)
        // Fetch subjects filtered by class if a class is selected
        const sUrl = filterClassId && filterClassId !== 'all'
          ? `/api/subjects?classId=${filterClassId}`
          : '/api/subjects'
        const sRes = await fetch(sUrl)
        if (sRes.ok) setSubjects(await sRes.json())
        const cRes = await fetch('/api/classes')
        if (cRes.ok) setClasses(await cRes.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterSubjectId, filterClassId])

  // Fetch MCQ questions
  const fetchMcqQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterChapterId && filterChapterId !== 'all'
        ? `/api/mcq-questions?chapterId=${filterChapterId}`
        : '/api/mcq-questions'
      const res = await fetch(url)
      if (res.ok) setMcqQuestions(await res.json())
      // Fetch chapters for filter
      const cRes = await fetch('/api/chapters')
      if (cRes.ok) setChapters(await cRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterChapterId])

  // Fetch creative questions
  const fetchCreativeQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterChapterId && filterChapterId !== 'all'
        ? `/api/creative-questions?chapterId=${filterChapterId}`
        : '/api/creative-questions'
      const res = await fetch(url)
      if (res.ok) setCreativeQuestions(await res.json())
      const cRes = await fetch('/api/chapters')
      if (cRes.ok) setChapters(await cRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterChapterId])

  // Fetch explanations
  const fetchExplanations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/explanations')
      if (res.ok) setExplanations(await res.json())
      const cRes = await fetch('/api/chapters')
      if (cRes.ok) setChapters(await cRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // Fetch ads
  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ads/all')
      if (res.ok) setAds(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter)
      if (userClassFilter !== 'all') params.set('classId', userClassFilter)
      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) setUsers(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [userRoleFilter, userClassFilter])

  // Fetch exams
  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/exams')
      if (res.ok) setExams(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/quotes?all=true')
      if (res.ok) setQuotes(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) setSettings(await res.json())
    } catch { /* ignore */ }
  }, [])

  // Load data when view changes
  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      if (cancelled) return
      switch (activeView) {
        case 'dashboard': await fetchStats(); break
        case 'classes': await fetchClasses(); break
        case 'subjects': await fetchSubjects(); break
        case 'chapters': await fetchChapters(); break
        case 'mcq-questions': await fetchMcqQuestions(); break
        case 'creative-questions': await fetchCreativeQuestions(); break
        case 'explanations': await fetchExplanations(); break
        case 'ads': await fetchAds(); break
        case 'users': await Promise.all([fetchUsers(), fetchClasses()]); break
        case 'exams': await fetchExams(); break
        case 'quotes': await fetchQuotes(); break
        case 'settings': await fetchSettings(); break
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [activeView, fetchStats, fetchClasses, fetchSubjects, fetchChapters,
    fetchMcqQuestions, fetchCreativeQuestions, fetchExplanations, fetchAds,
    fetchUsers, fetchExams, fetchQuotes, fetchSettings])

  // ─── CRUD handlers ────────────────────────────────────────────
  const getApiBase = (): string => {
    switch (activeView) {
      case 'classes': return '/api/classes'
      case 'subjects': return '/api/subjects'
      case 'chapters': return '/api/chapters'
      case 'mcq-questions': return '/api/mcq-questions'
      case 'creative-questions': return '/api/creative-questions'
      case 'explanations': return '/api/explanations'
      case 'ads': return '/api/ads/all'
      case 'exams': return '/api/exams'
      case 'quotes': return '/api/quotes'
      case 'users': return '/api/users'
      default: return ''
    }
  }

  const handleSave = async () => {
    const base = getApiBase()
    if (!base) return

    try {
      let res
      if (editingItem?.id) {
        res = await fetch(`${base}/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        res = await fetch(base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      if (res?.ok) {
        setDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        // Refresh data
        switch (activeView) {
          case 'classes': fetchClasses(); break
          case 'subjects': fetchSubjects(); break
          case 'chapters': fetchChapters(); break
          case 'mcq-questions': fetchMcqQuestions(); break
          case 'creative-questions': fetchCreativeQuestions(); break
          case 'explanations': fetchExplanations(); break
          case 'ads': fetchAds(); break
          case 'exams': fetchExams(); break
          case 'quotes': fetchQuotes(); break
          case 'users': fetchUsers(); break
        }
      }
    } catch { /* ignore */ }
  }

  // ─── MCQ Editor Save ────────────────────────────────────────────────
  const handleMcqSave = async (data: McqFormData) => {
    setMcqSaving(true)
    try {
      const chapterId = mcqEditing?.chapterId || filterChapterId
      if (!chapterId || chapterId === 'all') {
        alert('Please select a chapter first')
        setMcqSaving(false)
        return
      }
      const payload = { ...data, chapterId }
      const url = mcqEditing?.id
        ? `/api/mcq-questions/${mcqEditing.id}`
        : '/api/mcq-questions'
      const method = mcqEditing?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMcqEditorOpen(false)
        setMcqEditing(null)
        fetchMcqQuestions()
      }
    } catch { /* ignore */ }
    setMcqSaving(false)
  }

  const handleMcqDelete = async () => {
    if (!mcqEditing?.id) return
    try {
      const res = await fetch(`/api/mcq-questions/${mcqEditing.id}`, { method: 'DELETE' })
      if (res.ok) {
        setMcqEditorOpen(false)
        setMcqEditing(null)
        fetchMcqQuestions()
      }
    } catch { /* ignore */ }
  }

  // ─── CQ Editor Save ─────────────────────────────────────────────────
  const handleCqSave = async (data: CqFormData) => {
    setCqSaving(true)
    try {
      const chapterId = cqEditing?.chapterId || filterChapterId
      if (!chapterId || chapterId === 'all') {
        alert('Please select a chapter first')
        setCqSaving(false)
        return
      }
      const payload = { ...data, chapterId }
      const url = cqEditing?.id
        ? `/api/creative-questions/${cqEditing.id}`
        : '/api/creative-questions'
      const method = cqEditing?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setCqEditorOpen(false)
        setCqEditing(null)
        fetchCreativeQuestions()
      }
    } catch { /* ignore */ }
    setCqSaving(false)
  }

  const handleCqDelete = async () => {
    if (!cqEditing?.id) return
    try {
      const res = await fetch(`/api/creative-questions/${cqEditing.id}`, { method: 'DELETE' })
      if (res.ok) {
        setCqEditorOpen(false)
        setCqEditing(null)
        fetchCreativeQuestions()
      }
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    const base = getApiBase()
    if (!base || !deletingItem?.id) return

    try {
      const res = await fetch(`${base}/${deletingItem.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setDeletingItem(null)
        switch (activeView) {
          case 'classes': fetchClasses(); break
          case 'subjects': fetchSubjects(); break
          case 'chapters': fetchChapters(); break
          case 'mcq-questions': fetchMcqQuestions(); break
          case 'creative-questions': fetchCreativeQuestions(); break
          case 'explanations': fetchExplanations(); break
          case 'ads': fetchAds(); break
          case 'exams': fetchExams(); break
          case 'quotes': fetchQuotes(); break
          case 'users': fetchUsers(); break
        }
      }
    } catch { /* ignore */ }
  }

  const handleSettingsSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast({ title: 'Settings saved', description: 'All settings have been saved successfully.' })
      } else {
        toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' })
    }
  }

  const openAddDialog = () => {
    // Use premium chapter modal for chapters view
    if (activeView === 'chapters') {
      setChapterEditing(null)
      setChapterModalOpen(true)
      return
    }
    // Use dedicated editors for MCQ/CQ
    if (activeView === 'mcq-questions') {
      setMcqEditing(null)
      setMcqEditorOpen(true)
      return
    }
    if (activeView === 'creative-questions') {
      setCqEditing(null)
      setCqEditorOpen(true)
      return
    }
    setEditingItem(null)
    setFormData({})
    setDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    // Use premium chapter modal for chapters view
    if (activeView === 'chapters') {
      setChapterEditing(item)
      setChapterModalOpen(true)
      return
    }
    // Use dedicated editors for MCQ/CQ
    if (activeView === 'mcq-questions') {
      setMcqEditing(item)
      setMcqEditorOpen(true)
      return
    }
    if (activeView === 'creative-questions') {
      setCqEditing(item)
      setCqEditorOpen(true)
      return
    }
    setEditingItem(item)
    let initialFormData = { ...item }
    if (item.subjectId) {
      const curSubject = subjects.find(s => s.id === item.subjectId)
      if (curSubject) {
        initialFormData.classId = curSubject.classId
      }
    }
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const openDeleteDialog = (item: any) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  // ─── Render helpers ────────────────────────────────────────────
  const renderSkeleton = (rows = 5) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  )

  const renderEmpty = (message: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <AlertCircle className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm mt-1">Click the Add button to create one</p>
    </div>
  )

  // ─── Dashboard View ────────────────────────────────────────────
  const renderDashboard = () => {
    const statCards = [
      { label: 'Total Students', value: stats?.totalUsers ?? 0, icon: <Users className="h-5 w-5" />, color: 'from-emerald-500 to-teal-600' },
      { label: 'Total Questions', value: stats?.totalQuestions ?? 0, icon: <CheckSquare className="h-5 w-5" />, color: 'from-teal-500 to-cyan-600' },
      { label: 'Total Exams', value: stats?.totalExams ?? 0, icon: <ClipboardList className="h-5 w-5" />, color: 'from-emerald-600 to-green-700' },
      { label: 'Active Ads', value: ads.filter(a => a.isActive).length || 0, icon: <Megaphone className="h-5 w-5" />, color: 'from-green-500 to-emerald-600' },
    ]

    // Simple bar chart data
    const barData = [
      { label: 'MCQ', value: stats?.totalMcqQuestions ?? 0, color: 'bg-emerald-500' },
      { label: 'Creative', value: stats?.totalCreativeQuestions ?? 0, color: 'bg-teal-500' },
      { label: 'Expl.', value: stats?.totalExplanations ?? 0, color: 'bg-cyan-500' },
      { label: 'Exams', value: stats?.totalExams ?? 0, color: 'bg-green-500' },
      { label: 'Users', value: stats?.totalUsers ?? 0, color: 'bg-emerald-600' },
    ]
    const maxBar = Math.max(...barData.map(d => d.value), 1)

    const recentActivity = [
      { text: 'New student registered', time: '2 min ago', icon: <Users className="h-4 w-4 text-emerald-500" /> },
      { text: 'Exam completed by 5 students', time: '15 min ago', icon: <ClipboardList className="h-4 w-4 text-teal-500" /> },
      { text: 'New MCQ questions added', time: '1 hour ago', icon: <CheckSquare className="h-4 w-4 text-cyan-500" /> },
      { text: 'Creative question updated', time: '3 hours ago', icon: <Lightbulb className="h-4 w-4 text-green-500" /> },
      { text: 'New class created', time: '5 hours ago', icon: <GraduationCap className="h-4 w-4 text-emerald-600" /> },
    ]

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden border-0 shadow-md">
                <div className={`h-1 bg-gradient-to-r ${card.color}`} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">{card.value.toLocaleString()}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-48">
                {barData.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium">{bar.value}</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                      <motion.div
                        className={`w-full rounded-t-md ${bar.color}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${(bar.value / maxBar) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{bar.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">{act.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{act.text}</p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => { setActiveView('classes'); openAddDialog() }} className="gap-2">
                <Plus className="h-4 w-4" /> Add Class
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActiveView('subjects'); openAddDialog() }} className="gap-2">
                <Plus className="h-4 w-4" /> Add Subject
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActiveView('mcq-questions'); openAddDialog() }} className="gap-2">
                <Plus className="h-4 w-4" /> Add MCQ
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setActiveView('exams'); openAddDialog() }} className="gap-2">
                <Plus className="h-4 w-4" /> Add Exam
              </Button>
              <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchAds() }} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh Stats
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Stats Detail */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Classes', value: stats?.totalClasses ?? 0 },
            { label: 'Subjects', value: stats?.totalSubjects ?? 0 },
            { label: 'Chapters', value: stats?.totalChapters ?? 0 },
            { label: 'Exam Attempts', value: stats?.totalExamAttempts ?? 0 },
            { label: 'Testimonials', value: stats?.totalTestimonials ?? 0 },
            { label: 'FAQs', value: stats?.totalFaqs ?? 0 },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ─── Classes Manager ────────────────────────────────────────────
  const renderClasses = () => (
    <div>
      {loading ? renderSkeleton() : classes.length === 0 ? renderEmpty('No classes found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Number</TableHead>
                <TableHead className="hidden lg:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {cls.icon && <span>{cls.icon}</span>}
                      <span>{cls.name}</span>
                      {cls.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cls.color }} />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{cls.slug}</TableCell>
                  <TableCell className="hidden md:table-cell">{cls.number}</TableCell>
                  <TableCell className="hidden lg:table-cell">{cls.order}</TableCell>
                  <TableCell>
                    <Badge variant={cls.isActive ? 'default' : 'secondary'} className={cls.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(cls)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(cls)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Subjects Manager ────────────────────────────────────────────
  const renderSubjects = () => (
    <div>
      <div className="flex gap-3 mb-4">
        <Select value={filterClassId} onValueChange={setFilterClassId}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? renderSkeleton() : subjects.length === 0 ? renderEmpty('No subjects found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {sub.icon && <span>{sub.icon}</span>}
                      <span>{sub.name}</span>
                      {sub.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sub.color }} />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{sub.class?.name || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{sub.slug}</TableCell>
                  <TableCell>
                    <Badge variant={sub.isActive ? 'default' : 'secondary'} className={sub.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(sub)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(sub)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Chapters Manager ────────────────────────────────────────────
  const renderChapters = () => (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Class filter */}
        <Select
          value={filterClassId}
          onValueChange={(val) => {
            setFilterClassId(val)
            setFilterSubjectId('all') // reset subject when class changes
          }}
        >
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Subject filter — filtered by selected class */}
        <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects
              .filter(s => filterClassId === 'all' || s.classId === filterClassId)
              .map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? renderSkeleton() : chapters.length === 0 ? renderEmpty('No chapters found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden sm:table-cell">Subject</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((ch) => (
                <TableRow key={ch.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {ch.icon && <span>{ch.icon}</span>}
                      <span>{ch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{ch.subject?.class?.name || '-'}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{ch.subject?.name || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{ch.slug}</TableCell>
                  <TableCell>
                    <Badge variant={ch.isActive ? 'default' : 'secondary'} className={ch.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {ch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(ch)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(ch)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── MCQ Questions Manager ────────────────────────────────────────
  const renderMcqQuestions = () => (
    <div>
      <div className="flex gap-3 mb-4">
        <Select value={filterChapterId} onValueChange={setFilterChapterId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Filter by chapter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? renderSkeleton() : mcqQuestions.length === 0 ? renderEmpty('No MCQ questions found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="max-w-xs">Question</TableHead>
                <TableHead className="hidden md:table-cell">Answer</TableHead>
                <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
                <TableHead className="hidden lg:table-cell">Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mcqQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-xs truncate font-medium">{q.question}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="font-mono">{q.correctAnswer}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={difficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{q.marks}</TableCell>
                  <TableCell>
                    <Badge variant={q.isActive ? 'default' : 'secondary'} className={q.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(q)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(q)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Creative Questions Manager ────────────────────────────────────
  const renderCreativeQuestions = () => (
    <div>
      <div className="flex gap-3 mb-4">
        <Select value={filterChapterId} onValueChange={setFilterChapterId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Filter by chapter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? renderSkeleton() : creativeQuestions.length === 0 ? renderEmpty('No creative questions found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Label</TableHead>
                <TableHead className="max-w-xs">Question</TableHead>
                <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
                <TableHead className="hidden md:table-cell">Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creativeQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{q.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{q.question}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={difficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{q.marks}</TableCell>
                  <TableCell>
                    <Badge variant={q.isActive ? 'default' : 'secondary'} className={q.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(q)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(q)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Explanations Manager ────────────────────────────────────────
  const renderExplanations = () => (
    <div>
      {loading ? renderSkeleton() : explanations.length === 0 ? renderEmpty('No explanations found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="max-w-sm">Question</TableHead>
                <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
                <TableHead className="hidden md:table-cell">Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {explanations.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="max-w-sm truncate font-medium">{exp.question}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={difficultyColor(exp.difficulty)}>{exp.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {exp.videoUrl ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Available</Badge>
                    ) : (
                      <Badge variant="secondary">None</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={exp.isActive ? 'default' : 'secondary'} className={exp.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {exp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(exp)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(exp)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Exams Manager ────────────────────────────────────────────────
  const renderExams = () => (
    <div>
      {loading ? renderSkeleton() : exams.length === 0 ? renderEmpty('No exams found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Questions</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden lg:table-cell">Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={exam.type === 'mcq' ? 'border-emerald-300 text-emerald-700' : 'border-teal-300 text-teal-700'}>
                      {exam.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{exam.totalQuestions}</TableCell>
                  <TableCell className="hidden md:table-cell">{exam.duration} min</TableCell>
                  <TableCell className="hidden lg:table-cell">{exam._count?.attempts ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={exam.isActive ? 'default' : 'secondary'} className={exam.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(exam)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(exam)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Ads Manager ────────────────────────────────────────────────────
  const renderAds = () => (
    <div>
      {loading ? renderSkeleton() : ads.length === 0 ? renderEmpty('No ad zones found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Impressions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.location}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{ad.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={ad.isActive ? 'default' : 'secondary'} className={ad.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(ad)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(ad)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Quotes Manager ──────────────────────────────────────────────
  const renderQuotes = () => (
    <div>
      {loading ? renderSkeleton() : quotes.length === 0 ? renderEmpty('No quotes found') : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="max-w-md">Quote</TableHead>
                <TableHead className="hidden sm:table-cell">Author</TableHead>
                <TableHead className="hidden md:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-md truncate font-medium">{q.text}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{q.author || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">{q.order}</TableCell>
                  <TableCell>
                    <Badge variant={q.isActive ? 'default' : 'secondary'} className={q.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(q)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(q)} className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )

  // ─── Users Manager ────────────────────────────────────────────────
  const renderUsers = () => {
    // Compute role counts from current users
    const totalUsers = users.length
    const adminCount = users.filter(u => u.role === 'admin').length
    const editorCount = users.filter(u => u.role === 'editor').length
    const teacherCount = users.filter(u => u.role === 'teacher').length
    const studentCount = users.filter(u => u.role === 'student').length

    const roleTabs = [
      { key: 'all', label: 'All', count: totalUsers, color: 'bg-emerald-500' },
      { key: 'admin', label: 'Admin', count: adminCount, color: 'bg-emerald-500' },
      { key: 'editor', label: 'Editor', count: editorCount, color: 'bg-blue-500' },
      { key: 'teacher', label: 'Teacher', count: teacherCount, color: 'bg-teal-500' },
      { key: 'student', label: 'Student', count: studentCount, color: 'bg-gray-500' },
    ]

    return (
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {roleTabs.map((tab) => (
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`border-0 shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  userRoleFilter === tab.key ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-background' : ''
                }`}
                onClick={() => { setUserRoleFilter(tab.key); setUserClassFilter('all') }}
              >
                <div className={`h-1 ${tab.color}`} />
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{tab.label}</p>
                  <p className="text-xl font-bold mt-0.5">{tab.count}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Role filter pills */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
            {['all', 'admin', 'editor', 'teacher', 'student'].map((role) => (
              <button
                key={role}
                onClick={() => setUserRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  userRoleFilter === role
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {/* Class filter (for students) */}
          <Select value={userClassFilter} onValueChange={setUserClassFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Button onClick={() => fetchUsers()} variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? renderSkeleton() : users.length === 0 ? renderEmpty('No users found') : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Class</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name || 'Unnamed'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                        user.role === 'admin' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' :
                        user.role === 'editor' ? 'border-blue-300 text-blue-700 dark:text-blue-400' :
                        user.role === 'teacher' ? 'border-teal-300 text-teal-700 dark:text-teal-400' :
                        'border-gray-300 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {user.phone || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {user.classId ? classes.find(c => c.id === user.classId)?.name || '-' : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {
                          setShowPassword(false)
                          setPasswordHash('')
                          openEditDialog(user)
                        }} className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(user)} className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }

  // ─── Settings View ────────────────────────────────────────────────
  const renderSettings = () => (
    <div className="max-w-2xl space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input value={settings.site_name || ''} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Site URL</Label>
              <Input value={settings.site_url || ''} onChange={e => setSettings(s => ({ ...s, site_url: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Site Description</Label>
            <Textarea value={settings.site_description || ''} onChange={e => setSettings(s => ({ ...s, site_description: e.target.value }))} rows={3} />
          </div>            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input value={settings.contact_email || ''} onChange={e => setSettings(s => ({ ...s, contact_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Google Analytics ID</Label>
              <Input value={settings.google_analytics_id || ''} onChange={e => setSettings(s => ({ ...s, google_analytics_id: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <div className="flex gap-2">
                <Input value={settings.social_facebook || ''} onChange={e => setSettings(s => ({ ...s, social_facebook: e.target.value }))} placeholder="https://facebook.com/yourpage" className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setSettings(s => ({ ...s, social_facebook: '' }))}
                  title="Clear Facebook URL"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Twitter / X URL</Label>
              <div className="flex gap-2">
                <Input value={settings.social_twitter || ''} onChange={e => setSettings(s => ({ ...s, social_twitter: e.target.value }))} placeholder="https://twitter.com/yourhandle" className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setSettings(s => ({ ...s, social_twitter: '' }))}
                  title="Clear Twitter URL"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <div className="flex gap-2">
                <Input value={settings.social_youtube || ''} onChange={e => setSettings(s => ({ ...s, social_youtube: e.target.value }))} placeholder="https://youtube.com/@yourchannel" className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setSettings(s => ({ ...s, social_youtube: '' }))}
                  title="Clear YouTube URL"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input value={settings.social_email || ''} onChange={e => setSettings(s => ({ ...s, social_email: e.target.value }))} placeholder="hello@example.com" className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setSettings(s => ({ ...s, social_email: '' }))}
                  title="Clear Email"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Leave blank or use the clear button to hide the corresponding social icon in the footer. Click "Save Settings" below to apply changes.</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-base">Feature Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Disable site for visitors</p>
            </div>
            <Switch checked={settings.maintenance_mode === 'true'} onCheckedChange={v => setSettings(s => ({ ...s, maintenance_mode: String(v) }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Registration Enabled</p>
              <p className="text-xs text-muted-foreground">Allow new user registration</p>
            </div>
            <Switch checked={settings.registration_enabled !== 'false'} onCheckedChange={v => setSettings(s => ({ ...s, registration_enabled: String(v) }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Ads Enabled</p>
              <p className="text-xs text-muted-foreground">Show advertisements on site</p>
            </div>
            <Switch checked={settings.ads_enabled !== 'false'} onCheckedChange={v => setSettings(s => ({ ...s, ads_enabled: String(v) }))} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-base">Exam Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Exam Attempts</Label>
              <Input type="number" value={settings.max_exam_attempts || '3'} onChange={e => setSettings(s => ({ ...s, max_exam_attempts: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Default Timer (sec/question)</Label>
              <Input type="number" value={settings.default_timer_per_question || '50'} onChange={e => setSettings(s => ({ ...s, default_timer_per_question: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSettingsSave} className="bg-emerald-600 hover:bg-emerald-700">
        Save Settings
      </Button>
    </div>
  )

  // ─── Form Dialog ─────────────────────────────────────────────────
  const renderFormDialog = () => {
    const isEdit = !!editingItem?.id
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit' : 'Add'} {viewLabels[activeView]?.replace('Management', '').trim()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const renderFormFields = () => {
    switch (activeView) {
      case 'classes':
        return (
          <>
            <div className="space-y-2"><Label>Name</Label><Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug || ''} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Number</Label><Input type="number" value={formData.number || ''} onChange={e => setFormData(f => ({ ...f, number: parseInt(e.target.value) || 0 }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={formData.icon || ''} onChange={e => setFormData(f => ({ ...f, icon: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Color</Label><Input type="color" value={formData.color || '#10b981'} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order ?? 0} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2 flex items-center gap-2 pt-6">
                <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </>
        )
      case 'subjects':
        return (
          <>
            <div className="space-y-2"><Label>Name</Label><Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug || ''} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={formData.classId || ''} onValueChange={v => setFormData(f => ({ ...f, classId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={formData.icon || ''} onChange={e => setFormData(f => ({ ...f, icon: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Color</Label><Input type="color" value={formData.color || '#10b981'} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order ?? 0} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2 flex items-center gap-2 pt-6">
                <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </>
        )
      case 'chapters':
        return (
          <>
            <div className="space-y-2"><Label>Name</Label><Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug || ''} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={formData.classId || ''} onValueChange={v => setFormData(f => ({ ...f, classId: v, subjectId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subjectId || ''} onValueChange={v => setFormData(f => ({ ...f, subjectId: v }))} disabled={!formData.classId}>
                <SelectTrigger><SelectValue placeholder={formData.classId ? "Select subject" : "Select class first"} /></SelectTrigger>
                <SelectContent>
                  {subjects.filter(s => s.classId === formData.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={formData.icon || ''} onChange={e => setFormData(f => ({ ...f, icon: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Color</Label><Input type="color" value={formData.color || '#10b981'} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order ?? 0} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2 flex items-center gap-2 pt-6">
                <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </>
        )
      case 'mcq-questions':
        return (
          <>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={formData.chapterId || ''} onValueChange={v => setFormData(f => ({ ...f, chapterId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                <SelectContent>
                  {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Question</Label><Textarea value={formData.question || ''} onChange={e => setFormData(f => ({ ...f, question: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Option A</Label><Input value={formData.optionA || ''} onChange={e => setFormData(f => ({ ...f, optionA: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Option B</Label><Input value={formData.optionB || ''} onChange={e => setFormData(f => ({ ...f, optionB: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Option C</Label><Input value={formData.optionC || ''} onChange={e => setFormData(f => ({ ...f, optionC: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Option D</Label><Input value={formData.optionD || ''} onChange={e => setFormData(f => ({ ...f, optionD: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select value={formData.correctAnswer || ''} onValueChange={v => setFormData(f => ({ ...f, correctAnswer: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty || 'medium'} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Explanation</Label><Textarea value={formData.explanation || ''} onChange={e => setFormData(f => ({ ...f, explanation: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marks</Label><Input type="number" value={formData.marks ?? 1} onChange={e => setFormData(f => ({ ...f, marks: parseInt(e.target.value) || 1 }))} /></div>
              <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={formData.tags || ''} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </>
        )
      case 'creative-questions':
        return (
          <>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={formData.chapterId || ''} onValueChange={v => setFormData(f => ({ ...f, chapterId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                <SelectContent>
                  {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Select value={formData.label || ''} onValueChange={v => setFormData(f => ({ ...f, label: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty || 'medium'} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Question</Label><Textarea value={formData.question || ''} onChange={e => setFormData(f => ({ ...f, question: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Model Answer</Label><Textarea value={formData.answer || ''} onChange={e => setFormData(f => ({ ...f, answer: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Explanation</Label><Textarea value={formData.explanation || ''} onChange={e => setFormData(f => ({ ...f, explanation: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marks</Label><Input type="number" value={formData.marks ?? 10} onChange={e => setFormData(f => ({ ...f, marks: parseInt(e.target.value) || 10 }))} /></div>
              <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={formData.tags || ''} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </>
        )
      case 'explanations':
        return (
          <>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={formData.chapterId || ''} onValueChange={v => setFormData(f => ({ ...f, chapterId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                <SelectContent>
                  {chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Question</Label><Textarea value={formData.question || ''} onChange={e => setFormData(f => ({ ...f, question: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Solution</Label><Textarea value={formData.solution || ''} onChange={e => setFormData(f => ({ ...f, solution: e.target.value }))} rows={4} /></div>
            <div className="space-y-2"><Label>Video URL</Label><Input value={formData.videoUrl || ''} onChange={e => setFormData(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty || 'medium'} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={formData.tags || ''} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </>
        )
      case 'ads':
        return (
          <>
            <div className="space-y-2"><Label>Name</Label><Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug || ''} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formData.location || ''} onValueChange={v => setFormData(f => ({ ...f, location: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="exam_page">Exam Page</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type || ''} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="code">Custom Code</SelectItem>
                    <SelectItem value="adsense">AdSense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Custom Code</Label><Textarea value={formData.code || ''} onChange={e => setFormData(f => ({ ...f, code: e.target.value }))} rows={3} className="font-mono text-xs" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Image URL</Label><Input value={formData.imageUrl || ''} onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Link URL</Label><Input value={formData.linkUrl || ''} onChange={e => setFormData(f => ({ ...f, linkUrl: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Provider</Label><Input value={formData.provider || ''} onChange={e => setFormData(f => ({ ...f, provider: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </>
        )
      case 'exams':
        return (
          <>
            <div className="space-y-2"><Label>Title</Label><Input value={formData.title || ''} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug || ''} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type || 'mcq'} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty || 'mixed'} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select value={formData.sourceType || 'chapter'} onValueChange={v => setFormData(f => ({ ...f, sourceType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chapter">Chapter</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Source IDs (JSON)</Label><Input value={formData.sourceIds || '[]'} onChange={e => setFormData(f => ({ ...f, sourceIds: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Total Questions</Label><Input type="number" value={formData.totalQuestions ?? 10} onChange={e => setFormData(f => ({ ...f, totalQuestions: parseInt(e.target.value) || 10 }))} /></div>
              <div className="space-y-2"><Label>Marks/Question</Label><Input type="number" value={formData.marksPerQuestion ?? 1} onChange={e => setFormData(f => ({ ...f, marksPerQuestion: parseInt(e.target.value) || 1 }))} /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={formData.duration ?? 30} onChange={e => setFormData(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </>
        )
      case 'quotes':
        return (
          <>
            <div className="space-y-2"><Label>Quote Text (Bengali)</Label><Textarea value={formData.text || ''} onChange={e => setFormData(f => ({ ...f, text: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Author</Label><Input value={formData.author || ''} onChange={e => setFormData(f => ({ ...f, author: e.target.value }))} placeholder="e.g. রবীন্দ্রনাথ ঠাকুর" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order ?? 0} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2 flex items-center gap-2 pt-6">
                <Switch checked={formData.isActive !== false} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </>
        )
      case 'users':
        const isEdit = !!editingItem?.id
        return (
          <>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email || ''} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} type="email" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
                {isEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1 text-muted-foreground"
                    onClick={async () => {
                      if (passwordHash) {
                        setShowPassword(!showPassword)
                      } else if (editingItem?.id) {
                        try {
                          const res = await fetch(`/api/users?includePassword=true&userId=${editingItem.id}`)
                          if (res.ok) {
                            const data = await res.json()
                            const found = Array.isArray(data) ? data[0] : data
                            if (found?.password) {
                              setPasswordHash(found.password)
                              setShowPassword(true)
                            } else {
                              alert('No password hash found for this user')
                            }
                          }
                        } catch {}
                      }
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    {showPassword ? 'Hide' : 'Show'} Hash
                  </Button>
                )}
              </div>
              <Input value={formData.password || ''} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} type="password" placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Enter password'} />
              {isEdit && showPassword && passwordHash && (
                <div className="mt-1 p-2 bg-muted rounded-md">
                  <p className="text-[10px] text-muted-foreground mb-1">Current Password Hash (SHA256):</p>
                  <p className="text-[10px] font-mono break-all text-foreground select-all">{passwordHash}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role || 'student'} onValueChange={v => setFormData(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone || ''} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={formData.classId || 'none'} onValueChange={v => setFormData(f => ({ ...f, classId: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="No class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No class</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      default:
        return <p className="text-muted-foreground">No form available for this view.</p>
    }
  }

  // ─── Delete Dialog ────────────────────────────────────────────────
  const renderDeleteDialog = () => (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{deletingItem?.name || deletingItem?.title || deletingItem?.question?.slice(0, 50) || 'this item'}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  // ─── View Content ─────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard()
      case 'classes': return renderClasses()
      case 'subjects': return renderSubjects()
      case 'chapters': return renderChapters()
      case 'mcq-questions': return renderMcqQuestions()
      case 'creative-questions': return renderCreativeQuestions()
      case 'explanations': return renderExplanations()
      case 'exams': return renderExams()
      case 'ads': return renderAds()
      case 'quotes': return renderQuotes()
      case 'users': return renderUsers()
      case 'settings': return renderSettings()
      default: return renderDashboard()
    }
  }

  // ─── Main Render ──────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-emerald-800/50">
          <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">EduLearn</h1>
            <p className="text-xs text-emerald-400">Admin Panel</p>
          </div>
          <Button size="icon" variant="ghost" className="ml-auto lg:hidden text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveView(item.key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === item.key
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeView === item.key && <ChevronRight className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-800/50">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-300 hover:bg-white/10 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Site</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <h2 className="text-lg font-semibold">{viewLabels[activeView]}</h2>

            <div className="flex-1 max-w-sm ml-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Action Bar */}
          {activeView !== 'dashboard' && activeView !== 'settings' && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Manage your {viewLabels[activeView]?.toLowerCase()}
              </p>
              <Button onClick={openAddDialog} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Add New
              </Button>
            </div>
          )}

          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </main>
      </div>

      {/* Dialogs */}
      {renderFormDialog()}
      {renderDeleteDialog()}

      {/* Premium Edit Chapter Modal */}
      <EditChapterModal
        open={chapterModalOpen}
        onOpenChange={setChapterModalOpen}
        chapter={chapterEditing}
        classes={classes}
        subjects={subjects}
        onSaved={fetchChapters}
      />

      {/* MCQ Editor Dialog */}
      <Dialog open={mcqEditorOpen} onOpenChange={setMcqEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <McqEditor
            initialData={mcqEditing ? {
              question: mcqEditing.question,
              optionA: mcqEditing.optionA,
              optionB: mcqEditing.optionB,
              optionC: mcqEditing.optionC || '',
              optionD: mcqEditing.optionD || '',
              correctAnswer: mcqEditing.correctAnswer,
              mcqType: (mcqEditing as any).mcqType || 'single',
              stem: (mcqEditing as any).stem || '',
              subMcqs: (mcqEditing as any).subMcqs || '[]',
              statements: (mcqEditing as any).statements || '["","",""]',
              correctCombination: (mcqEditing as any).correctCombination || '',
              year: (mcqEditing as any).year || '',
              board: (mcqEditing as any).board || '',
              schoolName: (mcqEditing as any).schoolName || '',
              board_name: mcqEditing.board_name || '',
              exam_year: mcqEditing.exam_year ? String(mcqEditing.exam_year) : '',
              sourceType: mcqEditing.sourceType || 'custom',
              explanation: mcqEditing.explanation || '',
              tips: '',
              videoUrl: (mcqEditing as any).videoUrl || '',
              marks: mcqEditing.marks,
              difficulty: mcqEditing.difficulty,
            } : undefined}
            chapterId={mcqEditing?.chapterId || filterChapterId || ''}
            onSave={handleMcqSave}
            onDelete={mcqEditing?.id ? handleMcqDelete : undefined}
            onCancel={() => { setMcqEditorOpen(false); setMcqEditing(null) }}
            isSaving={mcqSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Creative Question Editor Dialog */}
      <Dialog open={cqEditorOpen} onOpenChange={setCqEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CreativeEditor
            initialData={cqEditing ? {
              label: cqEditing.label,
              question: cqEditing.question,
              answer: cqEditing.answer || '',
              marks: cqEditing.marks,
              difficulty: cqEditing.difficulty,
              year: (cqEditing as any).year || '',
              board: (cqEditing as any).board || '',
              schoolName: (cqEditing as any).schoolName || '',
              board_name: cqEditing.board_name || '',
              exam_year: cqEditing.exam_year ? String(cqEditing.exam_year) : '',
              sourceType: cqEditing.sourceType || 'custom',
              segmentK: (cqEditing as any).segmentK || '',
              segmentKh: (cqEditing as any).segmentKh || '',
              segmentG: (cqEditing as any).segmentG || '',
              segmentGh: (cqEditing as any).segmentGh || '',
              marksK: (cqEditing as any).marksK ?? 2,
              marksKh: (cqEditing as any).marksKh ?? 3,
              marksG: (cqEditing as any).marksG ?? 4,
              marksGh: (cqEditing as any).marksGh ?? 4,
              explanation: cqEditing.explanation || '',
              tips: '',
              videoUrl: (cqEditing as any).videoUrl || '',
            } : undefined}
            chapterId={cqEditing?.chapterId || filterChapterId || ''}
            onSave={handleCqSave}
            onDelete={cqEditing?.id ? handleCqDelete : undefined}
            onCancel={() => { setCqEditorOpen(false); setCqEditing(null) }}
            isSaving={cqSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
