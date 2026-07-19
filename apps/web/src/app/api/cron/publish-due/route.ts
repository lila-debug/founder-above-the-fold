import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decryptToken } from '@/lib/crypto';

// This endpoint is called by Vercel Cron every 15 minutes
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get('x-vercel-cron-secret') || request.headers.get('authorization');
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find due posts (queued and scheduled time has passed)
    const now = new Date().toISOString();

    // The query-builder shim below only supports plain SELECT/WHERE, not
    // Supabase-style embedded joins — fetch posts and each owner's token
    // as separate queries instead of a single embedded select.
    const { data: duePosts, error: findError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (findError) {
      console.error('Error finding due posts:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json({ published: 0, message: 'No due posts' });
    }

    const results = [];

    for (const post of duePosts) {
      try {
        const { data: token } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('owner_id', post.owner_id)
          .single();

        if (!token) {
          await supabase.from('posts').update({
            status: 'failed',
            failure_reason: 'No LinkedIn token on file. Please reconnect.',
            retry_count: post.retry_count + 1,
          }).eq('id', post.id);
          results.push({ id: post.id, status: 'failed', error: 'no token' });
          continue;
        }

        // Check if token is expired and needs refresh
        let accessToken = decryptToken(token.access_token);
        if (token.expires_at && new Date(token.expires_at) < new Date()) {
          // Attempt refresh (simplified — full refresh logic would be more complex)
          console.log('Token expired for post', post.id);
          // Mark as failed and continue
          await supabase.from('posts').update({
            status: 'failed',
            failure_reason: 'LinkedIn token expired. Please reconnect.',
            retry_count: post.retry_count + 1,
          }).eq('id', post.id);
          continue;
        }

        // Publish to LinkedIn
        const linkedinResponse = await publishToLinkedIn(post, accessToken);

        if (linkedinResponse.success) {
          await supabase.from('posts').update({
            status: 'published',
            published_at: new Date().toISOString(),
            linkedin_post_id: linkedinResponse.postId,
            linkedin_urn: linkedinResponse.urn,
          }).eq('id', post.id);

          results.push({ id: post.id, status: 'published', postId: linkedinResponse.postId });
        } else {
          // Retry once, then fail
          if (post.retry_count < 1) {
            await supabase.from('posts').update({
              retry_count: post.retry_count + 1,
              scheduled_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Retry in 15 minutes
            }).eq('id', post.id);
            results.push({ id: post.id, status: 'retrying' });
          } else {
            await supabase.from('posts').update({
              status: 'failed',
              failure_reason: linkedinResponse.error || 'Publishing failed after retry',
              retry_count: post.retry_count + 1,
            }).eq('id', post.id);
            results.push({ id: post.id, status: 'failed', error: linkedinResponse.error });
          }
        }
      } catch (err) {
        console.error('Error publishing post', post.id, err);
        await supabase.from('posts').update({
          status: 'failed',
          failure_reason: 'Unexpected error during publishing',
        }).eq('id', post.id);
        results.push({ id: post.id, status: 'failed' });
      }
    }

    return NextResponse.json({ published: results.filter(r => r.status === 'published').length, results });

  } catch (err) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
  }
}

async function publishToLinkedIn(post: any, accessToken: string): Promise<{ success: boolean; postId?: string; urn?: string; error?: string }> {
  try {
    // Get member URN
    const memberResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const memberData = await memberResponse.json();
    const memberUrn = `urn:li:person:${memberData.sub}`;

    // Create post via LinkedIn Posts API
    const postResponse = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: memberUrn,
        commentary: post.body,
        visibility: 'PUBLIC',
        distribution: {
          linkedInDistributionTarget: {},
        },
      }),
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      return { success: false, error: errorData.message || `LinkedIn API error: ${postResponse.status}` };
    }

    const postData = await postResponse.json();

    return {
      success: true,
      postId: postData.id,
      urn: postData.id,
    };
  } catch (err) {
    return { success: false, error: 'Network error during publishing' };
  }
}
