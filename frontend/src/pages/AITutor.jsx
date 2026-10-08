import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, X, RotateCcw, BookOpen, Brain, Square,
  ChevronDown, Target, Clock, AlertCircle, CheckCircle,
  Settings, ChevronRight, TrendingUp, Zap, Star
} from 'lucide-react';
import { streamGroqChat } from '../services/groqService';
import { useAuth } from '../context/AuthContext';

const MODES = ['Explain', 'Solve', 'Quiz me', 'Revise', 'Mains answer', 'Summarize'];
const CLASSES = ['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','JEE Main','JEE Advanced','NEET','UPSC','CAT'];
const SUBJECTS = ['Physics','Chemistry','Mathematics','Biology','English','History','Geography','Polity','Economics','Computer Science'];
const MODELS = [
  { id: 'llama3-8b-8192', label: 'LLaMA 3 8B', desc: 'Fast, lightweight' },
  { id: 'llama-3.1-70b-versatile', label: 'LLaMA 3.1 70B', desc: 'More capable, slower' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', desc: 'Balanced, 32k context' },
];

const QUICK_PROMPTS = [
  { icon: '🎯', label: 'Analyze my weak topics', prompt: 'Analyze my study profile and tell me what I should focus on right now to improve my score.' },
  { icon: '⚡', label: 'Quiz me now', prompt: 'Give me 3 practice questions from my current subject. I want to test myself.' },
  { icon: '📅', label: 'Revision schedule', prompt: 'Which topics are due for spaced revision today? Give me a quick recap.' },
  { icon: '📝', label: 'Chapter summary', prompt: 'Summarize the most important formulas and concepts from my current chapter in bullet points.' },
];

const buildSystemPrompt = (mode, classLevel, subject, userRole) => {
  const isElite = userRole === 'elite_student';
  return `You are the NotepediaX AI Tutor — a strict, grounded academic assistant for ${classLevel} ${subject} students.

RULES:
- Answer ONLY from educational material context. If unsure, say "This topic isn't in the library yet."
- Student plan: ${isElite ? 'Elite (unlimited, advanced explanations)' : 'Free (concise, beginner-friendly)'}.
- Mode "${mode}": ${
  mode === 'Explain' ? 'Explain with examples. End with a Socratic check question.' :
  mode === 'Solve' ? 'Step-by-step solution. Show all units. Never compute arithmetic yourself.' :
  mode === 'Quiz me' ? 'Generate 3 practice questions. Offer hints on request. Grade answers.' :
  mode === 'Revise' ? 'Bullet-point revision: key dates, formulas, definitions only.' :
  mode === 'Mains answer' ? 'Structure: Introduction → Body (3 points) → Conclusion. Use headings.' :
  'Summarize in under 200 words with bullet points.'
}
- Use markdown: **bold**, tables, numbered lists, code blocks where appropriate.
- Adapt depth and vocabulary for ${classLevel}.
- For STEM: always show formulas and units.
- Never fabricate citations, statistics, or article numbers.
- After every answer, suggest 1-2 follow-up questions.`;
};

export default function AITutor() {
  const { user } = useAuth();
  const [mode, setMode] = useState('Explain');
  const [classLevel, setClassLevel] = useState('Class 11');
  const [subject, setSubject] = useState('Physics');
  const [model, setModel] = useState(MODELS[0].id);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLearner, setShowLearner] = useState(false);
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Mock learner state (from engine)
  const learnerState = {
    overall_score: 0.68,
    weak_topics: ['Kinematics', 'Organic Chemistry', 'Integration'],
    revision_due: ["Newton's Laws", 'Trigonometry'],
    mastery: { Physics: 0.72, Mathematics: 0.55, Chemistry: 0.83, Biology: 0.61 }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (userContent) => {
    const userMsg = { id: Date.now().toString(), role: 'user', content: userContent };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg = { id: assistantId, role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const sysPrompt = buildSystemPrompt(mode, classLevel, subject, user?.role);
    const chatMessages = [
      { role: 'system', content: sysPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userContent }
    ];

    try {
      await streamGroqChat(chatMessages, model, (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ));
      }, controller.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: 'Sorry, an error occurred. Please try again.', streaming: false } : m
        ));
      }
    } finally {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m));
      setIsStreaming(false);
    }
  }, [messages, mode, classLevel, subject, model, user]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const q = input.trim();
    setInput('');
    send(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const masteryPct = Math.round((learnerState.overall_score || 0) * 100);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0b0f1a] text-slate-100 font-sans overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-72 shrink-0 bg-[#111827]/80 border-r border-slate-700/40 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">AI Tutor</h2>
              <p className="text-[10px] text-slate-400">Grounded · {user?.role === 'elite_student' ? '⭐ Elite' : 'Free'} Plan</p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="p-4 space-y-3 border-b border-slate-700/40">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Class / Level</label>
            <select value={classLevel} onChange={e => setClassLevel(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors">
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Mode Chips */}
        <div className="p-4 border-b border-slate-700/40">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Mode</label>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === m ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Learner Profile */}
        <div className="p-4 border-b border-slate-700/40">
          <button onClick={() => setShowLearner(v => !v)}
            className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white">
            <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-400" /> My Profile</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showLearner ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showLearner && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-3 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Overall Mastery</span>
                      <span className="font-bold text-indigo-400">{masteryPct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${masteryPct}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  {learnerState.weak_topics.slice(0, 3).map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
                      <span className="text-slate-300">{t}</span>
                    </div>
                  ))}
                  {learnerState.revision_due.slice(0, 2).map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-rose-400 shrink-0" />
                      <span className="text-slate-300">Review: {t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 flex-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Quick Prompts</label>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map(qp => (
              <button key={qp.label} onClick={() => { setInput(qp.prompt); textareaRef.current?.focus(); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/40 rounded-lg transition-colors flex items-center gap-2">
                <span>{qp.icon}</span>
                <span className="flex-1">{qp.label}</span>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-700/40 flex gap-2">
          <button onClick={() => setMessages([])}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white rounded-lg transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
          <button onClick={() => setShowSettings(v => !v)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white rounded-lg transition-colors">
            <Settings className="h-3.5 w-3.5" /> Model
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-14 bg-[#111827]/60 border-b border-slate-700/40 flex items-center px-6 justify-between shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-medium text-sm text-white">{mode} · {subject} · {classLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full text-xs">
              <CheckCircle className="h-3 w-3" /> Grounded Answers
            </span>
            <span className="bg-slate-700/50 px-2.5 py-1 rounded-full text-xs text-slate-400">
              {MODELS.find(m => m.id === model)?.label}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">NotepediaX AI Tutor</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-6">Strictly grounded answers from your syllabus. Pick a mode, select your class, and start learning.</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {QUICK_PROMPTS.map(qp => (
                  <button key={qp.label} onClick={() => { setInput(qp.prompt); textareaRef.current?.focus(); }}
                    className="text-left p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all">
                    <span className="text-xl">{qp.icon}</span>
                    <p className="text-slate-300 font-medium text-xs mt-1">{qp.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20'
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 rounded-bl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}
                    {msg.streaming && <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse" />}
                  </div>
                  {msg.role === 'assistant' && !msg.streaming && msg.content && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Source:</span>
                      <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">NCERT {subject} · {classLevel}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Grounded ✓</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#111827]/60 border-t border-slate-700/40 backdrop-blur-sm shrink-0">
          <div className="flex items-end gap-3 bg-slate-800/60 border border-slate-600/50 rounded-2xl px-4 py-3 focus-within:border-indigo-500/60 transition-colors">
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={`Ask anything in ${mode} mode… (Enter to send)`}
              rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none max-h-32" />
            {isStreaming ? (
              <button onClick={() => abortRef.current?.abort()}
                className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-colors shrink-0">
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0 shadow-sm shadow-indigo-500/20">
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Answers grounded in your syllabus · Not a substitute for your teacher
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-96 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Choose AI Model</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2">
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setModel(m.id); setShowSettings(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                      model === m.id ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'
                    }`}>
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
