import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink, createSession, getOrCreateOwner } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email required' }, { status: 400 });
    }

    const valid = await verifyMagicLink(token, email);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired magic link' }, { status: 401 });
    }

    // Get or create owner
    const owner = await getOrCreateOwner(email);

    // Check if this is a new user (no profile copy yet)
    const { data: profileCopy } = await supabase
      .from('profile_copy')
      .select('id')
      .eq('owner_id', owner.id)
      .limit(1);

    const isNewUser = !profileCopy || profileCopy.length === 0;

    // Create session
    const sessionToken = await createSession(email);

    // Set cookie
    const response = NextResponse.json({ success: true, owner, isNewUser });
    response.cookies.set('fatf_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Failed to verify magic link' }, { status: 500 });
  }
}
