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
        navy: {
          DEFAULT: '#1E2A3A',
          light: '#28374d',
        },
        'soft-orange': {
          DEFAULT: '#F97316',
          light: '#fb923c',
        },
        'soft-bg': '#f0f2f5',
        'soft-text': '#344767',
        'soft-muted': '#7b809a',
      },
      backgroundImage: {
        // Used as bg-gradient-orange, bg-gradient-navy etc.
        // Supports Tailwind variants (hover:bg-gradient-orange works)
        'gradient-orange': 'linear-gradient(195deg, #f97316, #ea580c)',
        'gradient-navy':   'linear-gradient(195deg, #42424a, #191919)',
        'gradient-info':   'linear-gradient(195deg, #49a3f1, #1a73e8)',
        'gradient-success':'linear-gradient(195deg, #66bb6a, #43a047)',
        'gradient-danger': 'linear-gradient(195deg, #ea0606, #c00000)',
      },
      boxShadow: {
        soft:     '0 20px 27px rgba(0,0,0,0.05)',
        'soft-md':'0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 27px rgba(0,0,0,0.05)',
        card:     '0px 2px 6px rgba(0,0,0,0.04), 0 20px 27px rgba(0,0,0,0.05)',
        inset:    'inset 0 1px 2px rgba(0,0,0,0.075)',
      },
      borderRadius: {
        card: '1rem',
        btn:  '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
