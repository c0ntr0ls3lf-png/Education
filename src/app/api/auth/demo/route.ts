import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Class } from '@/lib/db';
import { signAuthToken } from '@/lib/auth-cookie';

const DEMO_EMAILS: Record<string, string> = {
  admin: 'admin@demo.com',
  student: 'student@demo.com',
};

/**
 * GET /api/auth/demo?role=admin&redirect=/admin
 *
 * Used by middleware for seamless auto-login via redirect.
 * Logs the user in and redirects to the target page.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'student';
    const redirect = searchParams.get('redirect') || '/dashboard';

    if (!['admin', 'student'].includes(role)) {
      return NextResponse.redirect(new URL('/login?demo_fallback=1', request.url));
    }

    // First try to find by demo email, then fall back to any user with the role
    const demoEmail = DEMO_EMAILS[role];
    let user = await User.findOne({ email: demoEmail }).lean();
    if (!user) {
      user = await User.findOne({ role }).lean();
    }

    // If still no user, create a new demo user
    if (!user) {
      const isAdmin = role === 'admin';
      const demoUser = await User.create({
        email: demoEmail,
        name: isAdmin ? 'Demo Admin' : 'Demo Student',
        role,
        password: null,
        provider: 'demo',
        emailVerified: true,
      });
      user = demoUser.toObject();

      // Auto-assign the first available class to new demo students
      if (role === 'student') {
        const firstClass = await Class.findOne({ isActive: true }).sort({ number: 1 }).lean();
        if (firstClass) {
          await User.findByIdAndUpdate(user._id, { classId: firstClass._id.toString() });
          user.classId = firstClass._id.toString();
        }
      }
    }

    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL(redirect, request.url));
    response.cookies.set('eduAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Demo GET login error:', error);
    return NextResponse.redirect(new URL('/login?demo_fallback=1', request.url));
  }
}

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
 * 1. Finds the demo user by email (student@demo.com or admin@demo.com)
 * 2. If not found, falls back to any user with the role
 * 3. If still not found, creates a new demo user
 * 4. For new demo students, auto-assigns the first active class
 * 5. Signs an auth token and sets the cookie
 * 6. Returns the user data
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

    // First try to find by demo email (so admin edits to this user are picked up)
    const demoEmail = DEMO_EMAILS[role];
    let user = await User.findOne({ email: demoEmail }).lean();

    // Fall back to any user with the role
    if (!user) {
      user = await User.findOne({ role }).lean();
    }

    // If no user exists, create a demo user
    if (!user) {
      const isAdmin = role === 'admin';
      const newUser = await User.create({
        email: demoEmail,
        name: isAdmin ? 'Demo Admin' : 'Demo Student',
        role,
        password: null,
        provider: 'demo',
        emailVerified: true,
      });
      user = newUser.toObject();

      // Auto-assign the first active class to new demo students
      if (role === 'student') {
        const firstClass = await Class.findOne({ isActive: true }).sort({ number: 1 }).lean();
        if (firstClass) {
          await User.findByIdAndUpdate(user._id, { classId: firstClass._id.toString() });
          user.classId = firstClass._id.toString();
        }
      }
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
