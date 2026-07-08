'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function QueuePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/${postId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_at: scheduledAt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to queue post');
      } else {
        router.push('/dashboard/queue');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  // Set default to tomorrow at 9 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Queue Post</h1>
        <p className="text-ocean-500">Choose when to publish this post on LinkedIn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-imperial-500 mb-2">Scheduled Date & Time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            defaultValue={defaultDate}
            required
            className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
          />
          <p className="text-xs text-ocean-400 mt-1">Posts publish via LinkedIn's official API at the scheduled time.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !scheduledAt}
            className="px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Queueing...' : 'Queue Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-persian-400 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
