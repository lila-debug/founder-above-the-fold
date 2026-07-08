import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// GET /api/profile-copy - get all profile copy fields
export async function GET(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profile_copy')
    .select('*')
    .eq('owner_id', owner.id)
    .order('field');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profileCopy: data });
}

// POST /api/profile-copy - create or update profile copy
export async function POST(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { field, content } = body;

    if (!field || !['headline', 'about', 'experience', 'featured'].includes(field)) {
      return NextResponse.json({ error: 'Valid field required (headline, about, experience, featured)' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if field already exists
    const { data: existing } = await supabase
      .from('profile_copy')
      .select('*')
      .eq('owner_id', owner.id)
      .eq('field', field)
      .single();

    let result;
    if (existing) {
      // Update with new version
      const { data, error } = await supabase
        .from('profile_copy')
        .update({
          content,
          version: existing.version + 1,
          synced: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('profile_copy')
        .insert({
          owner_id: owner.id,
          field,
          content,
          version: 1,
          synced: false,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    }

    await logAudit(owner.id, existing ? 'update' : 'create', 'profile_copy', result.id, { field });

    return NextResponse.json({ profileCopy: result });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
