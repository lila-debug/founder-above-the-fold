'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: '◈' },
  { href: '/dashboard/drafts', label: 'Drafts', icon: '✎' },
  { href: '/dashboard/queue', label: 'Queue', icon: '◷' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◉' },
  { href: '/dashboard/settings', label: 'Settings', icon: '◐' },
];

export default function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed left-0 top-0 h-full bg-imperial-500 border-r border-imperial-400 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-imperial-400">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-mono text-sm font-bold">F</span>
            </div>
            {!collapsed && (
              <span className="font-mono text-sm text-white tracking-wider uppercase">Above the Fold</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-3 font-mono text-sm uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-sky-400 bg-imperial-400'
                        : 'text-white-300 hover:text-white hover:bg-imperial-400'
                    }`}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="p-6 border-t border-imperial-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ocean-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-mono text-xs">{email[0].toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white text-sm truncate">{email}</p>
                <p className="text-white-300 text-xs">Owner</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <form action="/api/auth/signout" method="post" className="mt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 text-xs font-mono uppercase tracking-wider text-white-300 hover:text-white border border-imperial-400 rounded-lg hover:bg-imperial-400 transition-colors"
              >
                Sign Out
              </button>
            </form>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-sky-600 transition-colors"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
    </aside>
  );
}
