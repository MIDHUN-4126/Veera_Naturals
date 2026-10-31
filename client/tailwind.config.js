/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcd0',
          500: '#4a6741',
          700: '#2d5a27',
          800: '#1a4329',
          900: '#123E30', // Veera Brand primary forest green
          950: '#0a231b'
        },
        gold: {
          50: '#fbf9f1',
          100: '#f5f0dc',
          300: '#e5d39f',
          500: '#C6A45B', // Veera Brand botanical gold
          600: '#b08b3e',
          700: '#8c6b2b'
        },
        ivory: {
          50: '#faf8f5',
          100: '#F6F0E5', // Warm ivory background
          200: '#ede2ce',
          300: '#ded0b5'
        },
        terracotta: {
          500: '#C4713B',
          600: '#a85726'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
