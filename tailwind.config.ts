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
        // SkipOS design tokens
        navy: {
          DEFAULT: '#1E2A3A',
          light: '#263548',
          dark: '#151f2d',
        },
        // orange-500 (#F97316) is already in Tailwind — used as accent
        // Full semantic palette for convenience
        'skipos-bg': '#F8FAFC',
        'skipos-text': '#0F172A',
        'skipos-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
