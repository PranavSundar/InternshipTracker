'use client';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20">
        <svg
          className="h-10 w-10 text-accent/60"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-200">No applications yet</h2>
      <p className="mb-6 max-w-sm text-center text-sm text-zinc-500">
        Start tracking your internship applications. Add your first one to see it on the board — 
        you can track companies, deadlines, resumes, and more.
      </p>
      <button
        id="empty-add-button"
        onClick={onAdd}
        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Your First Application
      </button>
    </div>
  );
}
