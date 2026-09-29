import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Lightbulb, 
  AlertOctagon, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  FunctionSquare,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoubtSolverOutput({ prompt }) {
  const steps = [
    {
      step: 'Step 1: Identify Given Parameters & Target',
      content: 'Wavelength λ = 600 nm = 6 × 10⁻⁷ m, Slit separation d = 1 mm = 1 × 10⁻³ m, Screen distance D = 2 m. Target: Calculate angular fringe width θ and linear fringe width β.'
    },
    {
      step: 'Step 2: Apply Governing Physical Relation',
      formula: 'β = \\frac{\\lambda D}{d} \\quad \\text{and} \\quad \\theta = \\frac{\\lambda}{d}',
      content: 'Substitute the given values into the Young\'s Double Slit linear spacing formula.'
    },
    {
      step: 'Step 3: Numerical Computation & Unit Verification',
      content: 'β = (6 × 10⁻⁷ × 2) / (1 × 10⁻³) = 1.2 × 10⁻³ m = 1.20 mm. Angular width θ = 6 × 10⁻⁴ radians (0.034°).'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-indigo-500/10 text-indigo-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-indigo-500/20">
            <Sparkles className="h-3 w-3" /> Step-by-Step Derivation
          </span>
          <span className="text-[11px] text-brand-muted font-mono">100% Solved</span>
        </div>
      </div>

      {/* Answer Callout Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30">
        <span className="text-[10px] font-mono uppercase font-bold text-indigo-500 tracking-wider">Final Verified Result</span>
        <div className="mt-1 text-base font-extrabold text-brand-text font-display flex items-baseline gap-2">
          <span>Linear Fringe Width β = 1.20 mm</span>
          <span className="text-xs font-normal text-brand-muted font-mono">(θ = 6.0 × 10⁻⁴ rad)</span>
        </div>
      </div>

      {/* Sequential Steps */}
      <div className="space-y-3">
        {steps.map((item, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl border border-brand-border bg-brand-card/60 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-5 rounded-full bg-indigo-500/15 text-indigo-500 font-mono text-[10px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <h4 className="text-xs font-bold text-brand-text font-display">{item.step}</h4>
            </div>

            {item.formula && (
              <div className="my-2.5 px-3 py-2 rounded-lg bg-brand-base border border-brand-border/60 font-mono text-xs text-indigo-400">
                {item.formula}
              </div>
            )}

            <p className="text-xs text-brand-body leading-relaxed pl-7">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Pitfalls & Tips */}
      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
        <AlertOctagon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold text-brand-text block">Exam Note & Units Trap</span>
          <p className="text-[11px] text-brand-muted mt-0.5">
            Always convert nanometers (nm) to meters (m) before computing. Angular width does NOT depend on distance D to the screen.
          </p>
        </div>
      </div>
    </div>
  );
}
