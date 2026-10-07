'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { LEVELS, SUBJECTS } from '@/lib/config';
import { SUBJECT_META } from '@/lib/subjects';

const LEVEL_LABELS = {
  Simple: 'Simple',
  Normal: 'Normal',
  Advanced: 'Advanced',
};

/**
 * Modern compact subject selector popover with colored dots and checkmarks.
 */
export function SubjectDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const currentMeta = SUBJECT_META[value] || SUBJECT_META['Auto-detect'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Subject: ${value}`}
        className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-white/[0.04] active:scale-95 disabled:opacity-50"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-base)',
          color: 'var(--color-text-primary)',
        }}
      >
        <span
          className="h-2 w-2 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: currentMeta.color }}
        />
        <span className="truncate max-w-[85px] sm:max-w-[120px] font-medium text-xs">
          {value}
        </span>
        <ChevronDown
          size={12}
          className={`text-[var(--color-text-muted)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select subject"
          className="absolute bottom-full left-0 mb-2 z-50 w-52 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl animate-scaleIn"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 12px 36px -4px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-white/5 mb-1">
            Subject Target
          </div>
          <div className="max-h-56 overflow-y-auto py-0.5 space-y-0.5">
            {SUBJECTS.map((s) => {
              const meta = SUBJECT_META[s] || SUBJECT_META['Auto-detect'];
              const isSelected = value === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition ${
                    isSelected
                      ? 'bg-violet-500/15 text-violet-400 font-semibold'
                      : 'hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="truncate">{s}</span>
                  </div>
                  {isSelected && <Check size={13} className="shrink-0 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact, modern segmented pill control for explanation level.
 */
export function LevelToggle({ value, onChange, disabled }) {
  return (
    <div
      role="radiogroup"
      aria-label="Explanation level"
      className="inline-flex rounded-xl border p-0.5"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-base)',
      }}
    >
      {LEVELS.map((l) => {
        const isSelected = value === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            disabled={disabled}
            aria-checked={isSelected}
            onClick={() => onChange(l)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              isSelected
                ? 'bg-[#17171F] text-violet-400 font-semibold shadow-sm border border-[#292932]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
            }`}
          >
            {LEVEL_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
