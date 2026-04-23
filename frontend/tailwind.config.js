/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  'oklch(99.5% 0.006 75)',
          100: 'oklch(96.5% 0.015 75)',
          200: 'oklch(93% 0.015 75)',
          300: 'oklch(88% 0.018 75)',
          400: 'oklch(62% 0.018 75)',
          500: 'oklch(58% 0.13 55)',
          600: 'oklch(48% 0.11 55)',
          700: 'oklch(38% 0.09 55)',
          800: 'oklch(26% 0.018 70)',
          900: 'oklch(17% 0.015 70)',
          950: 'oklch(12% 0.012 70)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
