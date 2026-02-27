/** @type {import('tailwindcss').Config} - Refined Versatility E-commerce */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Refined Versatility - Vêtements vintage */
        offwhite: '#FAFAF8',
        charcoal: '#1A1A1A',
        pearl: '#E8E8E5',
        gold: '#B8986E',
        sage: '#8A9A8B',
        /* Aliases */
        primary: {
          DEFAULT: '#1A1A1A',
          light: '#FAFAF8',
          mute: '#E8E8E5',
        },
        accent: {
          gold: '#B8986E',
          sage: '#8A9A8B',
        },
        'primary-dark': '#1A1A1A',
        'primary-gold': '#C9A96E',
        'primary-gold-dark': '#A67C52',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'luxury': '0.12em',
        'luxury-wide': '0.2em',
      },
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['2.25rem', { lineHeight: '1.3' }],
        'h3': ['1.5rem', { lineHeight: '1.35' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        'screen-min': '80px',
      },
      maxWidth: {
        'grid': '1400px',
      },
      borderRadius: {
        'refined': '6px',
        'capsule': '9999px',
      },
      boxShadow: {
        'refined': '0 2px 12px rgba(26, 26, 26, 0.06)',
        'refined-hover': '0 8px 24px rgba(26, 26, 26, 0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.04)',
      },
      transitionDuration: {
        'refined': '300ms',
      },
      aspectRatio: {
        'product': '4 / 5',
      },
    },
  },
  plugins: [],
};
