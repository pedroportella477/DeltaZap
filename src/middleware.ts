
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes
  if (pathname.startsWith('/admin')) {
    const adminAuthToken = request.cookies.get('admin-auth');
    const isAdminLoginPage = pathname === '/admin/login';

    if (!adminAuthToken && !isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (adminAuthToken && isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // App routes
  const authToken = request.cookies.get('auth-jid');
  const isAppLoginPage = pathname.startsWith('/login');

  if (isAppLoginPage) {
    if (authToken) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.next();
  }

  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
