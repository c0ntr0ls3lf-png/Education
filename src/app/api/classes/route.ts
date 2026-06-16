import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Class, Subject, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeSubjects = searchParams.get('include') === 'subjects';

    const classes = await Class.find().sort({ number: 1 }).lean();

    if (includeSubjects) {
      const subjects = await Subject.find().sort({ order: 1 }).lean();
      const subjectsByClass = new Map<string, typeof subjects>();
      for (const s of subjects) {
        if (!subjectsByClass.has(s.classId)) subjectsByClass.set(s.classId, []);
        subjectsByClass.get(s.classId)!.push(s);
      }
      const result = classes.map(cls => ({ ...cls, subjects: subjectsByClass.get(cls._id) || [] }));
      return NextResponse.json(toDoc(result));
    }

    return NextResponse.json(toDoc(classes));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, number, description, icon, color, order, isActive } = body;

    if (!name || !slug || number === undefined) {
      return NextResponse.json({ error: 'name, slug, and number are required' }, { status: 400 });
    }

    const newClass = await Class.create({
      name, slug, number, description, icon, color,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newClass.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
