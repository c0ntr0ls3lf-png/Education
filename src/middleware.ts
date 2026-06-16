import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-cookie'

/**
 * Middleware — seamless auto-login.
 *
 * Instead of redirecting to a login page when no auth token is found,
 * this middleware redirects to the demo login API which auto-authenticates
 * the user (no credentials needed) and sends them back.
 *
 * Flow:
 * - /admin/* → auto-login as admin
 * - /login    → auto-login as student, redirects to /dashboard
 * - /dashboard, /profile, /exam → auto-login as student
 * - Authenticated users visiting /admin with non-admin role → redirected to /dashboard
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read and verify the auth token from cookies
  const rawToken = request.cookies.get('eduAuthToken')?.value
  const authUser = rawToken ? await verifyAuthToken(rawToken) : null

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/admin', '/exam']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // ── No auth token? Auto-login via demo API ──
  if (!authUser) {
    // Visiting /login →
    //   If it's a fallback from a failed auto-login (DB down), show the login page.
    //   Otherwise, auto-login as student and redirect to dashboard.
    if (pathname === '/login') {
      if (request.nextUrl.searchParams.has('demo_fallback')) {
        return NextResponse.next()
      }
      const demoUrl = new URL('/api/auth/demo', request.url)
      demoUrl.searchParams.set('role', 'student')
      demoUrl.searchParams.set('redirect', '/dashboard')
      return NextResponse.redirect(demoUrl)
    }

    // Visiting a protected route → auto-login with matching role
    if (isProtectedRoute) {
      const demoUrl = new URL('/api/auth/demo', request.url)
      const role = pathname.startsWith('/admin') ? 'admin' : 'student'
      demoUrl.searchParams.set('role', role)
      demoUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(demoUrl)
    }

    // Not a protected route, not login — just proceed
    return NextResponse.next()
  }

  // ── Authenticated user ──

  // Admin routes require admin role
  if (pathname.startsWith('/admin') && authUser.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Already authenticated on /login → redirect to dashboard
  if (pathname === '/login') {
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
