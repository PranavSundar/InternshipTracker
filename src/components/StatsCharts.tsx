'use client';

import type { StatsData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STATUS_CHART_COLORS: Record<string, string> = {
  APPLIED: '#60a5fa',
  INTERVIEW: '#fbbf24',
  OFFER: '#4ade80',
  REJECTED: '#f87171',
};

interface StatsChartsProps {
  stats: StatsData;
}

export default function StatsCharts({ stats }: StatsChartsProps) {
  const pieData = stats.statusBreakdown.filter((s) => s.count > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly Applications Bar Chart */}
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-200">
          Applications per Week
        </h2>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.weeklyApplications}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e1e2e"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={{ stroke: '#1e1e2e' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12121a',
                  border: '1px solid #1e1e2e',
                  borderRadius: '12px',
                  color: '#e4e4e7',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown Pie Chart */}
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-200">
          Status Breakdown
        </h2>
        {pieData.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="h-[240px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_CHART_COLORS[entry.status] || '#71717a'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#12121a',
                      border: '1px solid #1e1e2e',
                      borderRadius: '12px',
                      color: '#e4e4e7',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {pieData.map((entry) => (
                <div key={entry.status} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_CHART_COLORS[entry.status] || '#71717a',
                    }}
                  />
                  <span className="text-zinc-400">{entry.label}</span>
                  <span className="ml-auto font-medium text-zinc-300">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[240px] items-center justify-center text-sm text-zinc-600">
            No data to display yet.
          </div>
        )}
      </div>
    </div>
  );
}
