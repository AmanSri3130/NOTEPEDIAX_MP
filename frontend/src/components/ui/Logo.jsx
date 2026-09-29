import React from 'react';

/**
 * NotepediaX Official Brand Logo
 * Styled with iconic bold red 3D slab typography, full-width red underline,
 * and the signature "Believe It" slogan subtitle.
 */
export default function Logo({ 
  size = 'md', 
  showTagline = true, 
  className = '',
  theme = 'auto' // 'auto' | 'dark' | 'light'
}) {
  // Size presets
  const sizeMap = {
    xs: {
      text: 'text-sm sm:text-base',
      underline: 'h-[2px] mt-[1px]',
      tagline: 'text-[8px] mt-0.5 tracking-wider',
      gap: 'gap-0',
      svgScale: 'h-6'
    },
    sm: {
      text: 'text-base sm:text-lg',
      underline: 'h-[2.5px] mt-[1.5px]',
      tagline: 'text-[9px] mt-0.5 tracking-wider font-semibold',
      gap: 'gap-0.5',
      svgScale: 'h-8'
    },
    md: {
      text: 'text-xl sm:text-2xl',
      underline: 'h-[3px] mt-[2px]',
      tagline: 'text-[10px] sm:text-[11px] mt-0.5 tracking-widest font-bold',
      gap: 'gap-0.5',
      svgScale: 'h-10'
    },
    lg: {
      text: 'text-3xl sm:text-4xl',
      underline: 'h-[4px] mt-[3px]',
      tagline: 'text-xs sm:text-sm mt-1 tracking-widest font-bold',
      gap: 'gap-1',
      svgScale: 'h-14'
    },
    xl: {
      text: 'text-4xl sm:text-6xl',
      underline: 'h-[5px] mt-[4px]',
      tagline: 'text-base sm:text-lg mt-1.5 tracking-widest font-bold',
      gap: 'gap-1.5',
      svgScale: 'h-20'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Tagline text color based on theme context
  const taglineColorClass = 
    theme === 'dark' 
      ? 'text-white' 
      : theme === 'light' 
        ? 'text-brand-text dark:text-white' 
        : 'text-brand-text dark:text-white';

  return (
    <div className={`inline-flex flex-col items-center select-none font-sans ${className}`}>
      {/* Brand Title: NOTEPEDIAX with 3D Red Shadow & Underline */}
      <div className="relative flex flex-col items-center">
        <span 
          className={`font-black uppercase tracking-tight italic transform -skew-x-6 text-[#FF2E2E] leading-none ${currentSize.text}`}
          style={{
            fontFamily: "'Sora', 'Impact', 'Plus Jakarta Sans', sans-serif",
            textShadow: '2px 2px 0px #8B0000, 3px 3px 0px rgba(0,0,0,0.4)',
            letterSpacing: '-0.02em',
            WebkitTextStroke: '0.4px #8B0000'
          }}
        >
          NOTEPEDIAX
        </span>

        {/* Full-width Solid Red Underline Bar */}
        <div 
          className={`w-[104%] bg-[#FF2E2E] rounded-full shadow-sm ${currentSize.underline}`}
          style={{
            boxShadow: '0 2px 4px rgba(255, 46, 46, 0.35)'
          }}
        />
      </div>

      {/* Tagline: Believe It */}
      {showTagline && (
        <span 
          className={`font-display transition-colors duration-200 ${taglineColorClass} ${currentSize.tagline}`}
          style={{
            letterSpacing: '0.12em',
            textShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.8)' : undefined
          }}
        >
          Believe It
        </span>
      )}
    </div>
  );
}
