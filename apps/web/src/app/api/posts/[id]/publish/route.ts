import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = params.id;

  try {
    // Get the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('owner_id', owner.id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post already published' }, { status: 400 });
    }

    // Get LinkedIn token
    const { data: linkedinToken, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('owner_id', owner.id)
      .eq('provider', 'linkedin')
      .single();

    if (tokenError || !linkedinToken) {
      return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 401 });
    }

    // Check if token is expired
    if (linkedinToken.expires_at && new Date(linkedinToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'LinkedIn token expired, please reconnect' }, { status: 401 });
    }

    // Get member ID from LinkedIn userinfo
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${linkedinToken.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to get LinkedIn profile' }, { status: 401 });
    }

    const userInfo = await userInfoResponse.json();
    const userId = userInfo.sub;
    const authorUrn = `urn:li:person:${userId}`;

    // Create post on LinkedIn
    const createPostResponse = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedinToken.access_token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202412',
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: post.body,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
      }),
    });

    if (!createPostResponse.ok) {
      const errorData = await createPostResponse.json();
      const failureReason = errorData.message || `LinkedIn API error: ${createPostResponse.status}`;

      // Update post with failure
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          failure_reason: failureReason,
          retry_count: post.retry_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      await logAudit(owner.id, 'publish_failed', 'post', postId, { error: failureReason });

      return NextResponse.json(
        { error: 'Failed to publish to LinkedIn', details: failureReason },
        { status: 400 }
      );
    }

    const postData = await createPostResponse.json();
    const linkedinPostId = postData.id || `unknown-${Date.now()}`;

    // Update post status
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        linkedin_post_id: linkedinPostId,
        linkedin_urn: `urn:li:share:${linkedinPostId}`,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
    }

    await logAudit(owner.id, 'publish', 'post', postId, { linkedin_post_id: linkedinPostId });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        status: 'published',
        linkedin_post_id: linkedinPostId,
        published_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Publish error:', err);
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 });
  }
}
