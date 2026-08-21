// middleware.ts
//
// First line of defense for /admin routes: redirects to /admin/login if
// there is no session cookie at all. This is a cheap, edge-safe check only
// (it cannot call the Firebase Admin SDK). The REAL authorization check -
// verifying the session cookie signature and the admin/superadmin custom
// claim - happens server-side in src/app/admin/layout.tsx and in every
// /api/admin/* route via requireAdminSession(). Never rely on this
// middleware alone for security.
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'hydel_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAdminRoute || isLoginPage) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
