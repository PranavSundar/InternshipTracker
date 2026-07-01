'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '@/types';

interface KanbanCardProps {
  application: Application;
  onClick: () => void;
  isDragOverlay?: boolean;
}

function getDeadlineInfo(deadline: string | null): {
  text: string;
  className: string;
  isUrgent: boolean;
} | null {
  if (!deadline) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      className: 'bg-red-500/15 text-red-400 border-red-500/20',
      isUrgent: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: 'Due today',
      className: 'bg-red-500/15 text-red-400 border-red-500/20',
      isUrgent: true,
    };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays}d left`,
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      isUrgent: true,
    };
  }
  if (diffDays <= 7) {
    return {
      text: `${diffDays}d left`,
      className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      isUrgent: false,
    };
  }

  return {
    text: new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    isUrgent: false,
  };
}

export default function KanbanCard({
  application,
  onClick,
  isDragOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: { type: 'card', application },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const deadlineInfo = getDeadlineInfo(application.deadline);

  const cardContent = (
    <div
      className={`group cursor-pointer rounded-xl border border-border bg-bg-card p-3.5 hover:border-border-hover hover:bg-bg-card/80 ${
        isDragOverlay ? 'drag-overlay shadow-2xl border-accent/30' : ''
      }`}
      onClick={!isDragOverlay ? onClick : undefined}
    >
      {/* Company Name */}
      <h3 className="text-sm font-semibold text-zinc-200 leading-tight">
        {application.company}
      </h3>

      {/* Role */}
      <p className="mt-0.5 text-xs text-zinc-500 leading-tight">{application.role}</p>

      {/* Bottom row: deadline + resume icon */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {/* Deadline badge */}
        {deadlineInfo ? (
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
              deadlineInfo.className
            } ${deadlineInfo.isUrgent ? 'deadline-urgent' : ''}`}
          >
            {deadlineInfo.text}
          </span>
        ) : (
          <span />
        )}

        {/* Resume icon */}
        {application.resumeUrl && (
          <div className="flex h-5 w-5 items-center justify-center rounded text-zinc-500" title="Resume attached">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (isDragOverlay) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  );
}
