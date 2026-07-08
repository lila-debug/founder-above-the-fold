import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('owner_id', owner.id)
    .eq('provider', 'linkedin')
    .single();

  if (error || !data) {
    return NextResponse.json({ connected: false });
  }

  // Check if token is expired
  const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;

  return NextResponse.json({
    connected: true,
    expired: isExpired,
    member_id: data.linkedin_member_id,
    connected_at: data.created_at,
  });
}
