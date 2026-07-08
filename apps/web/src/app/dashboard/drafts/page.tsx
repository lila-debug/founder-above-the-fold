'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  body: string;
  status: string;
  pillar?: string;
  archetype?: string;
  created_at: string;
  voice_checks?: { status: string; created_at: string }[];
}

export default function DraftsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.status === filter);

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-persian-100 text-persian-600' },
    queued: { label: 'Queued', color: 'bg-ocean-100 text-ocean-600' },
    published: { label: 'Published', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Drafts</h1>
          <p className="text-ocean-500">Create, edit, and manage your LinkedIn posts.</p>
        </div>
        <Link
          href="/dashboard/drafts/new"
          className="inline-flex items-center px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
        >
          + New Draft
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'draft', 'queued', 'published', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-colors ${
              filter === status
                ? 'bg-imperial-500 text-white'
                : 'bg-gray-100 text-ocean-500 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const latestVoice = post.voice_checks?.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            return (
              <div key={post.id} className="p-5 border border-persian-400 rounded-lg hover:border-sky-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-imperial-500 text-sm line-clamp-3 mb-3">{post.body}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase ${statusLabels[post.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[post.status]?.label || post.status}
                      </span>
                      {latestVoice && (
                        <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase ${
                          latestVoice.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          Voice: {latestVoice.status}
                        </span>
                      )}
                      {post.pillar && (
                        <span className="text-xs text-ocean-400">{post.pillar}</span>
                      )}
                      <span className="text-xs text-ocean-400">
                        {new Date(post.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/drafts/${post.id}`}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-sky-500 hover:text-sky-600 border border-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      Edit
                    </Link>
                    {post.status === 'draft' && (
                      <Link
                        href={`/dashboard/drafts/${post.id}/queue`}
                        className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                      >
                        Queue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-persian-400 rounded-lg">
          <p className="text-ocean-500 mb-4">No posts found.</p>
          <Link
            href="/dashboard/drafts/new"
            className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
          >
            Create Your First Draft
          </Link>
        </div>
      )}
    </div>
  );
}
