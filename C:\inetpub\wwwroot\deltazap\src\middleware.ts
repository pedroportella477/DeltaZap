
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-userId');
  const adminAuthToken = request.cookies.get('admin-auth');

  const isAdminRoute = pathname.startsWith('/admin');
  const isAppRoute = !isAdminRoute;
  
  const isAdminLoginPage = pathname === '/admin/login';
  const isAppLoginPage = pathname === '/login';

  // Redirect root to the appropriate home page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Handle Admin Routes
  if (isAdminRoute) {
    if (!adminAuthToken && !isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (adminAuthToken && isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Handle App Routes
  if (isAppRoute) {
    if (!authToken && !isAppLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (authToken && isAppLoginPage) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
