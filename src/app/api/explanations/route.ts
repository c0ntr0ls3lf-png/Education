import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Explanation, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');

    const where: Record<string, unknown> = {};
    if (chapterId) where.chapterId = chapterId;
    if (difficulty) where.difficulty = difficulty;

    const explanations = await Explanation.find(where).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(toDoc(explanations));
  } catch (error) {
    console.error('Error fetching explanations:', error);
    return NextResponse.json({ error: 'Failed to fetch explanations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { chapterId, question, solution, videoUrl, order, difficulty, tags, isActive } = body;

    if (!chapterId || !question) {
      return NextResponse.json({ error: 'chapterId and question are required' }, { status: 400 });
    }

    const newExplanation = await Explanation.create({
      chapterId, question, solution, videoUrl,
      order: order ?? 0,
      difficulty: difficulty ?? 'medium',
      tags,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newExplanation.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating explanation:', error);
    return NextResponse.json({ error: 'Failed to create explanation' }, { status: 500 });
  }
}
