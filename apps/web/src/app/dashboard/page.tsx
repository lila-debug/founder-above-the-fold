import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function TodayPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('fatf_session')?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) return null;

  // Fetch owner data
  const { data: owner } = await supabase
    .from('owner_settings')
    .select('*')
    .eq('email', session.email)
    .single();

  if (!owner) return null;

  // Fetch dashboard data
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('owner_id', owner.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: profileCopy } = await supabase
    .from('profile_copy')
    .select('*')
    .eq('owner_id', owner.id)
    .order('field');

  const { data: linkedinStatus } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('owner_id', owner.id)
    .eq('provider', 'linkedin')
    .single();

  const draftCount = posts?.filter(p => p.status === 'draft').length || 0;
  const queuedCount = posts?.filter(p => p.status === 'queued').length || 0;
  const publishedCount = posts?.filter(p => p.status === 'published').length || 0;
  const unsyncedProfile = profileCopy?.filter(p => !p.synced).length || 0;
  const linkedinConnected = !!linkedinStatus;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Today</h1>
        <p className="text-ocean-500">Your LinkedIn command centre at a glance.</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          label="LinkedIn"
          value={linkedinConnected ? 'Connected' : 'Not Connected'}
          status={linkedinConnected ? 'success' : 'warning'}
          href="/dashboard/settings"
        />
        <StatusCard
          label="Drafts"
          value={draftCount.toString()}
          status="neutral"
          href="/dashboard/drafts"
        />
        <StatusCard
          label="Queued"
          value={queuedCount.toString()}
          status={queuedCount > 0 ? 'success' : 'neutral'}
          href="/dashboard/queue"
        />
        <StatusCard
          label="Published"
          value={publishedCount.toString()}
          status="success"
          href="/dashboard/drafts"
        />
      </div>

      {/* Manual Tasks */}
      {unsyncedProfile > 0 && (
        <div className="p-6 bg-sky-50 border border-sky-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-mono text-lg">!</span>
            </div>
            <div>
              <h3 className="font-tarsius text-lg text-imperial-500 mb-1">
                {unsyncedProfile} profile {unsyncedProfile === 1 ? 'field' : 'fields'} need manual paste
              </h3>
              <p className="text-ocean-500 text-sm mb-4">
                Copy your generated profile copy and paste it into LinkedIn. Mark as synced when done.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
              >
                Go to Profile Copy
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-tarsius text-xl text-imperial-500">Recent Posts</h2>
          <Link
            href="/dashboard/drafts"
            className="font-mono text-xs text-sky-500 uppercase tracking-wider hover:text-sky-600"
          >
            View All →
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border border-persian-400 rounded-lg hover:border-sky-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-imperial-500 text-sm line-clamp-2">{post.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`badge badge-${post.status}`}>{post.status}</span>
                      {post.pillar && (
                        <span className="text-xs text-ocean-400">{post.pillar}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/drafts/${post.id}`}
                    className="shrink-0 text-sky-500 hover:text-sky-600 font-mono text-xs uppercase"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-persian-400 rounded-lg">
            <p className="text-ocean-500 mb-4">No posts yet. Create your first draft.</p>
            <Link
              href="/dashboard/drafts/new"
              className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
            >
              Create Draft
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ label, value, status, href }: {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'neutral' | 'error';
  href: string;
}) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    neutral: 'bg-gray-50 border-gray-200 text-gray-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <Link href={href} className={`block p-4 border rounded-lg hover:shadow-md transition-shadow ${statusColors[status]}`}>
      <p className="font-mono text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-tarsius text-2xl mt-1">{value}</p>
    </Link>
  );
}
