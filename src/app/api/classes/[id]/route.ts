import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Class, Subject, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeSubjects = searchParams.get('include') === 'subjects';

    const classItem = await Class.findById(id).lean();
    if (!classItem) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (includeSubjects) {
      const subjects = await Subject.find({ classId: id }).sort({ order: 1 }).lean();
      return NextResponse.json(toDoc({ ...classItem, subjects }));
    }

    return NextResponse.json(toDoc(classItem));
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
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
    const { id: _, createdAt, updatedAt, subjects, ...updateData } = body;

    const data: Record<string, unknown> = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.slug !== undefined) data.slug = updateData.slug;
    if (updateData.number !== undefined) data.number = updateData.number;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.icon !== undefined) data.icon = updateData.icon;
    if (updateData.color !== undefined) data.color = updateData.color;
    if (updateData.order !== undefined) data.order = updateData.order;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if ('categoryId' in updateData) data.categoryId = updateData.categoryId || null;
    if ('subcategoryId' in updateData) data.subcategoryId = updateData.subcategoryId || null;

    const updatedClass = await Class.findByIdAndUpdate(id, data, { new: true }).lean();
    return NextResponse.json(toDoc(updatedClass));
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Class.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
