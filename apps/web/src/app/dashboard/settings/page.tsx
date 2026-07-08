'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [linkedinStatus, setLinkedinStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  async function checkLinkedInStatus() {
    try {
      const res = await fetch('/api/linkedin/status');
      const data = await res.json();
      setLinkedinStatus(data.connected ? 'connected' : 'disconnected');
    } catch (err) {
      setLinkedinStatus('disconnected');
    }
  }

  async function connectLinkedIn() {
    setConnecting(true);
    try {
      const res = await fetch('/api/linkedin/oauth/start');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Failed to start OAuth:', err);
      setConnecting(false);
    }
  }

  async function disconnectLinkedIn() {
    try {
      const res = await fetch('/api/linkedin/disconnect', { method: 'POST' });
      if (res.ok) {
        setLinkedinStatus('disconnected');
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-tarsius text-imperial-500 mb-2">Settings</h1>
        <p className="text-ocean-500">Manage your account and connections.</p>
      </div>

      {/* LinkedIn Connection */}
      <div className="p-6 border border-persian-400 rounded-lg">
        <h2 className="font-tarsius text-xl text-imperial-500 mb-4">LinkedIn Connection</h2>

        {linkedinStatus === 'loading' ? (
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        ) : linkedinStatus === 'connected' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-700 font-mono text-sm">Connected to LinkedIn</span>
            </div>
            <button
              onClick={disconnectLinkedIn}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-600 font-mono text-sm">Not connected</span>
            </div>
            <button
              onClick={connectLinkedIn}
              disabled={connecting}
              className="px-6 py-3 bg-sky-500 text-white font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Connect LinkedIn'}
            </button>
          </div>
        )}
      </div>

      {/* Session */}
      <div className="p-6 border border-persian-400 rounded-lg">
        <h2 className="font-tarsius text-xl text-imperial-500 mb-4">Session</h2>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="px-6 py-3 border border-imperial-500 text-imperial-500 font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-imperial-500 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
