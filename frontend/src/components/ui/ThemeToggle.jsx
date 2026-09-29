import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Modern High-Contrast ThemeToggle Component
 * Features dual-state glowing track, animated icons, and smooth spring physics.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center h-[34px] w-[68px] rounded-full p-1 cursor-pointer transition-all duration-300 outline-none select-none border shadow-sm ${
        isDark 
          ? 'bg-[#0F172A] border-[#334155] hover:border-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
          : 'bg-[#FEF3C7] border-[#FDE68A] hover:border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
      } ${className}`}
      aria-label="Toggle dark and light theme"
      aria-pressed={isDark}
    >
      {/* Sun Icon (Light Mode) */}
      <span className="absolute left-2 z-10 flex items-center justify-center pointer-events-none">
        <Sun 
          className={`h-4 w-4 transition-all duration-300 ${
            isDark 
              ? 'text-slate-600 scale-75 opacity-40 rotate-90' 
              : 'text-amber-600 scale-100 opacity-100 rotate-0 drop-shadow-[0_0_4px_rgba(217,119,6,0.6)]'
          }`} 
        />
      </span>

      {/* Sliding Indicator Pill */}
      <motion.div
        className="rounded-full shadow-md z-20 flex items-center justify-center transition-colors"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          backgroundColor: isDark ? '#6366F1' : '#FFFFFF',
          marginLeft: isDark ? 'auto' : '0',
          width: '26px',
          height: '26px',
          boxShadow: isDark 
            ? '0 0 10px rgba(99,102,241,0.7), inset 0 0 4px rgba(255,255,255,0.4)' 
            : '0 2px 5px rgba(0,0,0,0.15)'
        }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-white" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </motion.div>

      {/* Moon Icon (Dark Mode) */}
      <span className="absolute right-2 z-10 flex items-center justify-center pointer-events-none">
        <Moon 
          className={`h-3.5 w-3.5 transition-all duration-300 ${
            isDark 
              ? 'text-indigo-300 scale-100 opacity-100 rotate-0 drop-shadow-[0_0_4px_rgba(165,180,252,0.8)]' 
              : 'text-amber-800/40 scale-75 opacity-40 -rotate-90'
          }`} 
        />
      </span>
    </button>
  );
}
