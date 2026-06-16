'use client'

import Link from 'next/link'
import { useState, useEffect, type ElementType } from 'react'
import {
  GraduationCap,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Send,
  BookOpen,
  ClipboardList,
  Home,
  HelpCircle,
  Phone,
  Shield,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const quickLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/class', label: 'Classes', icon: BookOpen },
  { href: '/exam', label: 'Exams', icon: ClipboardList },
]

const supportLinks = [
  { href: '/about', label: 'About', icon: HelpCircle },
  { href: '/contact', label: 'Contact', icon: Phone },
  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/terms', label: 'Terms of Service', icon: FileText },
]

interface SocialItem {
  key: string
  href: string
  icon: ElementType
  label: string
}

const socialIconMap: Record<string, { icon: React.ElementType; label: string }> = {
  social_facebook: { icon: Facebook, label: 'Facebook' },
  social_twitter: { icon: Twitter, label: 'Twitter' },
  social_youtube: { icon: Youtube, label: 'YouTube' },
  social_email: { icon: Mail, label: 'Email' },
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialItem[]>([])

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const settings = await res.json()
          const links: SocialItem[] = []
          for (const [key, mapping] of Object.entries(socialIconMap)) {
            const url = settings[key] as string | undefined
            if (url && url.trim()) {
              const href = key === 'social_email' ? `mailto:${url.trim()}` : url.trim()
              links.push({ key, href, icon: mapping.icon, label: mapping.label })
            }
          }
          setSocialLinks(links)
        }
      } catch {
        // Fallback: show no social links if fetch fails
      }
    }
    fetchSocialLinks()
  }, [])

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="bg-emerald-600 text-white p-2 rounded-lg group-hover:bg-emerald-500 transition-colors">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Edu<span className="text-emerald-400">LMS</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your comprehensive educational platform for Class 1-12. Interactive lessons, MCQ exams, creative questions, and more.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                      <Icon className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                      <Icon className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Stay updated with new lessons and exams
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="Your email"
                className="h-9 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-gray-800" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EduLMS. Your class to start learning - It&apos;s completely free!
        </p>
      </div>
    </footer>
  )
}
