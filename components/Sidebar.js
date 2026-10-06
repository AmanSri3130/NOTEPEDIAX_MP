'use client';
import { CloseIcon, NoteIcon, PlusIcon, SparkIcon, TrashIcon } from './Icons';

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** History sidebar: static on desktop, slide-over drawer on mobile. */
export default function Sidebar({ open, onClose, chats, activeId, onSelect, onNew, onDelete, hydrated }) {
  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} aria-hidden />}
      <aside
        aria-label="Past doubts"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r transition-transform duration-300 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'rgb(var(--surface))', borderColor: 'rgb(var(--border))' }}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
              <NoteIcon size={16} />
            </span>
            <span>Notepedia<span className="text-brand-500">X</span></span>
          </div>
          <button type="button" className="btn-ghost md:hidden !p-2" onClick={onClose} aria-label="Close sidebar">
            <CloseIcon />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => { onNew(); onClose(); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110 active:scale-[0.98]"
          >
            <PlusIcon size={16} /> New doubt
          </button>
        </div>

        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--muted))' }}>
          Past doubts
        </p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {!hydrated ? (
            [0, 1, 2, 3].map((i) => <div key={i} className="skeleton mx-1 my-1.5 h-11" />)
          ) : sorted.length === 0 ? (
            <div className="mx-2 mt-4 rounded-xl border border-dashed p-4 text-center text-xs" style={{ borderColor: 'rgb(var(--border))', color: 'rgb(var(--muted))' }}>
              <SparkIcon className="mx-auto mb-2" />
              No doubts yet. Ask your first question!
            </div>
          ) : (
            sorted.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center rounded-xl transition ${
                  c.id === activeId ? 'bg-brand-500/10 ring-1 ring-brand-500/40' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <button
                  type="button"
                  onClick={() => { onSelect(c.id); onClose(); }}
                  aria-current={c.id === activeId ? 'true' : undefined}
                  className="min-w-0 flex-1 px-3 py-2 text-left"
                >
                  <span className="block truncate text-sm font-medium">{c.title || 'Untitled doubt'}</span>
                  <span className="block text-[11px]" style={{ color: 'rgb(var(--muted))' }}>
                    {c.subject && c.subject !== 'Auto-detect' ? `${c.subject} · ` : ''}{timeAgo(c.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Delete doubt: ${c.title}`}
                  className="btn-ghost mr-1 !p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
