import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, Award, BookOpen, Sparkles, Sliders, 
  Brain, RefreshCw, CheckCircle2, Zap, ShieldCheck 
} from 'lucide-react';

export default function ProfileHeaderWidget({
  profile,
  learnerState,
  onOpenOnboard,
  onOpenDiagnostic,
  onRefresh,
  loading = false,
}) {
  const formatExamName = (exam) => {
    if (!exam) return 'JEE Main / Advanced';
    return exam.replace('_', ' ');
  };

  const formatLevel = (lvl) => {
    if (!lvl) return 'Class 12 Senior';
    return lvl.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const topicCount = learnerState?.topic_mastery 
    ? Object.keys(learnerState.topic_mastery).length 
    : 0;

  const averageMastery = learnerState?.topic_mastery && topicCount > 0
    ? Math.round(
        (Object.values(learnerState.topic_mastery).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : curr?.mastery || 0), 0) /
          topicCount) *
          100
      )
    : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-gradient-to-br from-brand-card via-brand-card/90 to-brand-primary/5 p-6 sm:p-8 shadow-sm">
      {/* Background Decorative Ambient Circles */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Identity & Badges */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold text-brand-primary font-jakarta">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange animate-pulse" />
              Adaptive Learning Intelligence
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-jakarta">
              <ShieldCheck className="h-3.5 w-3.5" />
              Engine Online (Phase 3 Core)
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text font-jakarta tracking-tight">
              Personalized Adaptive Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 leading-relaxed">
              Real-time cognitive knowledge tracking, dynamic Ebbinghaus retention decay, multi-factor recommendation ranking, and constraint-scheduled study planner.
            </p>
          </div>

          {/* Student Profile Meta Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-border bg-brand-base/60 text-xs font-semibold text-brand-text shadow-2xs">
              <Target className="h-3.5 w-3.5 text-brand-orange" />
              <span>Target: <strong className="font-bold text-brand-primary">{formatExamName(profile?.exam_target)}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-border bg-brand-base/60 text-xs font-semibold text-brand-text shadow-2xs">
              <BookOpen className="h-3.5 w-3.5 text-brand-primary" />
              <span>Level: <strong className="font-bold">{formatLevel(profile?.academic_level)}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-border bg-brand-base/60 text-xs font-semibold text-brand-text shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Daily Budget: <strong className="font-bold">{profile?.daily_available_minutes || 60} mins</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-border bg-brand-base/60 text-xs font-semibold text-brand-text shadow-2xs">
              <Award className="h-3.5 w-3.5 text-purple-500" />
              <span>Goal: <strong className="font-bold">{profile?.target_score || 90}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={onOpenOnboard}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-brand-border bg-brand-card hover:bg-brand-primary-light hover:border-brand-primary/40 text-xs font-bold text-brand-text transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="h-4 w-4 text-brand-primary" />
            Edit Goals & Profile
          </button>

          <button
            onClick={onOpenDiagnostic}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-orange text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md transition-all cursor-pointer"
          >
            <Brain className="h-4 w-4" />
            Diagnostic Test
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Sync latest learner state & decay"
            className="flex items-center justify-center p-2.5 rounded-2xl border border-brand-border bg-brand-card hover:bg-brand-primary-light text-brand-muted hover:text-brand-text transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
          </button>
        </div>

      </div>

      {/* Mini Overview Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-brand-border/60">
        <div className="p-3 rounded-2xl bg-brand-base/40 border border-brand-border/40">
          <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Tracked Topics</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-brand-text font-jakarta">{topicCount}</span>
            <span className="text-[10px] font-semibold text-brand-primary">Active in Graph</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-brand-base/40 border border-brand-border/40">
          <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Average Mastery</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-brand-text font-jakarta">{averageMastery}%</span>
            <span className="text-[10px] font-semibold text-emerald-500">
              {averageMastery >= 70 ? 'Proficient' : averageMastery >= 40 ? 'Developing' : 'Foundational'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-brand-base/40 border border-brand-border/40">
          <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Language Model</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-brand-text font-jakarta uppercase">{profile?.preferred_language || 'EN'}</span>
            <span className="text-[10px] font-semibold text-brand-muted">ISO 639-1</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-brand-base/40 border border-brand-border/40">
          <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Engine Status</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-jakarta">Real-time Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
}
