'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  url: string
  title?: string
  compact?: boolean
}

function getYouTubeEmbedUrl(url: string): string | null {
  // Try adding https:// if no protocol
  let urlToTry = url.trim()
  if (!/^https?:\/\//i.test(urlToTry)) {
    urlToTry = 'https://' + urlToTry
  }
  try {
    const parsed = new URL(urlToTry)
    let videoId = ''

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v') || ''
      // Handle /embed/ URLs
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] || ''
      }
      // Handle /shorts/ URLs
      if (!videoId && parsed.pathname.includes('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || ''
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
  } catch {
    // Invalid URL
  }
  return null
}

export default function VideoPlayer({ url, title, compact }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const embedUrl = getYouTubeEmbedUrl(url)
  const buttonClass = compact
    ? 'h-6 text-[10px] gap-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-1.5 shrink-0'
    : 'text-xs gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'

  if (!embedUrl && url.trim()) {
    // Fallback: open URL in new tab if we can't embed it
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : 'https://' + url.trim()
    const linkClasses = compact
      ? 'h-6 text-[10px] gap-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-1.5 shrink-0 inline-flex items-center justify-center rounded-md border bg-background font-medium transition-colors'
      : 'text-xs gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 inline-flex items-center justify-center rounded-md border bg-background font-medium transition-colors'
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses}>
        <Play className="h-3 w-3" />
        <span className="sm:hidden sr-only">Open video</span>
        <span className="hidden sm:inline">Open</span>
      </a>
    )
  }

  if (!embedUrl) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={buttonClass}
      >
        <Play className="h-3 w-3" />
        <span className="hidden sm:inline">Video</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Video */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={embedUrl}
                title={title || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
