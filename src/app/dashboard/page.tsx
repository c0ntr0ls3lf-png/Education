'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, BookOpen, Trophy, Flame, Target, Clock, Calendar,
  TrendingUp, Award, Bookmark, ChevronRight, GraduationCap,
  BarChart3, CheckCircle, XCircle, Timer, ClipboardList,
  ArrowRight, Play
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

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
}

interface ClassItem {
  id: string
  name: string
  slug: string
  number: number
  description?: string | null
  subjects: Array<{ id: string; name: string }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [stats, setStats] = useState({ totalClasses: 0, totalSubjects: 0, totalQuestions: 0, totalExams: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('eduUser')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, attemptsRes, classesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/exam-attempts?status=completed'),
        fetch('/api/classes?include=subjects'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json()
        setExamAttempts(Array.isArray(attemptsData) ? attemptsData : [])
      }
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(Array.isArray(classesData) ? classesData : [])
      }
    } catch (err) {
      // fetch error handled silently
    } finally {
      setLoading(false)
    }
  }

  const totalExams = examAttempts.length
  const avgScore = totalExams > 0 ? Math.round(examAttempts.reduce((a, b) => a + b.percentage, 0) / totalExams) : 0
  const questionsSolved = examAttempts.reduce((a, b) => a + b.correctCount + b.wrongCount, 0)

  const userName = user?.name || 'Student'
  const userEmail = user?.email || 'student@edu.com'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 mb-8"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-20 h-32 w-32 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-4 left-10 h-24 w-24 rounded-full bg-teal-200 blur-2xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/30 shadow-lg">
              <AvatarImage src={user?.image} alt={userName} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{userName}</h1>
              <p className="text-emerald-100 text-sm mt-1">{userEmail}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <Flame className="mr-1 h-3 w-3" />
                  7 Day Streak
                </Badge>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                Edit Profile
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ClipboardList, label: 'Exams Taken', value: totalExams, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            { icon: Target, label: 'Avg Score', value: `${avgScore}%`, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
            { icon: CheckCircle, label: 'Questions Solved', value: questionsSolved, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            { icon: Flame, label: 'Study Streak', value: '7 days', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Exam History</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Performance */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {examAttempts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mb-2 opacity-40" />
                      <p>No exam attempts yet</p>
                      <Link href="/exam">
                        <Button variant="link" className="text-emerald-600 mt-1">Take an exam</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {examAttempts.slice(0, 5).map((attempt, idx) => (
                        <div key={attempt.id || `attempt-${idx}`} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium truncate max-w-[200px]">
                              {attempt.exam?.title || 'Exam'}
                            </span>
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
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/exam">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 justify-start">
                      <Play className="h-4 w-4" />
                      Take an Exam
                    </Button>
                  </Link>
                  <Link href="/class">
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <BookOpen className="h-4 w-4" />
                      Browse Classes
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <User className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Class Navigation */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                    Browse Classes
                  </CardTitle>
                  <Link href="/class">
                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-600 hover:text-emerald-700">
                      View All <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No classes available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {classes.slice(0, 12).map((cls) => (
                      <Link key={cls.id} href={`/class/${cls.slug}`}>
                        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer h-full">
                          <CardContent className="p-3 flex flex-col items-center text-center">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {cls.number}
                              </span>
                            </div>
                            <p className="text-xs font-medium truncate w-full">{cls.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {cls.subjects?.length || 0} subjects
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  Platform Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalClasses}</p>
                    <p className="text-xs text-muted-foreground">Classes</p>
                  </div>
                  <div className="text-center p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalSubjects}</p>
                    <p className="text-xs text-muted-foreground">Subjects</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.totalExams}</p>
                    <p className="text-xs text-muted-foreground">Exams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Exam History</CardTitle>
              </CardHeader>
              <CardContent>
                {examAttempts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No exam history yet</p>
                    <p className="text-sm mt-1">Take an exam to see your results here</p>
                    <Link href="/exam">
                      <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <Play className="h-4 w-4" /> Take Exam
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examAttempts.map((attempt, idx) => (
                          <TableRow key={attempt.id || `hist-${idx}`}>
                            <TableCell className="font-medium">{attempt.exam?.title || 'Exam'}</TableCell>
                            <TableCell>{attempt.score}/{attempt.totalMarks}</TableCell>
                            <TableCell>
                              <Badge variant={attempt.percentage >= 80 ? 'default' : attempt.percentage >= 60 ? 'secondary' : 'destructive'}
                                className={attempt.percentage >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}>
                                {attempt.percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell>{Math.round(attempt.timeTaken / 60)}m</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
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
          </TabsContent>

          <TabsContent value="bookmarks">
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No bookmarks yet</p>
                <p className="text-sm mt-1">Save chapters and questions while studying</p>
                <Link href="/class">
                  <Button variant="outline" className="mt-4 gap-2">
                    <BookOpen className="h-4 w-4" /> Browse Content
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { title: 'First Exam', desc: 'Complete your first exam', icon: '🎯', earned: totalExams > 0 },
                { title: 'High Scorer', desc: 'Score 80%+ on an exam', icon: '🏆', earned: examAttempts.some(a => a.percentage >= 80) },
                { title: 'Quick Learner', desc: 'Complete 5 exams', icon: '⚡', earned: totalExams >= 5 },
                { title: 'Scholar', desc: 'Score 100% on an exam', icon: '🎓', earned: examAttempts.some(a => a.percentage === 100) },
                { title: 'Consistent', desc: '7-day study streak', icon: '🔥', earned: false },
                { title: 'Explorer', desc: 'Visit all class pages', icon: '🧭', earned: false },
                { title: 'Bookworm', desc: 'Read 50 explanations', icon: '📚', earned: false },
                { title: 'Champion', desc: 'Top 10 on leaderboard', icon: '🥇', earned: false },
              ].map((achievement) => (
                <Card
                  key={achievement.title}
                  className={`border-0 shadow-md transition-all ${achievement.earned ? 'opacity-100' : 'opacity-50 grayscale'}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="font-semibold text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.desc}</p>
                    {achievement.earned && (
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                        Earned
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
