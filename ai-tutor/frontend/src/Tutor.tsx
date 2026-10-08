import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, X, RotateCcw, BookOpen, Zap, Brain,
  ChevronDown, Target, Clock, AlertCircle, CheckCircle,
  MessageSquare, Settings, Mic, Square, ChevronRight,
  TrendingUp, Star
} from 'lucide-react';
import { useGroqStream } from '../hooks/useGroqStream';
import { useLearnerState } from '../hooks/useLearnerState';

const MODES = ['Explain', 'Solve', 'Quiz me', 'Revise', 'Mains answer', 'Summarize'] as const;
const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'JEE Main', 'JEE Advanced', 'NEET', 'UPSC', 'CAT'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Polity', 'Economics', 'Computer Science'];
const MODELS = ['llama3-8b-8192', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'];

const QUICK_PROMPTS = [
  { icon: '🎯', label: 'Analyze My Weak Topics', prompt: 'Based on my learner profile, analyze my weak topics and tell me what to focus on first.' },
  { icon: '⚡', label: 'Quiz Me Now', prompt: 'Give me 3 practice questions from my current subject. I want to be tested.' },
  { icon: '📅', label: 'Revision Due', prompt: 'Which topics are due for spaced revision? Give me a quick recap of the most important ones.' },
  { icon: '📝', label: 'Quick Summary', prompt: 'Summarize the most important formulas and concepts from my current chapter.' },
];

const buildSystemPrompt = (mode: string, classLevel: string, subject: string, contextPrompt: string) => {
  return `You are the NotepediaX AI Tutor — a strict, grounded academic assistant for students in ${classLevel} studying ${subject}.

RULES:
- Answer ONLY from retrieved educational material. If unsure, say "This topic isn't in the library yet."
- In "${mode}" mode: ${
  mode === 'Explain' ? 'Explain concepts clearly with examples. Ask a Socratic check question at the end.' :
  mode === 'Solve' ? 'Give step-by-step worked solutions. Show all units. Never compute arithmetic yourself — show the expression.' :
  mode === 'Quiz me' ? 'Generate 3 practice questions with hints on request. Grade the student\'s answers.' :
  mode === 'Revise' ? 'Give a concise bullet-point revision with key dates, formulas, and definitions.' :
  mode === 'Mains answer' ? 'Structure with Introduction, Body (3 paragraphs), Conclusion. Use headings.' :
  'Summarize the chapter in under 200 words with bullet points.'
}
- Format answers with markdown: use **bold**, \`code\`, tables, and numbered lists where appropriate.
- Adapt vocabulary and depth for ${classLevel}.
- For STEM: show formulas in LaTeX-style text. Always show units.
- Never fabricate citations, quotes, statistics, or article numbers.
${contextPrompt}`;
};

export default function Tutor() {
  const [mode, setMode] = useState<string>('Explain');
  const [classLevel, setClassLevel] = useState('Class 11');
  const [subject, setSubject] = useState('Physics');
  const [model, setModel] = useState(MODELS[0]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showLearnerCard, setShowLearnerCard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const studentId = 'student_001';

  const { messages, isStreaming, send, cancel, clear } = useGroqStream(model);
  const { learnerState, loading: learnerLoading, refresh, buildContextPrompt } = useLearnerState(studentId);

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const query = input.trim();
    setInput('');
    const systemPrompt = buildSystemPrompt(mode, classLevel, subject, buildContextPrompt());
    await send(query, systemPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const masteryPct = Math.round((learnerState?.overall_score || 0) * 100);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-72 bg-slate-800/60 border-r border-slate-700/50 flex flex-col backdrop-blur-sm">
        {/* Brand */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">NotepediaX Tutor</h1>
              <p className="text-[10px] text-slate-400">Grounded AI Learning</p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="p-4 space-y-3 border-b border-slate-700/50">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Class / Level</label>
            <select
              value={classLevel}
              onChange={e => setClassLevel(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            >
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Subject</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            >
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Mode Chips */}
        <div className="p-4 border-b border-slate-700/50">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Mode</label>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Learner Card */}
        <div className="p-4 border-b border-slate-700/50">
          <button
            onClick={() => { setShowLearnerCard(v => !v); if (!learnerState) refresh(); }}
            className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-400" /> Learner Profile</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showLearnerCard ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showLearnerCard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {learnerLoading ? (
                    <div className="h-8 bg-slate-700/50 rounded animate-pulse" />
                  ) : (
                    <>
                      {/* Mastery Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Overall Mastery</span>
                          <span className="font-bold text-indigo-400">{masteryPct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${masteryPct}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                      {/* Weak Topics */}
                      {learnerState?.weak_topics?.slice(0, 3).map((t: string) => (
                        <div key={t} className="flex items-center gap-2 text-xs">
                          <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
                          <span className="text-slate-300">{t}</span>
                        </div>
                      ))}
                      {/* Revision Due */}
                      {learnerState?.revision_due?.slice(0, 2).map((t: string) => (
                        <div key={t} className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-rose-400 shrink-0" />
                          <span className="text-slate-300">Review: {t}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 flex-1 overflow-y-auto">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Quick Prompts</label>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => handleQuickPrompt(qp.prompt)}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/40 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{qp.icon}</span>
                <span>{qp.label}</span>
                <ChevronRight className="h-3 w-3 ml-auto text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-700/50 flex gap-2">
          <button
            onClick={clear}
            title="Clear chat"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            title="Model settings"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="h-3.5 w-3.5" /> Model
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <div className="h-14 bg-slate-800/40 border-b border-slate-700/50 flex items-center px-6 justify-between backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-medium text-sm text-white">
              {mode} Mode · {subject} · {classLevel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" /> Grounded Answers
            </span>
            <span className="bg-slate-700/50 px-2.5 py-1 rounded-full">{model.split('-').slice(0,2).join('-')}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">NotepediaX AI Tutor</h2>
              <p className="text-slate-400 text-sm max-w-sm">Strictly grounded answers from your syllabus. Pick a mode, select your class, and start learning.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
                {QUICK_PROMPTS.map(qp => (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    className="text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all text-sm"
                  >
                    <span className="text-lg">{qp.icon}</span>
                    <p className="text-slate-300 font-medium text-xs mt-1">{qp.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800 border border-slate-700/50 text-slate-100 rounded-bl-sm shadow-lg'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse" />
                    )}
                  </div>
                  {msg.role === 'assistant' && !msg.streaming && msg.content && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Source:</span>
                      <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">NCERT {subject} · {classLevel}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Grounded</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-800/40 border-t border-slate-700/50 backdrop-blur-sm shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask anything in ${mode} mode… (Enter to send, Shift+Enter for newline)`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none max-h-32"
                style={{ lineHeight: '1.5' }}
              />
              <div className="flex items-center gap-2 shrink-0">
                {isStreaming ? (
                  <button
                    onClick={cancel}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-colors"
                    title="Stop streaming"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Answers grounded in your syllabus · Not a substitute for your teacher
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-96 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Model Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Select Model</label>
                <div className="space-y-2">
                  {MODELS.map(m => (
                    <button
                      key={m}
                      onClick={() => { setModel(m); setShowSettings(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                        model === m
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-medium">{m}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.includes('70b') ? 'More capable, slower' : m.includes('mixtral') ? 'Balanced, 32k context' : 'Fast, lightweight'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
