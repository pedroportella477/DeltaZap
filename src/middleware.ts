
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-jid');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = !pathname.startsWith('/login');

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page with a token, redirect to chat
  if (pathname.startsWith('/login') && authToken) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
