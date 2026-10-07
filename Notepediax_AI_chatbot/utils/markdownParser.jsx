import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

/**
 * Code Block component with Copy functionality
 */
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="npx-code-block-container my-3 rounded-xl overflow-hidden font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10 text-slate-300 font-sans text-xs select-none">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-cyan-400" />
          <span className="capitalize font-semibold text-slate-200">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all duration-200 text-xs border border-white/10"
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
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed whitespace-pre font-mono text-slate-100 bg-[#0d1117]">
        <code>{code}</code>
      </div>
    </div>
  );
};

/**
 * Custom Markdown Parser for formatted AI Chat messages
 */
export const FormattedMarkdown = ({ content }) => {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'text',
      value: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  const renderFormattedText = (textStr) => {
    const lines = textStr.split('\n');

    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={lineIdx} className="h-2" />;

      // Header 3: ### Title
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={lineIdx} className="text-base font-bold mt-3 mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-cyan-500 inline-block" />
            {parseInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        );
      }

      // Header 2: ## Title
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={lineIdx} className="text-lg font-bold mt-4 mb-2 border-b border-slate-500/20 pb-1">
            {parseInlineFormatting(trimmed.replace('## ', ''))}
          </h2>
        );
      }

      // Header 1: # Title
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={lineIdx} className="text-xl font-extrabold mt-4 mb-2">
            {parseInlineFormatting(trimmed.replace('# ', ''))}
          </h1>
        );
      }

      // Bullet List: - item or * item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.substring(2);
        return (
          <div key={lineIdx} className="npx-bullet-item flex items-start gap-2.5 my-1 pl-2 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
            <span>{parseInlineFormatting(bulletText)}</span>
          </div>
        );
      }

      // Numbered List: 1. item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={lineIdx} className="npx-bullet-item flex items-start gap-2.5 my-1 pl-2 leading-relaxed">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
              {numMatch[1]}
            </span>
            <span>{parseInlineFormatting(numMatch[2])}</span>
          </div>
        );
      }

      // Standard Paragraph
      return (
        <p key={lineIdx} className="my-1.5 leading-relaxed font-sans text-sm">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  const parseInlineFormatting = (str) => {
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = str.split(inlineRegex);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="npx-inline-code px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[12px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="npx-markdown-body space-y-1">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} language={part.language} code={part.value} />;
        }
        return <React.Fragment key={idx}>{renderFormattedText(part.value)}</React.Fragment>;
      })}
    </div>
  );
};
