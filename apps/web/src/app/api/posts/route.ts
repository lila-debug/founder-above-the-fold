import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, generateBodyHash, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// GET /api/posts - list posts
export async function GET(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('posts')
    .select('*')
    .eq('owner_id', owner.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

// POST /api/posts - create post
export async function POST(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { body: postBody, pillar, archetype, notes } = body;

    if (!postBody || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'Post body is required' }, { status: 400 });
    }

    const bodyHash = generateBodyHash(postBody);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        owner_id: owner.id,
        body: postBody,
        body_hash: bodyHash,
        pillar,
        archetype,
        notes,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit(owner.id, 'create', 'post', data.id, { pillar, archetype });

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
