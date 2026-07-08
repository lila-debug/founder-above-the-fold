'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send magic link');
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-tarsius text-imperial-500 mb-4">Check your email</h1>
          <p className="text-ocean-500 mb-6">
            We sent a magic link to <strong>{email}</strong>. Click it to sign in securely — no password required.
          </p>
          <p className="text-sm text-ocean-400">
            The link expires in 15 minutes. If you do not see it, check your spam folder.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-8 text-sky-500 hover:text-sky-600 font-mono text-sm uppercase tracking-wider"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-imperial-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-mono text-lg font-bold">F</span>
          </div>
          <span className="font-mono text-sm text-ocean-500 tracking-wider uppercase">Founder Above the Fold</span>
        </div>

        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Sign in</h1>
        <p className="text-ocean-500 mb-8">No passwords. Just your email and a secure magic link.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-imperial-500 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 border border-persian-400 rounded-lg focus:outline-none focus:border-sky-500 font-tarsius"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-6 py-4 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <p className="mt-8 text-sm text-ocean-400 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-sky-500 hover:text-sky-600">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-sky-500 hover:text-sky-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
