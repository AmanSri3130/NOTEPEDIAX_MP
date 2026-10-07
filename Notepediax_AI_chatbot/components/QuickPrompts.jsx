import React from 'react';
import { Brain, Sparkles, BookOpen, Code, HelpCircle } from 'lucide-react';
import { QUICK_PROMPTS } from '../utils/constants';

const ICON_MAP = {
  Brain,
  Sparkles,
  BookOpen,
  Code,
};

/**
 * Quick Starter Prompt Pills
 */
export const QuickPrompts = ({ onSelectPrompt }) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <HelpCircle size={14} className="text-cyan-400" />
        <span>Suggested AI Actions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {QUICK_PROMPTS.map((item, index) => {
          const IconComponent = ICON_MAP[item.icon] || Sparkles;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt?.(item.prompt)}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-left transition-all duration-200 group shadow-sm hover:shadow-md hover:shadow-cyan-500/5 hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shrink-0">
                <IconComponent size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
