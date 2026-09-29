import React from 'react';
import { motion } from 'framer-motion';

export default function CosmicLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-cosmic-base z-[9999]">
      <div className="relative flex items-center justify-center h-24 w-24">
        
        {/* Core glowing sphere */}
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-cosmic-cyan to-cosmic-indigo shadow-glow-lg animate-pulse" />
        
        {/* Orbiting Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="absolute border border-dashed border-cosmic-indigo/40 rounded-full h-16 w-16"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-cosmic-indigo shadow-glow-sm" />
        </motion.div>

        {/* Orbiting Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          className="absolute border border-dashed border-cosmic-cyan/35 rounded-full h-24 w-24"
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-cosmic-cyan shadow-glow-cyan" />
        </motion.div>
        
      </div>
      <span className="font-display text-sm tracking-widest text-slate-400 mt-6 animate-pulse uppercase">
        Initializing Notepediax Workspace
      </span>
    </div>
  );
}
