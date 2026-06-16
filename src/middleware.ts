import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-cookie'

/**
 * Middleware to protect routes that require authentication.
 *
 * Flow:
 * - Protected routes (/dashboard, /profile, /admin, /exam) require a valid eduAuthToken cookie.
 * - Unauthenticated users are redirected to /login with a callbackUrl parameter.
 * - Authenticated users visiting /login are redirected to /dashboard.
 * - Authenticated users visiting /admin must have the 'admin' role.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read and verify the auth token from cookies
  const rawToken = request.cookies.get('eduAuthToken')?.value
  const authUser = rawToken ? await verifyAuthToken(rawToken) : null

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/admin', '/exam']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access a protected route without auth, redirect to login
  if (isProtectedRoute && !authUser) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin') && authUser && authUser.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If already authenticated and trying to access login, redirect to dashboard
  if (pathname === '/login' && authUser) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/exam/:path*',
    '/login',
  ],
}
