/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: '#173D72',
        'royal-blue': '#2F6FED',
        teal: {
          DEFAULT: '#12B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        canvas: '#F7F9FC',
        muted: '#5B6575',
        border: '#D7DFEA',
        warning: '#D97706',
        danger: '#DC2626',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
