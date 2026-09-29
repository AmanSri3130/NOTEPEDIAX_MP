import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  ListChecks, 
  Bookmark, 
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SummarizerOutput({ rawText, prompt }) {
  const [copied, setCopied] = useState(false);

  // Extract or formulate structured notes
  const samplePoints = [
    {
      heading: '1. Primary Principle & Postulates',
      bullets: [
        'Every oscillating wavepoint generates secondary spherical wavelets traveling at speed v in the medium.',
        'The forward envelope tangent to all secondary wavelets forms the new wavefront at time t + Δt.'
      ]
    },
    {
      heading: '2. High-Yield Exam Formulas',
      bullets: [
        'Fringe Width: β = (λ · D) / d (Directly proportional to wavelength & screen distance).',
        'Phase Difference: Δϕ = (2π / λ) · Δx.'
      ]
    },
    {
      heading: '3. Key JEE / NEET Traps to Avoid',
      bullets: [
        'When immersed in liquid of refractive index μ, fringe width decreases: β\' = β / μ.',
        'Central maximum is always bright with zero path difference (Δx = 0).'
      ]
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText || JSON.stringify(samplePoints, null, 2));
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-pink-500/10 text-pink-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-pink-500/20">
            <Sparkles className="h-3 w-3" /> High-Yield Summary
          </span>
          <span className="text-[11px] text-brand-muted font-mono">3 Core Modules Extracted</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Structured Card Grid */}
      <div className="space-y-3">
        {samplePoints.map((section, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-xl border border-brand-border bg-brand-card/60 hover:border-pink-500/30 transition-all shadow-sm"
          >
            <h4 className="text-xs font-bold text-brand-text font-display flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              {section.heading}
            </h4>
            <ul className="mt-2.5 space-y-1.5 pl-4">
              {section.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="text-xs text-brand-body list-disc leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Actionable Revision Checklist */}
      <div className="p-3.5 rounded-xl bg-pink-500/5 border border-pink-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <ListChecks className="h-4 w-4 text-pink-500" />
          <span className="font-semibold text-brand-text">Active Recall Test:</span>
          <span className="text-brand-muted hidden sm:inline">Try explaining Huygens principle without checking notes.</span>
        </div>
        <span className="text-[10px] font-mono text-pink-500 font-bold">5 Min Review</span>
      </div>
    </div>
  );
}
