import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react'
import { connectDB, BlogPost, toDoc } from '@/lib/db'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const dynamic = 'force-dynamic'

// ─── Types ──────────────────────────────────────────────────────
interface BlogPostData {
  id: string
  title: string
  slug: string
  content: string
  coverImage?: string | null
  category?: string | null
  createdAt: string
  updatedAt: string
}

// ─── Metadata ───────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  try {
    await connectDB()
    const post = await BlogPost.findOne({ slug, isActive: true }).select('title content category').lean() as any
    if (!post) return { title: 'Post Not Found | EduLMS' }
    const description = post.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 160)
    return {
      title: `${post.title} | EduLMS Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: 'article',
      },
    }
  } catch {
    return { title: 'Blog | EduLMS' }
  }
}

// ─── Data fetch ──────────────────────────────────────────────────
async function fetchPost(slug: string): Promise<BlogPostData | null> {
  try {
    await connectDB()
    const post = await BlogPost.findOne({ slug, isActive: true }).lean()
    if (!post) return null
    return toDoc<BlogPostData>(post)
  } catch {
    return null
  }
}

async function fetchRelated(category: string | null | undefined, currentSlug: string): Promise<BlogPostData[]> {
  try {
    await connectDB()
    const filter: Record<string, any> = { isActive: true, slug: { $ne: currentSlug } }
    if (category) filter.category = category
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).limit(3).lean()
    return toDoc<BlogPostData[]>(posts)
  } catch {
    return []
  }
}

// ─── Helpers ─────────────────────────────────────────────────────
function fmt(dt: string) {
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function categoryColor(cat: string | null | undefined) {
  switch ((cat || '').toLowerCase()) {
    case 'exam prep': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'study tips': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'news': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  }
}

// ─── Page ────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await fetchPost(slug)

  if (!post) notFound()

  const related = await fetchRelated(post.category, post.slug)
  const minutes = readingTime(post.content)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/#blog' },
            { label: post.title },
          ]}
        />
      </div>

      {/* Hero / Cover */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Category badge on image */}
            {post.category && (
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColor(post.category)} shadow-sm`}>
                  {post.category}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
          {!post.coverImage && post.category && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor(post.category)}`}>
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {fmt(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {minutes} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-1 bg-emerald-500 rounded-full mb-8" />

        {/* Content */}
        <div
          className="blog-content text-gray-700 dark:text-gray-300 leading-relaxed text-base"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Homepage
          </Link>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12 mt-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              আরও পড়ুন
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rp => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {rp.coverImage && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={rp.coverImage}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {rp.category && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(rp.category)}`}>
                        {rp.category}
                      </span>
                    )}
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {rp.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">{fmt(rp.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
