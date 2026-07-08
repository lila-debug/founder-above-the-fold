'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  body: string;
  status: string;
  scheduled_at: string;
  published_at: string;
  linkedin_post_id: string;
  failure_reason: string;
}

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    try {
      const res = await fetch('/api/posts?status=queued');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function cancelPost(id: string) {
    try {
      const res = await fetch(`/api/posts/${id}/queue`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Queue</h1>
        <p className="text-ocean-500">Posts scheduled for publishing via LinkedIn's official API.</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-5 border border-ocean-400 rounded-lg bg-ocean-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-imperial-500 text-sm line-clamp-2 mb-2">{post.body}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-ocean-100 text-ocean-600 text-xs font-mono uppercase rounded-full">
                      Queued
                    </span>
                    <span className="text-xs text-ocean-500">
                      {new Date(post.scheduled_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => cancelPost(post.id)}
                  className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-persian-400 rounded-lg">
          <p className="text-ocean-500 mb-4">No posts in queue.</p>
          <a
            href="/dashboard/drafts"
            className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go to Drafts
          </a>
        </div>
      )}
    </div>
  );
}
