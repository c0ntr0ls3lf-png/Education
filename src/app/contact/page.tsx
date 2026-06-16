'use client'

import Link from 'next/link'
import {
  Mail, Phone, MapPin, MessageSquare, Clock, Send,
  HelpCircle, ArrowRight, CheckCircle2, Heart
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
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
            <MessageSquare className="mr-1 h-3 w-3" /> Contact Us
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            We&apos;d Love to Hear<br />From You
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Have a question, feedback, or need help? Our team is here to assist you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {[
              { icon: Mail, label: 'Email Us', value: 'support@edulearn.com', sub: 'We reply within 24 hours' },
              { icon: Phone, label: 'Call Us', value: '+880 1XXX-XXXXXX', sub: 'Sun-Thu, 9AM - 6PM' },
              { icon: MapPin, label: 'Visit Us', value: 'Dhaka, Bangladesh', sub: 'Main Campus' },
              { icon: Clock, label: 'Response Time', value: 'Within 24 Hours', sub: 'Monday - Friday' },
            ].map((item) => (
              <Card key={item.label} className="border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <p className="text-sm text-foreground font-medium mt-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div>
              <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <Send className="mr-1 h-3 w-3" /> Send a Message
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-6">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name</label>
                    <Input placeholder="John Doe" className="focus-visible:ring-emerald-500/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Email</label>
                    <Input type="email" placeholder="john@example.com" className="focus-visible:ring-emerald-500/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help?" className="focus-visible:ring-emerald-500/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={5}
                    className="focus-visible:ring-emerald-500/30"
                  />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 gap-2">
                  Send Message
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* FAQ Preview */}
            <div>
              <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <HelpCircle className="mr-1 h-3 w-3" /> Quick Help
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  { q: 'How do I create an account?', a: 'Click the "Register" button on the top right, fill in your details, and start learning immediately. It\'s completely free!' },
                  { q: 'Is EduLearn really free?', a: 'Yes! All our educational content, practice questions, and exam features are completely free for all students.' },
                  { q: 'How do I take an exam?', a: 'Navigate to the Exams page, choose a subject or chapter, and click "Start Exam". You can track your progress and see results instantly.' },
                  { q: 'Can I access on mobile?', a: 'Absolutely! EduLearn is fully responsive and works great on all devices - desktop, tablet, and mobile.' },
                ].map((faq, i) => (
                  <Card key={i} className="border border-muted shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-sm">{faq.q}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/about">
                  <Button variant="outline" className="gap-2">
                    Learn More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 mb-4">
            <Heart className="mr-1 h-3 w-3" /> We&apos;re Here to Help
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Check out our classes and study materials — they might answer your questions right away!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/class">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg gap-2">
                Browse Classes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/exam">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                Take Practice Exams
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
