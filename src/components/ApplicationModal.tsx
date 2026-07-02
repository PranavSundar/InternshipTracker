'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Application } from '@/types';
import { STATUS_CONFIG, STATUSES } from '@/lib/constants';
import ResumeUpload from './ResumeUpload';

interface ApplicationModalProps {
  application: Application | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (app: Application) => void;
  onDelete?: (id: string) => void;
}

export default function ApplicationModal({
  application,
  isNew = false,
  onClose,
  onSave,
  onDelete,
}: ApplicationModalProps) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'APPLIED' as string,
    dateApplied: '',
    deadline: '',
    jobLink: '',
    location: '',
    notes: '',
  });
  const [currentApp, setCurrentApp] = useState<Application | null>(application);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (application) {
      setForm({
        company: application.company || '',
        role: application.role || '',
        status: application.status || 'APPLIED',
        dateApplied: application.dateApplied
          ? new Date(application.dateApplied).toISOString().split('T')[0]
          : '',
        deadline: application.deadline
          ? new Date(application.deadline).toISOString().split('T')[0]
          : '',
        jobLink: application.jobLink || '',
        location: application.location || '',
        notes: application.notes || '',
      });
      setCurrentApp(application);
    }
  }, [application]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);

    try {
      const url = isNew
        ? '/api/applications'
        : `/api/applications/${application?.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateApplied: form.dateApplied || null,
          deadline: form.deadline || null,
          jobLink: form.jobLink || null,
          location: form.location || null,
          notes: form.notes || null,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        onSave(saved);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!application?.id || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete(application.id);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleResumeUpdate = (updatedApp: Application) => {
    setCurrentApp(updatedApp);
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-card/95 backdrop-blur-sm px-6 py-4 rounded-t-2xl">
          <h2 className="text-lg font-semibold">
            {isNew ? 'New Application' : 'Edit Application'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Company + Role */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Company *
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Google"
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Role *
              </label>
              <input
                id="role"
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. SWE Intern"
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Applied + Deadline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dateApplied" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Date Applied
              </label>
              <input
                id="dateApplied"
                type="date"
                value={form.dateApplied}
                onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Deadline / Follow-up
              </label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Job Link */}
          <div>
            <label htmlFor="jobLink" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Job Posting Link
            </label>
            <div className="relative">
              <input
                id="jobLink"
                type="url"
                value={form.jobLink}
                onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 pr-10 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              />
              {form.jobLink && (
                <a
                  href={form.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 hover:text-accent"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Mountain View, CA / Remote"
              className="w-full rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contacts, interview prep, conversation history..."
              rows={4}
              className="w-full resize-y rounded-xl border border-border bg-bg-primary/50 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {/* Resume Upload — only for existing applications */}
          {!isNew && currentApp && (
            <ResumeUpload application={currentApp} onUpdate={handleResumeUpdate} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-bg-card/95 backdrop-blur-sm px-6 py-4 rounded-b-2xl">
          <div>
            {!isNew && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  confirmDelete
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                {deleting
                  ? 'Deleting...'
                  : confirmDelete
                  ? 'Confirm Delete'
                  : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              id="save-application-button"
              onClick={handleSave}
              disabled={saving || !form.company.trim() || !form.role.trim()}
              className="rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isNew ? 'Add Application' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
