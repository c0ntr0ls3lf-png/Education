import { NextRequest, NextResponse } from 'next/server';
import { connectDB, McqQuestion, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const mcq = await McqQuestion.findById(id).lean();
    if (!mcq) {
      return NextResponse.json({ error: 'MCQ question not found' }, { status: 404 });
    }
    return NextResponse.json(toDoc(mcq));
  } catch (error) {
    console.error('Error fetching MCQ question:', error);
    return NextResponse.json({ error: 'Failed to fetch MCQ question' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Normalize board_name
    if (!body.board_name) {
      body.board_name = body.boardName || body.board || null;
    }

    // Normalize and default exam_year
    let finalExamYear: number | null = null;
    const rawYear = (body.exam_year !== undefined && body.exam_year !== null && body.exam_year !== '') ? body.exam_year : ((body.questionYear !== undefined && body.questionYear !== null && body.questionYear !== '') ? body.questionYear : null);
    if (rawYear !== null) {
      const parsed = parseInt(String(rawYear), 10);
      if (!isNaN(parsed)) {
        finalExamYear = parsed;
      }
    }
    
    if (!finalExamYear) {
      body.exam_year = new Date().getFullYear();
    } else {
      body.exam_year = finalExamYear;
    }

    const updated = await McqQuestion.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(toDoc(updated));
  } catch (error) {
    console.error('Error updating MCQ question:', error);
    return NextResponse.json({ error: 'Failed to update MCQ question' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await McqQuestion.findByIdAndDelete(id);
    return NextResponse.json({ message: 'MCQ question deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCQ question:', error);
    return NextResponse.json({ error: 'Failed to delete MCQ question' }, { status: 500 });
  }
}
