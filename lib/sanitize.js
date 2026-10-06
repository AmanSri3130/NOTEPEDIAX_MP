/**
 * Input sanitisation helpers (server side).
 * HTML is stripped from prose, but fenced/inline code is preserved so that
 * students can still ask about things like `<div>` or JSX.
 */

const TAG_RE = /<\/?[a-zA-Z!][^>]*>/g;
const DANGEROUS_BLOCK_RE = /<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi;
// Splits text into [prose, code, prose, code, ...] (code = ```fences``` or `inline`)
const CODE_SPLIT_RE = /(```[\s\S]*?```|`[^`\n]+`)/g;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripHtml(text) {
  return text
    .split(CODE_SPLIT_RE)
    .map((part, i) => {
      if (i % 2 === 1) return part; // code segment – leave untouched
      return part.replace(DANGEROUS_BLOCK_RE, '').replace(TAG_RE, '');
    })
    .join('');
}

export function cleanText(text, maxChars) {
  if (typeof text !== 'string') return '';
  let out = text.replace(CONTROL_RE, '');
  out = stripHtml(out).trim();
  if (maxChars && out.length > maxChars) out = out.slice(0, maxChars);
  return out;
}
