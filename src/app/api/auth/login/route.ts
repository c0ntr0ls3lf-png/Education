import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, toDoc } from '@/lib/db';
import { createHash } from 'crypto';
import { signAuthToken } from '@/lib/auth-cookie';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'edulms_salt').digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const hashedInput = hashPassword(password);

    if (user.password) {
      if (user.password !== hashedInput) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with Google or Facebook, or set a password first.' },
        { status: 401 }
      );
    }

    // Build response without password
    const userResponse = toDoc(user);
    delete (userResponse as Record<string, unknown>).password;

    const response = NextResponse.json({
      user: userResponse,
      message: `Welcome back, ${user.name || user.email}!`,
    });

    const token = await signAuthToken({ id: user._id, email: user.email, role: user.role });
    response.cookies.set('eduAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
