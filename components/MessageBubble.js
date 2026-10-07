'use client';
import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import Markdown from './Markdown';
import { getSubjectMeta } from '@/lib/subjects';

/** Minimal Claude/ChatGPT-style bouncing thinking state */
function ThinkingState() {
  return (
    <div role="status" aria-label="AI is thinking" className="space-y-3 py-1">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounceDot rounded-full bg-violet-400"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-[var(--color-text-muted)] animate-pulse">
          Thinking through your doubt…
        </span>
      </div>
      <div className="skeleton h-3 w-64 max-w-full rounded-md" />
      <div className="skeleton h-3 w-48 max-w-full rounded-md" />
    </div>
  );
}

/**
 * Message Bubble: Clean ChatGPT/Claude conversation layout with spacious reading width,
 * rich Markdown formatting, copy/regenerate/save actions, and subject badges.
 */
export default function MessageBubble({
  message,
  question,
  disabled,
  onRegenerate,
  onFeedback,
  onSave,
  onToast,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex animate-fadeIn justify-end my-2">
        <div
          className="max-w-[88%] sm:max-w-[75%] rounded-3xl rounded-tr-sm px-4 py-3 text-[var(--color-text-primary)] shadow-sm"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          {message.imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imagePreview}
              alt="Uploaded question"
              className="mb-2 max-h-56 rounded-2xl border border-white/10 object-contain shadow"
            />
          )}
          {message.hasImage && !message.imagePreview && (
            <div className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
              <ImageIcon size={12} /> Image attached
            </div>
          )}
          <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onToast?.('success', 'Explanation copied to clipboard!');
    } catch {
      onToast?.('error', 'Could not copy. Please select text manually.');
    }
  };

  const showActions = !message.streaming && message.content && !message.error;
  const subjectMeta = getSubjectMeta(message.subject, message.content || question || '');

  return (
    <div className="group relative flex animate-fadeIn gap-3 sm:gap-4 text-left my-4">
      {/* AI Avatar */}
      <div
        className="mt-0.5 grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white shadow-md shadow-violet-500/20"
        aria-hidden="true"
      >
        <Sparkles size={15} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Header line */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            NotepediaX AI
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: subjectMeta.bgLight,
              color: subjectMeta.textColor,
              borderColor: subjectMeta.borderLight,
              borderWidth: '1px',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: subjectMeta.color }}
            />
            {subjectMeta.name}
          </span>
          {message.level && message.level !== 'Normal' && (
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
              · {message.level}
            </span>
          )}
        </div>

        {/* AI Answer Container */}
        <div
          className="rounded-3xl border p-4 sm:p-5 shadow-sm transition-all duration-200"
          style={{
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {message.error ? (
            <div
              role="alert"
              className="flex flex-col gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-400"
            >
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} />
                <span>{message.error}</span>
              </div>
              <button
                type="button"
                onClick={() => onRegenerate(message.id)}
                disabled={disabled}
                className="btn-ghost w-fit !border !border-rose-500/30 !bg-rose-500/10 !text-rose-400 hover:!bg-rose-500/20 active:scale-95"
              >
                <RotateCcw size={13} /> Try again
              </button>
            </div>
          ) : message.streaming && !message.content ? (
            <ThinkingState />
          ) : (
            <Markdown streaming={message.streaming}>{message.content}</Markdown>
          )}

          {message.stopped && (
            <p className="mt-2.5 text-xs italic text-[var(--color-text-muted)]">
              Generation stopped.
            </p>
          )}
          {message.interrupted && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={13} />
              <span>Connection interrupted — this explanation may be incomplete.</span>
            </div>
          )}
        </div>

        {/* Action bar */}
        {(showActions || message.interrupted) && (
          <div
            className="mt-2 flex flex-wrap items-center gap-1 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
            role="group"
            aria-label="Answer actions"
          >
            <button
              type="button"
              className="btn-ghost !py-1 !px-2.5 text-[11px] rounded-lg"
              onClick={copy}
              aria-label="Copy answer to clipboard"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-ghost !py-1 !px-2.5 text-[11px] rounded-lg"
              onClick={() => onRegenerate(message.id)}
              disabled={disabled}
              aria-label="Regenerate this answer"
            >
              <RotateCcw size={13} />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              className="btn-ghost !py-1 !px-2.5 text-[11px] rounded-lg"
              onClick={() => onSave(message, question)}
              aria-label="Save answer to my notes"
            >
              <Bookmark size={13} />
              <span>Save to notes</span>
            </button>

            <span className="mx-1 h-3.5 w-px bg-white/10" />

            <button
              type="button"
              className={`btn-ghost !p-1.5 rounded-lg text-[11px] ${
                message.feedback === 'up'
                  ? '!text-emerald-400 !bg-emerald-500/15 ring-1 ring-emerald-500/30'
                  : ''
              }`}
              onClick={() => onFeedback(message.id, 'up')}
              aria-pressed={message.feedback === 'up'}
              aria-label="Good answer"
              title="Helpful"
            >
              <ThumbsUp size={13} />
            </button>

            <button
              type="button"
              className={`btn-ghost !p-1.5 rounded-lg text-[11px] ${
                message.feedback === 'down'
                  ? '!text-rose-400 !bg-rose-500/15 ring-1 ring-rose-500/30'
                  : ''
              }`}
              onClick={() => onFeedback(message.id, 'down')}
              aria-pressed={message.feedback === 'down'}
              aria-label="Bad answer"
              title="Not helpful"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
