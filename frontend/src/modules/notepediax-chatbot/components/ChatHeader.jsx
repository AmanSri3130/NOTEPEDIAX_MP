import { Bot, Sparkles, Trash2, Settings, Minus, Maximize2, Minimize2, X } from 'lucide-react';

/**
 * Top Header Navigation Bar for NotepediaX AI Companion
 */
export const ChatHeader = ({
  onClearHistory,
  onOpenSettings,
  onMinimize,
  onToggleFullscreen,
  isFullscreen,
  onClose,
  isStreaming,
}) => {
  return (
    <div className="npx-header-bar flex items-center justify-between px-3.5 py-2.5 select-none relative z-30 shrink-0">
      {/* Brand Title & Online Badge */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="relative shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-indigo-600 p-[1.5px] shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300">
              <Bot size={19} />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs sm:text-sm font-bold truncate tracking-wide flex items-center gap-1.5 npx-text-heading">
              NotepediaX AI
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded-md shrink-0">
                Companion
              </span>
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] npx-text-muted flex items-center gap-1 truncate">
            <Sparkles size={11} className="text-amber-400 shrink-0" />
            <span className="truncate">Secure NotepediaX AI</span>
          </p>
        </div>
      </div>

      {/* Header Action Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-30">
        {/* Status Badge */}
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>

        {/* Clear History */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClearHistory?.();
          }}
          disabled={isStreaming}
          className="p-1.5 rounded-lg hover:bg-slate-500/10 npx-text-muted hover:text-rose-400 transition-colors"
          title="Clear Chat History"
        >
          <Trash2 size={15} />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenSettings?.();
          }}
          className="p-1.5 rounded-lg hover:bg-slate-500/10 npx-text-muted hover:text-cyan-400 transition-colors"
          title="Chatbot Settings"
        >
          <Settings size={15} />
        </button>

        <div className="h-4 w-[1px] bg-slate-500/20 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFullscreen?.();
          }}
          className="p-1.5 rounded-lg hover:bg-slate-500/10 npx-text-muted hover:text-cyan-400 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        {/* Minimize Button */}
        {onMinimize && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMinimize?.();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-500/10 npx-text-muted hover:text-cyan-400 transition-colors"
            title="Minimize"
          >
            <Minus size={15} />
          </button>
        )}

        {/* High-Visibility Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
          className="npx-close-btn p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm ml-1"
          title="Close AI Companion (Esc)"
        >
          <X size={17} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
