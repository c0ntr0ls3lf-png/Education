import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Shield, Lock, Eye, Database, FileText, Mail,
  ArrowRight, CheckCircle2, Heart, AlertTriangle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Privacy Policy | EduLearn',
  description: 'EduLearn Privacy Policy. Learn how we collect, use, and protect your personal information.',
}

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: [
      'Account Information: When you register, we collect your name, email address, and academic information (class/grade).',
      'Usage Data: We collect information about how you interact with our platform, including pages visited, exams taken, and progress tracked.',
      'Device Information: We may collect information about the device you use to access our platform, including browser type and operating system.',
      'Cookies: We use cookies and similar tracking technologies to enhance your experience and analyze platform usage.',
    ],
  },
  {
    icon: Database,
    title: 'How We Use Your Information',
    content: [
      'To provide and maintain our educational services and improve your learning experience.',
      'To track your academic progress, exam results, and provide personalized recommendations.',
      'To communicate with you about platform updates, new features, and educational content.',
      'To analyze usage patterns and improve platform performance and user experience.',
      'To ensure platform security and prevent fraudulent or unauthorized access.',
    ],
  },
  {
    icon: Lock,
    title: 'Data Protection & Security',
    content: [
      'We implement industry-standard security measures including encryption, secure servers, and regular security audits.',
      'Your password is stored using strong hashing algorithms and is never accessible in plain text.',
      'We regularly review and update our security practices to ensure your data remains protected.',
      'Access to personal data is restricted to authorized personnel only on a need-to-know basis.',
    ],
  },
  {
    icon: Shield,
    title: 'Data Sharing & Third Parties',
    content: [
      'We do not sell, trade, or rent your personal information to third parties.',
      'We may share anonymized, aggregate data for analytical and research purposes.',
          'We may disclose information if required by law or to protect our legal rights.',
      'We use third-party services (e.g., hosting, analytics) that may process data on our behalf, all of which are bound by strict data protection agreements.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Your Rights & Choices',
    content: [
      'You have the right to access, update, or delete your personal information at any time through your account settings.',
      'You can opt out of marketing communications by adjusting your preferences or contacting us.',
      'You can request a copy of the data we hold about you by contacting our support team.',
      'You can close your account at any time, and we will delete your data in accordance with our data retention policy.',
    ],
  },
  {
    icon: FileText,
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
      'We will notify you of material changes via email or through a notice on our platform.',
      'We encourage you to review this policy periodically to stay informed about how we protect your information.',
      'Continued use of our platform after changes constitutes acceptance of the updated policy.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-teal-200 blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 mb-4">
            <Shield className="mr-1 h-3 w-3" /> Privacy Policy
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Your Privacy<br />Matters to Us
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto">
            We are committed to protecting your personal data and being transparent about how we use it.
          </p>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Last Updated:</span> January 1, 2026
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This Privacy Policy describes how EduLearn collects, uses, and protects your personal information.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {sections.map((section, idx) => (
            <div key={section.title}>
              {idx > 0 && <Separator className="mb-10" />}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <section.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{section.title}</h2>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            <Mail className="mr-1 h-3 w-3" /> Questions?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            If you have any questions or concerns about this Privacy Policy or how we handle your data, please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-emerald-600 hover:bg-emerald-500 gap-2">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" className="gap-2">
                View Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-8 w-8 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Safe & Secure Learning
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Start your learning journey with confidence. Your data is protected with us.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
