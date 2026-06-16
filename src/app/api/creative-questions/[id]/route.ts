import { NextRequest, NextResponse } from 'next/server';
import { connectDB, CreativeQuestion, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const question = await CreativeQuestion.findById(id).lean();
    if (!question) {
      return NextResponse.json({ error: 'Creative question not found' }, { status: 404 });
    }
    return NextResponse.json(toDoc(question));
  } catch (error) {
    console.error('Error fetching creative question:', error);
    return NextResponse.json({ error: 'Failed to fetch creative question' }, { status: 500 });
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

    const updated = await CreativeQuestion.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(toDoc(updated));
  } catch (error) {
    console.error('Error updating creative question:', error);
    return NextResponse.json({ error: 'Failed to update creative question' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await CreativeQuestion.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Creative question deleted successfully' });
  } catch (error) {
    console.error('Error deleting creative question:', error);
    return NextResponse.json({ error: 'Failed to delete creative question' }, { status: 500 });
  }
}
