import React from 'react';
import { 
  Compass, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

export default function MentorChatOutput({ prompt }) {
  const recommendations = [
    {
      title: 'Target Weakness Identified',
      desc: 'Optical path phase calculations & resolving power of telescopes have a 40% accuracy gap in recent mock sets.',
      type: 'critical'
    },
    {
      title: 'Next 3-Day Recovery Drill',
      desc: 'Dedicate 45 minutes daily to 15 PYQs from JEE Main 2021-2024 on Wave Optics & Interference before attempting next full mock.',
      type: 'action'
    },
    {
      title: 'Mentor Encouragement',
      desc: 'Your problem-solving speed in Ray Optics is in the 88th percentile. Bridging the wave theory gap will push your Physics score past 85+!',
      type: 'cheer'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-rose-500/10 text-rose-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-rose-500/20">
            <HeartHandshake className="h-3 w-3" /> AI Mentor Diagnostic
          </span>
          <span className="text-[11px] text-brand-muted font-mono">Personalized Strategy</span>
        </div>
      </div>

      {/* Companion Message Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent border border-rose-500/30 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
            M
          </div>
          <div>
            <span className="text-xs font-bold text-brand-text block">NotepediaX AI Mentor</span>
            <span className="text-[10px] text-brand-muted font-mono">Study Strategy Counselor</span>
          </div>
        </div>
        <p className="text-xs text-brand-body leading-relaxed pt-1">
          "I analyzed your target timeline for your upcoming exam. You're building solid conceptual momentum, but we need to strengthen formula recall for wave interference questions so you don't lose quick marks."
        </p>
      </div>

      {/* Diagnostic Cards */}
      <div className="space-y-2.5">
        {recommendations.map((item, idx) => (
          <div 
            key={idx}
            className="p-3.5 rounded-xl border border-brand-border bg-brand-card flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-brand-base border border-brand-border shrink-0 mt-0.5">
              {item.type === 'critical' && <Target className="h-4 w-4 text-rose-500" />}
              {item.type === 'action' && <Calendar className="h-4 w-4 text-brand-primary" />}
              {item.type === 'cheer' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-text font-display">{item.title}</h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
