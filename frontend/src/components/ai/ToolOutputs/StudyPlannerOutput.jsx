import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  Coffee,
  BrainCircuit
} from 'lucide-react';

export default function StudyPlannerOutput({ prompt }) {
  const [activeDay, setActiveDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const schedule = [
    {
      time: '06:30 AM - 08:00 AM',
      title: 'High-Focus Deep Concept Session',
      subject: 'Physics: Wave Optics (Diffraction & Young\'s Slits)',
      color: 'border-l-indigo-500',
      badge: 'Deep Work'
    },
    {
      time: '08:00 AM - 08:45 AM',
      title: 'Active Revision & Flashcards Drill',
      subject: 'Formula retrieval + 10 Flashcards',
      color: 'border-l-amber-500',
      badge: 'Recall'
    },
    {
      time: '04:30 PM - 06:00 PM',
      title: 'Problem Solving & PYQ Timed Block',
      subject: '20 Numerical MCQs from JEE 2023-2024 Archive',
      color: 'border-l-emerald-500',
      badge: 'Drill'
    },
    {
      time: '09:00 PM - 09:45 PM',
      title: 'Review & Daily Doubt Clearing',
      subject: 'NotepediaX AI Doubt Solver log analysis',
      color: 'border-l-purple-500',
      badge: 'Wrap-Up'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" /> Exam-Ready Timetable
          </span>
          <span className="text-[11px] text-brand-muted font-mono">4 Focus Blocks / Day</span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              activeDay === d 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-brand-base border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Timeline Slot Cards */}
      <div className="space-y-2.5">
        {schedule.map((slot, idx) => (
          <div 
            key={idx}
            className={`p-3.5 rounded-xl border border-brand-border bg-brand-card border-l-4 ${slot.color} space-y-1.5`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-brand-muted flex items-center gap-1 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-brand-primary" />
                {slot.time}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-base border border-brand-border text-brand-dim">
                {slot.badge}
              </span>
            </div>
            <h4 className="text-xs font-bold text-brand-text font-display">{slot.title}</h4>
            <p className="text-[11px] text-brand-body leading-relaxed">{slot.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
