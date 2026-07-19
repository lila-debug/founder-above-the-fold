import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/session';

const PUBLIC_ROUTES = ['/', '/auth', '/auth/callback', '/privacy', '/cookies', '/terms', '/how-it-works'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('fatf_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const session = await verifySession(token);

  if (!session) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('fatf_session');
    return response;
  }

  // Add owner email to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-owner-email', session.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
