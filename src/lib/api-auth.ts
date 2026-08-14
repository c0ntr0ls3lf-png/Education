import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from './auth-cookie';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Get authenticated user from request cookie or Authorization header.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('eduAuthToken')?.value ||
                request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return verifyAuthToken(token);
}

/**
 * Require user to be authenticated. Returns AuthUser or NextResponse (401).
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }
  return user;
}

/**
 * Require user to have admin role. Returns AuthUser or NextResponse (401/403).
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  return user;
}

/**
 * Require user to have teacher or admin role. Returns AuthUser or NextResponse (401/403).
 */
export async function requireTeacherOrAdmin(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Teacher or Admin access required' }, { status: 403 });
  }
  return user;
}
