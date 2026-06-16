import Link from 'next/link'
import type { Metadata } from 'next'
import {
  FileText, Shield, AlertTriangle, CheckCircle, BookOpen,
  UserCheck, Ban, Scale, Mail, ArrowRight, Heart, Gavel
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Terms of Service | EduLearn',
  description: 'EduLearn Terms of Service. Please read these terms carefully before using our platform.',
}

const sections = [
  {
    icon: BookOpen,
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using EduLearn, you agree to be bound by these Terms of Service.',
      'If you do not agree with any part of these terms, you may not use our platform.',
      'We reserve the right to update these terms at any time. Continued use constitutes acceptance of changes.',
      'These terms apply to all visitors, users, and others who access our platform.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Account Registration & Responsibilities',
    content: [
      'You must be at least 13 years old to create an account. If you are under 13, a parent or guardian must supervise your use.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You must provide accurate, current, and complete information during registration.',
      'You are responsible for all activities that occur under your account.',
      'Notify us immediately of any unauthorized use of your account.',
    ],
  },
  {
    icon: Scale,
    title: 'User Conduct & Acceptable Use',
    content: [
      'Use the platform solely for educational purposes and personal development.',
      'Do not attempt to access, modify, or interfere with platform systems or security.',
      'Do not share, distribute, or reproduce platform content for commercial purposes without authorization.',
      'Do not engage in any activity that disrupts or interferes with other users\' learning experience.',
      'Do not use automated tools, bots, or scripts to access or manipulate platform features.',
    ],
  },
  {
    icon: Shield,
    title: 'Intellectual Property',
    content: [
      'All content on EduLearn, including questions, explanations, graphics, and software, is our property or licensed to us.',
      'You may access and use the content for personal, non-commercial educational purposes only.',
      'You may not reproduce, distribute, modify, or create derivative works from our content without explicit permission.',
      'EduLearn name, logo, and branding are our trademarks and may not be used without authorization.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Limitation of Liability',
    content: [
      'EduLearn is provided "as is" without warranties of any kind, either express or implied.',
      'We do not guarantee that the platform will be uninterrupted, timely, secure, or error-free.',
      'We are not responsible for any loss or damage resulting from your use of the platform.',
      'We are not liable for the accuracy, completeness, or usefulness of any content provided on the platform.',
      'In no event shall EduLearn be liable for any indirect, incidental, or consequential damages.',
    ],
  },
  {
    icon: Ban,
    title: 'Termination & Suspension',
    content: [
      'We reserve the right to suspend or terminate your account at any time for violation of these terms.',
      'You may delete your account at any time through your account settings.',
      'Upon termination, your right to use the platform ceases immediately.',
      'Sections regarding intellectual property, limitation of liability, and governing law shall survive termination.',
    ],
  },
  {
    icon: Gavel,
    title: 'Governing Law',
    content: [
      'These terms shall be governed by and construed in accordance with the laws of Bangladesh.',
      'Any disputes arising from these terms shall be resolved in the courts of Dhaka, Bangladesh.',
      'If any provision of these terms is found to be unenforceable, the remaining provisions remain in full effect.',
      'These terms constitute the entire agreement between you and EduLearn regarding platform use.',
    ],
  },
]

export default function TermsPage() {
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
            <FileText className="mr-1 h-3 w-3" /> Terms of Service
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Our Commitment<br />to You
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Please read these terms carefully before using the EduLearn platform.
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
            These Terms of Service govern your use of the EduLearn educational platform.
          </p>
        </div>
      </section>

      {/* Terms Sections */}
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
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
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
            Have Questions About Our Terms?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            If you have any questions about these Terms of Service, please reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-emerald-600 hover:bg-emerald-500 gap-2">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="gap-2">
                View Privacy Policy
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
            Ready to Start Learning?
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Join thousands of students learning with EduLearn. It&apos;s completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/class">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                Browse Classes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
