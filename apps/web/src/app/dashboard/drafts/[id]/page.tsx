'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Post {
  id: string;
  body: string;
  status: string;
  pillar?: string;
  archetype?: string;
  notes?: string;
  body_hash: string;
  voice_checks?: {
    id: string;
    status: string;
    failures: string;
    body_hash: string;
    created_at: string;
  }[];
}

export default function DraftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceCheckLoading, setVoiceCheckLoading] = useState(false);
  const [voiceCheckResult, setVoiceCheckResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      setPost(data.post);
      setEditBody(data.post?.body || '');
    } catch (err) {
      console.error('Failed to fetch post:', err);
    } finally {
      setLoading(false);
    }
  }

  async function runVoiceCheck() {
    setVoiceCheckLoading(true);
    setVoiceCheckResult(null);

    try {
      const res = await fetch(`/api/posts/${postId}/voice-check`, { method: 'POST' });
      const data = await res.json();
      setVoiceCheckResult(data.voiceCheck);

      // Refresh post to get updated voice checks
      fetchPost();
    } catch (err) {
      console.error('Voice check failed:', err);
    } finally {
      setVoiceCheckLoading(false);
    }
  }

  async function saveEdit() {
    if (!editBody.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody }),
      });

      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!confirm('Delete this draft? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/drafts');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-12 text-center">
        <p className="text-ocean-500">Post not found.</p>
      </div>
    );
  }

  const latestVoice = post.voice_checks?.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  const voicePassed = latestVoice?.status === 'passed';
  const bodyChanged = latestVoice && latestVoice.status !== 'pending' && latestVoice.body_hash !== post.body_hash;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Draft</h1>
          <p className="text-ocean-500">{post.status === 'draft' ? 'Edit and prepare for publishing.' : `Status: ${post.status}`}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-imperial-500 border border-persian-400 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={deletePost}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Post body */}
      <div className="p-6 border border-persian-400 rounded-lg">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius resize-y"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditBody(post.body); }}
                className="px-4 py-2 border border-persian-400 text-imperial-500 font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-imperial-500 whitespace-pre-wrap">{post.body}</p>
        )}
      </div>

      {/* Voice Check */}
      <div className="p-6 border border-persian-400 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-tarsius text-xl text-imperial-500">Voice Check</h2>
          <div className="flex items-center gap-3">
            {latestVoice && (
              <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase ${
                voicePassed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {latestVoice.status}
              </span>
            )}
            {bodyChanged && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-mono uppercase rounded-full">
                Body changed — re-check needed
              </span>
            )}
          </div>
        </div>

        <button
          onClick={runVoiceCheck}
          disabled={voiceCheckLoading}
          className="px-6 py-3 bg-imperial-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-600 transition-colors disabled:opacity-50"
        >
          {voiceCheckLoading ? 'Running...' : 'Run Voice Check'}
        </button>

        {voiceCheckResult && (
          <div className={`mt-4 p-4 rounded-lg ${voiceCheckResult.status === 'passed' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`font-mono text-sm uppercase tracking-wider mb-2 ${voiceCheckResult.status === 'passed' ? 'text-green-700' : 'text-yellow-700'}`}>
              {voiceCheckResult.status === 'passed' ? 'Passed' : 'Failed'}
            </p>
            {voiceCheckResult.failures && voiceCheckResult.failures.length > 0 && (
              <ul className="space-y-1">
                {voiceCheckResult.failures.map((failure: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-700">• {failure}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {latestVoice && !voiceCheckResult && (
          <div className={`mt-4 p-4 rounded-lg ${voicePassed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`font-mono text-sm uppercase ${voicePassed ? 'text-green-700' : 'text-yellow-700'}`}>
              Last check: {latestVoice.status}
            </p>
            {latestVoice.failures && (
              <ul className="mt-2 space-y-1">
                {JSON.parse(latestVoice.failures).map((failure: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-700">• {failure}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Queue Action */}
      {post.status === 'draft' && voicePassed && !bodyChanged && (
        <div className="p-6 border border-green-300 bg-green-50 rounded-lg">
          <p className="text-green-700 mb-4">Voice check passed. Ready to queue.</p>
          <a
            href={`/dashboard/drafts/${post.id}/queue`}
            className="inline-flex items-center px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
          >
            Schedule for Publishing
          </a>
        </div>
      )}

      {post.status === 'draft' && !voicePassed && (
        <div className="p-6 border border-yellow-300 bg-yellow-50 rounded-lg">
          <p className="text-yellow-700">Voice check must pass before queueing. Run the voice check above.</p>
        </div>
      )}
    </div>
  );
}
