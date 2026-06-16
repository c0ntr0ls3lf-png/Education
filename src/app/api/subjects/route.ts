import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Subject, Chapter, Class, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const includeChapters = searchParams.get('include') === 'chapters';

    const where: Record<string, unknown> = {};
    if (classId) where.classId = classId;

    const subjects = await Subject.find(where).sort({ order: 1, name: 1 }).lean();

    // Populate class info for each subject
    const classIds = [...new Set(subjects.map(s => s.classId))];
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const classMap = new Map(classes.map(c => [c._id, c]));
    let result = subjects.map(s => ({ ...s, class: classMap.get(s.classId) || null }));

    if (includeChapters) {
      const chapters = await Chapter.find({
        subjectId: { $in: subjects.map(s => s._id) },
      }).sort({ order: 1 }).lean();
      const chaptersBySubject = new Map<string, any[]>();
      for (const c of chapters) {
        if (!chaptersBySubject.has(c.subjectId)) chaptersBySubject.set(c.subjectId, []);
        chaptersBySubject.get(c.subjectId)!.push(c);
      }
      result = result.map(s => ({ ...s, chapters: chaptersBySubject.get(s._id) || [] }));
      return NextResponse.json(toDoc(result));
    }

    return NextResponse.json(toDoc(result));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, classId, description, icon, color, order, isActive } = body;

    if (!name || !slug || !classId) {
      return NextResponse.json({ error: 'name, slug, and classId are required' }, { status: 400 });
    }

    const newSubject = await Subject.create({
      name, slug, classId, description, icon, color,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newSubject.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
