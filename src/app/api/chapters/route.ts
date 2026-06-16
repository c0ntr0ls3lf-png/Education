import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Chapter, Subject, Class, Explanation, CreativeQuestion, McqQuestion, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const includeContent = searchParams.get('include') === 'content';

    const where: Record<string, unknown> = {};
    if (subjectId) where.subjectId = subjectId;

    const chapters = await Chapter.find(where).sort({ order: 1, name: 1 }).lean();

    // Populate subject + class for all chapters
    const subjectIds = [...new Set(chapters.map(c => c.subjectId))];
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
    const classIds = [...new Set(subjects.map(s => s.classId))];
    const classes = await Class.find({ _id: { $in: classIds } }).lean();

    const classMap = new Map(classes.map(c => [c._id, c]));
    const subjectMap = new Map(subjects.map(s => ({ ...s, class: classMap.get(s.classId) })));
    const subjectMapFixed = new Map(subjects.map(s => [s._id, { ...s, class: classMap.get(s.classId) }]));

    let result = chapters.map(ch => ({ ...ch, subject: subjectMapFixed.get(ch.subjectId) }));

    if (includeContent) {
      const chapterIds = chapters.map(c => c._id);
      const [explanations, cqs, mcqs] = await Promise.all([
        Explanation.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 }).lean(),
        CreativeQuestion.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 }).lean(),
        McqQuestion.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 }).lean(),
      ]);
      const expMap = new Map<string, typeof explanations>();
      const cqMap = new Map<string, typeof cqs>();
      const mcqMap = new Map<string, typeof mcqs>();
      for (const e of explanations) { if (!expMap.has(e.chapterId)) expMap.set(e.chapterId, []); expMap.get(e.chapterId)!.push(e); }
      for (const q of cqs) { if (!cqMap.has(q.chapterId)) cqMap.set(q.chapterId, []); cqMap.get(q.chapterId)!.push(q); }
      for (const q of mcqs) { if (!mcqMap.has(q.chapterId)) mcqMap.set(q.chapterId, []); mcqMap.get(q.chapterId)!.push(q); }
      result = result.map(ch => ({
        ...ch,
        explanations: expMap.get(ch._id) || [],
        creativeQuestions: cqMap.get(ch._id) || [],
        mcqQuestions: mcqMap.get(ch._id) || [],
      }));
    }

    return NextResponse.json(toDoc(result));
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, subjectId, description, icon, color, order, isActive } = body;

    if (!name || !slug || !subjectId) {
      return NextResponse.json({ error: 'name, slug, and subjectId are required' }, { status: 400 });
    }

    const newChapter = await Chapter.create({
      name, slug, subjectId, description, sidebarContent: body.sidebarContent, icon, color,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newChapter.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
