'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LIMITS } from '@/lib/config';
import { prepareImage } from '@/lib/image';
import { useSpeech } from '@/hooks/useSpeech';
import { CloseIcon, ImageIcon, MicIcon, SendIcon, StopIcon } from './Icons';

/**
 * Sticky input bar: multi-line textarea (Enter = send, Shift+Enter = newline),
 * image upload with preview, voice dictation, send / stop button.
 */
export default function Composer({ streaming, onSend, onStop, onToast, prefill, onPrefillConsumed }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null); // data URL
  const [busyImage, setBusyImage] = useState(false);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const baseTextRef = useRef('');

  const speech = useSpeech({
    onTranscript: (t) => setText((baseTextRef.current + ' ' + t).trim().slice(0, LIMITS.maxMessageChars)),
    onError: (code) =>
      onToast('error', code === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice input failed. Please try again.'),
  });

  // Auto-grow textarea (max ~8 lines)
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  // Example prompts / external prefill
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
    }
  };

  const onKeyDown = (e) => {
    // `isComposing` protects IME users (Hindi/Japanese keyboards) from accidental sends.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const onPaste = (e) => {
    const file = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith('image/'));
    if (file) {
      e.preventDefault();
      attach(file);
    }
  };

  const toggleMic = () => {
    baseTextRef.current = text;
    speech.toggle();
  };

  const nearLimit = text.length > LIMITS.maxMessageChars * 0.85;
  const canSend = (text.trim() || image) && !streaming && !busyImage;

  return (
    <div className="border-t px-3 pb-3 pt-2 backdrop-blur sm:px-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--bg) / 0.85)' }}>
      <div className="mx-auto max-w-3xl">
        {(image || busyImage) && (
          <div className="mb-2 flex items-start gap-2">
            {busyImage ? (
              <div className="skeleton h-20 w-20" aria-label="Processing image" />
            ) : (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Preview of the question image you will send" className="h-20 w-20 rounded-xl border object-cover" style={{ borderColor: 'rgb(var(--border))' }} />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Remove image"
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="card flex items-end gap-1 p-2 shadow-lg focus-within:border-brand-400">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => attach(e.target.files?.[0])} aria-label="Upload image" />
          <button type="button" className="btn-ghost !p-2.5" onClick={() => fileRef.current?.click()} disabled={streaming} aria-label="Attach a photo of your question (JPG or PNG, max 5 MB)" title="Attach image (JPG/PNG, max 5 MB)">
            <ImageIcon />
          </button>

          <label htmlFor="doubt-input" className="sr-only">Type your doubt</label>
          <textarea
            id="doubt-input"
            ref={taRef}
            value={text}
            rows={1}
            maxLength={LIMITS.maxMessageChars}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={speech.listening ? 'Listening… speak your doubt' : 'Ask your doubt… (Enter to send, Shift+Enter for new line)'}
            className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[0.95rem] outline-none placeholder:text-[rgb(var(--muted))]"
            style={{ color: 'rgb(var(--text))' }}
          />

          {speech.supported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={streaming}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? 'Stop voice input' : 'Start voice input'}
              className={`btn-ghost !p-2.5 ${speech.listening ? '!bg-red-500/15 !text-red-500 animate-pulse' : ''}`}
            >
              <MicIcon />
            </button>
          )}

          {streaming ? (
            <button type="button" onClick={onStop} aria-label="Stop generating" className="flex h-11 items-center gap-1.5 rounded-xl bg-red-500 px-3.5 text-sm font-semibold text-white shadow transition hover:bg-red-600 active:scale-95">
              <StopIcon size={16} /> <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send doubt"
              className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <SendIcon size={18} />
            </button>
          )}
        </div>

        <div className="mt-1 flex justify-between px-1 text-[11px]" style={{ color: 'rgb(var(--muted))' }}>
          <span>AI can make mistakes — verify important answers.</span>
          {nearLimit && <span className="text-amber-500">{text.length}/{LIMITS.maxMessageChars}</span>}
        </div>
      </div>
    </div>
  );
}
