import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { puter } from '@heyputer/puter.js';

export default function TranslatorOutput({ prompt }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const translateNotes = async () => {
      try {
        const promptText = `Translate the following text into the requested Indian regional language (Hindi, Marathi, Telugu, Tamil, Bengali). If no language is explicitly mentioned, translate it to Hindi. Output only the translation, nothing else:\n\n${prompt}`;
        
        // Puter AI Chat Call
        const translation = await puter.ai.chat(promptText, { model: "gpt-5.4-nano" });
        
        if (isMounted) {
          // Puter chat usually returns a string or an object depending on the implementation
          // but based on the user's snippet, it returns the text directly in the promise.
          setOutput(typeof translation === 'string' ? translation : translation?.message?.content || String(translation));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setOutput('Error translating notes. Please check Puter integration.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    translateNotes();
    return () => { isMounted = false; };
  }, [prompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Translation copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-violet-500/10 text-violet-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-violet-500/20">
            <Sparkles className="h-3 w-3" /> Puter.js AI Translator
          </span>
          <span className="text-[11px] text-brand-muted font-mono">{loading ? 'Translating via Puter...' : '100% Translated'}</span>
        </div>
        
        {!loading && output && (
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
      
      <div className="p-4 rounded-xl border border-brand-border bg-brand-card/60 relative overflow-hidden text-sm text-brand-body leading-relaxed max-h-[500px] overflow-y-auto">
        {loading && !output ? (
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs">
             <Brain className="animate-pulse h-4 w-4" /> Converting to regional dialect...
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-violet-400 prose-a:text-violet-500 prose-strong:text-brand-text prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-brand-border prose-th:border prose-th:border-brand-border prose-th:bg-brand-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {output}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
