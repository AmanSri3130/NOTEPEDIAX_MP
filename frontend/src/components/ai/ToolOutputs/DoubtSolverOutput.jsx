import React, { useState, useEffect } from 'react';
import { Sparkles, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DoubtSolverOutput({ prompt }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDoubt = async () => {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: 'You are an AI Doubt Solver for students. Break down the user\'s doubt into clear, step-by-step mathematical or logical reasoning. Keep the format structured and professional. Use markdown.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch from Groq API');
        }
        
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
        if (isMounted) setOutput('Error generating response. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchDoubt();
    return () => { isMounted = false; };
  }, [prompt]);

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-indigo-500/10 text-indigo-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-indigo-500/20">
            <Sparkles className="h-3 w-3" /> AI Doubt Solver
          </span>
          <span className="text-[11px] text-brand-muted font-mono">{loading ? 'Thinking...' : '100% Solved'}</span>
        </div>
      </div>
      
      <div className="p-4 rounded-xl border border-brand-border bg-brand-card/60 relative overflow-hidden text-sm text-brand-body leading-relaxed max-h-[400px] overflow-y-auto">
        {loading && !output ? (
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
             <Brain className="animate-pulse h-4 w-4" /> Analyzing your doubt step-by-step...
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-indigo-400 prose-a:text-indigo-500">
            <ReactMarkdown>
              {output}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
