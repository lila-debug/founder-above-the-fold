'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setError('Invalid or expired magic link.');
      return;
    }

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setError(data.error || 'Failed to verify magic link.');
        } else {
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } catch (err) {
        setStatus('error');
        setError('Network error. Please try again.');
      }
    }

    verify();
  }, [token, email, router]);

  return (
    <div className="max-w-md w-full text-center">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-tarsius text-imperial-500 mb-2">Verifying your magic link...</h1>
          <p className="text-ocean-500">Just a moment while we sign you in securely.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-tarsius text-imperial-500 mb-2">You are signed in</h1>
          <p className="text-ocean-500">Redirecting to your dashboard...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-tarsius text-imperial-500 mb-2">Sign-in failed</h1>
          <p className="text-ocean-500 mb-6">{error}</p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors"
          >
            Try Again
          </a>
        </>
      )}
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <Suspense fallback={
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-tarsius text-imperial-500 mb-2">Loading...</h1>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
