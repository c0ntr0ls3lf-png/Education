import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Exam, ExamAttempt, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sourceType = searchParams.get('sourceType');
    const isPublic = searchParams.get('isPublic');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (sourceType) where.sourceType = sourceType;
    if (isPublic !== null && isPublic !== undefined) where.isPublic = isPublic === 'true';

    const exams = await Exam.find(where).sort({ order: 1, createdAt: -1 }).lean();

    // Count attempts per exam
    const examIds = exams.map(e => e._id);
    const attemptCounts = await ExamAttempt.aggregate([
      { $match: { examId: { $in: examIds } } },
      { $group: { _id: '$examId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(attemptCounts.map((x: { _id: string; count: number }) => [x._id, x.count]));

    const result = exams.map(e => ({ ...e, _count: { attempts: countMap.get(e._id) || 0 } }));
    return NextResponse.json(toDoc(result));
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, slug, description, type, sourceType, sourceIds, totalQuestions, marksPerQuestion, duration, timerPerQuestion, difficulty, isPublic, createdBy, order, isActive } = body;

    if (!title || !slug || !type || !sourceType || !sourceIds || !totalQuestions || !duration) {
      return NextResponse.json(
        { error: 'title, slug, type, sourceType, sourceIds, totalQuestions, and duration are required' },
        { status: 400 }
      );
    }

    const newExam = await Exam.create({
      title, slug, description, type, sourceType, sourceIds,
      totalQuestions,
      marksPerQuestion: marksPerQuestion ?? 1,
      duration,
      timerPerQuestion,
      difficulty: difficulty ?? 'mixed',
      isPublic: isPublic ?? true,
      createdBy,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newExam.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
