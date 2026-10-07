/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './hooks/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          sidebar: 'var(--color-bg-sidebar)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border)',
          accent: 'var(--color-border-accent)',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          gradientFrom: '#7C3AED',
          gradientTo: '#A855F7',
        },
        subject: {
          math: '#3B82F6',
          physics: '#F97316',
          chemistry: '#22C55E',
          biology: '#14B8A6',
          coding: '#8B5CF6',
          commerce: '#F59E0B',
          humanities: '#F43F5E',
          languages: '#06B6D4',
          exam: '#8B5CF6',
          general: '#8B5CF6',
        },
      },
      borderRadius: {
        card: '16px',
        control: '12px',
        full: '9999px',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.35)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        bounceDot: 'bounceDot 1.2s infinite ease-in-out',
        fadeIn: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        scaleIn: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
        pulseGlow: 'pulseGlow 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
