'use client';
import { useState } from 'react';
import Markdown from './Markdown';
import { BookmarkIcon, CheckIcon, CopyIcon, RefreshIcon, SparkIcon, ThumbDownIcon, ThumbUpIcon } from './Icons';

/** Three bouncing dots + skeleton lines shown before the first token arrives. */
function Typing() {
  return (
    <div role="status" aria-label="AI is thinking" className="space-y-2.5 py-1">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-bounceDot rounded-full bg-brand-400" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
        <span className="ml-2 text-xs" style={{ color: 'rgb(var(--muted))' }}>Thinking…</span>
      </div>
      <div className="skeleton h-3 w-64 max-w-full" />
      <div className="skeleton h-3 w-48 max-w-full" />
    </div>
  );
}

export default function MessageBubble({ message, question, disabled, onRegenerate, onFeedback, onSave, onToast }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex animate-slideUp justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2.5 text-white shadow-md sm:max-w-[75%]">
          {message.imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={message.imagePreview} alt="Question you uploaded" className="mb-2 max-h-56 rounded-lg object-contain" />
          )}
          {message.hasImage && !message.imagePreview && (
            <div className="mb-1 text-xs opacity-80">📷 Image attached</div>
          )}
          <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      onToast('error', 'Could not copy. Please select the text manually.');
    }
  };

  const showActions = !message.streaming && message.content && !message.error;

  return (
    <div className="flex animate-slideUp gap-3">
      <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-fuchsia-500 text-white shadow" aria-hidden>
        <SparkIcon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="card rounded-tl-md px-4 py-3 sm:px-5">
          {message.error ? (
            <div role="alert" className="flex flex-col gap-2 text-sm text-red-600 dark:text-red-300">
              <span>⚠️ {message.error}</span>
              <button type="button" onClick={() => onRegenerate(message.id)} disabled={disabled} className="btn-ghost w-fit !text-red-600 dark:!text-red-300">
                <RefreshIcon size={14} /> Try again
              </button>
            </div>
          ) : message.streaming && !message.content ? (
            <Typing />
          ) : (
            <Markdown streaming={message.streaming}>{message.content}</Markdown>
          )}
          {message.stopped && <p className="mt-2 text-xs italic" style={{ color: 'rgb(var(--muted))' }}>Generation stopped.</p>}
          {message.interrupted && (
            <p className="mt-2 text-xs italic text-amber-600 dark:text-amber-400">Connection dropped — this answer may be incomplete.</p>
          )}
        </div>

        {(showActions || message.interrupted) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-0.5" role="group" aria-label="Answer actions">
            <button type="button" className="btn-ghost" onClick={copy} aria-label="Copy answer">
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => onRegenerate(message.id)} disabled={disabled} aria-label="Regenerate answer">
              <RefreshIcon size={14} /> Regenerate
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onSave(message, question)}
              aria-label="Save answer to my notes"
            >
              <BookmarkIcon size={14} /> Save to notes
            </button>
            <span className="mx-1 h-4 w-px" style={{ background: 'rgb(var(--border))' }} />
            <button
              type="button"
              className={`btn-ghost ${message.feedback === 'up' ? '!text-emerald-500' : ''}`}
              onClick={() => onFeedback(message.id, 'up')}
              aria-pressed={message.feedback === 'up'}
              aria-label="Good answer"
            >
              <ThumbUpIcon size={14} />
            </button>
            <button
              type="button"
              className={`btn-ghost ${message.feedback === 'down' ? '!text-red-500' : ''}`}
              onClick={() => onFeedback(message.id, 'down')}
              aria-pressed={message.feedback === 'down'}
              aria-label="Bad answer"
            >
              <ThumbDownIcon size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
