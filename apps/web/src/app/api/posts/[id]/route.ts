import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, generateBodyHash, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// GET /api/posts/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('posts')
    .select('*, voice_checks(*)')
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

// PATCH /api/posts/:id - update post
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { body: postBody, pillar, archetype, notes, status } = body;

    // Build update object
    const updates: any = {};
    if (postBody !== undefined) {
      updates.body = postBody;
      updates.body_hash = generateBodyHash(postBody);
    }
    if (pillar !== undefined) updates.pillar = pillar;
    if (archetype !== undefined) updates.archetype = archetype;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', params.id)
      .eq('owner_id', owner.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found or update failed' }, { status: 404 });
    }

    await logAudit(owner.id, 'update', 'post', params.id, updates);

    return NextResponse.json({ post: data });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/posts/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', params.id)
    .eq('owner_id', owner.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }

  await logAudit(owner.id, 'delete', 'post', params.id);

  return NextResponse.json({ success: true });
}
