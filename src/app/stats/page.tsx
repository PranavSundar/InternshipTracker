'use client';

import { useState, useEffect } from 'react';
import type { StatsData, Application } from '@/types';
import { STATUS_CONFIG, type StatusType } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import ApplicationModal from '@/components/ApplicationModal';
import dynamic from 'next/dynamic';

const StatsCharts = dynamic(() => import('@/components/StatsCharts'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20 text-zinc-600">
      Loading charts...
    </div>
  ),
});

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalApp, setModalApp] = useState<Application | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-500">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading stats...
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-zinc-500">
          Failed to load statistics.
        </div>
      </div>
    );
  }

  const totalApps = stats.statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-zinc-200">Dashboard</h1>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Total Apps
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-200">{totalApps}</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Response Rate
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-200">
              {stats.responseRate.rate}%
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">
              {stats.responseRate.responded} / {stats.responseRate.totalApplied} applied
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Active
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-200">
              {stats.statusBreakdown
                .filter((s) =>
                  ['APPLIED', 'INTERVIEW'].includes(s.status)
                )
                .reduce((sum, s) => sum + s.count, 0)}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">In pipeline</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Offers
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.statusBreakdown.find((s) => s.status === 'OFFER')?.count || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <StatsCharts stats={stats} />

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-border bg-bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-zinc-200">
              Upcoming Deadlines
              <span className="ml-2 text-xs font-normal text-zinc-500">
                Next 7 days
              </span>
            </h2>
          </div>
          {stats.upcomingDeadlines.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.upcomingDeadlines.map((app) => {
                const deadline = new Date(app.deadline!);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                deadline.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil(
                  (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = diffDays <= 3;
                const statusCfg = STATUS_CONFIG[app.status as StatusType];

                return (
                  <div
                    key={app.id}
                    onClick={() => setModalApp(app)}
                    className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-white/[0.02]"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isUrgent
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {diffDays === 0 ? 'Today' : `${diffDays}d`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {app.company}
                      </p>
                      <p className="text-xs text-zinc-500">{app.role}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${statusCfg?.bgColor} ${statusCfg?.color}`}
                    >
                      {statusCfg?.label}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(app.deadline!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-zinc-600">
              No deadlines in the next 7 days. You&apos;re all caught up! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Modal for clicking deadlines */}
      {modalApp && (
        <ApplicationModal
          application={modalApp}
          isNew={false}
          onClose={() => setModalApp(null)}
          onSave={() => {
            setModalApp(null);
            // Refresh stats
            window.location.reload();
          }}
          onDelete={() => {
            setModalApp(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
