'use client';
import { Children, isValidElement, useState } from 'react';
import { CheckIcon, CopyIcon } from './Icons';

/** Recursively pulls plain text out of React children (rehype-highlight wraps tokens in spans). */
function extractText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) return extractText(node.props.children);
  return '';
}

/** Renders a fenced code block with a language label and copy button. */
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
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked – ignore */
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--code-bg))' }}>
      <div className="flex items-center justify-between px-3 py-1.5 text-xs" style={{ background: 'rgb(var(--code-head))', color: 'rgb(var(--muted))' }}>
        <span className="font-mono uppercase tracking-wide">{lang}</span>
        <button type="button" onClick={copy} className="btn-ghost !px-2 !py-1" aria-label={copied ? 'Code copied' : 'Copy code'}>
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.82rem] leading-relaxed">{children}</pre>
    </div>
  );
}
