import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `LinkedIn error: ${error}` }, { status: 400 });
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  // Validate state
  const storedState = request.cookies.get('linkedin_oauth_state')?.value;
  if (storedState !== state) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'LinkedIn OAuth not configured' }, { status: 500 });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: tokenData.error_description || 'Token exchange failed' }, { status: 400 });
    }

    // Get member info
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();

    // Store tokens (encrypted in production)
    const { data: existingToken } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('owner_id', owner.id)
      .eq('provider', 'linkedin')
      .single();

    if (existingToken) {
      await supabase
        .from('oauth_tokens')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          linkedin_member_id: profileData.sub,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);
    } else {
      await supabase.from('oauth_tokens').insert({
        owner_id: owner.id,
        provider: 'linkedin',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        linkedin_member_id: profileData.sub,
      });
    }

    await logAudit(owner.id, 'connect', 'oauth', undefined, { provider: 'linkedin', member_id: profileData.sub });

    // Clear state cookie and redirect
    const response = NextResponse.redirect(new URL('/dashboard/settings', process.env.NEXT_PUBLIC_APP_URL));
    response.cookies.set('linkedin_oauth_state', '', { maxAge: 0, path: '/' });
    return response;

  } catch (err) {
    console.error('LinkedIn OAuth error:', err);
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
