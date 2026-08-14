import { NextResponse } from 'next/server'
import { connectDB, Exam, ExamAttempt, Chapter, Subject, McqQuestion, CreativeQuestion, toDoc } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const exam = await Exam.findById(id).lean()
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Fetch recent attempts
    const attempts = await ExamAttempt.find({ examId: id }).sort({ createdAt: -1 }).limit(10).lean()

    let mcqQuestions: any[] = []
    let creativeQuestions: any[] = []

    const sourceIds: string[] = JSON.parse(exam.sourceIds || '[]')

    if (exam.type === 'mcq') {
      const where: Record<string, unknown> = { isActive: true }
      if (exam.sourceType === 'chapter' && sourceIds.length > 0) {
        where.chapterId = { $in: sourceIds }
      } else if (exam.sourceType === 'subject') {
        const chapters = await Chapter.find({ subjectId: { $in: sourceIds } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      } else if (exam.sourceType === 'class') {
        const subjects = await Subject.find({ classId: { $in: sourceIds } }).select('_id').lean()
        const chapters = await Chapter.find({ subjectId: { $in: subjects.map(s => s._id) } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      }

      if (exam.difficulty !== 'mixed') {
        where.difficulty = exam.difficulty
      }

      const allMcqs = await McqQuestion.find(where).sort({ order: 1 }).lean()
      mcqQuestions = allMcqs.sort(() => Math.random() - 0.5).slice(0, exam.totalQuestions)
    } else {
      const where: Record<string, unknown> = { isActive: true }
      if (exam.sourceType === 'chapter' && sourceIds.length > 0) {
        where.chapterId = { $in: sourceIds }
      } else if (exam.sourceType === 'subject') {
        const chapters = await Chapter.find({ subjectId: { $in: sourceIds } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      } else if (exam.sourceType === 'class') {
        const subjects = await Subject.find({ classId: { $in: sourceIds } }).select('_id').lean()
        const chapters = await Chapter.find({ subjectId: { $in: subjects.map(s => s._id) } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      }

      if (exam.difficulty !== 'mixed') {
        where.difficulty = exam.difficulty
      }

      const allCqs = await CreativeQuestion.find(where).sort({ order: 1 }).lean()
      creativeQuestions = allCqs.sort(() => Math.random() - 0.5).slice(0, exam.totalQuestions)
    }

    return NextResponse.json({
      exam: toDoc({ ...exam, attempts }),
      mcqQuestions: toDoc(mcqQuestions),
      creativeQuestions: toDoc(creativeQuestions),
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedExam = await Exam.findByIdAndUpdate(id, body, { new: true }).lean()
    return NextResponse.json(toDoc(updatedExam))
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    await Exam.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}
