'use client';
import { LEVELS, SUBJECTS } from '@/lib/config';

const LEVEL_LABELS = { Simple: 'Simple (ELI10)', Normal: 'Normal', Advanced: 'Advanced' };

/** Horizontally-scrolling subject chips (radio group semantics). */
export function SubjectChips({ value, onChange, disabled }) {
  return (
    <div role="radiogroup" aria-label="Subject" className="no-scrollbar flex gap-2 overflow-x-auto py-1">
      {SUBJECTS.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          disabled={disabled}
          onClick={() => onChange(s)}
          className="chip"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/** Segmented control for explanation level. */
export function LevelToggle({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Explanation level"
      className="inline-flex rounded-full border p-0.5"
      style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--surface))' }}
    >
      {LEVELS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={value === l}
          onClick={() => onChange(l)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === l ? 'bg-brand-500 text-white shadow' : 'hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          style={value === l ? undefined : { color: 'rgb(var(--muted))' }}
        >
          {LEVEL_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
