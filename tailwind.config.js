/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        // Primary — deep indigo
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent — warm amber
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Surface — cool slate (dark mode base)
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080e1a',
        },
        // Semantic
        success: { light: '#dcfce7', DEFAULT: '#22c55e', dark: '#16a34a' },
        warning: { light: '#fef9c3', DEFAULT: '#eab308', dark: '#ca8a04' },
        danger:  { light: '#fee2e2', DEFAULT: '#ef4444', dark: '#dc2626' },
        info:    { light: '#dbeafe', DEFAULT: '#3b82f6', dark: '#2563eb' },
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.25)',
        'card':       '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'grid-subtle':  'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      keyframes: {
        'slide-in-left':  { from: { transform: 'translateX(-100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        'slide-in-right': { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        'slide-in-up':    { from: { transform: 'translateY(12px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        'fade-in':        { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in':       { from: { transform: 'scale(0.96)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        'pulse-glow':     { '0%,100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' }, '50%': { boxShadow: '0 0 0 6px rgba(99,102,241,0.12)' } },
        'shimmer':        { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'slide-in-left':  'slide-in-left 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-up':    'slide-in-up 0.2s ease-out',
        'fade-in':        'fade-in 0.15s ease-out',
        'scale-in':       'scale-in 0.15s ease-out',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
