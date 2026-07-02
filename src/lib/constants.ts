export const STATUSES = [
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const;

export type StatusType = typeof STATUSES[number];

export const STATUS_CONFIG: Record<
  StatusType,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  APPLIED: {
    label: 'Applied',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  INTERVIEW: {
    label: 'Interview',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-400',
  },
  OFFER: {
    label: 'Offer',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    dotColor: 'bg-red-400',
  },
};

export const COLUMNS: StatusType[] = [...STATUSES];
