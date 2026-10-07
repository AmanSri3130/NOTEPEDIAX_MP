import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Sparkles, Zap } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { VoiceWaveform } from './VoiceWaveform';

/**
 * Bottom Interactive Input Box
 */
export const ChatInput = ({ onSendMessage, isStreaming, onStopStreaming }) => {
  const [text, setText] = useState('');
  const [contextChip, setContextChip] = useState(true);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const textareaRef = useRef(null);

  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="npx-input-bar p-3 select-none relative z-20 shrink-0">
      {/* Quick Action Presets Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {contextChip && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
              <Sparkles size={11} />
              FastAPI Context Active
              <button
                type="button"
                onClick={() => setContextChip(false)}
                className="hover:text-cyan-500 ml-0.5"
                title="Remove context"
              >
                ×
              </button>
            </span>
          )}

          {isListening && <VoiceWaveform />}
        </div>

        {/* Quick Menu Toggle */}
        <button
          type="button"
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className="text-[11px] font-medium npx-text-muted hover:text-cyan-500 flex items-center gap-1 transition-colors"
        >
          <Zap size={12} className="text-amber-500" />
          <span>Quick Commands</span>
        </button>
      </div>

      {/* Quick Action Menu Popup */}
      {quickMenuOpen && (
        <div className="mb-2 p-2 rounded-xl bg-slate-800 border border-cyan-500/30 grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setText('Summarize my overall learning progress and recommend 3 focused study steps.');
              setQuickMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-left text-slate-200"
          >
            📊 Summarize Progress
          </button>
          <button
            type="button"
            onClick={() => {
              setText('Create a 5-question practice quiz based on my weak topics with answer explanations.');
              setQuickMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-left text-slate-200"
          >
            🎯 Practice Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setText('Explain the core concepts behind my highest priority revision due topic.');
              setQuickMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-left text-slate-200"
          >
            📖 Revision Breakdown
          </button>
          <button
            type="button"
            onClick={() => {
              setText('Provide step-by-step calculus integration rules with clear examples.');
              setQuickMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-left text-slate-200"
          >
            🧮 Math Step-by-Step
          </button>
        </div>
      )}

      {/* Main Form Input Box */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="npx-textarea-box flex-1 relative rounded-2xl p-2 transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI companion anything... (Shift+Enter for newline)"
            className="w-full bg-transparent text-sm resize-none outline-none font-sans px-2 py-1 max-h-28 overflow-y-auto npx-scrollbar npx-text-primary placeholder:text-slate-400"
          />

          {/* Voice Input Button */}
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-3 bottom-2.5 p-1.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse'
                  : 'npx-text-muted hover:text-cyan-500 hover:bg-slate-500/10'
              }`}
              title={isListening ? 'Stop Voice Recording' : 'Speak Prompt (Voice Input)'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>

        {/* Send or Stop Stream Button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStreaming}
            className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95 shrink-0"
            title="Stop generating response"
          >
            <Square size={16} className="fill-white" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0 ${
              text.trim()
                ? 'bg-gradient-to-r from-purple-600 via-cyan-500 to-indigo-600 text-white shadow-cyan-500/30 hover:scale-105'
                : 'bg-slate-400/20 text-slate-400 border border-slate-400/20 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send size={16} className={text.trim() ? 'ml-0.5' : ''} />
          </button>
        )}
      </form>
    </div>
  );
};
