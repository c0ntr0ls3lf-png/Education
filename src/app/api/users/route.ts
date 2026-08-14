import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, toDoc } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'edulms_salt').digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const classId = searchParams.get('classId');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    if (role && role !== 'all') where.role = role;
    if (classId && classId !== 'all') where.classId = classId;
    if (userId) where._id = userId;

    const users = await User.find(where).select('-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json(toDoc(users));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, phone, role, classId, selectedCategoryId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = password ? hashPassword(password) : null;

    const user = await User.create({
      email,
      name: name || null,
      password: hashedPassword,
      phone: phone || null,
      role: role || 'student',
      classId: classId || null,
      selectedCategoryId: selectedCategoryId || null,
      isProfileComplete: true,
      provider: 'credentials',
      emailVerified: false,
    });

    const userObj = user.toObject();
    delete userObj.password;
    return NextResponse.json(toDoc(userObj), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
