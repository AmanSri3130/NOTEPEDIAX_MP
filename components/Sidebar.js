'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sparkles,
  Command,
  PanelLeftClose,
  MoreHorizontal,
  ChevronRight,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import { getSubjectMeta } from '@/lib/subjects';

function formatRelativeTime(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getGroupKey(ts) {
  const now = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === date.getDate()) return 'Today';
  if (diffDays <= 1) return 'Yesterday';
  if (diffDays <= 7) return 'Previous 7 Days';
  return 'Older';
}

/**
 * Premium ChatGPT/Claude styled Sidebar with date-categorized doubts,
 * search filter, inline rename/delete, user profile footer, and settings modal.
 */
export default function Sidebar({
  open,
  onClose,
  chats = [],
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  hydrated,
  collapsed = false,
  onToggleCollapse,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpenId]);

  // Filter & sort
  const filteredChats = useMemo(() => {
    let list = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.subject || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [chats, searchQuery]);

  // Group by date
  const groupedChats = useMemo(() => {
    const groups = { Today: [], Yesterday: [], 'Previous 7 Days': [], Older: [] };
    for (const c of filteredChats) {
      const key = getGroupKey(c.updatedAt || c.createdAt || Date.now());
      if (groups[key]) groups[key].push(c);
      else groups.Older.push(c);
    }
    return groups;
  }, [filteredChats]);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title || '');
    setMenuOpenId(null);
  };

  const handleSaveRename = (e, chatId) => {
    e.stopPropagation();
    if (editTitle.trim() && onRename) {
      onRename(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setConfirmDeleteId(chatId);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = (e, chatId) => {
    e.stopPropagation();
    onDelete(chatId);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Past doubts navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-out lg:static ${
          collapsed ? 'lg:w-0 lg:overflow-hidden lg:border-r-0' : 'w-[280px]'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white shadow-md shadow-violet-500/20">
              <BookOpen size={16} strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14px] tracking-tight text-[var(--color-text-primary)]">
                  Notepedia<span className="text-violet-500 font-extrabold">X</span>
                </span>
              </div>
              <span className="block text-[10px] font-medium text-[var(--color-text-muted)] tracking-wider">
                Doubt Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                className="btn-ghost !p-1.5 hidden lg:flex text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            )}

            <button
              type="button"
              className="btn-ghost !p-1.5 lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              onClick={onClose}
              aria-label="Close past doubts sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>

        {/* New Doubt Button */}
        <div className="px-3 py-1.5">
          <button
            type="button"
            onClick={() => {
              onNew();
              onClose();
            }}
            className="group relative flex w-full items-center justify-between rounded-xl bg-[#17171F] border border-[#292932] px-3.5 py-2.5 text-xs font-medium text-[var(--color-text-primary)] shadow-sm transition-all duration-200 hover:border-violet-500/50 hover:bg-[#1E1E28] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <div className="grid h-5 w-5 place-items-center rounded-lg bg-violet-500/15 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <Plus size={14} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-xs">New doubt</span>
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
              <Command size={10} /> K
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="px-3 py-1.5">
          <div
            className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Search size={13} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Doubt History List */}
        <nav
          className="flex-1 space-y-3.5 overflow-y-auto px-2 pb-3 pt-1 text-xs"
          aria-label="History groups"
        >
          {!hydrated ? (
            <div className="space-y-2 px-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div
              className="mx-2 mt-6 rounded-2xl border border-dashed p-5 text-center text-xs"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Sparkles size={20} className="mx-auto mb-2 text-violet-400 opacity-80" />
              <p className="font-medium text-[var(--color-text-primary)]">
                {searchQuery ? 'No matching doubts' : 'No doubts yet'}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                {searchQuery
                  ? 'Try searching with different keywords.'
                  : 'Ask your first academic doubt to start learning!'}
              </p>
            </div>
          ) : (
            Object.entries(groupedChats).map(([groupTitle, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {groupTitle}
                  </p>

                  <div className="space-y-0.5">
                    {items.map((c) => {
                      const isActive = c.id === activeId;
                      const isEditing = editingId === c.id;
                      const isConfirmingDelete = confirmDeleteId === c.id;
                      const isMenuOpen = menuOpenId === c.id;
                      const meta = getSubjectMeta(c.subject, c.title || '');

                      return (
                        <div
                          key={c.id}
                          className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition duration-150 ${
                            isActive
                              ? 'bg-violet-500/10 text-[var(--color-text-primary)] font-medium border-l-[3px] border-l-violet-500 rounded-l-none'
                              : 'text-[var(--color-text-secondary)] hover:bg-white/[0.04] hover:text-[var(--color-text-primary)]'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex w-full items-center gap-1.5">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(e, c.id);
                                  if (e.key === 'Escape') handleCancelRename(e);
                                }}
                                autoFocus
                                className="w-full rounded-md border border-violet-500/60 bg-black/30 px-2 py-1 text-xs outline-none text-[var(--color-text-primary)]"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleSaveRename(e, c.id)}
                                className="text-emerald-400 hover:text-emerald-300 p-1"
                                aria-label="Save title"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelRename}
                                className="text-rose-400 hover:text-rose-300 p-1"
                                aria-label="Cancel rename"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : isConfirmingDelete ? (
                            <div className="flex w-full items-center justify-between gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                              <span>Delete chat?</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleConfirmDelete(e, c.id)}
                                  className="font-semibold text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded hover:bg-rose-500/20"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelDelete}
                                  className="text-[var(--color-text-muted)] hover:text-white px-1.5 py-0.5 rounded"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelect(c.id);
                                  onClose();
                                }}
                                aria-current={isActive ? 'true' : undefined}
                                className="min-w-0 flex-1 text-left pr-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: meta.color }}
                                  />
                                  <span className="truncate text-xs leading-tight font-medium">
                                    {c.title || 'Untitled doubt'}
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 pl-3.5 text-[10px] text-[var(--color-text-muted)]">
                                  <span
                                    className="inline-block rounded px-1 py-0.2 font-semibold uppercase tracking-wider text-[9px]"
                                    style={{
                                      backgroundColor: meta.bgLight,
                                      color: meta.textColor,
                                      borderColor: meta.borderLight,
                                      borderWidth: '1px',
                                    }}
                                  >
                                    {meta.name}
                                  </span>
                                  <span>·</span>
                                  <span>{formatRelativeTime(c.updatedAt || c.createdAt || Date.now())}</span>
                                </div>
                              </button>

                              {/* Three-dot dropdown menu / hover buttons */}
                              <div className="relative" ref={isMenuOpen ? menuRef : null}>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(isMenuOpen ? null : c.id);
                                    }}
                                    className="rounded p-1 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-primary)]"
                                    aria-label="Conversation options"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                </div>

                                {isMenuOpen && (
                                  <div
                                    className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl border p-1 shadow-xl backdrop-blur-xl animate-scaleIn"
                                    style={{
                                      background: 'var(--color-bg-elevated)',
                                      borderColor: 'var(--color-border)',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartRename(e, c)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-[var(--color-text-primary)] transition"
                                    >
                                      <Edit2 size={12} />
                                      <span>Rename</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteClick(e, c.id)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 transition"
                                    >
                                      <Trash2 size={12} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </nav>

        {/* Footer with User Avatar, Plan & Settings */}
        <div
          className="border-t p-3 relative"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white shadow">
                NP
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                  Student Demo
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="truncate text-[10px] text-[var(--color-text-muted)] font-medium">
                    Free Plan · Groq AI
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className={`btn-ghost !p-1.5 rounded-lg transition ${
                showSettings
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Settings Popover */}
          {showSettings && (
            <div
              className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl animate-scaleIn z-50"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  Preferences
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-[var(--color-text-muted)] hover:text-white p-0.5"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="mt-2.5 space-y-2 text-[11px] text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Engine Inference</span>
                  <span className="font-mono text-violet-400 font-semibold">Groq LPU</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>New doubt shortcut</span>
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] border border-white/10">
                    ⌘K / Ctrl+K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Send doubt shortcut</span>
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] border border-white/10">
                    Enter
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>New line shortcut</span>
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] border border-white/10">
                    Shift+Enter
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
