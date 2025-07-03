
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-jid');
  const adminAuthToken = request.cookies.get('admin-auth');

  const isAppLoginPage = pathname === '/login';
  const isAdminLoginPage = pathname === '/admin/login';

  // Handle admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!adminAuthToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  if (isAdminLoginPage && adminAuthToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Handle app routes
  const isAppRoute = !pathname.startsWith('/admin') && pathname !== '/login';

  if (isAppRoute) {
    if (!authToken) {
      // Se não estiver logado e tentar acessar uma página do app, redireciona para login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAppLoginPage && authToken) {
    // Se estiver logado e tentar acessar a página de login, redireciona para o chat
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  // Se o usuário acessar a raiz, redireciona com base no login
  if (pathname === '/') {
    if (authToken) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Roda em todas as rotas, exceto as de sistema da API e arquivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
