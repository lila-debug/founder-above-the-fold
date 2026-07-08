import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_APP_URL));
  response.cookies.set('fatf_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
