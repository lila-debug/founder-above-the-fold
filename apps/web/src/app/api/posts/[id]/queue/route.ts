import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// POST /api/posts/:id/queue - queue a post for publishing
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { scheduled_at } = body;

    if (!scheduled_at) {
      return NextResponse.json({ error: 'scheduled_at is required' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'scheduled_at must be a future date' }, { status: 400 });
    }

    // Get the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .eq('owner_id', owner.id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if post can be queued (must be draft or failed)
    if (post.status !== 'draft' && post.status !== 'failed') {
      return NextResponse.json({ error: 'Post must be in draft or failed status to queue' }, { status: 400 });
    }

    // The query-builder shim doesn't support embedded joins — fetch separately.
    const { data: voiceChecks } = await supabase
      .from('voice_checks')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false });

    const latestVoiceCheck = (voiceChecks || [])[0];

    if (!latestVoiceCheck || latestVoiceCheck.status !== 'passed') {
      return NextResponse.json({ error: 'Voice check must pass before queueing' }, { status: 400 });
    }

    // Check body hash matches latest voice check
    if (latestVoiceCheck.body_hash !== post.body_hash) {
      return NextResponse.json({ error: 'Post has been edited since last voice check. Run voice check again.' }, { status: 400 });
    }

    // Update post status
    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'queued',
        scheduled_at: scheduled_at,
        retry_count: 0,
        failure_reason: null,
      })
      .eq('id', params.id)
      .eq('owner_id', owner.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await logAudit(owner.id, 'queue', 'post', params.id, { scheduled_at });

    return NextResponse.json({ post: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/posts/:id/queue - cancel queued post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get the post
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .single();

  if (!post || post.status !== 'queued') {
    return NextResponse.json({ error: 'Post not found or not queued' }, { status: 404 });
  }

  const { data: updated } = await supabase
    .from('posts')
    .update({ status: 'cancelled', scheduled_at: null })
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .select()
    .single();

  await logAudit(owner.id, 'cancel', 'post', params.id);

  return NextResponse.json({ post: updated });
}
