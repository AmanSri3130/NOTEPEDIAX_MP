'use client';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/** Accessible toast stack. `toasts` = [{id, type: 'error'|'success'|'info', message}] */
export default function Toasts({ toasts = [], dismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(
      () => dismiss(toast.id),
      toast.type === 'error' ? 6000 : 3200
    );
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  const config = {
    error: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/80 text-rose-200',
      icon: <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />,
    },
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/80 text-emerald-200',
      icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />,
    },
    info: {
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-950/80 text-indigo-200',
      icon: <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />,
    },
  }[toast.type || 'info'];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex max-w-md animate-scaleIn items-start gap-2.5 rounded-2xl border px-4 py-2.5 text-xs shadow-xl backdrop-blur-xl ${config.border} ${config.bg}`}
    >
      {config.icon}
      <span className="flex-1 font-medium leading-relaxed">{toast.message}</span>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
      >
        <X size={13} />
      </button>
    </div>
  );
}
