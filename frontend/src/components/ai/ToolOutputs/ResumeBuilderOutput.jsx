import React, { useState } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumeBuilderOutput({ prompt }) {
  const [copied, setCopied] = useState(false);

  const atsScore = 92;

  const optimizedBullets = [
    'Spearheaded development of responsive React 19 web application serving 10,000+ monthly active learners with 99.8% uptime.',
    'Engineered RAG-powered vector search pipeline utilizing Supabase pgvector & HNSW indexing, reducing query retrieval latency by 45%.',
    'Integrated Razorpay & UPI payment gateways with idempotent webhook validation and automated PDF GST invoicing.'
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedBullets.join('\n\n'));
    setCopied(true);
    toast.success('Resume bullets copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & ATS Meter */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-blue-500/10 text-blue-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-blue-500/20">
            <Sparkles className="h-3 w-3" /> ATS Resume Enhancer
          </span>
          <span className="text-[11px] text-brand-muted font-mono">Action Verb Optimized</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* ATS Score Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-blue-500 tracking-wider">ATS Keyword Match Score</span>
          <div className="text-xl font-extrabold text-brand-text font-display mt-0.5">
            {atsScore} / 100 <span className="text-xs font-normal text-emerald-500 font-mono">(Top 5% Tier)</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
          <Award className="h-5 w-5" />
        </div>
      </div>

      {/* Optimized Bullets */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-brand-text font-display block">High-Impact Experience Bullets (STAR Format):</span>
        {optimizedBullets.map((bullet, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-xl border border-brand-border bg-brand-card flex items-start gap-2.5"
          >
            <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-body leading-relaxed">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
