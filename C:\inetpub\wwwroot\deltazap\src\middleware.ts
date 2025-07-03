
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-jid');
  const adminAuthToken = request.cookies.get('admin-auth');

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';
  
  const isAppRoute = !isAdminRoute;
  const isAppLoginPage = pathname === '/login';

  // Handle root path redirection
  if (pathname === '/') {
      return NextResponse.redirect(new URL(authToken ? '/chat' : '/login', request.url));
  }

  // Handle Admin Routes
  if (isAdminRoute) {
    if (isAdminLoginPage) {
      // If on admin login page and already logged in, redirect to dashboard
      if (adminAuthToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // Allow access to admin login page
      return NextResponse.next();
    }
    
    // For all other admin routes, require auth
    if (!adminAuthToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Allow access to protected admin routes if authenticated
    return NextResponse.next();
  }

  // Handle App Routes
  if (isAppRoute) {
    if (isAppLoginPage) {
      // If on app login page and already logged in, redirect to chat
      if (authToken) {
        return NextResponse.redirect(new URL('/chat', request.url));
      }
      // Allow access to app login page
      return NextResponse.next();
    }

    // For all other app routes, require auth
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow access to protected app routes if authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Roda em todas as rotas, exceto as de sistema da API e arquivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
