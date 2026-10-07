'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Mic, MicOff, ArrowUp, Square, X, Loader2 } from 'lucide-react';
import { LIMITS } from '@/lib/config';
import { prepareImage } from '@/lib/image';
import { useSpeech } from '@/hooks/useSpeech';
import { LevelToggle, SubjectDropdown } from './Selectors';

/**
 * Premium floating AI composer with auto-expanding multiline textarea,
 * integrated attachment & voice tools, subject selector, and mode toggle.
 */
export default function Composer({
  streaming,
  onSend,
  onStop,
  onToast,
  subject,
  onSubjectChange,
  level,
  onLevelChange,
  prefill,
  onPrefillConsumed,
}) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [busyImage, setBusyImage] = useState(false);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const baseTextRef = useRef('');

  const speech = useSpeech({
    onTranscript: (t) =>
      setText((baseTextRef.current + ' ' + t).trim().slice(0, LIMITS.maxMessageChars)),
    onError: (code) =>
      onToast(
        'error',
        code === 'not-allowed'
          ? 'Microphone permission was denied.'
          : 'Voice input failed. Please try again.'
      ),
  });

  // Auto-grow textarea up to ~160px
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Handle external prefill (e.g. example clicks)
  useEffect(() => {
    if (prefill) {
      setText(prefill);
      taRef.current?.focus();
      onPrefillConsumed?.();
    }
  }, [prefill, onPrefillConsumed]);

  const attach = useCallback(
    async (file) => {
      if (!file) return;
      setBusyImage(true);
      try {
        setImage(await prepareImage(file));
      } catch (e) {
        onToast('error', e.message);
      } finally {
        setBusyImage(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [onToast]
  );

  const submit = async () => {
    if (streaming || busyImage) return;
    if (speech.listening) speech.stop();
    const ok = await onSend(text, image);
    if (ok) {
      setText('');
      setImage(null);
      if (taRef.current) {
        taRef.current.style.height = 'auto';
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) {
        submit();
      }
    }
  };

  const onPaste = (e) => {
    const file = [...(e.clipboardData?.files || [])].find((f) =>
      f.type.startsWith('image/')
    );
    if (file) {
      e.preventDefault();
      attach(file);
    }
  };

  const toggleMic = () => {
    baseTextRef.current = text;
    speech.toggle();
  };

  const charLimit80Percent = LIMITS.maxMessageChars * 0.8;
  const showCharCount = text.length > charLimit80Percent;
  const canSend = (text.trim().length > 0 || image) && !streaming && !busyImage;

  return (
    <div className="sticky bottom-0 z-20 px-3 pb-3 pt-2 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)] to-transparent sm:px-4">
      <div className="mx-auto max-w-3xl">
        {/* Floating Main Composer Container */}
        <div
          className="rounded-3xl border p-2.5 sm:p-3 transition-all duration-200 focus-within:border-violet-500/50 focus-within:shadow-[0_8px_30px_rgba(124,58,237,0.12)]"
          style={{
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Image preview thumbnail if attached */}
          {(image || busyImage) && (
            <div className="mb-2.5 flex items-center gap-2 px-1">
              {busyImage ? (
                <div className="skeleton flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-xs">
                  <Loader2 size={18} className="animate-spin text-violet-400" />
                </div>
              ) : (
                <div className="relative group inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Question attachment preview"
                    className="h-16 w-16 rounded-2xl border object-cover shadow-md transition group-hover:brightness-90"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label="Remove image"
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600 active:scale-95"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={(e) => attach(e.target.files?.[0])}
            aria-label="Upload question image"
          />

          {/* Multiline Textarea */}
          <label htmlFor="doubt-input" className="sr-only">
            Ask anything, or upload a question...
          </label>
          <textarea
            id="doubt-input"
            ref={taRef}
            value={text}
            rows={1}
            maxLength={LIMITS.maxMessageChars}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={
              speech.listening
                ? 'Listening… speak your academic doubt'
                : 'Ask anything, or upload a question...'
            }
            className="w-full resize-none bg-transparent px-2 pt-1 pb-1.5 text-[0.9375rem] leading-relaxed outline-none transition placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)]"
            style={{
              minHeight: '42px',
              maxHeight: '160px',
            }}
          />

          {/* Bottom Integrated Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 px-0.5">
            {/* Left Controls */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {/* Attachment Button */}
              <button
                type="button"
                className="btn-ghost !p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.06]"
                onClick={() => fileRef.current?.click()}
                disabled={streaming || busyImage}
                aria-label="Attach question image (JPG or PNG, max 5MB)"
                title="Attach image"
              >
                <ImageIcon size={18} strokeWidth={1.8} />
              </button>

              {/* Voice / Mic Button */}
              {speech.supported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={streaming}
                  aria-pressed={speech.listening}
                  aria-label={speech.listening ? 'Stop recording voice' : 'Start recording voice'}
                  title={speech.listening ? 'Stop voice input' : 'Voice input'}
                  className={`btn-ghost !p-2 rounded-xl transition-all ${
                    speech.listening
                      ? '!bg-rose-500/20 !text-rose-400 ring-2 ring-rose-500/40 animate-pulse'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.06]'
                  }`}
                >
                  {speech.listening ? (
                    <MicOff size={18} strokeWidth={2} />
                  ) : (
                    <Mic size={18} strokeWidth={1.8} />
                  )}
                </button>
              )}

              <div className="h-4 w-px bg-white/10 mx-0.5 hidden sm:block" />

              {/* Subject Dropdown */}
              <SubjectDropdown
                value={subject}
                onChange={onSubjectChange}
                disabled={streaming}
              />

              {/* Level Segmented Control */}
              <div className="hidden xs:block">
                <LevelToggle
                  value={level}
                  onChange={onLevelChange}
                  disabled={streaming}
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 ml-auto">
              {showCharCount && (
                <span className="text-[11px] font-mono text-amber-500 font-medium">
                  {text.length}/{LIMITS.maxMessageChars}
                </span>
              )}

              {streaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  aria-label="Stop generating response"
                  title="Stop generating"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/20 transition-all hover:bg-rose-600 hover:scale-105 active:scale-95"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend}
                  aria-label="Send question"
                  title={canSend ? 'Send (Enter)' : 'Type a question to send'}
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 ${
                    canSend
                      ? 'bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 hover:brightness-110 hover:shadow-violet-500/30 hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5 opacity-40'
                  }`}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Level Toggle on very small screens */}
        <div className="xs:hidden mt-2 flex justify-center">
          <LevelToggle
            value={level}
            onChange={onLevelChange}
            disabled={streaming}
          />
        </div>

        {/* Muted Disclaimer */}
        <div className="mt-1.5 text-center text-[10px] sm:text-[11px] text-[var(--color-text-muted)] tracking-tight">
          AI can make mistakes. Verify important formulas and answers with study materials.
        </div>
      </div>
    </div>
  );
}
