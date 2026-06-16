import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Class, Subject, Chapter, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ classes: [], subjects: [], chapters: [] });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [classes, subjects, chapters] = await Promise.all([
      Class.find({
        $or: [{ name: regex }, { description: regex }],
        isActive: true,
      }).limit(10).lean(),

      Subject.find({
        $or: [{ name: regex }, { description: regex }],
        isActive: true,
      }).limit(10).lean(),

      Chapter.find({
        $or: [{ name: regex }, { description: regex }],
        isActive: true,
      }).limit(10).lean(),
    ]);

    // Populate class info for subjects
    const classIds = [...new Set(subjects.map(s => s.classId))];
    const classesForSubjects = await Class.find({ _id: { $in: classIds } }).select('_id name slug').lean();
    const classMap = new Map(classesForSubjects.map(c => [c._id, c]));
    const subjectsWithClass = subjects.map(s => ({ ...s, class: classMap.get(s.classId) }));

    // Populate subject info for chapters
    const subjectIds = [...new Set(chapters.map(c => c.subjectId))];
    const subjectsForChapters = await Subject.find({ _id: { $in: subjectIds } }).select('_id name slug classId').lean();
    const subjectMap = new Map(subjectsForChapters.map(s => [s._id, s]));
    const chaptersWithSubject = chapters.map(c => ({ ...c, subject: subjectMap.get(c.subjectId) }));

    return NextResponse.json({
      classes: toDoc(classes),
      subjects: toDoc(subjectsWithClass),
      chapters: toDoc(chaptersWithSubject),
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
