import Link from 'next/link'
import type { Metadata } from 'next'
import {
  GraduationCap, BookOpen, Users, Award, Target, Globe,
  Shield, Zap, Heart, ArrowRight, CheckCircle2, Mail, Phone, MapPin
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'About Us | EduLearn',
  description: 'Learn about EduLearn - the comprehensive educational platform for Class 1-12 students.',
}

export default function AboutPage() {
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
            <Heart className="mr-1 h-3 w-3" /> About Us
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Empowering Students<br />to Learn Smarter
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto">
            EduLearn is a comprehensive educational platform designed to help students from Class 1 to 12 excel academically through interactive lessons, practice exams, and detailed solutions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <Target className="mr-1 h-3 w-3" /> Our Mission
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Making Quality Education Accessible to All
              </h2>
              <p className="text-muted-foreground mb-4">
                We believe every student deserves access to high-quality educational resources, regardless of their background or location. Our platform provides comprehensive study materials, interactive exams, and detailed solutions for all subjects from Class 1 to 12.
              </p>
              <p className="text-muted-foreground mb-6">
                With thousands of questions, detailed explanations, and a powerful exam engine, EduLearn helps students practice effectively and track their progress over time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: 'Comprehensive Content' },
                  { icon: Target, label: 'Exam Preparation' },
                  { icon: Users, label: 'Student Community' },
                  { icon: Award, label: 'Achievement System' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '12', label: 'Classes', color: 'from-emerald-400 to-emerald-600' },
                { number: '55+', label: 'Subjects', color: 'from-teal-400 to-teal-600' },
                { number: '95+', label: 'Questions', color: 'from-cyan-400 to-cyan-600' },
                { number: '100%', label: 'Free', color: 'from-green-400 to-green-600' },
              ].map((stat) => (
                <Card key={stat.label} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <span className="text-white font-bold text-lg">{stat.number}</span>
                    </div>
                    <p className="font-semibold text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <Zap className="mr-1 h-3 w-3" /> Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Why Choose EduLearn?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Comprehensive Content', desc: 'Detailed explanations, MCQ questions, and creative questions for every chapter across all subjects.' },
              { icon: Target, title: 'Smart Exam Engine', desc: 'Create custom exams by chapter, subject, or class. Timed MCQ exams with instant results and analytics.' },
              { icon: Zap, title: 'KaTeX Math Support', desc: 'Full support for mathematical equations and formulas. Every physics and math equation renders perfectly.' },
              { icon: Shield, title: 'Safe & Secure', desc: 'Your data is protected with industry-standard security. We never share your information with third parties.' },
              { icon: Globe, title: 'Access Anywhere', desc: 'Study on any device - desktop, tablet, or phone. Our responsive design works everywhere.' },
              { icon: Award, title: 'Track Progress', desc: 'Monitor your performance with detailed analytics, achievements, and leaderboard rankings.' },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <Users className="mr-1 h-3 w-3" /> Our Team
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Built by Educators, for Students</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Dr. Sarah Ahmed', role: 'Head of Content', initials: 'SA' },
              { name: 'Rakib Hasan', role: 'Lead Developer', initials: 'RH' },
              { name: 'Fatima Khan', role: 'UX Designer', initials: 'FK' },
            ].map((member) => (
              <Card key={member.name} className="border-0 shadow-md text-center">
                <CardContent className="p-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-white font-bold text-lg">{member.initials}</span>
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <Mail className="mr-1 h-3 w-3" /> Contact
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Get in Touch</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Mail, label: 'Email', value: 'support@edulearn.com' },
              { icon: Phone, label: 'Phone', value: '+880 1XXX-XXXXXX' },
              { icon: MapPin, label: 'Address', value: 'Dhaka, Bangladesh' },
            ].map((contact) => (
              <Card key={contact.label} className="border-0 shadow-md text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                    <contact.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-sm">{contact.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{contact.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8">
            Join thousands of students who are already excelling with EduLearn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/class">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg gap-2">
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
