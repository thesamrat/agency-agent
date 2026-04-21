import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Color Palette ────────────────────────────────────────────────────────
      // "Third space" — neither temple nor classroom.
      // Warm parchment base, deep charcoal text, gold-saffron accents.
      colors: {
        // Backgrounds
        parchment: {
          50:  '#fdfaf4',
          100: '#faf4e6',
          200: '#f5e9cc',
          DEFAULT: '#faf4e6',
        },
        // Primary text — deep charcoal with warm undertone
        charcoal: {
          50:  '#f4f3f1',
          100: '#e8e6e1',
          400: '#9b9589',
          600: '#5c5650',
          800: '#2e2b26',
          900: '#1a1815',
          DEFAULT: '#2e2b26',
        },
        // Navy — secondary text, headers, depth layer labels
        navy: {
          50:  '#eef1f8',
          100: '#d5ddf0',
          600: '#3b5180',
          700: '#2d4069',
          800: '#1f2d52',
          900: '#141d35',
          DEFAULT: '#1f2d52',
        },
        // Gold / Saffron — primary accent, CTAs, highlights
        gold: {
          50:  '#fefaeb',
          100: '#fdf3c7',
          200: '#fbe58e',
          300: '#f9d25a',
          400: '#f7bc2f',
          500: '#e8a010',  // Main gold
          600: '#c47d08',  // Deeper gold
          700: '#a05e06',
          800: '#7d4505',
          DEFAULT: '#e8a010',
        },
        saffron: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',  // Primary saffron CTA
          600: '#ea6400',
          DEFAULT: '#f97316',
        },
        // Borders and dividers
        border: {
          light: '#ede8dc',
          DEFAULT: '#ddd7c8',
          strong: '#c9c1ae',
        },
        // Semantic feedback
        success: '#16a34a',
        error:   '#dc2626',
        warning: '#d97706',
      },

      // ─── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        sans:       ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        serif:      ['var(--font-crimson)', 'Georgia', 'serif'],
        devanagari: ['var(--font-devanagari)', 'Noto Sans Devanagari', 'sans-serif'],
      },
      fontSize: {
        // Sanskrit display sizes — larger for readability
        'devanagari-sm':  ['1.125rem', { lineHeight: '1.8', letterSpacing: '0.01em' }],
        'devanagari-base':['1.375rem', { lineHeight: '1.9', letterSpacing: '0.01em' }],
        'devanagari-lg':  ['1.75rem',  { lineHeight: '2.0', letterSpacing: '0.01em' }],
        'devanagari-xl':  ['2.25rem',  { lineHeight: '2.0', letterSpacing: '0.005em' }],
        // UI scale (augmented fourth — 1.414 ratio)
        'ui-xs':    ['0.707rem', { lineHeight: '1.4' }],
        'ui-sm':    ['0.875rem', { lineHeight: '1.5' }],
        'ui-base':  ['1rem',     { lineHeight: '1.6' }],
        'ui-lg':    ['1.125rem', { lineHeight: '1.6' }],
        'ui-xl':    ['1.414rem', { lineHeight: '1.4' }],
        'ui-2xl':   ['2rem',     { lineHeight: '1.3' }],
        'ui-3xl':   ['2.828rem', { lineHeight: '1.2' }],
        'ui-4xl':   ['4rem',     { lineHeight: '1.1' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ─── Animations ───────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to:   { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to:   { height: '0', opacity: '0' },
        },
        'progress-ring': {
          '0%':   { strokeDashoffset: 'var(--circumference)' },
          '100%': { strokeDashoffset: 'var(--offset)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out',
        'slide-up':      'slide-up 0.4s ease-out',
        'cursor-blink':  'cursor-blink 0.8s ease-in-out infinite',
        'shimmer':       'shimmer 1.8s linear infinite',
        'accordion-down':'accordion-down 0.25s ease-out',
        'accordion-up':  'accordion-up 0.2s ease-in',
      },

      // ─── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        'card':    '0.75rem',
        'modal':   '1rem',
        'pill':    '9999px',
      },

      // ─── Shadows ──────────────────────────────────────────────────────────────
      boxShadow: {
        'card':      '0 1px 4px rgba(30,24,18,0.06), 0 4px 16px rgba(30,24,18,0.04)',
        'card-hover':'0 4px 12px rgba(30,24,18,0.10), 0 12px 32px rgba(30,24,18,0.08)',
        'modal':     '0 8px 32px rgba(30,24,18,0.16), 0 2px 8px rgba(30,24,18,0.08)',
        'gold-glow': '0 0 0 3px rgba(232,160,16,0.25)',
      },

      // ─── Screens ──────────────────────────────────────────────────────────────
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
