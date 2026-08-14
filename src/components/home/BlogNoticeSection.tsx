'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, X, Star, ChevronRight, ChevronDown, Calendar, Tag, ArrowRight, Clock } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  coverImage?: string | null
  category?: string | null
  createdAt: string
}

interface Notice {
  id: string
  title: string
  content: string
  category: string
  isImportant: boolean
  createdAt: string
}

interface BlogNoticeSectionProps {
  posts: BlogPost[]
  notices: Notice[]
}

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function noticeCategoryColor(cat: string) {
  switch (cat) {
    case 'exam':      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'academic':  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'admission': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    default:          return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }
}

function blogCategoryColor(cat: string | null | undefined) {
  switch ((cat || '').toLowerCase()) {
    case 'exam prep':  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'study tips': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:           return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  }
}

// ─── Color gradients for cards ───────────────────────────────────────
const CARD_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-600',
  'from-red-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-yellow-600',
  'from-violet-500 to-purple-600',
  'from-teal-500 to-green-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
]

// ─── Category colors for featured posts ─────────────────────────────
const CATEGORY_COLORS = {
  'exam prep': 'bg-orange-500',
  'study tips': 'bg-purple-500',
  'general': 'bg-emerald-500',
}

function getCategoryColor(cat: string | null | undefined) {
  return CATEGORY_COLORS[(cat || 'general').toLowerCase() as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.general
}

// ── Featured Blog Card (large, full-bleed image) ───────────────────
function FeaturedBlogCard({ post, index }: { post: BlogPost; index: number }) {
  const categoryColor = getCategoryColor(post.category)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Background image */}
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content overlay - bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-3">
          {/* Category tag */}
          {post.category && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor} text-white`}>
              {post.category}
            </span>
          )}
          {/* Date */}
          <span className="text-xs text-white/80">
            {fmt(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-xl leading-tight line-clamp-2">
          {post.title}
        </h3>
      </div>
    </Link>
  )
}

// ── Notice Accordion Item ─────────────────────────────────────────
function NoticeItem({ notice, index, isOpen, onToggle }: { notice: Notice; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-gray-600/50"
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-800/50"
        aria-expanded={isOpen}
      >
        {/* Icon placeholder */}
        <div className="shrink-0 h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center">
          <Bell className="h-4 w-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          {/* Title */}
          <h4 className="font-semibold text-[11px] text-gray-900 dark:text-white truncate">
            {notice.title}
          </h4>
          {/* Category tag */}
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {notice.category}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-700/50 bg-gray-900/30">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {fmt(notice.createdAt)}
            </span>
          </div>
          <div
            className="text-sm text-gray-300 leading-relaxed
              [&_strong]:font-bold [&_strong]:text-white
              [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mt-1
              [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mt-1
              [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />
        </div>
      )}
    </div>
  )
}

// ── Mobile Notice Popup ──────────────────────────────────────────
function MobileNoticePopup({ notices, openNoticeId, handleNoticeToggle }: { notices: Notice[]; openNoticeId: string | null; handleNoticeToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const importantCount = notices.filter(n => n.isImportant).length

  if (notices.length === 0) return null

  return (
    <>
      {/* Floating Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-gray-800 text-white shadow-xl hover:bg-gray-700 active:scale-95 transition-all duration-200"
        aria-label="Open Notice Board"
      >
        <Bell className="h-6 w-6" />
        {importantCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {importantCount}
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl shadow-2xl max-h-[78vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">নোটিশ বোর্ড</h3>
                  <span className="text-xs text-gray-400">{notices.length}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-800 text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Accordion list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {notices.map((notice, index) => (
                <NoticeItem
                  key={notice.id}
                  notice={notice}
                  index={index}
                  isOpen={openNoticeId === notice.id}
                  onToggle={() => handleNoticeToggle(notice.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Blog Card → links to /blog/[slug] ───────────────────────────
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const plainText = post.content.replace(/<[^>]*>/g, ' ').trim()
  const minutes = readingTime(post.content)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl border border-gray-100 dark:border-gray-800
        hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 bg-white dark:bg-gray-900 block overflow-hidden"
    >
      {/* Cover image on top */}
      {post.coverImage ? (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
      )}

      {/* Content */}
      <div className="p-4">
        {/* Category badge + date */}
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${blogCategoryColor(post.category)}`}>
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {fmt(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug
          group-hover:text-emerald-600 dark:group-hover:text-emerald-400
          transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {plainText.slice(0, 120)}{plainText.length > 120 ? '...' : ''}
        </p>
      </div>
    </Link>
  )
}

// ── Main Export ─────────────────────────────────────────────────
export default function BlogNoticeSection({ posts, notices }: BlogNoticeSectionProps) {
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(notices.length > 0 ? notices[0].id : null)

  const handleNoticeToggle = (noticeId: string) => {
    setOpenNoticeId(openNoticeId === noticeId ? null : noticeId)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

        {/* ── Blog Posts col (3/4 width) ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">সর্বশেষ ব্লগ পোস্ট</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">আর্টিকেল, টিপস ও স্টাডি রিসোর্স</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Tag className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">কোনো ব্লগ পোস্ট নেই।</p>
            </div>
          ) : (
            <>
              {/* Top Row: 2 Featured Posts */}
              {posts.slice(0, 2).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {posts.slice(0, 2).map((post, index) => (
                    <FeaturedBlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}

              {/* Recent Posts Heading */}
              {posts.slice(2).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
                </div>
              )}

              {/* Bottom Row: 3-column grid for regular posts */}
              {posts.slice(2).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(2).map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index + 2} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Notice Board col (1/4 width) — desktop only ── */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">নোটিশ বোর্ড</h3>
                <p className="text-xs text-gray-400">গুরুত্বপূর্ণ ঘোষণাসমূহ</p>
              </div>
            </div>

            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-gray-700/50 bg-gray-900/30">
                <Bell className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">কোনো নোটিশ নেই</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[660px] overflow-y-auto pr-0.5">
                {notices.map((notice, index) => (
                  <NoticeItem
                    key={notice.id}
                    notice={notice}
                    index={index}
                    isOpen={openNoticeId === notice.id}
                    onToggle={() => handleNoticeToggle(notice.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bell popup */}
      <MobileNoticePopup notices={notices} openNoticeId={openNoticeId} handleNoticeToggle={handleNoticeToggle} />
    </>
  )
}
