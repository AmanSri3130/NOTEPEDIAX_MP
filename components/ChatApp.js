'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Menu,
  Plus,
  Sun,
  Moon,
  Zap,
  ArrowDown,
  Sparkles,
  FileText,
  X,
  HelpCircle,
  RotateCcw,
  BookOpen,
  PanelLeft,
  ChevronDown,
  Check,
  Cpu,
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { saveNote } from '@/lib/notes';
import { setUser } from '@/lib/storage';
import { LIMITS, MODELS } from '@/lib/config';
import Composer from './Composer';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import Toasts from './Toasts';
import Welcome from './Welcome';

const FOLLOW_UPS = [
  { text: 'Explain that in simpler words', icon: HelpCircle },
  { text: 'Give me a practice question on this', icon: BookOpen },
  { text: 'Show another method', icon: RotateCcw },
];

/**
 * Top-level AI Doubt Solver UI with ChatGPT/Claude-inspired design.
 */
export default function ChatApp() {
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [notesContext, setNotesContext] = useState('');
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const modelMenuRef = useRef(null);

  const toast = useCallback((type, message) => {
    setToasts((t) => [
      ...t.slice(-2),
      { id: `${Date.now()}${Math.random()}`, type, message },
    ]);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // Per-user history
  if (typeof window !== 'undefined') {
    const uid = new URLSearchParams(window.location.search).get('uid');
    if (uid) setUser(uid);
  }

  const chat = useChat({ notesContext, onToast: toast });
  const { activeChat, streaming } = chat;

  // Theme synchronization
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('npx_theme', next ? 'dark' : 'light');
    } catch {}
  };

  // Close model menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelMenuOpen(false);
      }
    };
    if (modelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modelMenuOpen]);

  // Keyboard shortcut: Ctrl+K or Cmd+K for new doubt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        chat.newChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chat]);

  // Notes context from host app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('notes') || window.NOTEPEDIAX_NOTES_CONTEXT || '';
    if (initial) setNotesContext(initial.slice(0, LIMITS.maxNotesChars));

    const allowed = new Set([window.location.origin]);
    try {
      if (document.referrer) allowed.add(new URL(document.referrer).origin);
    } catch {}

    const onMessage = (e) => {
      if (!allowed.has(e.origin)) return;
      if (e.data?.type === 'NOTEPEDIAX_NOTES_CONTEXT' && typeof e.data.notes === 'string') {
        setNotesContext(e.data.notes.slice(0, LIMITS.maxNotesChars));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Scroll management
  const scrollRef = useRef(null);
  const stickRef = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceToBottom < 100;
    stickRef.current = isNearBottom;
    setIsScrolledUp(!isNearBottom && el.scrollHeight > el.clientHeight + 200);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      stickRef.current = true;
      setIsScrolledUp(false);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) {
      el.scrollTo({ top: el.scrollHeight });
    }
  }, [activeChat?.messages, streaming]);

  useEffect(() => {
    stickRef.current = true;
    setIsScrolledUp(false);
  }, [chat.activeId]);

  const handleSend = useCallback(
    (text, image) => {
      stickRef.current = true;
      return chat.send(text, image);
    },
    [chat]
  );

  const handleSave = (message, question) => {
    const ok = saveNote({
      title: question || 'AI Doubt Explanation',
      content: `## ${question || 'AI Doubt Explanation'}\n\n${message.content}`,
      subject: activeChat?.subject || chat.subject,
    });
    toast(
      ok ? 'success' : 'error',
      ok
        ? 'Explanation saved to your NotepediaX notes ✓'
        : 'Could not save note. Storage may be full.'
    );
  };

  const messages = activeChat?.messages || [];
  const last = messages[messages.length - 1];
  const showFollowUps =
    last?.role === 'assistant' &&
    !last.streaming &&
    !last.error &&
    last.content &&
    !streaming;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-base)]">
      {/* Toast notifications */}
      <Toasts toasts={toasts} dismiss={dismissToast} />

      {/* History Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chat.chats}
        activeId={chat.activeId}
        onSelect={chat.selectChat}
        onNew={chat.newChat}
        onDelete={chat.deleteChat}
        onRename={chat.renameChat}
        hydrated={chat.hydrated}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Minimal Modern Top Bar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-5 backdrop-blur-xl z-20"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-surface)',
          }}
        >
          {/* Left: Sidebar toggle + Current title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              className="btn-ghost !p-2 lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open past doubts drawer"
            >
              <Menu size={18} />
            </button>

            {/* Desktop collapse toggle button */}
            {sidebarCollapsed && (
              <button
                type="button"
                className="btn-ghost !p-2 hidden lg:flex text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                  {activeChat ? activeChat.title : 'NotepediaX Doubt Engine'}
                </span>
                {!activeChat && (
                  <span className="hidden sm:inline-flex rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.2 text-[10px] font-semibold text-violet-400">
                    Groq LPU
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: AI Model selector, New Chat, Theme toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Model Selector / Badge */}
            <div className="relative" ref={modelMenuRef}>
              <button
                type="button"
                onClick={() => setModelMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] hover:border-violet-500/40"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                }}
                title="AI Inference Model"
              >
                <Zap size={13} className="text-amber-400" />
                <span className="hidden xs:inline">Groq LPU · 120B / Fast</span>
                <span className="xs:hidden">120B</span>
                <ChevronDown size={11} className="text-[var(--color-text-muted)]" />
              </button>

              {/* Model info popover */}
              {modelMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl animate-scaleIn"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Cpu size={15} className="text-violet-400" />
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      AI Inference Engine
                    </span>
                  </div>
                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <div>
                        <p className="font-semibold text-violet-300">Groq High-Speed LPU</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          Auto routes to 120B / 20B / Vision
                        </p>
                      </div>
                      <Check size={14} className="text-violet-400" />
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed px-1">
                      Powered by Groq tensor stream processors delivering ultra-fast step-by-step academic solutions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* New Doubt Button */}
            <button
              type="button"
              className="btn-ghost !px-2.5 !py-1.5 text-xs text-[var(--color-text-primary)] hover:bg-white/10"
              onClick={chat.newChat}
              aria-label="Start a new doubt (Ctrl+K)"
              title="New doubt (Ctrl+K)"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New doubt</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              className="btn-ghost !p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Container */}
        <main
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto px-2 sm:px-4"
          aria-live="polite"
          aria-busy={streaming}
        >
          {/* Notes Context banner if linked */}
          {notesContext && (
            <div className="mx-auto max-w-3xl pt-3">
              <div className="flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs text-violet-300">
                <FileText size={15} className="shrink-0 text-violet-400" />
                <span className="flex-1 truncate">
                  Answers will reference your active study note context.
                </span>
                <button
                  type="button"
                  onClick={() => setNotesContext('')}
                  aria-label="Remove note context"
                  className="opacity-70 hover:opacity-100 p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {!chat.hydrated ? (
            <div className="mx-auto max-w-3xl space-y-4 py-8">
              <div className="skeleton ml-auto h-12 w-2/3 rounded-3xl" />
              <div className="skeleton h-36 w-full rounded-3xl" />
            </div>
          ) : messages.length === 0 ? (
            <Welcome />
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 py-6">
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

              {/* Follow-up recommendation chips */}
              {showFollowUps && (
                <div
                  className="flex animate-fadeIn flex-wrap gap-2 pl-10 sm:pl-12 pt-1 pb-2"
                  role="group"
                  aria-label="Follow-up suggestions"
                >
                  {FOLLOW_UPS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.text}
                        type="button"
                        className="chip hover:border-violet-400 text-xs py-1.5 px-3 rounded-xl"
                        onClick={() => handleSend(f.text)}
                      >
                        <Icon size={13} className="text-violet-400" />
                        <span>{f.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Floating Jump to Latest Button */}
          {isScrolledUp && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="fixed bottom-24 right-6 z-30 flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-primary)] shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 animate-scaleIn"
            >
              <ArrowDown size={14} className="text-violet-400" />
              <span>Jump to latest</span>
            </button>
          )}
        </main>

        {/* Floating Composer */}
        <Composer
          streaming={streaming}
          onSend={handleSend}
          onStop={chat.stop}
          onToast={toast}
          subject={chat.subject}
          onSubjectChange={chat.setSubject}
          level={chat.level}
          onLevelChange={chat.setLevel}
        />
      </div>
    </div>
  );
}
