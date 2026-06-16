import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the auth cookie and returns a success response.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  response.cookies.set('eduAuthToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Immediately expire
    path: '/',
  });

  return response;
}
