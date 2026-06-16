import { NextResponse } from 'next/server'
import { connectDB, Exam, Chapter, Subject, Class, McqQuestion, CreativeQuestion, toDoc } from '@/lib/db'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { sourceType, questionCount, examType, difficulty, sourceIds } = body

    let title = ''
    if (sourceType === 'chapter') {
      if (sourceIds?.length > 0) {
        const chapters = await Chapter.find({ _id: { $in: sourceIds } }).lean()
        const subjectIds = [...new Set(chapters.map(c => c.subjectId))]
        const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean()
        if (chapters.length > 0 && subjects.length > 0) {
          title = `${chapters.map(c => c.name).join(', ')} - ${subjects[0].name}`
        }
      }
    } else if (sourceType === 'subject') {
      if (sourceIds?.length > 0) {
        const subjects = await Subject.find({ _id: { $in: sourceIds } }).lean()
        const classIds = [...new Set(subjects.map(s => s.classId))]
        const classes = await Class.find({ _id: { $in: classIds } }).lean()
        if (subjects.length > 0 && classes.length > 0) {
          title = `${subjects.map(s => s.name).join(', ')} - Class ${classes[0].number}`
        }
      }
    } else if (sourceType === 'class') {
      if (sourceIds?.length > 0) {
        const classes = await Class.find({ _id: { $in: sourceIds } }).lean()
        if (classes.length > 0) {
          title = `Class ${classes.map(c => c.number).join(', ')} Exam`
        }
      }
    }

    if (!title) {
      title = `${examType === 'mcq' ? 'MCQ' : 'Creative'} Exam - ${difficulty} - ${questionCount}Q`
    }

    const duration = examType === 'mcq'
      ? Math.ceil(questionCount * 0.8) * 60
      : Math.ceil(questionCount * 5) * 60

    let availableCount = 0
    const where: Record<string, unknown> = { isActive: true }

    if (sourceIds?.length > 0) {
      if (sourceType === 'chapter') {
        where.chapterId = { $in: sourceIds }
      } else if (sourceType === 'subject') {
        const chapters = await Chapter.find({ subjectId: { $in: sourceIds } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      } else if (sourceType === 'class') {
        const subjects = await Subject.find({ classId: { $in: sourceIds } }).select('_id').lean()
        const chapters = await Chapter.find({ subjectId: { $in: subjects.map(s => s._id) } }).select('_id').lean()
        where.chapterId = { $in: chapters.map(c => c._id) }
      }
    }

    if (difficulty !== 'mixed') {
      where.difficulty = difficulty
    }

    if (examType === 'mcq') {
      availableCount = await McqQuestion.countDocuments(where)
    } else {
      availableCount = await CreativeQuestion.countDocuments(where)
    }

    const actualQuestionCount = Math.min(questionCount, availableCount)

    if (actualQuestionCount === 0) {
      return NextResponse.json({
        error: 'No questions available for the selected criteria. Please try different options.',
      }, { status: 400 })
    }

    const slug = `${examType}-${sourceType}-${difficulty}-${Date.now()}`

    const exam = await Exam.create({
      title, slug,
      description: `Custom ${examType === 'mcq' ? 'MCQ' : 'Creative'} exam with ${actualQuestionCount} questions`,
      type: examType,
      sourceType,
      sourceIds: JSON.stringify(sourceIds || []),
      totalQuestions: actualQuestionCount,
      marksPerQuestion: examType === 'mcq' ? 1 : 10,
      duration,
      timerPerQuestion: examType === 'mcq' ? 50 : null,
      difficulty,
      isPublic: true,
    })

    return NextResponse.json({ exam: toDoc(exam.toObject()), availableCount: actualQuestionCount })
  } catch (error) {
    console.error('Error generating exam:', error)
    return NextResponse.json({ error: 'Failed to generate exam' }, { status: 500 })
  }
}
