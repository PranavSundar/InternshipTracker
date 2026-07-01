'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Application } from '@/types';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import TableView from '@/components/TableView';
import ViewToggle from '@/components/ViewToggle';
import ApplicationModal from '@/components/ApplicationModal';
import EmptyState from '@/components/EmptyState';

export default function HomePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [modalApp, setModalApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewApp, setIsNewApp] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCardClick = (app: Application) => {
    setModalApp(app);
    setIsNewApp(false);
    setShowModal(true);
  };

  const handleNewApp = () => {
    setModalApp(null);
    setIsNewApp(true);
    setShowModal(true);
  };

  const handleSave = (saved: Application) => {
    if (isNewApp) {
      setApplications((prev) => [...prev, saved]);
    } else {
      setApplications((prev) =>
        prev.map((a) => (a.id === saved.id ? saved : a))
      );
    }
    setShowModal(false);
    setModalApp(null);
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setShowModal(false);
    setModalApp(null);
  };

  const handleBoardUpdate = (updated: Application[]) => {
    setApplications(updated);
  };

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
            Loading applications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-200">Applications</h1>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
            {applications.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onToggle={setView} />
          <button
            id="add-application-button"
            onClick={handleNewApp}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {applications.length === 0 ? (
        <EmptyState onAdd={handleNewApp} />
      ) : view === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onUpdate={handleBoardUpdate}
          onCardClick={handleCardClick}
        />
      ) : (
        <TableView applications={applications} onCardClick={handleCardClick} />
      )}

      {/* Modal */}
      {showModal && (
        <ApplicationModal
          application={isNewApp ? null : modalApp}
          isNew={isNewApp}
          onClose={() => {
            setShowModal(false);
            setModalApp(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
