import { NextResponse } from 'next/server'
import { connectDB, ExamAttempt, Exam, toDoc } from '@/lib/db'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { examId, answers, score, totalMarks, correctCount, wrongCount, percentage, timeTaken } = body

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
    }

    const attempt = await ExamAttempt.create({
      examId,
      userId: 'demo-user',
      answers: JSON.stringify(answers || {}),
      score: score || 0,
      totalMarks: totalMarks || 0,
      correctCount: correctCount || 0,
      wrongCount: wrongCount || 0,
      percentage: percentage || 0,
      timeTaken: timeTaken || 0,
      status: 'completed',
      completedAt: new Date(),
    })

    // Calculate rank
    const allAttempts = await ExamAttempt.find({ examId, status: 'completed' }).sort({ percentage: -1 }).lean()
    const rank = allAttempts.findIndex(a => a._id === attempt._id) + 1

    await ExamAttempt.findByIdAndUpdate(attempt._id, { rank })

    const attemptObj = attempt.toObject()
    return NextResponse.json({ attempt: toDoc({ ...attemptObj, rank }) })
  } catch (error) {
    console.error('Error submitting exam attempt:', error)
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get('id')

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 })
    }

    const attempt = await ExamAttempt.findById(attemptId).lean()
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const exam = await Exam.findById(attempt.examId).lean()
    return NextResponse.json({ attempt: toDoc({ ...attempt, exam }) })
  } catch (error) {
    console.error('Error fetching attempt:', error)
    return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 })
  }
}
