'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Application } from '@/types';
import { STATUSES, type StatusType } from '@/lib/constants';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  applications: Application[];
  onUpdate: (apps: Application[]) => void;
  onCardClick: (app: Application) => void;
}

export default function KanbanBoard({
  applications,
  onUpdate,
  onCardClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getColumnApps = useCallback(
    (status: StatusType): Application[] =>
      applications
        .filter((a) => a.status === status)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [applications]
  );

  const activeApplication = activeId
    ? applications.find((a) => a.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    // Determine target status
    let targetStatus: string | null = null;

    if (over.data.current?.type === 'column') {
      targetStatus = over.data.current.status;
    } else if (over.data.current?.type === 'card') {
      const overApp = applications.find((a) => a.id === over.id);
      targetStatus = overApp?.status || null;
    }

    if (targetStatus && activeApp.status !== targetStatus) {
      const updated = applications.map((a) =>
        a.id === activeApp.id ? { ...a, status: targetStatus as string } : a
      );
      onUpdate(updated);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    // Determine final status
    let targetStatus = activeApp.status;
    if (over.data.current?.type === 'column') {
      targetStatus = over.data.current.status;
    } else if (over.data.current?.type === 'card') {
      const overApp = applications.find((a) => a.id === over.id);
      if (overApp) targetStatus = overApp.status;
    }

    // Update the status of the active app
    const updatedApps = applications.map((a) =>
      a.id === activeApp.id ? { ...a, status: targetStatus } : a
    );

    // Recompute sort orders for affected columns
    const affectedStatuses = new Set([activeApp.status, targetStatus]);
    const reorderItems: { id: string; status: string; sortOrder: number }[] = [];

    affectedStatuses.forEach((status) => {
      const columnApps = updatedApps
        .filter((a) => a.status === status)
        .sort((a, b) => {
          if (a.id === activeApp.id) return -1; // put active at top of new column
          if (b.id === activeApp.id) return 1;
          return a.sortOrder - b.sortOrder;
        });

      columnApps.forEach((app, index) => {
        reorderItems.push({ id: app.id, status, sortOrder: index });
      });
    });

    // Apply sort orders locally
    const finalApps = updatedApps.map((app) => {
      const reordered = reorderItems.find((r) => r.id === app.id);
      if (reordered) {
        return { ...app, status: reordered.status, sortOrder: reordered.sortOrder };
      }
      return app;
    });

    onUpdate(finalApps);

    // Persist to server
    try {
      await fetch('/api/applications/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderItems }),
      });
    } catch (err) {
      console.error('Failed to persist reorder:', err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full gap-3 overflow-x-auto pb-4 px-4 sm:px-6">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={getColumnApps(status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeApplication && (
          <KanbanCard
            application={activeApplication}
            onClick={() => {}}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
