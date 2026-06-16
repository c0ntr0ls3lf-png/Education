import { NextRequest, NextResponse } from 'next/server';
import { connectDB, AdZone, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const ad = await AdZone.findById(id).lean();
    if (!ad) {
      return NextResponse.json({ error: 'Ad zone not found' }, { status: 404 });
    }
    return NextResponse.json(toDoc(ad));
  } catch (error) {
    console.error('Error fetching ad zone:', error);
    return NextResponse.json({ error: 'Failed to fetch ad zone' }, { status: 500 });
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
    const updated = await AdZone.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(toDoc(updated));
  } catch (error) {
    console.error('Error updating ad zone:', error);
    return NextResponse.json({ error: 'Failed to update ad zone' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await AdZone.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Ad zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad zone:', error);
    return NextResponse.json({ error: 'Failed to delete ad zone' }, { status: 500 });
  }
}
