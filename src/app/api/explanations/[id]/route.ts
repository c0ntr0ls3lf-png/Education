import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Explanation, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const explanation = await Explanation.findById(id).lean();
    if (!explanation) {
      return NextResponse.json({ error: 'Explanation not found' }, { status: 404 });
    }
    return NextResponse.json(toDoc(explanation));
  } catch (error) {
    console.error('Error fetching explanation:', error);
    return NextResponse.json({ error: 'Failed to fetch explanation' }, { status: 500 });
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
    const updated = await Explanation.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(toDoc(updated));
  } catch (error) {
    console.error('Error updating explanation:', error);
    return NextResponse.json({ error: 'Failed to update explanation' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Explanation.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Explanation deleted successfully' });
  } catch (error) {
    console.error('Error deleting explanation:', error);
    return NextResponse.json({ error: 'Failed to delete explanation' }, { status: 500 });
  }
}
