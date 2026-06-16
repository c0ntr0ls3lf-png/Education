'use client'

import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'

interface AdData {
  id: string
  name: string
  location: string
  type: string
  code?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  isActive: boolean
}

interface AdBannerProps {
  location: 'header' | 'sidebar' | 'content' | 'footer' | 'exam_page' | 'mobile'
}

const sizeMap: Record<string, string> = {
  header: 'w-full h-[90px]',
  sidebar: 'w-full h-[250px]',
  content: 'w-full h-[100px]',
  footer: 'w-full h-[60px]',
  exam_page: 'w-full h-[90px]',
  mobile: 'w-full h-[50px]',
}

export function AdBanner({ location }: AdBannerProps) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`/api/ads?location=${location}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            // Pick a random ad from available ones
            setAd(data[Math.floor(Math.random() * data.length)])
          }
        }
      } catch {
        // Silently fail - ad loading should not break the page
      } finally {
        setLoading(false)
      }
    }
    fetchAd()
  }, [location])

  const sizeClass = sizeMap[location] || 'w-full h-[90px]'

  // Loading skeleton
  if (loading) {
    return (
      <div className={`${sizeClass} rounded-lg bg-muted/30 animate-pulse flex items-center justify-center`}>
        <div className="h-4 w-20 bg-muted/50 rounded" />
      </div>
    )
  }

  // If ad is configured, render it
  if (ad) {
    // If ad has custom HTML code
    if (ad.code) {
      return (
        <div className={`${sizeClass} rounded-lg overflow-hidden`}>
          <div dangerouslySetInnerHTML={{ __html: ad.code }} />
        </div>
      )
    }

    // If ad has an image
    if (ad.imageUrl) {
      const content = (
        <img
          src={ad.imageUrl}
          alt={ad.name}
          className={`${sizeClass} object-cover rounded-lg`}
        />
      )

      if (ad.linkUrl) {
        return (
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {content}
          </a>
        )
      }
      return content
    }
  }

  // Placeholder when no ad is configured
  return (
    <div
      className={`${sizeClass} rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 flex items-center justify-center gap-2`}
    >
      <Megaphone className="h-4 w-4 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground/40 font-medium">Ad Space</span>
    </div>
  )
}
