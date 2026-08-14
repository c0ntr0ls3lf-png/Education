import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-cookie';
import { connectDB, User, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('eduAuthToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No auth token found' },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(payload.id).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const userResponse = toDoc(user);
    delete (userResponse as Record<string, unknown>).password;

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 401 }
    );
  }
}
