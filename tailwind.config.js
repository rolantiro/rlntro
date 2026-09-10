/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EF',
        parchment: '#F3ECDF',
        ink: '#2B2622',
        charcoal: '#1B1815',
        moss: '#4B5D45',
        wine: '#6E2C2C',
        clay: '#8A6E52',
        mist: '#8C857C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        read: '700px',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadein: 'fadein .5s ease-out both',
        pop: 'pop .35s ease-out',
      },
    },
  },
  plugins: [],
}
