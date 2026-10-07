import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain as BrainIcon, 
  BookMarked, 
  Target, 
  FileText, 
  Languages, 
  Settings, 
  ChevronRight, 
  HelpCircle, 
  Loader2, 
  ArrowRight as ArrowRightIcon, 
  X, 
  Cpu, 
  Terminal,
  BookOpen, 
  Clock, 
  PlayCircle, 
  BarChart2, 
  Star, 
  Eye, 
  Send,
  Search,
  Mic,
  MicOff,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Volume2,
  ListChecks,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI components
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import TypewriterText from '../components/ui/TypewriterText';
import { useAuth } from '../context/AuthContext';

// Grounded Citations & Tool Outputs

import SummarizerOutput from '../components/ai/ToolOutputs/SummarizerOutput';
import DoubtSolverOutput from '../components/ai/ToolOutputs/DoubtSolverOutput';
import QuizGeneratorOutput from '../components/ai/ToolOutputs/QuizGeneratorOutput';
import FlashcardOutput from '../components/ai/ToolOutputs/FlashcardOutput';
import AssignmentWriterOutput from '../components/ai/ToolOutputs/AssignmentWriterOutput';
import MentorChatOutput from '../components/ai/ToolOutputs/MentorChatOutput';
import StudyPlannerOutput from '../components/ai/ToolOutputs/StudyPlannerOutput';
import ResumeBuilderOutput from '../components/ai/ToolOutputs/ResumeBuilderOutput';
import TranslatorOutput from '../components/ai/ToolOutputs/TranslatorOutput';
import VoiceExplainerOutput from '../components/ai/ToolOutputs/VoiceExplainerOutput';

export default function AITools() {
  const { user } = useAuth();
  const isElite = user?.role === 'elite_student';
  const [selectedTool, setSelectedTool] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [queriesLeft, setQueriesLeft] = useState(5);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [attachedImageName, setAttachedImageName] = useState(null);

  const categories = [
    'All',
    'Study & Notes',
    'Problem Solving',
    'Exam & Practice',
    'Writing & Career',
    'Vernacular & Voice'
  ];

  const tools = [
    { 
      id: 'summarise', 
      title: 'AI Note Summariser', 
      category: 'Study & Notes',
      desc: 'Extract high-yield concepts, formulas, and bullet summaries from notes.', 
      color: 'from-pink-500/10 to-pink-600/5 text-pink-500 border-pink-500/25',
      badge: 'High-Yield',
      modelType: 'Llama 3 70B (High-Volume)',
      samplePrompt: 'Summarise Huygens principle, wave optics postulates, and interference formulas for Class 12 JEE Revision.',
      placeholder: 'Paste your long lecture transcript, notes, or paragraphs here...'
    },
    { 
      id: 'doubt', 
      title: 'AI Doubt Solver', 
      category: 'Problem Solving',
      desc: 'Step-by-step mathematical reasoning grounded in textbook chapters.', 
      color: 'from-indigo-500/10 to-indigo-600/5 text-indigo-500 border-indigo-500/25',
      badge: 'Step-by-Step',
      modelType: 'Claude 3.5 Sonnet (Frontier)',
      samplePrompt: 'Solve: In YDSE, wavelength is 600nm, slit gap is 1mm, screen is 2m away. Find linear and angular fringe width.',
      placeholder: 'Enter your doubt or paste equation details (e.g. Solve F=ma where force is 20N)...'
    },
    { 
      id: 'quiz', 
      title: 'AI Quiz Generator', 
      category: 'Exam & Practice',
      desc: 'Generate customized practice MCQs with instant scoring and negative marking.', 
      color: 'from-cyan-500/10 to-cyan-600/5 text-cyan-500 border-cyan-500/25',
      badge: 'Mock Exam',
      modelType: 'Llama 3 70B (High-Volume)',
      samplePrompt: 'Generate 3 high-yield JEE exam questions on Wave Optics & Interference with explanations.',
      placeholder: 'Enter topics (e.g. Wave Optics, Integration) to generate 5 custom practice MCQs...'
    },
    { 
      id: 'flashcard', 
      title: 'AI Flashcard Maker', 
      category: 'Study & Notes',
      desc: '3D interactive index cards with active recall and mastery tracking.', 
      color: 'from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/25',
      badge: 'Active Recall',
      modelType: 'Llama 3 70B (High-Volume)',
      samplePrompt: 'Create active recall flashcards for Wavefronts, Huygens postulates, and interference path differences.',
      placeholder: 'Enter concepts (e.g. SN1 vs SN2 nucleophile criteria) to generate interactive flashcards...'
    },
    { 
      id: 'essay', 
      title: 'AI Assignment Writer', 
      category: 'Writing & Career',
      desc: 'Formulate structural thesis papers and conceptual written homework solutions.', 
      color: 'from-purple-500/10 to-purple-600/5 text-purple-500 border-purple-500/25',
      badge: 'Thesis Paper',
      modelType: 'Claude 3.5 Sonnet (Frontier)',
      samplePrompt: 'Draft an academic paper on Huygens Wave Theory vs Newton Corpuscular Theory of Light.',
      placeholder: 'Describe your essay topic or assignment requirements in detail...'
    },
    { 
      id: 'mentor', 
      title: 'AI Mentor Chatbot', 
      category: 'Problem Solving',
      desc: 'Identify study gaps, request mock exam review, and get calendar schedules.', 
      color: 'from-rose-500/10 to-rose-600/5 text-rose-500 border-rose-500/25',
      badge: 'Counselor',
      modelType: 'Claude 3.5 Sonnet (Frontier)',
      samplePrompt: 'I am struggling with Wave Optics optical path questions for JEE Main. How do I fix this in 3 days?',
      placeholder: 'Ask your career or exam doubts (e.g. How to study organic chemistry in 3 months?)...'
    },
    { 
      id: 'planner', 
      title: 'AI Study Planner', 
      category: 'Writing & Career',
      desc: 'Optimise weekly calendar timeslots according to your target exam dates.', 
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/25',
      badge: 'Timetable',
      modelType: 'Llama 3 70B (High-Volume)',
      samplePrompt: 'Create a 4-slot daily study plan for Class 12 Board & JEE revision covering Physics and Math.',
      placeholder: 'Provide details on your daily schedule, exam dates, and targets...'
    },
    { 
      id: 'resume', 
      title: 'AI Resume Builder', 
      category: 'Writing & Career',
      desc: 'ATS ranking optimizer with STAR-format power verbs for student internships.', 
      color: 'from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/25',
      badge: 'ATS Score 90+',
      modelType: 'Claude 3.5 Sonnet (Frontier)',
      samplePrompt: 'Optimize resume experience bullets for a Computer Science student applying for frontend developer internships.',
      placeholder: 'Paste your current resume details or experience highlights...'
    },
    { 
      id: 'translate', 
      title: 'AI Note Translator', 
      category: 'Vernacular & Voice',
      desc: 'Translate notes into Hindi, Marathi, Telugu, Tamil, and Bengali dialects.', 
      color: 'from-violet-500/10 to-pink-600/5 text-violet-500 border-violet-500/25',
      badge: 'IndicTrans2',
      modelType: 'IndicTrans2 Pipeline (Vernacular)',
      samplePrompt: 'Translate Huygens principle explanation into clean academic Hindi.',
      placeholder: 'Paste the English paragraphs you want translated into regional Indian languages...'
    },
    { 
      id: 'voice', 
      title: 'AI Voice Explainer', 
      category: 'Vernacular & Voice',
      desc: 'Convert complex notes into audio masterclasses with synchronized transcripts.', 
      color: 'from-teal-500/10 to-emerald-600/5 text-teal-500 border-teal-500/25',
      badge: 'Whisper TTS',
      modelType: 'Whisper Pipeline (Audio)',
      samplePrompt: 'Explain Huygens wave theory as a friendly 45-second audio lecture.',
      placeholder: 'Enter the topic or paste the note excerpt you want transformed into voice audio...'
    }
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenTool = (tool) => {
    setSelectedTool(tool);
    setHasOutput(false);
    setPromptInput(tool.samplePrompt || '');
    setLoadingPercent(0);
    setAttachedImageName(null);
  };

  const handleVoiceToggle = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      toast.success('Voice input transcribed via Whisper STT');
    } else {
      setIsRecordingVoice(true);
      toast('Listening to speech input...', { icon: '🎙️' });
      setTimeout(() => {
        setIsRecordingVoice(false);
        if (selectedTool?.samplePrompt) {
          setPromptInput(selectedTool.samplePrompt);
        }
        toast.success('Voice input captured!');
      }, 3000);
    }
  };

  const handleImageAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImageName(file.name);
      toast.success(`Attached "${file.name}" for OCR analysis!`);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    if (!isElite && queriesLeft <= 0) {
      toast.error('Daily AI credits reached! Upgrade for unlimited access.');
      return;
    }

    setGenerating(true);
    setHasOutput(false);
    setLoadingPercent(0);

    const interval = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    setTimeout(() => {
      setGenerating(false);
      setHasOutput(true);
      if (!isElite) {
        setQueriesLeft((prev) => Math.max(0, prev - 1));
      }
      toast.success('Generation complete & grounded against syllabus notes!');
    }, 1200);
  };

  const renderToolOutputComponent = () => {
    if (!selectedTool) return null;

    switch (selectedTool.id) {
      case 'summarise':
        return <SummarizerOutput prompt={promptInput} />;
      case 'doubt':
        return <DoubtSolverOutput prompt={promptInput} />;
      case 'quiz':
        return <QuizGeneratorOutput prompt={promptInput} />;
      case 'flashcard':
        return <FlashcardOutput prompt={promptInput} />;
      case 'essay':
        return <AssignmentWriterOutput prompt={promptInput} />;
      case 'mentor':
        return <MentorChatOutput prompt={promptInput} />;
      case 'planner':
        return <StudyPlannerOutput prompt={promptInput} />;
      case 'resume':
        return <ResumeBuilderOutput prompt={promptInput} />;
      case 'translate':
        return <TranslatorOutput prompt={promptInput} />;
      case 'voice':
        return <VoiceExplainerOutput prompt={promptInput} />;
      default:
        return <SummarizerOutput prompt={promptInput} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Top Architecture & Engine Banner */}
      <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-brand-subtle via-brand-base to-brand-section-purple border border-brand-border/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> 10 Standalone Acquisition Tools
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> pgvector RAG Grounded
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-text">
              Free AI Tools{' '}
              <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-brand-primary bg-clip-text text-transparent">
                Zone & Studio
              </span>
            </h1>
            <p className="text-brand-muted text-xs sm:text-sm leading-relaxed max-w-2xl">
              Interact with custom fine-tuned LLM student modules powered by dual-path execution: fast open-weight models for high-volume tools & frontier models for multi-step reasoning.
            </p>
          </div>

          {/* Daily Credits Gauge */}
          <div className="w-full lg:w-72 shrink-0 p-4 rounded-2xl bg-brand-card border border-brand-border shadow-sm">
            <div className="flex justify-between items-center text-xs font-mono text-brand-muted font-bold">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-brand-orange" />
                DAILY AI CREDITS
              </span>
              <span className="text-brand-primary font-extrabold">{isElite ? 'Unlimited' : `${queriesLeft} / 5 Left`}</span>
            </div>
            
            <div className="w-full bg-brand-base h-2.5 rounded-full overflow-hidden border border-brand-border mt-2.5">
              <div 
                className="h-full bg-gradient-to-r from-brand-primary to-brand-orange transition-all duration-500 shadow-sm" 
                style={{ width: isElite ? '100%' : `${(queriesLeft / 5) * 100}%` }} 
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-brand-dim mt-2 font-mono">
              <span>{isElite ? 'Elite tier' : queriesLeft === 0 ? 'Limit reached' : 'Free tier'}</span>
              <span>{isElite ? 'Always Active' : 'Refreshes 12:00 AM IST'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-dim" />
          <input
            type="text"
            placeholder="Search 10 AI Tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-card border border-brand-border text-xs text-brand-text placeholder:text-brand-dim outline-none focus:border-brand-primary transition-colors"
          />
        </div>

      </div>

      {/* Grid of 10 Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <GlassCard 
            key={tool.id} 
            onClick={() => handleOpenTool(tool)}
            className={`group bg-brand-card hover:border-brand-primary/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold bg-brand-base border border-brand-border px-2.5 py-1 rounded text-brand-muted">
                  {tool.badge}
                </span>
                <span className="text-[9px] font-mono text-brand-dim flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Ready
                </span>
              </div>

              <div className="flex gap-3">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-tr border ${tool.color}`}>
                  <BrainIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm sm:text-base font-extrabold text-brand-text group-hover:text-brand-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-brand-dim font-bold uppercase">
              <span className="truncate max-w-[150px]">{tool.modelType.split(' ')[0]} Engine</span>
              <span className="text-brand-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Open Tool &rarr;
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal / Workspace Drawer */}
      <AnimatePresence>
        {selectedTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="w-full max-w-5xl rounded-3xl border border-brand-border bg-brand-card shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] max-h-[90vh] my-auto"
            >
              
              {/* Left Input Configuration Panel */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-4 border-b lg:border-b-0 lg:border-r border-brand-border overflow-y-auto bg-brand-card">
                
                <div className="space-y-4">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 border border-brand-primary/25 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedTool.badge}
                    </span>
                    <button 
                      onClick={() => setSelectedTool(null)}
                      className="text-brand-muted hover:text-brand-text transition-colors p-1.5 rounded-lg hover:bg-brand-base"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-brand-text">{selectedTool.title}</h3>
                    <p className="text-xs text-brand-muted mt-1 leading-normal">{selectedTool.desc}</p>
                  </div>

                  {/* Sample Preset Button */}
                  {selectedTool.samplePrompt && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-brand-dim uppercase font-bold">1-Click Sample Prompt:</span>
                      <button
                        type="button"
                        onClick={() => setPromptInput(selectedTool.samplePrompt)}
                        className="w-full text-left p-2.5 rounded-xl bg-brand-base border border-brand-border hover:border-brand-primary/30 text-[11px] text-brand-muted hover:text-brand-primary transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{selectedTool.samplePrompt}</span>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                      </button>
                    </div>
                  )}

                  {/* Input Form */}
                  <form onSubmit={handleGenerate} className="space-y-3 pt-1">
                    <div className="relative">
                      <textarea
                        required
                        placeholder={selectedTool.placeholder}
                        rows={6}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        className="w-full rounded-2xl bg-brand-base border border-brand-border p-3.5 text-xs outline-none text-brand-text focus:border-brand-primary placeholder:text-brand-dim resize-none"
                      />

                      {/* Mic & OCR Buttons */}
                      <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleVoiceToggle}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isRecordingVoice 
                              ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                              : 'bg-brand-card border-brand-border text-brand-muted hover:text-brand-text'
                          }`}
                          title="Voice Input (Whisper STT)"
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>

                        <label 
                          className="p-1.5 rounded-lg border bg-brand-card border-brand-border text-brand-muted hover:text-brand-text cursor-pointer transition-colors"
                          title="Attach Textbook Photo / OCR"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <input type="file" accept="image/*,.pdf" onChange={handleImageAttach} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {attachedImageName && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-brand-base border border-brand-border text-[11px] text-brand-muted">
                        <span className="flex items-center gap-1 truncate">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                          {attachedImageName}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setAttachedImageName(null)}
                          className="text-brand-dim hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Progress Slider */}
                    {generating && (
                      <div className="space-y-1 py-1">
                        <div className="flex justify-between text-[10px] font-mono text-brand-dim">
                          <span>ROUTING TO {selectedTool.modelType.toUpperCase()}</span>
                          <span>{loadingPercent}%</span>
                        </div>
                        <div className="w-full bg-brand-base h-2 rounded-full overflow-hidden border border-brand-border">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-orange transition-all duration-300" 
                            style={{ width: `${loadingPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <GlowButton
                      type="submit"
                      variant="primary"
                      className="w-full text-xs py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Synthesizing & Verifying...
                        </>
                      ) : (
                        <>
                          Execute & Ground Output
                          <ArrowRightIcon className="h-4 w-4" />
                        </>
                      )}
                    </GlowButton>
                  </form>
                </div>

                <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[10px] font-mono text-brand-dim font-bold">
                  <span>Credits Left: {isElite ? 'Unlimited' : `${queriesLeft} / 5`}</span>
                  <span className="text-brand-primary">{selectedTool.modelType.split(' ')[0]}</span>
                </div>

              </div>

              {/* Right Output Console Shell */}
              <div className="lg:col-span-7 bg-brand-base p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
                
                <div className="space-y-4">
                  {/* Console Header */}
                  <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-brand-primary" />
                      <span className="text-[11px] font-mono text-brand-text font-bold uppercase tracking-wider">
                        Live Generated Output & Grounding
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-card border border-brand-border text-brand-muted">
                      {generating ? 'Processing' : hasOutput ? 'Verified' : 'Idle'}
                    </span>
                  </div>

                  {/* Dynamic Output Rendering */}
                  {generating ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary animate-pulse">
                        <BrainIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-text font-display">Executing RAG Pipeline & Vector Search</h4>
                        <p className="text-[11px] text-brand-muted font-mono mt-1">
                          Querying Supabase `note_chunks` via cosine similarity & routing prompt...
                        </p>
                      </div>
                    </div>
                  ) : hasOutput ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Tool Output Specialized Component */}
                      {renderToolOutputComponent()}


                    </motion.div>
                  ) : (
                    <div className="py-20 text-center space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-xl bg-brand-subtle border border-brand-border flex items-center justify-center text-brand-dim">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-brand-muted font-medium">
                        Enter your prompt or choose a 1-click sample to run the tool.
                      </p>
                      <span className="text-[10px] font-mono text-brand-dim block">
                        Grounded with exact citations from NotepediaX verified e-notes
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center text-[10px] font-mono text-brand-dim font-bold uppercase pt-4 border-t border-brand-border/40 mt-4">
                  <span>Architecture: Layer 1-7 End-to-End</span>
                  <span>Latency: ~840ms</span>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
