'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { saveNote } from '@/lib/notes';
import { setUser } from '@/lib/storage';
import { LIMITS } from '@/lib/config';
import Composer from './Composer';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import Toasts from './Toasts';
import Welcome from './Welcome';
import { LevelToggle, SubjectChips } from './Selectors';
import { CloseIcon, MenuIcon, MoonIcon, NoteIcon, PlusIcon, SunIcon } from './Icons';

const FOLLOW_UPS = [
  'Explain that in simpler words',
  'Give me a practice question on this',
  'Show another method',
];

/**
 * Top-level doubt-solver UI.
 *
 * NotepediaX integration points:
 *  - notes context: `?notes=...` URL param, `window.NOTEPEDIAX_NOTES_CONTEXT`, or
 *    `postMessage({ type: 'NOTEPEDIAX_NOTES_CONTEXT', notes })` from the host page.
 *  - user id (per-user history): `?uid=...` or `postMessage({ type: 'NOTEPEDIAX_USER', id })`.
 */
export default function ChatApp() {
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [notesContext, setNotesContext] = useState('');
  const [pendingExample, setPendingExample] = useState(null);

  const toast = useCallback((type, message) => {
    setToasts((t) => [...t.slice(-2), { id: `${Date.now()}${Math.random()}`, type, message }]);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // Per-user history must be selected BEFORE useChat hydrates, so read uid synchronously on the client.
  if (typeof window !== 'undefined') {
    const uid = new URLSearchParams(window.location.search).get('uid');
    if (uid) setUser(uid);
  }

  const chat = useChat({ notesContext, onToast: toast });
  const { activeChat, streaming } = chat;

  // ---- theme ----
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('npx_theme', next ? 'dark' : 'light'); } catch {}
  };

  // ---- notes context from host app ----
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('notes') || window.NOTEPEDIAX_NOTES_CONTEXT || '';
    if (initial) setNotesContext(initial.slice(0, LIMITS.maxNotesChars));

    const allowed = new Set([window.location.origin]);
    try { if (document.referrer) allowed.add(new URL(document.referrer).origin); } catch {}

    const onMessage = (e) => {
      if (!allowed.has(e.origin)) return; // ignore untrusted senders
      if (e.data?.type === 'NOTEPEDIAX_NOTES_CONTEXT' && typeof e.data.notes === 'string') {
        setNotesContext(e.data.notes.slice(0, LIMITS.maxNotesChars));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // ---- auto-scroll (only while the user is near the bottom) ----
  const scrollRef = useRef(null);
  const stickRef = useRef(true);
  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTo({ top: el.scrollHeight });
  }, [activeChat?.messages, streaming]);
  useEffect(() => { stickRef.current = true; }, [chat.activeId]);

  // ---- tap-to-try examples (send after the subject state has updated) ----
  useEffect(() => {
    if (pendingExample) {
      chat.send(pendingExample);
      setPendingExample(null);
    }
  }, [pendingExample, chat]);

  const pickExample = (ex) => {
    chat.setSubject(ex.subject);
    setPendingExample(ex.text);
  };

  const handleSend = useCallback(
    (text, image) => {
      stickRef.current = true;
      return chat.send(text, image);
    },
    [chat]
  );

  const handleSave = (message, question) => {
    const ok = saveNote({
      title: question || 'AI answer',
      content: `## ${question || 'AI answer'}\n\n${message.content}`,
      subject: activeChat?.subject,
    });
    toast(ok ? 'success' : 'error', ok ? 'Saved to your notes ✓' : 'Could not save the note. Storage may be full.');
  };

  const messages = activeChat?.messages || [];
  const last = messages[messages.length - 1];
  const showFollowUps = last?.role === 'assistant' && !last.streaming && !last.error && last.content && !streaming;

  return (
    <div className="flex h-dvh overflow-hidden">
      <Toasts toasts={toasts} dismiss={dismissToast} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chat.chats}
        activeId={chat.activeId}
        onSelect={chat.selectChat}
        onNew={chat.newChat}
        onDelete={chat.deleteChat}
        hydrated={chat.hydrated}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-2 border-b px-3 py-2 sm:px-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--surface) / 0.8)' }}>
          <button type="button" className="btn-ghost !p-2 md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open past doubts">
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">AI Doubt Solver</p>
            <p className="truncate text-[11px]" style={{ color: 'rgb(var(--muted))' }}>
              {activeChat ? activeChat.title : 'Step-by-step answers, powered by NotepediaX AI'}
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={chat.newChat} aria-label="Start a new doubt" title="New doubt">
            <PlusIcon /> <span className="hidden sm:inline">New doubt</span>
          </button>
          <button type="button" className="btn-ghost !p-2" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* Conversation */}
        <main ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={streaming}>
          {!chat.hydrated ? (
            <div className="mx-auto max-w-3xl space-y-4 p-6">
              <div className="skeleton ml-auto h-10 w-2/3" />
              <div className="skeleton h-28 w-full" />
            </div>
          ) : messages.length === 0 ? (
            <Welcome onPick={pickExample} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-5 px-3 py-6 sm:px-4">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  question={m.role === 'assistant' ? messages[i - 1]?.content : undefined}
                  disabled={streaming}
                  onRegenerate={chat.regenerate}
                  onFeedback={chat.setFeedback}
                  onSave={handleSave}
                  onToast={toast}
                />
              ))}

              {showFollowUps && (
                <div className="flex animate-slideUp flex-wrap gap-2 pl-11" role="group" aria-label="Follow-up suggestions">
                  {FOLLOW_UPS.map((f) => (
                    <button key={f} type="button" className="chip" onClick={() => handleSend(f)}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Controls + input */}
        <div className="border-t px-3 pt-2 sm:px-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--bg) / 0.85)' }}>
          <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
            {notesContext && (
              <div className="flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs text-brand-600 dark:text-brand-300">
                <NoteIcon size={14} />
                <span className="flex-1 truncate">Answers will stay consistent with the note you&apos;re viewing.</span>
                <button type="button" onClick={() => setNotesContext('')} aria-label="Stop using note context" className="opacity-70 hover:opacity-100">
                  <CloseIcon size={14} />
                </button>
              </div>
            )}
            <SubjectChips value={chat.subject} onChange={chat.setSubject} disabled={streaming} />
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[11px] font-medium" style={{ color: 'rgb(var(--muted))' }}>Level</span>
              <LevelToggle value={chat.level} onChange={chat.setLevel} />
            </div>
          </div>
        </div>
        <Composer streaming={streaming} onSend={handleSend} onStop={chat.stop} onToast={toast} />
      </div>
    </div>
  );
}
