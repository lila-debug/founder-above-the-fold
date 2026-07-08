import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// POST /api/profile-copy/:field/sync - mark profile copy as synced
export async function POST(request: NextRequest, { params }: { params: { field: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const validFields = ['headline', 'about', 'experience', 'featured'];
  if (!validFields.includes(params.field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profile_copy')
    .update({
      synced: true,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', owner.id)
    .eq('field', params.field)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Profile copy field not found' }, { status: 404 });
  }

  await logAudit(owner.id, 'sync', 'profile_copy', data.id, { field: params.field });

  return NextResponse.json({ profileCopy: data });
}
