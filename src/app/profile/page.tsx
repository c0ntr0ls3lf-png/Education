'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User, BookOpen, Trophy, Flame, Target, Clock, Calendar,
  TrendingUp, Star, Award, Bookmark, ChevronRight, Edit3,
  BarChart3, Users, CheckCircle, XCircle, MinusCircle, ArrowUp,
  Lock, Medal, Zap, Brain, Eye, Timer, GraduationCap, ClipboardList, Camera
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
  exam: {
    id: string
    title: string
    type: string
    duration: number
    totalQuestions: number
  }
}

interface Achievement {
  id: string
  title: string
  description?: string
  icon?: string
  type: string
  earnedAt: string
}

interface LeaderboardEntry {
  userId: string
  name: string
  score: number
  rank: number
  image?: string
}

const DEMO_USER_ID = 'demo-user'

// ─── Image compression ──────────────────────────────────────────
function compressImage(file: File, maxSize = 300, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas context not available')); return }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Achievement definitions ──────────────────────────────────
const allAchievements = [
  { id: 'first-exam', title: 'First Step', description: 'Complete your first exam', icon: '🎯', type: 'exam' },
  { id: 'score-90', title: 'High Achiever', description: 'Score 90% or above in an exam', icon: '⭐', type: 'score' },
  { id: 'streak-7', title: 'Week Warrior', description: '7-day study streak', icon: '🔥', type: 'streak' },
  { id: 'streak-30', title: 'Monthly Master', description: '30-day study streak', icon: '💪', type: 'streak' },
  { id: 'questions-100', title: 'Century Club', description: 'Solve 100 questions', icon: '💯', type: 'questions' },
  { id: 'exams-10', title: 'Exam Pro', description: 'Complete 10 exams', icon: '📝', type: 'exam' },
  { id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% in any exam', icon: '🏆', type: 'score' },
  { id: 'bookmark-10', title: 'Bookworm', description: 'Bookmark 10 items', icon: '📚', type: 'bookmark' },
  { id: 'leaderboard-top3', title: 'Top 3', description: 'Reach top 3 on leaderboard', icon: '🥉', type: 'leaderboard' },
  { id: 'leaderboard-top1', title: 'Champion', description: 'Reach #1 on leaderboard', icon: '👑', type: 'leaderboard' },
  { id: 'creative-master', title: 'Creative Mind', description: 'Complete a creative exam', icon: '💡', type: 'exam' },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Finish an exam in under half the time', icon: '⚡', type: 'speed' },
]

// ─── Leaderboard mock data ────────────────────────────────────
const mockLeaderboard: LeaderboardEntry[] = [
  { userId: '1', name: 'Fatima Khan', score: 2850, rank: 1, image: null },
  { userId: '2', name: 'Rahul Sharma', score: 2720, rank: 2, image: null },
  { userId: '3', name: 'Priya Das', score: 2680, rank: 3, image: null },
  { userId: '4', name: 'Arjun Patel', score: 2540, rank: 4, image: null },
  { userId: 'demo-user', name: 'Alex Rahman', score: 2420, rank: 5, image: null },
  { userId: '6', name: 'Neha Singh', score: 2390, rank: 6, image: null },
  { userId: '7', name: 'Kabir Islam', score: 2280, rank: 7, image: null },
  { userId: '8', name: 'Sara Ahmed', score: 2150, rank: 8, image: null },
  { userId: '9', name: 'Dev Roy', score: 2020, rank: 9, image: null },
  { userId: '10', name: 'Maya Gupta', score: 1980, rank: 10, image: null },
]

// ─── Component ─────────────────────────────────────────────────
export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [savedImage, setSavedImage] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  const [userRole, setUserRole] = useState('student')
  const [userClass, setUserClass] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Computed stats
  const totalExams = examAttempts.length
  const avgScore = totalExams > 0
    ? Math.round(examAttempts.reduce((s, a) => s + a.percentage, 0) / totalExams)
    : 0
  const totalQuestions = examAttempts.reduce((s, a) => s + a.correctCount + a.wrongCount, 0)
  const studyStreak = 5 // Mock streak

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user data
        const userRes = await fetch(`/api/users?userId=${DEMO_USER_ID}`)
        if (userRes.ok) {
          const users = await userRes.json()
          const user = Array.isArray(users) ? users[0] : users
          if (user) {
            setProfileData({ name: user.name || '', email: user.email })
            setSavedImage(user.image || null)
            setUserRole(user.role || 'student')
            // Fetch class name
            if (user.classId) {
              const classRes = await fetch(`/api/classes`)
              if (classRes.ok) {
                const classes = await classRes.json()
                const cls = classes.find((c: any) => c.id === user.classId)
                if (cls) setUserClass(cls.name)
              }
            }
          }
        }

        // Fetch exam attempts
        const examRes = await fetch(`/api/exam-attempts?userId=${DEMO_USER_ID}&status=completed`)
        if (examRes.ok) {
          const data = await examRes.json()
          setExamAttempts(Array.isArray(data) ? data : [])
        }

        // Mock some achievements
        setAchievements([
          { id: '1', title: 'First Step', description: 'Complete your first exam', icon: '🎯', type: 'exam', earnedAt: new Date().toISOString() },
          { id: '2', title: 'High Achiever', description: 'Score 90% or above', icon: '⭐', type: 'score', earnedAt: new Date().toISOString() },
          { id: '3', title: 'Week Warrior', description: '7-day study streak', icon: '🔥', type: 'streak', earnedAt: new Date().toISOString() },
        ])
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchData()
  }, [])

  // ─── Profile Header ────────────────────────────────────────────
  const renderProfileHeader = () => (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
      <CardContent className="relative pt-0 pb-4 px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={profileImage || savedImage} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pt-2">
            <h1 className="text-xl font-bold">{profileData.name}</h1>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              <GraduationCap className="h-3 w-3 mr-1" />
              {userClass || 'Student'}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditDialogOpen(true)}>
              <Edit3 className="h-3 w-3" /> Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ─── Stats Cards ────────────────────────────────────────────────
  const renderStatsCards = () => {
    const stats = [
      { label: 'Exams Taken', value: totalExams, icon: <BookOpen className="h-5 w-5" />, color: 'from-emerald-500 to-teal-600' },
      { label: 'Average Score', value: `${avgScore}%`, icon: <Target className="h-5 w-5" />, color: 'from-teal-500 to-cyan-600' },
      { label: 'Questions Solved', value: totalQuestions, icon: <Brain className="h-5 w-5" />, color: 'from-emerald-600 to-green-700' },
      { label: 'Study Streak', value: `${studyStreak} days`, icon: <Flame className="h-5 w-5" />, color: 'from-amber-500 to-orange-600' },
    ]

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // ─── Overview Tab ────────────────────────────────────────────────
  const renderOverview = () => {
    // Progress chart (simple bar chart)
    const recentAttempts = examAttempts.slice(0, 6)
    const maxScore = 100
    const progressBars = recentAttempts.length > 0 ? recentAttempts : [
      { exam: { title: 'Sample Exam' }, percentage: 75, id: 'sample-1' },
      { exam: { title: 'Math Test' }, percentage: 88, id: 'sample-2' },
      { exam: { title: 'Physics Quiz' }, percentage: 62, id: 'sample-3' },
    ].map(r => ({ ...r, completedAt: new Date().toISOString() })) as any[]

    // Upcoming exams (mock)
    const upcomingExams = [
      { title: 'Mid-Term Mathematics', date: 'Mar 15, 2026', questions: 40, duration: 60 },
      { title: 'Physics Chapter Test', date: 'Mar 18, 2026', questions: 20, duration: 30 },
      { title: 'Chemistry Quiz', date: 'Mar 20, 2026', questions: 25, duration: 45 },
    ]

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Exam Performance */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Recent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : progressBars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-40" />
                <p>No exam attempts yet</p>
                <Link href="/exam"><Button variant="link" className="text-emerald-600 mt-1">Take an exam</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {progressBars.map((attempt: any, i: number) => (
                  <div key={`progress-${i}-${attempt.id || 'na'}`} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]">{attempt.exam?.title || 'Exam'}</span>
                      <span className="text-muted-foreground">{attempt.percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          attempt.percentage >= 80 ? 'bg-emerald-500' :
                          attempt.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${attempt.percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam, i) => (
                <div key={i} className="p-3 rounded-lg border bg-card hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <p className="font-medium text-sm">{exam.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exam.date}</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{exam.questions} Q</span>
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{exam.duration}m</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Exam History Tab ────────────────────────────────────────────
  const renderExamHistory = () => (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Exam History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : examAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mb-2 opacity-40" />
            <p>No exam attempts yet</p>
            <Link href="/exam"><Button variant="link" className="text-emerald-600 mt-1">Take an exam</Button></Link>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Exam</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden md:table-cell">Percentage</TableHead>
                  <TableHead className="hidden lg:table-cell">Time</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examAttempts.map((attempt, idx) => (
                  <TableRow key={`row-${idx}-${attempt.id || 'na'}`}>
                    <TableCell className="font-medium">{attempt.exam?.title || 'Exam'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={attempt.exam?.type === 'mcq' ? 'border-emerald-300 text-emerald-700' : 'border-teal-300 text-teal-700'}>
                        {attempt.exam?.type?.toUpperCase() || 'MCQ'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{attempt.score}/{attempt.totalMarks}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={attempt.percentage} className="h-2 w-16" />
                        <span className="text-sm">{attempt.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ─── Bookmarks Tab ──────────────────────────────────────────────
  const renderBookmarks = () => {
    // Mock bookmarks
    const bookmarks = [
      { id: '1', type: 'chapter', title: 'Algebra - Quadratic Equations', subtitle: 'Class 10 > Math', createdAt: '2026-03-01' },
      { id: '2', type: 'question', title: 'Solve: 2x² + 5x - 3 = 0', subtitle: 'MCQ > Easy', createdAt: '2026-03-02' },
      { id: '3', type: 'chapter', title: 'Light & Optics', subtitle: 'Class 10 > Physics', createdAt: '2026-03-03' },
      { id: '4', type: 'question', title: 'Explain the laws of reflection', subtitle: 'Creative > Medium', createdAt: '2026-03-04' },
      { id: '5', type: 'chapter', title: 'Trigonometric Ratios', subtitle: 'Class 10 > Math', createdAt: '2026-03-05' },
    ]

    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-emerald-500" />
            Your Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  {bm.type === 'chapter' ? <BookOpen className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{bm.title}</p>
                  <p className="text-xs text-muted-foreground">{bm.subtitle}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                  <Bookmark className="h-4 w-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── Achievements Tab ───────────────────────────────────────────
  const renderAchievements = () => {
    const earnedIds = achievements.map(a => a.title)
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {achievements.length} of {allAchievements.length} achievements earned
          </p>
          <Progress value={(achievements.length / allAchievements.length) * 100} className="h-2 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allAchievements.map((ach, i) => {
            const isEarned = earnedIds.includes(ach.title)
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`border-0 shadow-md overflow-hidden transition-all ${isEarned ? '' : 'opacity-50 grayscale'}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <p className="font-semibold text-sm">{ach.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                    {isEarned ? (
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">
                        <CheckCircle className="h-3 w-3 mr-1" /> Earned
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-2 text-[10px]">
                        <Lock className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Leaderboard Tab ─────────────────────────────────────────────
  const renderLeaderboard = () => {
    const currentUserRank = mockLeaderboard.find(e => e.userId === 'demo-user')?.rank ?? 0

    return (
      <div>
        {/* User position card */}
        <Card className="border-0 shadow-md mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                #{currentUserRank}
              </div>
              <div>
                <p className="font-semibold">Your Ranking</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re in the top {Math.round((currentUserRank / mockLeaderboard.length) * 100)}% of students
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-emerald-600">{mockLeaderboard.find(e => e.userId === 'demo-user')?.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              Top Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockLeaderboard.map((entry) => {
                const isCurrentUser = entry.userId === 'demo-user'
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.rank <= 3 ? (
                        entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        `#${entry.rank}`
                      )}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.image} />
                      <AvatarFallback className={`text-xs font-bold ${
                        isCurrentUser ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isCurrentUser ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                        {entry.name} {isCurrentUser && '(You)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{entry.score.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Main Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {renderProfileHeader()}
        {renderStatsCards()}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> History
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-1.5">
              <Bookmark className="h-3.5 w-3.5" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1.5">
              <Award className="h-3.5 w-3.5" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <TabsContent value="overview" className="mt-0">{renderOverview()}</TabsContent>
            <TabsContent value="history" className="mt-0">{renderExamHistory()}</TabsContent>
            <TabsContent value="bookmarks" className="mt-0">{renderBookmarks()}</TabsContent>
            <TabsContent value="achievements" className="mt-0">{renderAchievements()}</TabsContent>
            <TabsContent value="leaderboard" className="mt-0">{renderLeaderboard()}</TabsContent>
          </motion.div>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                >
                  <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-transparent hover:ring-emerald-400 transition-all">
                    <AvatarImage src={profileImage || savedImage} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Image too large. Please upload an image under 10MB.')
                        e.target.value = ''
                        return
                      }
                      try {
                        const compressed = await compressImage(file, 400, 0.7)
                        setProfileImage(compressed)
                      } catch {
                        alert('Failed to process image. Please try another one.')
                      }
                    }
                    e.target.value = ''
                  }}
                />
                <p className="text-xs text-muted-foreground">Click avatar to upload photo</p>
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditDialogOpen(false)
                setProfileImage(null)
              }}>Cancel</Button>
              <Button
                onClick={async () => {
                  setSaving(true)
                  try {
                    const payload: Record<string, any> = {
                      name: profileData.name,
                      email: profileData.email,
                    }
                    if (profileImage) {
                      payload.image = profileImage
                    }
                    const res = await fetch(`/api/users/${DEMO_USER_ID}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    if (res.ok) {
                      if (profileImage) {
                        setSavedImage(profileImage)
                      }
                      setProfileImage(null)
                      setEditDialogOpen(false)
                    }
                  } catch {}
                  setSaving(false)
                }}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
