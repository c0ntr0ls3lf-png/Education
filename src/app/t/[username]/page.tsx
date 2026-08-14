'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen, Plus, ClipboardList, Target, CheckCircle,
  Clock, AlertTriangle, HelpCircle, Activity,
  Search, Eye, Edit3, ArrowRight, ShieldCheck, XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface PageProps {
  params: Promise<{ username: string }> | { username: string }
}

export default function TeacherPage({ params }: PageProps) {
  const [username, setUsername] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    approvedMcqs: 0,
    approvedCqs: 0,
    approvedExplanations: 0,
    pendingCount: 0,
    rejectedCount: 0
  })
  
  // Data lists
  const [chapters, setChapters] = useState<any[]>([])
  const [mcqs, setMcqs] = useState<any[]>([])
  const [cqs, setCqs] = useState<any[]>([])
  const [explanations, setExplanations] = useState<any[]>([])
  const [pendingChanges, setPendingChanges] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [filterChapterId, setFilterChapterId] = useState('all')

  // Form Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formType, setFormType] = useState<'mcq' | 'cq' | 'explanation'>('mcq')
  const [formAction, setFormAction] = useState<'create' | 'update'>('create')
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})

  const router = useRouter()
  const { toast } = useToast()

  // Unpack username from promise
  useEffect(() => {
    if (params instanceof Promise) {
      params.then((p) => setUsername(p.username))
    } else if (params && typeof params === 'object' && 'username' in params) {
      setUsername(params.username)
    }
  }, [params])

  // Verify auth and username
  useEffect(() => {
    const stored = localStorage.getItem('eduUser')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)
        // If not admin and username doesn't match, redirect
        if (u.role !== 'admin' && u.username !== username && username !== '') {
          router.push('/dashboard')
        }
      } catch {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [username])

  // Load baseline data (chapters, user stats, pending requests)
  useEffect(() => {
    if (username) {
      fetchBaselineData()
    }
  }, [username])

  const fetchBaselineData = async () => {
    setLoading(true)
    try {
      const [chaptersRes, pendingRes, activityRes] = await Promise.all([
        fetch('/api/chapters'),
        fetch('/api/pending'),
        fetch('/api/activity')
      ])

      if (chaptersRes.ok) setChapters(await chaptersRes.ok ? await chaptersRes.json() : [])
      if (pendingRes.ok) {
        const pendData = await pendingRes.json()
        setPendingChanges(pendData)
        
        // Calculate counts
        const pending = pendData.filter((c: any) => c.status === 'pending').length
        const rejected = pendData.filter((c: any) => c.status === 'rejected').length
        setStats(prev => ({ ...prev, pendingCount: pending, rejectedCount: rejected }))
      }
      if (activityRes.ok) setActivityLogs(await activityRes.json())

      // Fetch live content list for workspace
      await fetchLiveContent()
    } catch {
      toast({ title: 'Error', description: 'Failed to load baseline data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveContent = async () => {
    try {
      const [mcqRes, cqRes, expRes] = await Promise.all([
        fetch('/api/mcq-questions'),
        fetch('/api/creative-questions'),
        fetch('/api/explanations')
      ])

      const mcqList = mcqRes.ok ? await mcqRes.json() : []
      const cqList = cqRes.ok ? await cqRes.json() : []
      const expList = expRes.ok ? await expRes.json() : []

      setMcqs(mcqList)
      setCqs(cqList)
      setExplanations(expList)

      setStats(prev => ({
        ...prev,
        approvedMcqs: mcqList.length,
        approvedCqs: cqList.length,
        approvedExplanations: expList.length
      }))
    } catch {
      // handled silently
    }
  }

  // Handle Form Dialog opening for submitting new items
  const openCreateDialog = (type: 'mcq' | 'cq' | 'explanation') => {
    setFormType(type)
    setFormAction('create')
    setEditingEntityId(null)
    
    // Initialize default fields
    if (type === 'mcq') {
      setFormData({
        chapterId: '',
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        difficulty: 'medium',
        explanation: '',
        marks: 1,
        tags: '',
        isActive: true
      })
    } else if (type === 'cq') {
      setFormData({
        chapterId: '',
        label: '',
        question: '',
        answer: '',
        marks: 10,
        difficulty: 'medium',
        explanation: '',
        subQuestionA: '',
        subQuestionB: '',
        subQuestionC: '',
        subQuestions: '',
        tags: '',
        isActive: true
      })
    } else {
      setFormData({
        chapterId: '',
        question: '',
        solution: '',
        videoUrl: '',
        difficulty: 'medium',
        tags: '',
        isActive: true
      })
    }
    setIsFormOpen(true)
  }

  // Handle Form Dialog pre-filled for requesting edits
  const openEditDialog = (item: any, type: 'mcq' | 'cq' | 'explanation') => {
    setFormType(type)
    setFormAction('update')
    setEditingEntityId(item.id || item._id)
    setFormData({ ...item })
    setIsFormOpen(true)
  }

  // Form Submit handler
  const handleFormSubmit = async () => {
    if (!formData.chapterId) {
      toast({ title: 'Error', description: 'Please select a Chapter', variant: 'destructive' })
      return
    }

    setSubmitLoading(true)
    try {
      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: formType,
          entityId: editingEntityId,
          action: formAction,
          data: formData
        })
      })

      if (res.ok) {
        toast({
          title: 'Proposal Submitted',
          description: `Your ${formAction === 'create' ? 'new' : 'edit'} proposal for ${formType} has been queued for Admin review.`
        })
        setIsFormOpen(false)
        fetchBaselineData() // Refresh list and counts
      } else {
        const err = await res.json()
        toast({ title: 'Submission Failed', description: err.error || 'Could not queue change', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setSubmitLoading(false)
    }
  }

  // Filters MCQ/CQ/Explanations by chapter ID if selected
  const filteredMcqs = filterChapterId === 'all' ? mcqs : mcqs.filter(m => m.chapterId === filterChapterId)
  const filteredCqs = filterChapterId === 'all' ? cqs : cqs.filter(c => c.chapterId === filterChapterId)
  const filteredExps = filterChapterId === 'all' ? explanations : explanations.filter(e => e.chapterId === filterChapterId)

  // Returns true if a question has a pending edit request
  const hasPendingChange = (entityId: string) => {
    return pendingChanges.some(c => c.entityId === entityId && c.status === 'pending')
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Workspace</h1>
            <p className="text-muted-foreground mt-1">Logged in as @{username}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openCreateDialog('mcq')} className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-sm h-9">
              <Plus className="h-4 w-4" /> Submit MCQ
            </Button>
            <Button onClick={() => openCreateDialog('cq')} className="bg-teal-600 hover:bg-teal-700 gap-1 text-sm h-9">
              <Plus className="h-4 w-4" /> Submit CQ
            </Button>
            <Button onClick={() => openCreateDialog('explanation')} className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-sm h-9">
              <Plus className="h-4 w-4" /> Submit Explanation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Live MCQs', value: stats.approvedMcqs, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Live CQs', value: stats.approvedCqs, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/20' },
            { label: 'Live Explanations', value: stats.approvedExplanations, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
            { label: 'Pending Requests', value: stats.pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Rejected Proposals', value: stats.rejectedCount, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' }
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 items-center">
          <span className="text-sm font-medium text-muted-foreground">Filter by Chapter:</span>
          <Select value={filterChapterId} onValueChange={setFilterChapterId}>
            <SelectTrigger className="w-64 h-9">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mcq">MCQs</TabsTrigger>
            <TabsTrigger value="cq">CQs (Creative)</TabsTrigger>
            <TabsTrigger value="explanation">Explanations</TabsTrigger>
            <TabsTrigger value="requests">My Submissions ({pendingChanges.length})</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    My Workspace Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">No recent actions logged</p>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs.slice(0, 8).map((log, idx) => (
                        <div key={log.id || idx} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Type: {log.entityType}</p>
                          </div>
                          <div className="text-right">
                            {log.status === 'pending' && <Badge variant="outline" className="text-amber-600 border-amber-600/30">Pending</Badge>}
                            {log.status === 'approved' && <Badge variant="outline" className="text-emerald-600 border-emerald-600/30">Approved</Badge>}
                            {log.status === 'rejected' && <Badge variant="outline" className="text-rose-600 border-rose-600/30">Rejected</Badge>}
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips & Guidance */}
              <Card className="border-0 shadow-md bg-emerald-50/50 dark:bg-emerald-950/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    Teacher Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-emerald-900/80 dark:text-emerald-200/80">
                  <p>1. <strong>Strict Moderation:</strong> All submissions (creations & updates) are saved in draft status and remain hidden from public view until reviewed and approved by an Admin.</p>
                  <p>2. <strong>One Edit Limit:</strong> An approved, active content item is locked from further direct updates by a Teacher. You must request subsequent revisions.</p>
                  <p>3. <strong>Delete Disabled:</strong> Teachers do not have deletion privileges. If an item contains faulty content, notify the Admin.</p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* MCQ TAB */}
          <TabsContent value="mcq">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {filteredMcqs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No MCQ questions found. Click 'Submit MCQ' to start.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Correct Option</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMcqs.map((q) => {
                        const isLocked = hasPendingChange(q.id);
                        return (
                          <TableRow key={q.id}>
                            <TableCell className="font-medium max-w-xs truncate">{q.question}</TableCell>
                            <TableCell><Badge className="capitalize">{q.difficulty}</Badge></TableCell>
                            <TableCell className="font-mono">{q.correctAnswer}</TableCell>
                            <TableCell>
                              {isLocked ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-600/30">Pending Review</Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approved (Live)</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLocked}
                                onClick={() => openEditDialog(q, 'mcq')}
                                className="h-8 gap-1"
                              >
                                <Edit3 className="h-3 w-3" /> Edit Proposal
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CQ TAB */}
          <TabsContent value="cq">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {filteredCqs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No creative questions found. Click 'Submit CQ' to start.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label / Year</TableHead>
                        <TableHead>Stem / Question Preview</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCqs.map((q) => {
                        const isLocked = hasPendingChange(q.id);
                        return (
                          <TableRow key={q.id}>
                            <TableCell className="font-medium">{q.label || q.board_name || 'Creative'}</TableCell>
                            <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                            <TableCell><Badge className="capitalize">{q.difficulty}</Badge></TableCell>
                            <TableCell>
                              {isLocked ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-600/30">Pending Review</Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approved (Live)</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLocked}
                                onClick={() => openEditDialog(q, 'cq')}
                                className="h-8 gap-1"
                              >
                                <Edit3 className="h-3 w-3" /> Edit Proposal
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPLANATION TAB */}
          <TabsContent value="explanation">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {filteredExps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No explanations found. Click 'Submit Explanation' to start.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic / Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Solution Preview</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExps.map((q) => {
                        const isLocked = hasPendingChange(q.id);
                        return (
                          <TableRow key={q.id}>
                            <TableCell className="font-medium max-w-xs truncate">{q.question}</TableCell>
                            <TableCell><Badge className="capitalize">{q.difficulty}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">{q.solution || 'No text'}</TableCell>
                            <TableCell>
                              {isLocked ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-600/30">Pending Review</Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approved (Live)</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLocked}
                                onClick={() => openEditDialog(q, 'explanation')}
                                className="h-8 gap-1"
                              >
                                <Edit3 className="h-3 w-3" /> Edit Proposal
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBMISSIONS LIST TAB */}
          <TabsContent value="requests">
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {pendingChanges.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No proposals submitted yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Date Proposed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingChanges.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell className="font-semibold capitalize">{change.entityType}</TableCell>
                          <TableCell className="capitalize">{change.action}</TableCell>
                          <TableCell>{new Date(change.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {change.status === 'pending' && <Badge className="bg-amber-500 hover:bg-amber-600">Pending Review</Badge>}
                            {change.status === 'approved' && <Badge className="bg-emerald-600 hover:bg-emerald-700">Approved</Badge>}
                            {change.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                          </TableCell>
                          <TableCell className="text-sm italic max-w-xs truncate text-muted-foreground">
                            {change.reviewNote || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Dynamic Creation/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {formAction === 'create' ? 'Propose New' : 'Propose Edit for'} {formType}
            </DialogTitle>
            <DialogDescription>
              Submit your proposal details below. Your submission must be approved by an administrator before it is made live.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            
            {/* Common fields: Chapter */}
            <div className="grid gap-2">
              <Label htmlFor="item-chapter">Chapter</Label>
              <Select
                value={formData.chapterId || ''}
                onValueChange={(val) => setFormData((prev: any) => ({ ...prev, chapterId: val }))}
              >
                <SelectTrigger id="item-chapter">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* MCQ specific fields */}
            {formType === 'mcq' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="item-question">Question Text</Label>
                  <Textarea
                    id="item-question"
                    value={formData.question || ''}
                    onChange={(e) => setFormData((p: any) => ({ ...p, question: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="optA">Option A</Label>
                    <Input id="optA" value={formData.optionA || ''} onChange={(e) => setFormData((p: any) => ({ ...p, optionA: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="optB">Option B</Label>
                    <Input id="optB" value={formData.optionB || ''} onChange={(e) => setFormData((p: any) => ({ ...p, optionB: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="optC">Option C</Label>
                    <Input id="optC" value={formData.optionC || ''} onChange={(e) => setFormData((p: any) => ({ ...p, optionC: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="optD">Option D</Label>
                    <Input id="optD" value={formData.optionD || ''} onChange={(e) => setFormData((p: any) => ({ ...p, optionD: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="correct-ans">Correct Option</Label>
                    <Select value={formData.correctAnswer || 'A'} onValueChange={(val) => setFormData((p: any) => ({ ...p, correctAnswer: val }))}>
                      <SelectTrigger id="correct-ans">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="item-diff">Difficulty</Label>
                    <Select value={formData.difficulty || 'medium'} onValueChange={(val) => setFormData((p: any) => ({ ...p, difficulty: val }))}>
                      <SelectTrigger id="item-diff">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-exp">Explanation</Label>
                  <Textarea id="item-exp" value={formData.explanation || ''} onChange={(e) => setFormData((p: any) => ({ ...p, explanation: e.target.value }))} />
                </div>
              </>
            )}

            {/* CQ specific fields */}
            {formType === 'cq' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="cq-label">Label (e.g. Dhaka Board 2023)</Label>
                    <Input id="cq-label" value={formData.label || ''} onChange={(e) => setFormData((p: any) => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="cq-diff">Difficulty</Label>
                    <Select value={formData.difficulty || 'medium'} onValueChange={(val) => setFormData((p: any) => ({ ...p, difficulty: val }))}>
                      <SelectTrigger id="cq-diff">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cq-stem">Stem Text</Label>
                  <Textarea id="cq-stem" value={formData.question || ''} onChange={(e) => setFormData((p: any) => ({ ...p, question: e.target.value }))} rows={4} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cq-sub-a">Question A</Label>
                  <Input id="cq-sub-a" value={formData.subQuestionA || ''} onChange={(e) => setFormData((p: any) => ({ ...p, subQuestionA: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cq-sub-b">Question B</Label>
                  <Input id="cq-sub-b" value={formData.subQuestionB || ''} onChange={(e) => setFormData((p: any) => ({ ...p, subQuestionB: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cq-sub-c">Question C</Label>
                  <Input id="cq-sub-c" value={formData.subQuestionC || ''} onChange={(e) => setFormData((p: any) => ({ ...p, subQuestionC: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cq-ans">Answer Description (optional)</Label>
                  <Textarea id="cq-ans" value={formData.answer || ''} onChange={(e) => setFormData((p: any) => ({ ...p, answer: e.target.value }))} />
                </div>
              </>
            )}

            {/* Explanation specific fields */}
            {formType === 'explanation' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="exp-topic">Topic / Question Title</Label>
                  <Input id="exp-topic" value={formData.question || ''} onChange={(e) => setFormData((p: any) => ({ ...p, question: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exp-solution">Detailed Solution (supports markdown)</Label>
                  <Textarea id="exp-solution" value={formData.solution || ''} onChange={(e) => setFormData((p: any) => ({ ...p, solution: e.target.value }))} rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="exp-video">Video Explainer URL (optional)</Label>
                    <Input id="exp-video" value={formData.videoUrl || ''} onChange={(e) => setFormData((p: any) => ({ ...p, videoUrl: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="exp-diff">Difficulty</Label>
                    <Select value={formData.difficulty || 'medium'} onValueChange={(val) => setFormData((p: any) => ({ ...p, difficulty: val }))}>
                      <SelectTrigger id="exp-diff">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} disabled={submitLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {submitLoading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
