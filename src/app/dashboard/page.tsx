'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, BookOpen, Trophy, Flame, Target, Clock, Calendar,
  TrendingUp, Award, Bookmark, ChevronRight, ChevronDown, GraduationCap,
  BarChart3, CheckCircle, XCircle, Timer, ClipboardList,
  ArrowRight, Play, Loader2, Zap, Layers, LogOut, Search,
  MessageCircle, HelpCircle, Star, Sparkles, Camera
} from 'lucide-react'
import { ClassChangeModal } from '@/components/dashboard/ClassChangeModal'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────
interface ExamAttempt {
  id: string
  examId: string
  score: number
  totalMarks: number
  correctCount: number
  wrongCount: number
  percentage: number
  timeTaken: number
  status: string
  completedAt: string | null
  startedAt: string
  exam?: {
    id: string
    title: string
    type: string
    duration: number
    totalQuestions: number
  }
}

interface UserData {
  id: string
  name: string
  email: string
  image?: string
  role: string
  classId?: string
  selectedCategoryId?: string
}

interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string | null
  subjects: Array<{ id: string; name: string; slug: string }>
}

interface ChapterItem {
  id: string
  name: string
  slug: string
  subjectId: string
  order: number
}

interface SubjectWithChapters {
  id: string
  name: string
  slug: string
  classId: string
  chapters: ChapterItem[]
}

// ─── Helpers ──────────────────────────────────────────────────
function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour < 6) return { text: 'শুভ রাত্রি', emoji: '🌙' }
  if (hour < 12) return { text: 'শুভ সকাল', emoji: '👋' }
  if (hour < 17) return { text: 'শুভ অপরাহ্ন', emoji: '☀️' }
  if (hour < 21) return { text: 'শুভ সন্ধ্যা', emoji: '🌆' }
  return { text: 'শুভ রাত্রি', emoji: '🌙' }
}

const subjectColors = [
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-lime-500 to-green-600',
]

const subjectIcons = ['📐', '📘', '🧪', '📖', '🎨', '🌍', '💻', '📊']

// ─── Dashboard Component ─────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [allExamAttempts, setAllExamAttempts] = useState<any[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjectsWithChapters, setSubjectsWithChapters] = useState<SubjectWithChapters[]>([])
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)
  const [generatingExam, setGeneratingExam] = useState<string | null>(null)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [stats, setStats] = useState({ totalClasses: 0, totalSubjects: 0, totalQuestions: 0, totalExams: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'bookmarks' | 'achievements'>('overview')
  const [perfTab, setPerfTab] = useState<'my' | 'leaderboard'>('my')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image under 10MB.', variant: 'destructive' })
      return
    }
    
    setUploading(true)
    try {
      const compressed = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const img = new Image()
          img.onload = () => {
            let w = img.width, h = img.height
            if (w > 300 || h > 300) {
              const ratio = Math.min(300 / w, 300 / h)
              w = Math.round(w * ratio)
              h = Math.round(h * ratio)
            }
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            if (!ctx) { reject(new Error('Canvas context not available')); return }
            ctx.drawImage(img, 0, 0, w, h)
            resolve(canvas.toDataURL('image/jpeg', 0.7))
          }
          img.onerror = reject
          img.src = reader.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const userId = user.id || (user as any)._id
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressed }),
      })
      
      if (res.ok) {
        const updatedUser = { ...user, image: compressed }
        setUser(updatedUser)
        localStorage.setItem('eduUser', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('storage'))
        toast({ title: 'Success', description: 'Profile picture updated successfully.' })
      } else {
        toast({ title: 'Upload failed', description: 'Failed to update profile picture.', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Error uploading image.', variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const studentClass = classes.find(c => c.id === user?.classId)

  // ─── Auth & Data Fetching ─────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.user) {
          window.location.href = '/login?callbackUrl=/dashboard'
          return
        }
        const u = data.user
        setUser(u)
        localStorage.setItem('eduUser', JSON.stringify(u))
        fetchData(u.id || u._id)
      })
      .catch(() => {
        window.location.href = '/login?callbackUrl=/dashboard'
      })
  }, [])

  const fetchData = async (userId?: string) => {
    try {
      const calls: Promise<Response>[] = [
        fetch('/api/stats'),
        fetch('/api/exam-attempts?status=completed'), // all completed attempts for leaderboard
        fetch('/api/classes?include=subjects'),
      ]
      if (userId) {
        calls.push(fetch(`/api/users?userId=${userId}`))
        calls.push(fetch(`/api/exam-attempts?userId=${userId}&status=completed`)) // only user's attempts
      }

      const results = await Promise.all(calls)
      const statsRes = results[0]
      const attemptsRes = results[1]
      const classesRes = results[2]
      const userRes = userId ? results[3] : null
      const myAttemptsRes = userId ? results[4] : null

      if (statsRes.ok) setStats(await statsRes.json())
      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json()
        setAllExamAttempts(Array.isArray(attemptsData) ? attemptsData : [])
      }
      if (myAttemptsRes && myAttemptsRes.ok) {
        const myAttemptsData = await myAttemptsRes.json()
        setExamAttempts(Array.isArray(myAttemptsData) ? myAttemptsData : [])
      } else if (!userId && attemptsRes.ok) {
        const attemptsData = await attemptsRes.json()
        setExamAttempts(Array.isArray(attemptsData) ? attemptsData : [])
      }
      
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(Array.isArray(classesData) ? classesData : [])
      }
      if (userRes && userRes.ok) {
        const usersData = await userRes.json()
        if (Array.isArray(usersData) && usersData.length > 0) {
          const freshUser = usersData[0]
          setUser(freshUser)
          localStorage.setItem('eduUser', JSON.stringify(freshUser))
        }
      }
    } catch (err) {
      // fetch error handled silently
    } finally {
      setLoading(false)
    }
  }

  // Fetch subjects with chapters when user's classId is known
  useEffect(() => {
    if (!user?.classId) return
    setSubjectsLoading(true)
    fetch(`/api/subjects?classId=${user.classId}&include=chapters`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setSubjectsWithChapters(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setSubjectsLoading(false))
  }, [user?.classId])

  // Quick exam generation
  const handleQuickExam = async (sourceType: string, sourceIds: string[], examType: string) => {
    const key = `${sourceType}-${sourceIds[0]}-${examType}`
    setGeneratingExam(key)
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceIds,
          questionCount: 20,
          examType,
          difficulty: 'mixed',
        }),
      })
      const data = await res.json()
      if (data.exam) {
        router.push(`/exam/${data.exam.id}`)
      } else {
        toast({ title: 'Failed', description: data.error || 'Could not create exam', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to generate exam', variant: 'destructive' })
    } finally {
      setGeneratingExam(null)
    }
  }

  // ─── Computed Values ──────────────────────────────────────
  const totalExams = examAttempts.length
  const avgScore = totalExams > 0 ? Math.round(examAttempts.reduce((a, b) => a + b.percentage, 0) / totalExams) : 0
  const questionsSolved = examAttempts.reduce((a, b) => a + b.correctCount + b.wrongCount, 0)
  const userName = user?.name || 'Student'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const classLink = studentClass ? `/class/${studentClass.slug}` : '/class'
  const greeting = getGreeting()

  const calculatedLeaderboard = useMemo(() => {
    const studentsMap: Record<string, { name: string; scores: number[]; solved: number }> = {}
    
    if (user) {
      studentsMap[user.id || (user as any)._id] = {
        name: user.name || 'You',
        scores: [],
        solved: 0
      }
    }

    allExamAttempts.forEach(attempt => {
      if (!attempt.userId || !attempt.user) return
      const uid = attempt.userId
      const uName = attempt.user.name || attempt.user.email?.split('@')[0] || 'Student'
      
      if (!studentsMap[uid]) {
        studentsMap[uid] = { name: uName, scores: [], solved: 0 }
      }
      studentsMap[uid].scores.push(attempt.percentage)
      studentsMap[uid].solved += (attempt.correctCount + attempt.wrongCount)
    })

    const list = Object.entries(studentsMap).map(([uid, data]) => {
      const avg = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0
      const positionScore = Math.round((avg * 10) + data.solved)
      return {
        userId: uid,
        name: data.name,
        score: positionScore,
        avgScore: avg,
        examsCount: data.scores.length,
        totalSolved: data.solved
      }
    })

    list.sort((a, b) => b.score - a.score || b.totalSolved - a.totalSolved)

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }))
  }, [allExamAttempts, user])

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-emerald-500/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Loading dashboard...</p>
            <p className="text-xs text-muted-foreground mt-1">Preparing your learning space</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ═══════════════════════════════════════════════════════
            GREETING HEADER
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
                {user?.image ? (
                  <img src={user.image} alt={userName} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {greeting.text}, {userName.split(' ')[0]}! <span className="inline-block">{greeting.emoji}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                তুমি আজ কী শিখতে চাও?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {studentClass && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <GraduationCap className="h-3.5 w-3.5" />
                {studentClass.name}
              </span>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {uploading ? 'Uploading...' : 'Upload Pic'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            STATS CARDS
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            {
              icon: ClipboardList,
              label: 'Exams Taken',
              value: totalExams,
              gradient: 'from-emerald-500/15 to-teal-500/5',
              iconBg: 'bg-emerald-500/15',
              iconColor: 'text-emerald-500',
              borderColor: 'border-emerald-500/10',
            },
            {
              icon: Target,
              label: 'Avg Score',
              value: `${avgScore}%`,
              gradient: 'from-cyan-500/15 to-blue-500/5',
              iconBg: 'bg-cyan-500/15',
              iconColor: 'text-cyan-500',
              borderColor: 'border-cyan-500/10',
            },
            {
              icon: CheckCircle,
              label: 'Questions Solved',
              value: questionsSolved,
              gradient: 'from-amber-500/15 to-orange-500/5',
              iconBg: 'bg-amber-500/15',
              iconColor: 'text-amber-500',
              borderColor: 'border-amber-500/10',
            },
            {
              icon: Flame,
              label: 'Study Streak',
              value: '7 days',
              gradient: 'from-rose-500/15 to-pink-500/5',
              iconBg: 'bg-rose-500/15',
              iconColor: 'text-rose-500',
              borderColor: 'border-rose-500/10',
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className={`group relative overflow-hidden rounded-xl border ${stat.borderColor} bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-4 sm:p-5 hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${stat.iconBg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              {/* Subtle decorative dot */}
              <div className={`absolute top-3 right-3 h-1.5 w-1.5 rounded-full ${stat.iconColor} opacity-40`} />
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            MAIN GRID: Performance + Quick Actions
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {/* Recent Performance & Leaderboard — 3 cols */}
          <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center gap-6 border-b border-border/40 pb-3 mb-5">
                <button
                  onClick={() => setPerfTab('my')}
                  className={`text-sm font-semibold flex items-center gap-2 pb-1 transition-colors relative ${
                    perfTab === 'my'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Recent Performance
                  {perfTab === 'my' && (
                    <motion.div layoutId="perfUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setPerfTab('leaderboard')}
                  className={`text-sm font-semibold flex items-center gap-2 pb-1 transition-colors relative ${
                    perfTab === 'leaderboard'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                  {perfTab === 'leaderboard' && (
                    <motion.div layoutId="perfUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
                </button>
              </div>

              {perfTab === 'my' ? (
                examAttempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">No exam attempts yet</p>
                    <p className="text-xs mt-1 text-muted-foreground/70">Take your first exam to track progress</p>
                    <Link href="/exam">
                      <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                        <Play className="h-3.5 w-3.5" /> Take an Exam
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {examAttempts.slice(0, 5).map((attempt, idx) => {
                      const color = attempt.percentage >= 80 ? 'bg-emerald-500' :
                        attempt.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      const dotColor = attempt.percentage >= 80 ? 'bg-emerald-400' :
                        attempt.percentage >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                      return (
                        <motion.div
                          key={attempt.id || `attempt-${idx}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`h-2 w-2 rounded-full ${dotColor} shrink-0`} />
                              <span className="text-sm font-medium truncate max-w-[260px] text-foreground">
                                {attempt.exam?.title || 'Exam'}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-foreground tabular-nums">
                              {attempt.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${attempt.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + idx * 0.08, ease: 'easeOut' }}
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                  {calculatedLeaderboard.slice(0, 10).map((student, idx) => {
                    const isCurrentUser = user && (student.userId === user.id || student.userId === (user as any)._id)
                    return (
                      <motion.div
                        key={student.userId || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                          isCurrentUser
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-muted/10 border-border/30 hover:border-emerald-500/10'
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          student.rank === 1 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          student.rank === 2 ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' :
                          student.rank === 3 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                        </div>
                        <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-semibold text-xs shrink-0 uppercase">
                          {student.name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isCurrentUser ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-foreground'}`}>
                            {student.name} {isCurrentUser && '(You)'}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {student.examsCount} exam{student.examsCount !== 1 ? 's' : ''} • {student.totalSolved} solved
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground tabular-nums">{student.avgScore}%</p>
                          <p className="text-[8px] text-muted-foreground">avg score</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
            {perfTab === 'my' && examAttempts.length > 5 && (
              <div className="mt-4 pt-3 border-t border-border/20 text-right">
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-0.5 justify-end transition-colors"
                >
                  View All History <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions — 2 cols */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col justify-between min-h-[360px]">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground mb-5">
                <Zap className="h-4 w-4 text-emerald-500" />
                Quick Actions
              </h2>
              <div className="space-y-4">
                {[
                  { href: '/exam', icon: Play, label: 'Take an Exam', desc: 'Practice mock test now', primary: true },
                  { href: '/exam', icon: HelpCircle, label: 'Ask for Help', desc: 'Exam preparation support' },
                ].map((action, idx) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      className={`group relative rounded-xl p-4.5 border transition-all duration-200 cursor-pointer ${
                        action.primary
                          ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500/30 text-white'
                          : 'bg-muted/30 hover:bg-muted/60 border-border/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          action.primary
                            ? 'bg-white/20'
                            : 'bg-emerald-500/10'
                        }`}>
                          <action.icon className={`h-5.5 w-5.5 ${action.primary ? 'text-white' : 'text-emerald-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">{action.label}</p>
                          <p className={`text-xs mt-1.5 leading-none ${action.primary ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                            {action.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            CONTINUE LEARNING — Subject Cards
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              Continue Learning
            </h2>
            {studentClass && (
              <div className="flex items-center gap-2">
                <ClassChangeModal
                  trigger={
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Change Class
                    </button>
                  }
                />
                <Link href={classLink} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {studentClass ? (
            subjectsWithChapters.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 flex flex-col items-center justify-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">{subjectsLoading ? 'Loading subjects...' : 'No subjects available for this class'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {subjectsWithChapters.map((sub, idx) => {
                  const colorClass = subjectColors[idx % subjectColors.length]
                  const icon = subjectIcons[idx % subjectIcons.length]
                  const chapterCount = sub.chapters?.length || 0

                  return (
                    <Link key={sub.id} href={`/class/${studentClass.slug}/${sub.slug}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                        className="group rounded-xl border border-border/60 bg-card p-4 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5 h-full flex flex-col justify-between"
                      >
                        <div>
                          {/* Subject Icon */}
                          <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-lg mb-3 shadow-sm`}>
                            {icon}
                          </div>

                          {/* Title & Meta */}
                          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-emerald-500 transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Action Row */}
                        <div className="mt-4 pt-2 border-t border-border/10 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                            Start Learning <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-semibold">
                            Free
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            )
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-8 flex flex-col items-center justify-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mb-3 opacity-25" />
              <p className="text-sm font-medium">No class selected yet</p>
              <p className="text-xs mt-1 max-w-sm text-center">
                Update your profile to select a class, or{' '}
                <Link href={classLink} className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2">
                  browse all classes
                </Link>
                {' '}to start.
              </p>
            </div>
          )}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            BOTTOM GRID: Upcoming Exams + Achievements
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Upcoming Exams / Exam History */}
          <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-emerald-500" />
                {examAttempts.length > 0 ? 'Recent Exams' : 'Upcoming Exams'}
              </h2>
              {examAttempts.length > 3 && (
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
            {examAttempts.length === 0 ? (
              <div className="space-y-3">
                {/* Placeholder upcoming exams */}
                {['Start your first MCQ exam', 'Try a creative question set', 'Practice with chapter-wise tests'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ClipboardList className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item}</p>
                      <p className="text-[11px] text-muted-foreground">Ready when you are</p>
                    </div>
                    <Link href="/exam">
                      <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-emerald-500 transition-colors" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {examAttempts.slice(0, 4).map((attempt, idx) => (
                  <motion.div
                    key={attempt.id || `recent-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-emerald-500/20 transition-colors group"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      attempt.percentage >= 80 ? 'bg-emerald-500/15' :
                      attempt.percentage >= 60 ? 'bg-amber-500/15' : 'bg-rose-500/15'
                    }`}>
                      {attempt.percentage >= 80 ? (
                        <Trophy className="h-4 w-4 text-emerald-500" />
                      ) : attempt.percentage >= 60 ? (
                        <Target className="h-4 w-4 text-amber-500" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attempt.exam?.title || 'Exam'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'In progress'} • {Math.round(attempt.timeTaken / 60)}min
                      </p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${
                      attempt.percentage >= 80 ? 'text-emerald-500' :
                      attempt.percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {attempt.percentage}%
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Award className="h-4 w-4 text-emerald-500" />
                Achievements
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'First Exam', desc: 'Complete your first exam', icon: '🎯', earned: totalExams > 0, progress: totalExams > 0 ? '1/1' : '0/1' },
                { title: '7 Day Streak', desc: 'Study 7 days in a row', icon: '🔥', earned: false, progress: '3/7' },
                { title: 'Quick Solver', desc: 'Solve 10 questions', icon: '⚡', earned: questionsSolved >= 10, progress: `${Math.min(questionsSolved, 10)}/10` },
                { title: 'High Scorer', desc: 'Score 80%+ on an exam', icon: '🏆', earned: examAttempts.some(a => a.percentage >= 80), progress: examAttempts.some(a => a.percentage >= 80) ? 'Done' : 'In progress' },
              ].map((ach, idx) => (
                <motion.div
                  key={ach.title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    ach.earned
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-muted/10 border-border/30 opacity-60'
                  }`}
                >
                  <div className="text-2xl shrink-0">{ach.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ach.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ach.desc}</p>
                  </div>
                  {ach.earned ? (
                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md tabular-nums">
                      {ach.progress}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            MY CLASS: Expandable Subjects with Chapters
        ═══════════════════════════════════════════════════════ */}
        {studentClass && subjectsWithChapters.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Layers className="h-4 w-4 text-emerald-500" />
                My Class: {studentClass.name}
              </h2>
              <ClassChangeModal
                trigger={
                  <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/5">
                    Request Class Change
                  </button>
                }
              />
            </div>

            <div className="space-y-3">
              {subjectsWithChapters.map((sub, subIdx) => {
                const isExpanded = expandedSubjectId === sub.id
                const chapterCount = sub.chapters?.length || 0
                const colorClass = subjectColors[subIdx % subjectColors.length]

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + subIdx * 0.04 }}
                    className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-emerald-500/20 transition-colors"
                  >
                    {/* Subject Header */}
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 shadow-sm`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate text-foreground">{sub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickExam('subject', [sub.id], 'mcq')
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer ${
                              generatingExam === `subject-${sub.id}-mcq` ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            {generatingExam === `subject-${sub.id}-mcq` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            MCQ
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Chapters */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/30 px-4 py-3 space-y-2 bg-muted/5">
                            {chapterCount > 0 ? (
                              sub.chapters.map((ch) => (
                                <div
                                  key={ch.id}
                                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border border-border/30 hover:border-emerald-500/20 transition-colors group"
                                >
                                  <Link
                                    href={`/class/${studentClass.slug}/${sub.slug}/${ch.slug}`}
                                    className="flex items-center gap-2 min-w-0 flex-1"
                                  >
                                    <Layers className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span className="text-sm font-medium truncate group-hover:text-emerald-500 transition-colors">
                                      {ch.name}
                                    </span>
                                  </Link>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                      onClick={() => handleQuickExam('chapter', [ch.id], 'mcq')}
                                      disabled={generatingExam === `chapter-${ch.id}-mcq`}
                                    >
                                      {generatingExam === `chapter-${ch.id}-mcq` ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Target className="h-3 w-3" />
                                      )}
                                      MCQ
                                    </button>
                                    <button
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-teal-500 hover:bg-teal-500/10 transition-colors"
                                      onClick={() => handleQuickExam('chapter', [ch.id], 'creative')}
                                      disabled={generatingExam === `chapter-${ch.id}-creative`}
                                    >
                                      {generatingExam === `chapter-${ch.id}-creative` ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Zap className="h-3 w-3" />
                                      )}
                                      Creative
                                    </button>
                                    <Link
                                      href={`/class/${studentClass.slug}/${sub.slug}/${ch.slug}`}
                                      className="p-1 rounded-md hover:bg-muted/30 transition-colors"
                                    >
                                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500" />
                                    </Link>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-3">
                                No chapters available yet
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════════
            PLATFORM OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-xl border border-border/60 bg-card p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Classes', value: stats.totalClasses, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Subjects', value: stats.totalSubjects, color: 'text-teal-500', bg: 'bg-teal-500/10' },
              { label: 'Questions', value: stats.totalQuestions, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Exams', value: stats.totalExams, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            ].map(item => (
              <div key={item.label} className={`text-center p-4 ${item.bg} rounded-xl`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  )
}
