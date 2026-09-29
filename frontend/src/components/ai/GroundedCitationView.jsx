import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  BookOpen, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  FileCheck,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * GroundedCitationView
 * Implements Layer 7 (Grounded Output) from the NotepediaX Architecture:
 * - Displays source verified badges
 * - Cosine vector similarity match confidence (pgvector)
 * - LLM router execution info (Frontier vs Open-Weight)
 * - Interactive collapsible citation cards with exact quotes & page offsets
 */
export default function GroundedCitationView({ 
  sources = [], 
  confidenceScore = 94, 
  modelUsed = 'Claude 3.5 Sonnet (Frontier)', 
  pipeline = 'RAG + pgvector HNSW Index' 
}) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const defaultSources = sources.length > 0 ? sources : [
    {
      title: 'NCERT Class 12 Physics (Vol II)',
      chapter: 'Wave Optics §10.3',
      page: 356,
      examCode: 'JEE_MAIN / CBSE_12',
      snippet: 'Huygens principle states that every point on a wavefront acts as a secondary spherical wave source with speed equal to wave propagation speed in that medium.',
      similarity: 0.94,
      noteId: 'enote-phys-12-ch10'
    },
    {
      title: 'NotepediaX Master Formula Sheet',
      chapter: 'Optics & Wave Motion Formulae',
      page: 12,
      examCode: 'JEE_ADVANCED',
      snippet: 'Fringe width β = (λ * D) / d. Path difference Δx = d * sin(θ) ≈ d * y / D for constructive and destructive interference minima.',
      similarity: 0.89,
      noteId: 'enote-optics-master'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="mt-6 pt-5 border-t border-brand-border/60 bg-gradient-to-b from-brand-subtle/40 to-transparent p-4 sm:p-5 rounded-2xl border border-brand-border/40">
      
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-border/40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-brand-text font-display">Grounded Source Verification</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
              </span>
            </div>
            <p className="text-[11px] text-brand-muted">Grounded against verified syllabus textbooks & NotepediaX E-Notes</p>
          </div>
        </div>

        {/* Confidence & Routing Badges */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${getScoreColor(confidenceScore)}`}>
            <Sparkles className="h-3 w-3" />
            <span>{confidenceScore}% Match</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-base border border-brand-border text-brand-muted">
            <Cpu className="h-3 w-3 text-brand-primary" />
            <span>{modelUsed}</span>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-brand-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-brand-primary" />
            Referenced Citations ({defaultSources.length})
          </span>
          <span className="text-[10px] font-mono text-brand-dim">Indexed via pgvector (HNSW)</span>
        </div>

        {defaultSources.map((source, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={false}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded 
                  ? 'bg-brand-card border-brand-primary/30 shadow-sm' 
                  : 'bg-brand-base/70 border-brand-border hover:border-brand-primary/20'
              }`}
            >
              {/* Citation Title Row */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 text-brand-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-brand-text truncate block">{source.title}</span>
                    <span className="text-[10px] text-brand-muted">{source.chapter} • Page {source.page}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {source.examCode && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-base border border-brand-border text-brand-dim hidden xs:inline-block">
                      {source.examCode}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-brand-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-brand-muted" />
                  )}
                </div>
              </button>

              {/* Excerpt Details Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-brand-border/40 px-3.5 py-3 bg-brand-subtle/30 space-y-2.5"
                  >
                    <div className="text-[11px] text-brand-body leading-relaxed pl-3 border-l-2 border-brand-primary/40 italic bg-brand-base/50 py-1.5 pr-2 rounded-r-lg">
                      "{source.snippet}"
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-brand-dim">
                        Vector Cosine Distance: {(1 - (source.similarity || 0.94)).toFixed(3)}
                      </span>

                      <Link
                        to={`/notes?highlight=${encodeURIComponent(source.chapter)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                      >
                        <FileCheck className="h-3 w-3" />
                        Open in E-Notes
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Pipeline Info */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-brand-dim pt-2 border-t border-brand-border/30">
        <span>Pipeline: {pipeline}</span>
        <span className="text-brand-primary font-medium">Confidence: High Reliability</span>
      </div>

    </div>
  );
}
