import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-cookie'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read and verify the auth token from cookies
  const rawToken = request.cookies.get('eduAuthToken')?.value
  const authUser = rawToken ? await verifyAuthToken(rawToken) : null

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/admin', '/exam', '/t']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // ── No auth token? Redirect to /login ──
  if (!authUser) {
    if (isProtectedRoute) {
      // Redirect to login page with callbackUrl parameter
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── Authenticated user ──

  // Already authenticated visiting login or register page → redirect
  if (pathname === '/login' || pathname === '/register') {
    const dest = authUser.role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin') && authUser.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Teacher/Instructor routes require teacher or admin role
  if (pathname.startsWith('/t') && authUser.role !== 'teacher' && authUser.role !== 'admin') {
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
    '/t/:path*',
    '/login',
    '/register',
  ],
}
