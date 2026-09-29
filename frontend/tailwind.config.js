/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vedantu exact brand
        'vedantu-purple':  '#6D366C',
        'vedantu-orange':  '#FF693D',
        'vedantu-green':   '#3AA348',

        // Semantic tokens
        'bg-base':         'var(--bg-base)',
        'bg-subtle':       'var(--bg-subtle)',
        'bg-section':      'var(--bg-section-purple)',
        'bg-card':         'var(--bg-card)',
        'bg-input':        'var(--bg-input)',
        'bg-nav':          'var(--bg-nav)',
        'bg-sidebar':      'var(--bg-sidebar)',
        'text-primary':    'var(--text-primary)',
        'text-body':       'var(--text-body)',
        'text-muted':      'var(--text-muted)',
        'text-faint':      'var(--text-faint)',
        'text-link':       'var(--text-link)',
        'border-base':     'var(--border-base)',
        'border-strong':   'var(--border-strong)',
        'border-focus':    'var(--border-focus)',
        'brand':           'var(--primary)',
        'brand-hover':     'var(--primary-hover)',
        'brand-subtle':    'var(--primary-subtle)',
        'brand-text':      'var(--primary-text)',
        'cta':             'var(--accent)',
        'cta-hover':       'var(--accent-hover)',
        'cta-subtle':      'var(--accent-subtle)',
        'live':            'var(--success)',
        'live-subtle':     'var(--success-subtle)',
        'live-text':       'var(--success-text)',

        // Existing Mappings for Compatibility
        brand: {
          base: 'var(--bg-base)',
          section: 'var(--bg-section-purple)',
          card: 'var(--bg-card)',
          primary: 'var(--primary)',
          'primary-light': 'var(--primary-subtle)',
          'primary-dark': 'var(--primary-hover)',
          orange: 'var(--accent)',
          'orange-light': 'var(--accent-subtle)',
          green: 'var(--success)',
          yellow: 'var(--warning)',
          pink: 'var(--danger)',
          text: 'var(--text-primary)',
          muted: 'var(--text-body)',
          dim: 'var(--text-muted)',
          light: 'var(--text-faint)',
          border: 'var(--border-base)',
          focus: 'var(--border-focus)',
        },
        cosmic: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-card)',
          card: 'var(--bg-card)',
          border: 'var(--border-base)',
          indigo: 'var(--primary)',
          cyan: 'var(--info)',
          violet: 'var(--primary-hover)',
          pink: 'var(--danger)',
          amber: 'var(--warning)',
          text: 'var(--text-primary)',
          muted: 'var(--text-body)',
          dim: 'var(--text-muted)',
        }
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marqueeReverse 25s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(109,54,108,0.2)', borderColor: 'rgba(109,54,108,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(109,54,108,0.4)', borderColor: 'rgba(109,54,108,0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' }
        }
      },
      boxShadow: {
        'card':   'var(--shadow-card)',
        'md':     'var(--shadow-md)',
        'lg':     'var(--shadow-lg)',
        'focus':  'var(--shadow-focus)',
        'accent': 'var(--shadow-accent)',
        'glow-sm': '0 0 12px rgba(109,54,108,0.2)',
        'glow-md': '0 0 25px rgba(109,54,108,0.35)',
        'glow-lg': '0 0 50px rgba(109,54,108,0.5)',
        'glow-cyan': '0 0 20px rgba(255,105,61,0.25)',
        'glow-pink': '0 0 20px rgba(229,57,53,0.25)',
        'glow-amber': '0 0 20px rgba(255,193,7,0.25)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent':  'var(--gradient-accent)',
        'gradient-hero':    'var(--gradient-hero)',
      }
    },
  },
  plugins: [],
}
