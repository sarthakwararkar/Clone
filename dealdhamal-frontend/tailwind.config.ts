import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E84141',
        'primary-dark': '#C62F2F',
        'primary-light': '#FFF0F0',
        accent: '#FF6B35',
        success: '#22C55E',
        warning: '#F59E0B',
        background: '#F5F5F5',
        card: '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        badge: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'zoom-in-95': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'in': 'fade-in 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'zoom-in-95': 'zoom-in-95 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
