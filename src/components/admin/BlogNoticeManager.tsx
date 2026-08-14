'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  FileText, Bell, Search, X, ImageIcon, Save, RefreshCw, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

// ─── Types ─────────────────────────────────────────────────────
interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  coverImage?: string | null
  category?: string | null
  isActive: boolean
  createdAt: string
}

interface Notice {
  id: string
  title: string
  slug: string
  content: string
  category: 'academic' | 'exam' | 'admission' | 'general'
  isImportant: boolean
  isActive: boolean
  createdAt: string
}

type Tab = 'blog' | 'notice'

const BLOG_CATEGORIES = ['General', 'Study Tips', 'Exam Prep', 'Science', 'Math', 'Language', 'History', 'News']
const NOTICE_CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'exam', label: 'Exam' },
  { value: 'admission', label: 'Admission' },
  { value: 'general', label: 'General' },
]

// ─── Category badge colour ──────────────────────────────────────
function noticeCategoryColor(cat: string) {
  switch (cat) {
    case 'exam': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'academic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'admission': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

// ─── Date formatter ─────────────────────────────────────────────
function fmt(dt: string) {
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main Component ─────────────────────────────────────────────
export default function BlogNoticeManager() {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('blog')
  const [search, setSearch] = useState('')

  // Blog state
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(false)

  // Notice state
  const [notices, setNotices] = useState<Notice[]>([])
  const [noticeLoading, setNoticeLoading] = useState(false)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; item: BlogPost | Notice } | null>(null)

  // Blog form
  const [blogForm, setBlogForm] = useState({
    title: '', content: '', coverImage: '', category: 'General', isActive: true,
  })

  // Notice form
  const [noticeForm, setNoticeForm] = useState({
    title: '', content: '', category: 'general' as Notice['category'], isImportant: false, isActive: true,
  })

  // ── Fetch ──────────────────────────────────────────────────
  const fetchBlogs = useCallback(async () => {
    setBlogLoading(true)
    try {
      const res = await fetch('/api/blog-posts?all=true')
      if (res.ok) setBlogs(await res.json())
    } catch { /* ignore */ }
    finally { setBlogLoading(false) }
  }, [])

  const fetchNotices = useCallback(async () => {
    setNoticeLoading(true)
    try {
      const res = await fetch('/api/notices?all=true')
      if (res.ok) setNotices(await res.json())
    } catch { /* ignore */ }
    finally { setNoticeLoading(false) }
  }, [])

  useEffect(() => { fetchBlogs(); fetchNotices() }, [fetchBlogs, fetchNotices])

  // ── Open Create Dialog ─────────────────────────────────────
  function openCreate() {
    if (tab === 'blog') {
      setEditingBlog(null)
      setBlogForm({ title: '', content: '', coverImage: '', category: 'General', isActive: true })
    } else {
      setEditingNotice(null)
      setNoticeForm({ title: '', content: '', category: 'general', isImportant: false, isActive: true })
    }
    setDialogOpen(true)
  }

  function openEdit(item: BlogPost | Notice) {
    if (tab === 'blog') {
      const b = item as BlogPost
      setEditingBlog(b)
      setBlogForm({ title: b.title, content: b.content, coverImage: b.coverImage || '', category: b.category || 'General', isActive: b.isActive })
    } else {
      const n = item as Notice
      setEditingNotice(n)
      setNoticeForm({ title: n.title, content: n.content, category: n.category, isImportant: n.isImportant, isActive: n.isActive })
    }
    setDialogOpen(true)
  }

  // ── Save ───────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      if (tab === 'blog') {
        if (!blogForm.title.trim() || !blogForm.content.trim()) {
          toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' })
          return
        }
        const url = editingBlog ? `/api/blog-posts/${editingBlog.id}` : '/api/blog-posts'
        const method = editingBlog ? 'PUT' : 'POST'
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blogForm) })
        if (!res.ok) throw new Error(await res.text())
        toast({ title: editingBlog ? 'Blog updated' : 'Blog created' })
        await fetchBlogs()
      } else {
        if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
          toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' })
          return
        }
        const url = editingNotice ? `/api/notices/${editingNotice.id}` : '/api/notices'
        const method = editingNotice ? 'PUT' : 'POST'
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noticeForm) })
        if (!res.ok) throw new Error(await res.text())
        toast({ title: editingNotice ? 'Notice updated' : 'Notice created' })
        await fetchNotices()
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const { type, item } = deleteTarget
      const url = type === 'blog' ? `/api/blog-posts/${item.id}` : `/api/notices/${item.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: type === 'blog' ? 'Blog deleted' : 'Notice deleted' })
      if (type === 'blog') await fetchBlogs()
      else await fetchNotices()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── Toggle Active ───────────────────────────────────────────
  async function toggleActive(type: Tab, item: BlogPost | Notice) {
    try {
      const url = type === 'blog' ? `/api/blog-posts/${item.id}` : `/api/notices/${item.id}`
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      })
      if (type === 'blog') await fetchBlogs()
      else await fetchNotices()
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  // ── Toggle Important (notices) ──────────────────────────────
  async function toggleImportant(notice: Notice) {
    try {
      await fetch(`/api/notices/${notice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notice, isImportant: !notice.isImportant }),
      })
      await fetchNotices()
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  // ── Filter ─────────────────────────────────────────────────
  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(search.toLowerCase())
  )
  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  )

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blog &amp; Notice Board</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage blog posts and notices shown on the homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-52"
            />
          </div>
          <Button size="sm" onClick={() => { tab === 'blog' ? fetchBlogs() : fetchNotices() }} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            New {tab === 'blog' ? 'Post' : 'Notice'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => { setTab(v as Tab); setSearch('') }}>
        <TabsList className="grid grid-cols-2 w-64">
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="notice" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notices
          </TabsTrigger>
        </TabsList>

        {/* ─ Blog Posts Tab ─ */}
        <TabsContent value="blog" className="mt-4">
          {blogLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />Loading...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No blog posts yet. Create your first post.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredBlogs.map(post => (
                <Card key={post.id} className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{post.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {post.category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  {post.category}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">{fmt(post.createdAt)}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${post.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                                {post.isActive ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-gray-600"
                              title={post.isActive ? 'Unpublish' : 'Publish'}
                              onClick={() => toggleActive('blog', post)}
                            >
                              {post.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-500 hover:text-blue-700"
                              onClick={() => openEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget({ type: 'blog', item: post })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p
                          className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>/g, ' ').slice(0, 180) }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─ Notices Tab ─ */}
        <TabsContent value="notice" className="mt-4">
          {noticeLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />Loading...
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No notices yet. Create your first notice.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredNotices.map(notice => (
                <Card key={notice.id} className={`border ${notice.isImportant ? 'border-amber-300 dark:border-amber-700' : 'border-gray-100 dark:border-gray-800'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {notice.isImportant && <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />}
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{notice.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${noticeCategoryColor(notice.category)}`}>
                            {notice.category}
                          </span>
                          <span className="text-xs text-gray-400">{fmt(notice.createdAt)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${notice.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                            {notice.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p
                          className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: notice.content.replace(/<[^>]*>/g, ' ').slice(0, 180) }}
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-amber-500 hover:text-amber-700"
                          title={notice.isImportant ? 'Remove important' : 'Mark important'}
                          onClick={() => toggleImportant(notice)}
                        >
                          {notice.isImportant ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                          title={notice.isActive ? 'Hide' : 'Show'}
                          onClick={() => toggleActive('notice', notice)}
                        >
                          {notice.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-500 hover:text-blue-700"
                          onClick={() => openEdit(notice)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => setDeleteTarget({ type: 'notice', item: notice })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {tab === 'blog'
                ? (editingBlog ? 'Edit Blog Post' : 'New Blog Post')
                : (editingNotice ? 'Edit Notice' : 'New Notice')}
            </DialogTitle>
          </DialogHeader>

          {tab === 'blog' ? (
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  value={blogForm.title}
                  onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter post title..."
                />
              </div>

              {/* Category + Cover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />Category</Label>
                  <Select value={blogForm.category} onValueChange={v => setBlogForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Cover Image URL</Label>
                  <Input
                    value={blogForm.coverImage}
                    onChange={e => setBlogForm(f => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Cover preview */}
              {blogForm.coverImage && (
                <img src={blogForm.coverImage} alt="Cover" className="h-32 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              )}

              {/* Content */}
              <div className="space-y-1.5">
                <Label>Content <span className="text-red-500">*</span></Label>
                <RichTextEditor
                  value={blogForm.content}
                  onChange={html => setBlogForm(f => ({ ...f, content: html }))}
                  placeholder="Write your blog post here..."
                  minHeight={300}
                  showMathButton={false}
                />
              </div>

              {/* Published switch */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <Switch
                  id="blog-active"
                  checked={blogForm.isActive}
                  onCheckedChange={v => setBlogForm(f => ({ ...f, isActive: v }))}
                />
                <Label htmlFor="blog-active" className="cursor-pointer select-none">
                  {blogForm.isActive ? 'Published — visible on homepage' : 'Draft — hidden from homepage'}
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  value={noticeForm.title}
                  onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter notice title..."
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={noticeForm.category} onValueChange={v => setNoticeForm(f => ({ ...f, category: v as Notice['category'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOTICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label>Content <span className="text-red-500">*</span></Label>
                <RichTextEditor
                  value={noticeForm.content}
                  onChange={html => setNoticeForm(f => ({ ...f, content: html }))}
                  placeholder="Write your notice here..."
                  minHeight={250}
                  showMathButton={false}
                />
              </div>

              {/* Switches */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Switch
                    id="notice-important"
                    checked={noticeForm.isImportant}
                    onCheckedChange={v => setNoticeForm(f => ({ ...f, isImportant: v }))}
                  />
                  <Label htmlFor="notice-important" className="cursor-pointer select-none">
                    {noticeForm.isImportant ? '⭐ Marked as Important' : 'Mark as Important'}
                  </Label>
                </div>
                <div className="flex items-center gap-3 flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                  <Switch
                    id="notice-active"
                    checked={noticeForm.isActive}
                    onCheckedChange={v => setNoticeForm(f => ({ ...f, isActive: v }))}
                  />
                  <Label htmlFor="notice-active" className="cursor-pointer select-none">
                    {noticeForm.isActive ? 'Active — visible on homepage' : 'Hidden from homepage'}
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === 'blog' ? 'Blog Post' : 'Notice'}?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.item.title}&rdquo; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
