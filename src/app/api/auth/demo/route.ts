import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { signAuthToken } from '@/lib/auth-cookie';

/**
 * Demo login — no password required.
 *
 * POST /api/auth/demo  — Body: { role: "admin" | "student" }
 *   Returns JSON with user data and sets the auth cookie.
 *
 * GET  /api/auth/demo?role=admin&redirect=/admin
 *   Signs token, sets cookie, then redirects to the given URL.
 *   Used by middleware for seamless auto-login.
 */

async function demoLogin(role: string) {
  await connectDB();

  if (!['admin', 'student'].includes(role)) {
    throw new Error('Invalid role. Use "admin" or "student".');
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

  // Sign the auth token
  const token = await signAuthToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('eduAuthToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * POST — JSON response (used by the Demo Login button on the login page)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const role: string = body.role || 'student';

    const { user, token } = await demoLogin(role);

    const userResponse = { ...user } as Record<string, unknown>;
    delete userResponse.password;

    const response = NextResponse.json({
      user: userResponse,
      message: `Demo login as ${role}!`,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Demo login failed. Is your database connected?' },
      { status: 500 }
    );
  }
}

/**
 * GET — redirect-based auto-login (used by middleware)
 * Query params: role=admin|student&redirect=/path
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'student';
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const { token } = await demoLogin(role);

    // Redirect back to the intended page with the cookie set
    const redirectUrl = new URL(redirectTo, request.url);
    const response = NextResponse.redirect(redirectUrl);
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Auto demo login error:', error);
    // If auto-login fails (e.g. DB not connected), fall back to the login page
    // Extract the original redirect target from query params
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    // Redirect to login page with a flag so middleware knows not to loop
    const fallbackUrl = new URL('/login', request.url);
    fallbackUrl.searchParams.set('demo_fallback', '1');
    fallbackUrl.searchParams.set('callbackUrl', redirectTo);
    return NextResponse.redirect(fallbackUrl);
  }
}
