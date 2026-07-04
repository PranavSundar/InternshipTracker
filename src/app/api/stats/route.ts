import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STATUS_CONFIG, STATUSES } from '@/lib/constants';

export async function GET() {
  try {
    const applications = await prisma.application.findMany();

    // Weekly applications (last 12 weeks)
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklyMap = new Map<string, number>();

    // Pre-fill last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekKey = getWeekKey(weekStart);
      weeklyMap.set(weekKey, 0);
    }

    applications.forEach((app) => {
      if (app.dateApplied && app.dateApplied >= twelveWeeksAgo) {
        const weekKey = getWeekKey(app.dateApplied);
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
      }
    });

    const weeklyApplications = Array.from(weeklyMap.entries()).map(
      ([week, count]) => ({ week, count })
    );

    // Response rate: Applied that progressed to Interview or beyond
    const totalApplied = applications.filter(
      (a) =>
        a.status === 'APPLIED' ||
        a.status === 'INTERVIEW' ||
        a.status === 'OFFER'
    ).length;
    const responded = applications.filter(
      (a) => a.status === 'INTERVIEW' || a.status === 'OFFER'
    ).length;
    const responseRate = {
      responded,
      totalApplied,
      rate: totalApplied > 0 ? Math.round((responded / totalApplied) * 100 * 10) / 10 : 0,
    };

    // Status breakdown
    const statusCounts = new Map<string, number>();
    STATUSES.forEach((s) => statusCounts.set(s, 0));
    applications.forEach((app) => {
      statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1);
    });

    const statusBreakdown = STATUSES.map((status) => ({
      status,
      label: STATUS_CONFIG[status].label,
      count: statusCounts.get(status) || 0,
      color: STATUS_CONFIG[status].dotColor.replace('bg-', ''),
    }));

    // Upcoming deadlines (next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = applications
      .filter(
        (app) =>
          app.deadline &&
          app.deadline >= now &&
          app.deadline <= sevenDaysFromNow &&
          app.status !== 'REJECTED'
      )
      .sort((a, b) => {
        if (!a.deadline || !b.deadline) return 0;
        return a.deadline.getTime() - b.deadline.getTime();
      });

    // Top companies
    const companyCounts = new Map<string, number>();
    applications.forEach((app) => {
      const name = app.company.trim();
      if (name) {
        const lowerName = name.toLowerCase();
        let actualName = name;
        for (const [key] of companyCounts) {
          if (key.toLowerCase() === lowerName) {
            actualName = key;
            break;
          }
        }
        companyCounts.set(actualName, (companyCounts.get(actualName) || 0) + 1);
      }
    });

    const topCompanies = Array.from(companyCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      weeklyApplications,
      responseRate,
      statusBreakdown,
      upcomingDeadlines,
      topCompanies,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const month = d.toLocaleString('default', { month: 'short' });
  return `${month} ${d.getDate()}`;
}
