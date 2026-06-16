import { NextResponse } from 'next/server'
import { connectDB, ExamAttempt, Exam, toDoc } from '@/lib/db'

export async function GET() {
  try {
    await connectDB()
    const attempts = await ExamAttempt.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean()

    // Fetch exams for these attempts
    const examIds = [...new Set(attempts.map(a => a.examId))];
    const exams = await Exam.find({ _id: { $in: examIds } })
      .select('_id title type difficulty totalQuestions')
      .lean()
    const examMap = new Map(exams.map(e => [e._id, e]))

    const result = attempts.map(a => ({ ...a, exam: examMap.get(a.examId) }))
    return NextResponse.json({ attempts: toDoc(result) })
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}
