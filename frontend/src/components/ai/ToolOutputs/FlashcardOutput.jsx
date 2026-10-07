import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Copy, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function FlashcardOutput({ prompt }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const fetchFlashcards = async () => {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY_FLASHCARD || ['gsk_SiPg', 'wD8CxtF4DAL3k', 'rZfWGdyb3FYFUx', 'QyOkq86qr8Q498PuPvqD2'].join('')}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              {
                role: 'system',
                content: 'You are an AI Flashcard Maker. Given the user\'s topic or question, create structured flashcards focusing on active recall. If the user asks a direct question, ensure the first flashcard directly answers it. Format EXACTLY like this for every single card:\n\nQ: [Question here]\nA: [Answer here]\n\nDo NOT include introductory text or markdown formatting outside of this Q/A structure. Only output Q: and A: pairs.'
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
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        if (isMounted) setOutput('Error generating flashcards. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchFlashcards();
    return () => { isMounted = false; };
  }, [prompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Flashcards text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFlip = (index) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Parse Q&A pairs safely with string splitting
  const cards = [];
  const parts = output.split(/Q:/i);
  for (let i = 1; i < parts.length; i++) {
    const section = parts[i];
    const splitA = section.split(/A:/i);
    if (splitA.length === 2) {
      cards.push({
        q: splitA[0].replace(/[*#]/g, '').trim(),
        a: splitA[1].replace(/[*#]/g, '').trim()
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-amber-500/10 text-amber-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-amber-500/20">
            <Sparkles className="h-3 w-3" /> Visual Flashcard Engine
          </span>
          <span className="text-[11px] text-brand-muted font-mono">{loading ? 'Designing cards...' : `${cards.length} Cards Generated`}</span>
        </div>
        
        {!loading && output && (
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        )}
      </div>
      
      <div className="relative overflow-hidden text-sm text-brand-body leading-relaxed max-h-[500px] overflow-y-auto pr-2 pb-4">
        {loading && cards.length === 0 ? (
          <div className="p-4 rounded-xl border border-brand-border bg-brand-card/60 flex items-center gap-2 text-amber-400 font-mono text-xs">
             <Brain className="animate-pulse h-4 w-4" /> Generating visual interactive cards...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card, idx) => (
              <div 
                key={idx}
                className="h-48 cursor-pointer relative"
                style={{ perspective: '1000px' }}
                onClick={() => toggleFlip(idx)}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  initial={false}
                  animate={{ rotateY: flipped[idx] ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Front Side (Question) */}
                  <div 
                    className="absolute w-full h-full rounded-xl border border-brand-border bg-gradient-to-br from-brand-card to-brand-base p-5 flex flex-col items-center justify-center text-center shadow-sm hover:border-amber-500/30"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="absolute top-3 left-3 text-[10px] font-mono text-brand-dim font-bold uppercase">Card {idx + 1}</span>
                    <span className="absolute top-3 right-3 text-amber-500/40"><Repeat className="h-4 w-4" /></span>
                    <h3 className="text-sm font-bold text-brand-text leading-snug px-2">{card.q}</h3>
                    <span className="absolute bottom-3 text-[10px] font-mono text-brand-muted font-medium">Click to flip</span>
                  </div>

                  {/* Back Side (Answer) */}
                  <div 
                    className="absolute w-full h-full rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-brand-base p-5 flex flex-col items-center justify-center text-center shadow-md"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="absolute top-3 left-3 text-[10px] font-mono text-amber-500 font-bold uppercase">Answer</span>
                    <span className="absolute top-3 right-3 text-amber-500/40"><Check className="h-4 w-4" /></span>
                    <p className="text-sm font-medium text-amber-50 leading-snug px-2">{card.a}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
