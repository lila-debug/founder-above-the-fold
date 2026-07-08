import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('oauth_tokens')
    .delete()
    .eq('owner_id', owner.id)
    .eq('provider', 'linkedin');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit(owner.id, 'disconnect', 'oauth', undefined, { provider: 'linkedin' });

  return NextResponse.json({ success: true });
}
