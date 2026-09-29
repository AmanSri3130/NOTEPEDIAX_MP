import React from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'pink', 'amber'
  className = '',
  disabled = false
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-glow-sm hover:shadow-glow-md border border-cosmic-indigo/30';
      case 'secondary':
        return 'border border-slate-300 dark:border-slate-700 bg-cosmic-surface/60 text-cosmic-text hover:bg-cosmic-surface hover:border-slate-400 dark:hover:border-slate-500 shadow-sm';
      case 'pink':
        return 'bg-gradient-to-r from-cosmic-pink to-cosmic-violet text-white shadow-glow-pink border border-cosmic-pink/30';
      case 'amber':
        return 'bg-gradient-to-r from-cosmic-amber to-amber-600 text-white shadow-glow-amber border border-cosmic-amber/30';
      default:
        return 'bg-cosmic-indigo text-white';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none shimmer-sweep cursor-pointer ${getVariantStyles()} ${className}`}
    >
      {children}
    </motion.button>
  );
}
