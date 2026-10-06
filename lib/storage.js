/**
 * Client-side persistence (localStorage), namespaced per user.
 * To move to a database later, keep these function signatures and swap the
 * bodies for fetch() calls to your NotepediaX backend.
 */
const KEYS = {
  chats: 'npx_chats_v1',
  feedback: 'npx_feedback_v1',
  prefs: 'npx_prefs_v1',
};

const MAX_CHATS = 50;
const MAX_MESSAGES_PER_CHAT = 100;

let currentUser = 'guest';
export function setUser(id) {
  currentUser = id || 'guest';
}
const ns = (key) => `${key}:${currentUser}`;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(ns(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(ns(key), JSON.stringify(value));
    return true;
  } catch {
    return false; // quota exceeded / private mode – fail silently
  }
}

/** Loads chats and repairs any message left mid-stream by a closed tab. */
export function loadChats() {
  const chats = read(KEYS.chats, []);
  return chats.map((c) => ({
    ...c,
    messages: (c.messages || []).map((m) => (m.streaming ? { ...m, streaming: false, stopped: true } : m)),
  }));
}

export function saveChats(chats) {
  const trimmed = [...chats]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CHATS)
    .map((c) => ({
      ...c,
      messages: c.messages
        .slice(-MAX_MESSAGES_PER_CHAT)
        // Never persist raw image data (quota); keep only the `hasImage` flag.
        .map(({ imagePreview, ...rest }) => rest),
    }));
  write(KEYS.chats, trimmed);
}

export function loadPrefs() {
  return read(KEYS.prefs, {});
}
export function savePrefs(prefs) {
  write(KEYS.prefs, prefs);
}

/** Stores thumbs up/down so answers can be reviewed and improved later. */
export function addFeedback(entry) {
  const all = read(KEYS.feedback, []);
  const filtered = all.filter((f) => f.messageId !== entry.messageId);
  if (entry.value) filtered.push({ ...entry, ts: Date.now() });
  write(KEYS.feedback, filtered.slice(-500));
}
