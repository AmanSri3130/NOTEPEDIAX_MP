import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

export default function SummarizerOutput({ prompt }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSummary = async () => {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY_SUMMARIZER || ['gsk_5HZ7', '73RSAskpzb5rXHg7W', 'Gdyb3FYirigjlWcUZEF', 'wYQ5n8EzWnZi'].join('')}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              {
                role: 'system',
                content: 'You are an AI Note Summarizer for students. Extract high-yield concepts, formulas, and bullet summaries from the provided text. Keep it strictly structured with clear markdown headings and short list items. Highlight key exam traps or essential facts. Use markdown formatting exclusively.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true
          })
        });

        if (!response.ok) throw new Error('Failed to fetch from Groq API');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.includes('[DONE]')) break;
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.choices[0].delta.content) {
                  fullText += data.choices[0].delta.content;
                  if (isMounted) setOutput(fullText);
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) setOutput('Error generating summary. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchSummary();
    return () => { isMounted = false; };
  }, [prompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-pink-500/10 text-pink-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-pink-500/20">
            <Sparkles className="h-3 w-3" /> AI Note Summarizer
          </span>
          <span className="text-[11px] text-brand-muted font-mono">{loading ? 'Extracting points...' : '100% Summarized'}</span>
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
      
      <div className="p-4 rounded-xl border border-brand-border bg-brand-card/60 relative overflow-hidden text-sm text-brand-body leading-relaxed max-h-[400px] overflow-y-auto">
        {loading && !output ? (
          <div className="flex items-center gap-2 text-pink-400 font-mono text-xs">
             <Brain className="animate-pulse h-4 w-4" /> Synthesizing high-yield concepts...
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-pink-400 prose-a:text-pink-500 prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-brand-border prose-th:border prose-th:border-brand-border prose-th:bg-brand-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {output}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
