import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ExamAttempt, Exam, User, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const examId = searchParams.get('examId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (examId) where.examId = examId;
    if (status) where.status = status;

    const attempts = await ExamAttempt.find(where).sort({ createdAt: -1 }).lean();

    // Populate exam and user info
    const examIds = [...new Set(attempts.map(a => a.examId))];
    const userIds = [...new Set(attempts.map(a => a.userId))];
    const [exams, users] = await Promise.all([
      Exam.find({ _id: { $in: examIds } }).select('_id title type duration totalQuestions').lean(),
      User.find({ _id: { $in: userIds } }).select('_id name email').lean(),
    ]);
    const examMap = new Map(exams.map(e => [e._id, e]));
    const userMap = new Map(users.map(u => [u._id, u]));

    const result = attempts.map(a => ({
      ...a,
      exam: examMap.get(a.examId),
      user: userMap.get(a.userId),
    }));

    return NextResponse.json(toDoc(result));
  } catch (error) {
    console.error('Error fetching exam attempts:', error);
    return NextResponse.json({ error: 'Failed to fetch exam attempts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { examId, userId, answers, score, totalMarks, correctCount, wrongCount, percentage, timeTaken, rank, status, completedAt } = body;

    if (!examId || !userId || !answers) {
      return NextResponse.json({ error: 'examId, userId, and answers are required' }, { status: 400 });
    }

    const newAttempt = await ExamAttempt.create({
      examId, userId, answers,
      score: score ?? 0,
      totalMarks: totalMarks ?? 0,
      correctCount: correctCount ?? 0,
      wrongCount: wrongCount ?? 0,
      percentage: percentage ?? 0,
      timeTaken: timeTaken ?? 0,
      rank,
      status: status ?? 'in_progress',
      completedAt,
    });

    return NextResponse.json(toDoc(newAttempt.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating exam attempt:', error);
    return NextResponse.json({ error: 'Failed to create exam attempt' }, { status: 500 });
  }
}
