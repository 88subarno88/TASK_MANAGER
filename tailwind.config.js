/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        void: '#080c16',
        surface: '#0d1326',
        panel: '#111827',
        border: '#1e2d47',
        muted: '#2a3a55',
        cyan: {
          DEFAULT: '#00d4ff',
          dim: '#00a8cc',
          glow: 'rgba(0, 212, 255, 0.15)',
        },
        amber: {
          accent: '#f59e0b',
        },
        slate: {
          text: '#94a3b8',
          light: '#cbd5e1',
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        'glow-cyan': 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.12) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
