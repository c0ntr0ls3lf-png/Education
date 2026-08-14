'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ExamCreator } from '@/components/exam/ExamCreator'
import { useRouter } from 'next/navigation'

interface ExamConfig {
  sourceType: 'chapter' | 'subject' | 'class'
  sourceIds: string[]
  questionCount: number
  examType: 'mcq' | 'creative'
  difficulty: 'mixed'
}

export default function ExamPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [defaultClassId, setDefaultClassId] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.classId) {
          setDefaultClassId(data.user.classId)
        }
      })
      .catch(() => {})
  }, [])

  const handleGenerateExam = async (config: ExamConfig) => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: config.sourceType,
          sourceIds: config.sourceIds,
          questionCount: config.questionCount,
          examType: config.examType,
          difficulty: config.difficulty,
        }),
      })
      const data = await res.json()
      if (data.exam) {
        router.push(`/exam/${data.exam.id}`)
      }
    } catch (error) {
      // generation error handled silently
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border/60 bg-card p-4 sm:p-8 rounded-2xl shadow-xl">
            <CardContent className="p-0">
              <ExamCreator 
                onGenerate={handleGenerateExam} 
                isGenerating={isGenerating} 
                defaultClassId={defaultClassId} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
