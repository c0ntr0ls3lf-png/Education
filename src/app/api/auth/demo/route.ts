import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { signAuthToken } from '@/lib/auth-cookie';

/**
 * POST /api/auth/demo
 *
 * Demo login — no password required.
 * Allows instant access to the admin panel or student dashboard
 * for testing/development purposes.
 *
 * Body: { role: "admin" | "student" }
 *
 * Flow:
 * 1. Finds the first user with the requested role
 * 2. If none exists, creates a demo user with that role
 * 3. Signs an auth token and sets the cookie
 * 4. Returns the user data
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const role: string = body.role || 'student';

    if (!['admin', 'student'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Use "admin" or "student".' },
        { status: 400 }
      );
    }

    // Try to find an existing user with the requested role
    let user = await User.findOne({ role }).lean();

    // If no user exists, create a demo user
    if (!user) {
      const isAdmin = role === 'admin';
      const demoUser = await User.create({
        email: isAdmin ? 'admin@demo.com' : 'student@demo.com',
        name: isAdmin ? 'Demo Admin' : 'Demo Student',
        role,
        password: null,
        provider: 'demo',
        emailVerified: true,
      });
      user = demoUser.toObject();
    }

    // Build response without password
    const userResponse = { ...user } as Record<string, unknown>;
    delete userResponse.password;

    const response = NextResponse.json({
      user: userResponse,
      message: `Demo login as ${role}!`,
    });

    // Sign and set the auth cookie (same as normal login)
    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    response.cookies.set('eduAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Demo login failed. Is your database connected?' },
      { status: 500 }
    );
  }
}
