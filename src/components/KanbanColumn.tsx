'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Application } from '@/types';
import { STATUS_CONFIG, type StatusType } from '@/lib/constants';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  status: StatusType;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({
  status,
  applications,
  onCardClick,
}: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div
      className={`flex flex-1 min-w-[260px] flex-col rounded-2xl border bg-bg-column ${
        isOver ? 'border-accent/30 bg-accent/5' : 'border-border'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </h3>
        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
          {applications.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="kanban-scroll flex-1 space-y-2 overflow-y-auto px-2 pb-2"
        style={{ minHeight: '80px', maxHeight: 'calc(100vh - 200px)' }}
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onClick={() => onCardClick(app)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-zinc-600">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
