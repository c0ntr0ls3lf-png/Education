import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Class, toDoc } from '@/lib/db';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'edulms_salt').digest('hex');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { id: _, createdAt, updatedAt, password, ...updateData } = body;

    const data: Record<string, unknown> = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.email !== undefined) data.email = updateData.email;
    if (updateData.role !== undefined) data.role = updateData.role;
    if (updateData.phone !== undefined) data.phone = updateData.phone;
    if (updateData.classId !== undefined) data.classId = updateData.classId;
    if (updateData.image !== undefined) data.image = updateData.image;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    // If a new password is provided, hash it
    if (password && typeof password === 'string' && password.length > 0) {
      data.password = hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(toDoc(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
