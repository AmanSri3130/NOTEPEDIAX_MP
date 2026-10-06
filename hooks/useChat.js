'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIMITS } from '@/lib/config';
import { addFeedback, loadChats, loadPrefs, saveChats, savePrefs } from '@/lib/storage';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const DEFAULT_IMAGE_PROMPT = 'Please solve the question in this image step by step.';

/**
 * All chat state + streaming logic lives here so UI components stay dumb.
 * `notesContext` is the note the student is currently viewing (optional).
 */
export function useChat({ notesContext, onToast }) {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [subject, setSubject] = useState('Auto-detect');
  const [level, setLevel] = useState('Normal');
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef(null);
  const busyRef = useRef(false); // synchronous guard against double-click sends
  const imagesRef = useRef(new Map()); // userMessageId -> dataUrl (memory only, for regenerate)
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const toast = useCallback((type, msg) => onToast?.(type, msg), [onToast]);

  // ---- hydrate from localStorage (client only) ----
  useEffect(() => {
    const stored = loadChats();
    setChats(stored);
    const prefs = loadPrefs();
    if (prefs.subject) setSubject(prefs.subject);
    if (prefs.level) setLevel(prefs.level);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePrefs({ subject, level });
  }, [subject, level, hydrated]);

  // ---- persist chats (not mid-stream, to avoid thrashing storage) ----
  useEffect(() => {
    if (hydrated && !streaming) saveChats(chats);
  }, [chats, streaming, hydrated]);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId]);

  const patchChat = useCallback((chatId, fn) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...fn(c), updatedAt: Date.now() } : c)));
  }, []);

  const patchMessage = useCallback(
    (chatId, msgId, patch) => {
      patchChat(chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)),
      }));
    },
    [patchChat]
  );

  /** Core: streams an answer for `history` (ending in a user message) into a new assistant message. */
  const runCompletion = useCallback(
    async (chatId, history, image) => {
      const assistantId = uid();
      patchChat(chatId, (c) => ({
        ...c,
        messages: [...c.messages, { id: assistantId, role: 'assistant', content: '', streaming: true, subject, level }],
      }));

      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      // Buffer chunks and flush on animation frames for smooth, cheap rendering.
      let buffer = '';
      let raf = null;
      const flush = () => {
        raf = null;
        if (!buffer) return;
        const piece = buffer;
        buffer = '';
        patchMessage(chatId, assistantId, (m) => ({ content: m.content + piece }));
      };
      const scheduleFlush = () => {
        if (raf == null) raf = requestAnimationFrame(flush);
      };

      const payload = {
        messages: history
          .filter((m) => m.content && !m.error)
          .slice(-LIMITS.maxHistoryMessages)
          .map(({ role, content }) => ({ role, content })),
        subject,
        level,
        ...(notesContext ? { notesContext } : {}),
        ...(image ? { imageBase64: image } : {}),
      };

      try {
        const res = await fetch('/api/doubt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          let message = 'Something went wrong. Please try again.';
          try {
            message = (await res.json()).error || message;
          } catch {}
          patchMessage(chatId, assistantId, { streaming: false, error: message, content: '' });
          toast('error', message);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          scheduleFlush();
        }
        buffer += decoder.decode();
        if (raf != null) cancelAnimationFrame(raf);
        flush();
        patchMessage(chatId, assistantId, { streaming: false });
      } catch (err) {
        if (raf != null) cancelAnimationFrame(raf);
        flush();
        if (err?.name === 'AbortError') {
          patchMessage(chatId, assistantId, { streaming: false, stopped: true });
        } else {
          // Network drop mid-stream (or before any bytes): keep whatever arrived.
          patchMessage(chatId, assistantId, (m) =>
            m.content
              ? { streaming: false, interrupted: true }
              : { streaming: false, error: 'Connection lost. Check your internet and try again.' }
          );
          toast('error', 'Connection lost. Check your internet and retry.');
        }
      } finally {
        abortRef.current = null;
        busyRef.current = false;
        setStreaming(false);
      }
    },
    [level, subject, notesContext, patchChat, patchMessage, toast]
  );

  /** Sends a new doubt. `image` is an optional data-URL. */
  const send = useCallback(
    async (rawText, image = null) => {
      if (busyRef.current) return false; // double-click / Enter spam guard
      const text = (rawText || '').trim();
      if (!text && !image) {
        toast('error', 'Please type your doubt first.');
        return false;
      }
      if (text.length > LIMITS.maxMessageChars) {
        toast('error', `Your message is too long (max ${LIMITS.maxMessageChars} characters).`);
        return false;
      }
      busyRef.current = true;

      const content = text || DEFAULT_IMAGE_PROMPT;
      const userMsg = { id: uid(), role: 'user', content, hasImage: !!image, imagePreview: image || undefined };
      if (image) imagesRef.current.set(userMsg.id, image);

      let chatId = activeId;
      let history;
      const existing = chatsRef.current.find((c) => c.id === chatId);
      if (existing) {
        history = [...existing.messages, userMsg];
        patchChat(chatId, (c) => ({ ...c, messages: [...c.messages, userMsg] }));
      } else {
        chatId = uid();
        history = [userMsg];
        const chat = {
          id: chatId,
          title: content.slice(0, 60),
          subject,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [userMsg],
        };
        setChats((prev) => [chat, ...prev]);
        setActiveId(chatId);
      }

      await runCompletion(chatId, history, image);
      return true;
    },
    [activeId, patchChat, runCompletion, subject, toast]
  );

  /** Re-asks the question that produced `assistantMsgId`, replacing that answer (and anything after it). */
  const regenerate = useCallback(
    async (assistantMsgId) => {
      if (busyRef.current || !activeChat) return;
      const idx = activeChat.messages.findIndex((m) => m.id === assistantMsgId);
      if (idx < 1) return;
      const history = activeChat.messages.slice(0, idx);
      if (history[history.length - 1]?.role !== 'user') return;
      busyRef.current = true;
      patchChat(activeChat.id, (c) => ({ ...c, messages: history }));
      await runCompletion(activeChat.id, history, imagesRef.current.get(history[history.length - 1].id) || null);
    },
    [activeChat, patchChat, runCompletion]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
  }, []);

  const selectChat = useCallback((id) => {
    abortRef.current?.abort();
    setActiveId(id);
  }, []);

  const deleteChat = useCallback(
    (id) => {
      if (id === activeId) abortRef.current?.abort();
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (id === activeId) setActiveId(null);
    },
    [activeId]
  );

  const setFeedback = useCallback(
    (msgId, value) => {
      if (!activeChat) return;
      const current = activeChat.messages.find((m) => m.id === msgId)?.feedback;
      const next = current === value ? null : value; // clicking again clears
      patchMessage(activeChat.id, msgId, { feedback: next });
      addFeedback({ messageId: msgId, chatId: activeChat.id, value: next, subject, level });
    },
    [activeChat, level, patchMessage, subject]
  );

  return {
    chats,
    activeChat,
    activeId,
    streaming,
    hydrated,
    subject,
    setSubject,
    level,
    setLevel,
    send,
    stop,
    regenerate,
    newChat,
    selectChat,
    deleteChat,
    setFeedback,
  };
}
