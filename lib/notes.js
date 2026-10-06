/**
 * NotepediaX notes adapter.
 *
 * "Save to my notes" calls saveNote(). By default the note is stored in
 * localStorage AND announced to the host app via:
 *   - a window CustomEvent  'notepediax:save-note'
 *   - window.parent.postMessage({ type: 'NOTEPEDIAX_SAVE_NOTE', note }) when embedded in an iframe
 * Replace the body with a fetch('/api/notes', ...) call to persist in your real backend.
 */
const NOTES_KEY = 'npx_notes_v1';

export function saveNote({ title, content, subject }) {
  const note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: (title || 'AI answer').slice(0, 120),
    content,
    subject: subject || 'Auto-detect',
    source: 'ai-doubt-solver',
    createdAt: new Date().toISOString(),
  };

  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    all.unshift(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(all.slice(0, 300)));
  } catch {
    return false;
  }

  window.dispatchEvent(new CustomEvent('notepediax:save-note', { detail: note }));

  // Only post to the embedding parent's origin (never '*').
  if (window.parent && window.parent !== window && document.referrer) {
    try {
      window.parent.postMessage({ type: 'NOTEPEDIAX_SAVE_NOTE', note }, new URL(document.referrer).origin);
    } catch {}
  }
  return true;
}
