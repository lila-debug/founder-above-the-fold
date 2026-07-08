'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDraftPage() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [pillar, setPillar] = useState('');
  const [archetype, setArchetype] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, pillar, archetype, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create draft');
      } else {
        router.push(`/dashboard/drafts/${data.post.id}`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">New Draft</h1>
        <p className="text-ocean-500">Write your LinkedIn post. Run a voice check before queueing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-imperial-500 mb-2">Post Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What do you want to say on LinkedIn?"
            rows={8}
            required
            className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius resize-y"
          />
          <p className="text-xs text-ocean-400 mt-1">{body.length} characters</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-imperial-500 mb-2">Content Pillar</label>
            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
            >
              <option value="">Select pillar...</option>
              <option value="founder-story">Founder Story</option>
              <option value="industry-insight">Industry Insight</option>
              <option value="product-update">Product Update</option>
              <option value="behind-the-scenes">Behind the Scenes</option>
              <option value="thought-leadership">Thought Leadership</option>
              <option value="community">Community</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-imperial-500 mb-2">Post Archetype</label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
            >
              <option value="">Select archetype...</option>
              <option value="story">Story</option>
              <option value="lesson">Lesson</option>
              <option value="question">Question</option>
              <option value="framework">Framework</option>
              <option value="announcement">Announcement</option>
              <option value="reflection">Reflection</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-imperial-500 mb-2">Private Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for yourself — not published"
            rows={3}
            className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius resize-y"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Draft'}
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
