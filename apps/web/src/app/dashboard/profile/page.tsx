'use client';

import { useState, useEffect } from 'react';

interface ProfileField {
  id: string;
  field: string;
  content: string;
  version: number;
  synced: boolean;
  updated_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  headline: 'Headline',
  about: 'About',
  experience: 'Experience',
  featured: 'Featured Links',
};

export default function ProfilePage() {
  const [fields, setFields] = useState<ProfileField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfileCopy();
  }, []);

  async function fetchProfileCopy() {
    try {
      const res = await fetch('/api/profile-copy');
      const data = await res.json();
      setFields(data.profileCopy || []);
    } catch (err) {
      console.error('Failed to fetch profile copy:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveField(field: string) {
    if (!editing[field]?.trim()) return;

    setSaving(prev => ({ ...prev, [field]: true }));

    try {
      const res = await fetch('/api/profile-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, content: editing[field] }),
      });

      const data = await res.json();

      if (res.ok) {
        setFields(prev => {
          const filtered = prev.filter(f => f.field !== field);
          return [...filtered, data.profileCopy].sort((a, b) => a.field.localeCompare(b.field));
        });
        setEditing(prev => { const n = { ...prev }; delete n[field]; return n; });
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }

  async function markSynced(field: string) {
    try {
      const res = await fetch(`/api/profile-copy/${field}/sync`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setFields(prev => prev.map(f => f.field === field ? data.profileCopy : f));
      }
    } catch (err) {
      console.error('Failed to mark synced:', err);
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content);
    // Could show a toast here
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allFields = ['headline', 'about', 'experience', 'featured'];
  const unsyncedCount = fields.filter(f => !f.synced).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Profile Copy</h1>
        <p className="text-ocean-500">
          Your canonical LinkedIn profile text. Copy to LinkedIn and mark as synced.
          {unsyncedCount > 0 && (
            <span className="text-sky-500 ml-2">{unsyncedCount} field{unsyncedCount === 1 ? '' : 's'} need attention.</span>
          )}
        </p>
      </div>

      <div className="space-y-6">
        {allFields.map(field => {
          const fieldData = fields.find(f => f.field === field);
          const isEditing = editing[field] !== undefined;
          const content = isEditing ? editing[field] : (fieldData?.content || '');

          return (
            <div key={field} className={`p-6 border rounded-lg ${fieldData?.synced ? 'border-green-300 bg-green-50' : 'border-persian-400'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-tarsius text-xl text-imperial-500">{FIELD_LABELS[field]}</h3>
                  {fieldData?.synced ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono uppercase rounded-full">Synced</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-mono uppercase rounded-full">Unsynced</span>
                  )}
                  {fieldData && (
                    <span className="text-xs text-ocean-400">v{fieldData.version}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && fieldData?.content && (
                    <button
                      onClick={() => copyToClipboard(fieldData.content)}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-sky-500 border border-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => setEditing(prev => ({ ...prev, [field]: fieldData?.content || '' }))}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-imperial-500 border border-persian-400 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {fieldData?.content ? 'Edit' : 'Create'}
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setEditing(prev => ({ ...prev, [field]: e.target.value }))}
                    rows={field === 'about' || field === 'experience' ? 10 : 4}
                    className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveField(field)}
                      disabled={saving[field] || !content.trim()}
                      className="px-4 py-2 bg-sky-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
                    >
                      {saving[field] ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(prev => { const n = { ...prev }; delete n[field]; return n; })}
                      className="px-4 py-2 border border-persian-400 text-imperial-500 font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {fieldData?.content ? (
                    <div className="p-4 bg-white border border-persian-400 rounded-lg">
                      <p className="text-imperial-500 text-sm whitespace-pre-wrap">{fieldData.content}</p>
                    </div>
                  ) : (
                    <p className="text-ocean-400 text-sm italic">No content yet. Click Create to add.</p>
                  )}

                  {fieldData?.content && !fieldData.synced && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 mb-2">
                        Copy the text above and paste it into your LinkedIn {FIELD_LABELS[field].toLowerCase()}.
                      </p>
                      <button
                        onClick={() => markSynced(field)}
                        className="px-4 py-2 bg-yellow-500 text-white font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        I have pasted this into LinkedIn
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
