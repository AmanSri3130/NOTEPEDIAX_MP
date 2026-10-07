'use client';
import { Children, isValidElement, useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

/** Recursively pulls plain text out of React children */
function extractText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) return extractText(node.props?.children);
  return '';
}

/**
 * Fenced code block with mac-like header, language badge, copy status, and clean styling.
 */
export default function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const codeEl = Children.toArray(children).find(isValidElement);
  const className = codeEl?.props?.className || '';
  const lang = (className.match(/language-([\w-]+)/) || [])[1] || 'code';
  const text = extractText(codeEl?.props?.children).replace(/\n$/, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div
      className="my-3.5 overflow-hidden rounded-2xl border shadow-md"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--code-bg)',
      }}
    >
      {/* Code block header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2 text-xs"
        style={{
          background: 'var(--code-head)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-violet-400" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {lang}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          className="btn-ghost !px-2.5 !py-1 text-[11px] hover:text-white rounded-lg"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents */}
      <pre className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed font-mono">
        {children}
      </pre>
    </div>
  );
}
