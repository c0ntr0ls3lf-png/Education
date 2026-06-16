import { NextResponse } from 'next/server'
import { connectDB, Class, Subject, Chapter, McqQuestion, CreativeQuestion } from '@/lib/db'

export async function GET() {
  try {
    await connectDB()

    // Fetch all active data in parallel
    const [classes, subjects, chapters, mcqCounts, cqCounts] = await Promise.all([
      Class.find({ isActive: true }).sort({ number: 1 }).lean(),
      Subject.find({ isActive: true }).sort({ order: 1 }).lean(),
      Chapter.find({ isActive: true }).sort({ order: 1 }).lean(),
      McqQuestion.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
      ]),
      CreativeQuestion.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
      ]),
    ])

    // Build count maps
    const mcqCountMap = new Map(mcqCounts.map((x: { _id: string; count: number }) => [x._id, x.count]))
    const cqCountMap = new Map(cqCounts.map((x: { _id: string; count: number }) => [x._id, x.count]))

    // Build chapters by subject map
    const chaptersBySubject = new Map<string, typeof chapters>()
    for (const chapter of chapters) {
      if (!chaptersBySubject.has(chapter.subjectId)) chaptersBySubject.set(chapter.subjectId, [])
      chaptersBySubject.get(chapter.subjectId)!.push({
        ...chapter,
        _count: {
          mcqQuestions: mcqCountMap.get(chapter._id) || 0,
          creativeQuestions: cqCountMap.get(chapter._id) || 0,
        },
      } as typeof chapter & { _count: { mcqQuestions: number; creativeQuestions: number } })
    }

    // Build subjects by class map
    const subjectsByClass = new Map<string, typeof subjects>()
    for (const subject of subjects) {
      if (!subjectsByClass.has(subject.classId)) subjectsByClass.set(subject.classId, [])
      const subjectChapters = chaptersBySubject.get(subject._id) || []
      subjectsByClass.get(subject.classId)!.push({
        ...subject,
        chapters: subjectChapters,
        _count: { chapters: subjectChapters.length },
      } as typeof subject & { chapters: typeof chapters; _count: { chapters: number } })
    }

    // Build final result
    const result = classes.map(cls => {
      const classSubjects = subjectsByClass.get(cls._id) || []
      return {
        ...cls,
        subjects: classSubjects,
        _count: { subjects: classSubjects.length },
      }
    })

    return NextResponse.json({ classes: result })
  } catch (error) {
    console.error('Error fetching academic structure:', error)
    return NextResponse.json({ error: 'Failed to fetch academic structure' }, { status: 500 })
  }
}
