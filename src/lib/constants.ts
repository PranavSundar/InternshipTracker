export const STATUSES = [
  'WISHLIST',
  'APPLIED',
  'OA_ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const;

export type StatusType = (typeof STATUSES)[number];

export const STATUS_CONFIG: Record<
  StatusType,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  WISHLIST: {
    label: 'Wishlist',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    dotColor: 'bg-slate-400',
  },
  APPLIED: {
    label: 'Applied',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    dotColor: 'bg-blue-400',
  },
  OA_ASSESSMENT: {
    label: 'OA / Assessment',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    dotColor: 'bg-purple-400',
  },
  INTERVIEW: {
    label: 'Interview',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    dotColor: 'bg-amber-400',
  },
  OFFER: {
    label: 'Offer',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    dotColor: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    dotColor: 'bg-red-400',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    dotColor: 'bg-zinc-500',
  },
};
