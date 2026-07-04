export interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  dateApplied: string | null;
  deadline: string | null;
  jobLink: string | null;
  location: string | null;
  notes: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
  resumeUploadedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatsData {
  weeklyApplications: { week: string; count: number }[];
  responseRate: { responded: number; totalApplied: number; rate: number };
  statusBreakdown: { status: string; label: string; count: number; color: string }[];
  upcomingDeadlines: Application[];
  topCompanies: { name: string; count: number }[];
}
