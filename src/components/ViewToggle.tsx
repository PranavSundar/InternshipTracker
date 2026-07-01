'use client';

interface ViewToggleProps {
  view: 'kanban' | 'table';
  onToggle: (view: 'kanban' | 'table') => void;
}

export default function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-xl border border-border bg-bg-card p-0.5">
      <button
        id="kanban-view-toggle"
        onClick={() => onToggle('kanban')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          view === 'kanban'
            ? 'bg-accent/15 text-accent'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
        Board
      </button>
      <button
        id="table-view-toggle"
        onClick={() => onToggle('table')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          view === 'table'
            ? 'bg-accent/15 text-accent'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
        Table
      </button>
    </div>
  );
}
