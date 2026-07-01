'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
              <svg
                className="h-4 w-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.073c0 1.078-.86 1.973-1.935 2.01A47.46 47.46 0 0 0 12 20c-2.29 0-4.52.163-6.315.233C4.61 20.246 3.75 19.35 3.75 18.273V14.15M12 15V3m0 0-3.75 3.75M12 3l3.75 3.75"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight group-hover:text-accent-hover">
              Internship Tracker
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              Board
            </Link>
            <Link
              href="/stats"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/stats'
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              Stats
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-1">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              pathname === '/'
                ? 'bg-accent/10 text-accent'
                : 'text-zinc-400'
            }`}
          >
            Board
          </Link>
          <Link
            href="/stats"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              pathname === '/stats'
                ? 'bg-accent/10 text-accent'
                : 'text-zinc-400'
            }`}
          >
            Stats
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
