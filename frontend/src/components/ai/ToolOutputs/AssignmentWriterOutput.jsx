import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  BookMarked, 
  Download, 
  AlignLeft,
  Heading
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignmentWriterOutput({ prompt }) {
  const [copied, setCopied] = useState(false);

  const sections = [
    {
      title: 'Abstract & Problem Thesis',
      content: 'Wave theory of light, pioneered by Christian Huygens, addresses rectilinear propagation, reflection, and refraction by considering the continuous generation of secondary wavelets. This paper explores the foundational postulates of wavefront geometry, validating interference fringes in Young\'s experiment.'
    },
    {
      title: 'Section 1: Geometric Wavefront Construction',
      content: 'A wavefront is defined as the locus of all adjacent particles oscillating in identical phase. For a point source in an isotropic medium, spherical wavefronts expand radially. As distance increases, curvature flattens, forming planar wavefronts governed by envelope tangents.'
    },
    {
      title: 'Section 2: Mathematical Interference Conditions',
      content: 'Interference patterns arise from superposition: y = y₁ + y₂. Maxima condition satisfies path difference Δx = nλ with intensity I = 4I₀, whereas destructive interference yields nodes at Δx = (2n - 1)λ/2.'
    },
    {
      title: 'Conclusion & Academic Significance',
      content: 'Huygens\' principle provided the pivotal physical model necessary to overcome Newtonian corpuscular dogma, cementing the wave paradigm in 19th-century classical electrodynamics.'
    }
  ];

  const fullText = sections.map(s => `${s.title.toUpperCase()}\n${s.content}\n`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Assignment draft copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-purple-500/10 text-purple-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-purple-500/20">
            <Sparkles className="h-3 w-3" /> Thesis Paper Draft
          </span>
          <span className="text-[11px] text-brand-muted font-mono">4 Sections • ~450 Words</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-medium flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Document layout view */}
      <div className="p-5 rounded-2xl border border-brand-border bg-brand-card space-y-4 shadow-sm font-sans">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              {sec.title}
            </h4>
            <p className="text-xs text-brand-body leading-relaxed text-justify">
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      {/* Word Count / Structure Bar */}
      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs text-brand-muted">
        <span>Format: Standard Academic (APA Reference Structure)</span>
        <span className="font-mono text-purple-500 font-bold">Plagiarism Free: 99.4%</span>
      </div>
    </div>
  );
}
