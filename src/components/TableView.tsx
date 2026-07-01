'use client';

import { useState } from 'react';
import type { Application } from '@/types';
import { STATUS_CONFIG, type StatusType } from '@/lib/constants';

interface TableViewProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
}

type SortKey = 'company' | 'role' | 'status' | 'dateApplied' | 'deadline';
type SortDir = 'asc' | 'desc';

function getDeadlineClass(deadline: string | null): string {
  if (!deadline) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'text-red-400';
  if (diff <= 3) return 'text-amber-400';
  return '';
}

export default function TableView({ applications, onCardClick }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...applications].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (sortKey === 'dateApplied' || sortKey === 'deadline') {
      return (new Date(aVal).getTime() - new Date(bVal).getTime()) * dir;
    }

    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return (
        <svg className="h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      );
    }
    return (
      <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={sortDir === 'asc' ? 'M4.5 15.75l7.5-7.5 7.5 7.5' : 'M19.5 8.25l-7.5 7.5-7.5-7.5'}
        />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto px-4 sm:px-6">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border">
            {([
              ['company', 'Company'],
              ['role', 'Role'],
              ['status', 'Status'],
              ['dateApplied', 'Applied'],
              ['deadline', 'Deadline'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
              >
                <div className="flex items-center gap-1">
                  {label}
                  <SortIcon column={key} />
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Location
            </th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
              Resume
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status as StatusType];
            return (
              <tr
                key={app.id}
                onClick={() => onCardClick(app)}
                className="cursor-pointer hover:bg-white/[0.02]"
              >
                <td className="px-3 py-3 font-medium text-zinc-200">
                  {app.company}
                </td>
                <td className="px-3 py-3 text-zinc-400">{app.role}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${statusCfg?.bgColor} ${statusCfg?.color} border-transparent`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg?.dotColor}`} />
                    {statusCfg?.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-zinc-500">
                  {app.dateApplied
                    ? new Date(app.dateApplied).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td className={`px-3 py-3 ${getDeadlineClass(app.deadline)}`}>
                  {app.deadline
                    ? new Date(app.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-3 py-3 text-zinc-500">
                  {app.location || '—'}
                </td>
                <td className="px-3 py-3 text-center">
                  {app.resumeUrl ? (
                    <svg className="mx-auto h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="py-12 text-center text-sm text-zinc-600">
          No applications to display.
        </div>
      )}
    </div>
  );
}
