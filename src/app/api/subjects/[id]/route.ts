import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Subject, Chapter, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeChapters = searchParams.get('include') === 'chapters';

    const subject = await Subject.findById(id).lean();
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (includeChapters) {
      const chapters = await Chapter.find({ subjectId: id }).sort({ order: 1 }).lean();
      return NextResponse.json(toDoc({ ...subject, chapters }));
    }

    return NextResponse.json(toDoc(subject));
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
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
    const { id: _, createdAt, updatedAt, class: classRelation, chapters, ...updateData } = body;

    const data: Record<string, unknown> = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.slug !== undefined) data.slug = updateData.slug;
    if (updateData.classId !== undefined) data.classId = updateData.classId;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.icon !== undefined) data.icon = updateData.icon;
    if (updateData.color !== undefined) data.color = updateData.color;
    if (updateData.order !== undefined) data.order = updateData.order;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const updatedSubject = await Subject.findByIdAndUpdate(id, data, { new: true }).lean();
    return NextResponse.json(toDoc(updatedSubject));
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Subject.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
