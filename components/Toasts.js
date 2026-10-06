'use client';
import { useEffect } from 'react';
import { CheckIcon, CloseIcon } from './Icons';

/** Accessible toast stack. `toasts` = [{id, type: 'error'|'success'|'info', message}] */
export default function Toasts({ toasts, dismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.type === 'error' ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  const color =
    toast.type === 'error'
      ? 'border-red-400/50 bg-red-50 text-red-800 dark:bg-red-950/80 dark:text-red-100'
      : toast.type === 'success'
        ? 'border-emerald-400/50 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-100'
        : 'border-brand-400/50 bg-brand-50 text-brand-900 dark:bg-brand-900/80 dark:text-brand-100';

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex max-w-md animate-slideUp items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${color}`}
    >
      {toast.type === 'success' && <CheckIcon size={16} className="mt-0.5 shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="opacity-60 hover:opacity-100">
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
