/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(239, 246, 255)',
          100: 'rgb(219, 234, 254)',
          200: 'rgb(191, 219, 254)',
          300: 'rgb(147, 197, 253)',
          400: 'rgb(96, 165, 250)',
          500: 'rgb(59, 130, 246)',
          600: 'rgb(37, 99, 235)',
          700: 'rgb(29, 78, 216)',
          800: 'rgb(30, 64, 175)',
          900: 'rgb(30, 58, 138)',
        },
        neutral: {
          50: 'rgb(250, 250, 250)',
          100: 'rgb(244, 244, 245)',
          200: 'rgb(228, 228, 231)',
          300: 'rgb(212, 212, 216)',
          400: 'rgb(161, 161, 170)',
          500: 'rgb(113, 113, 122)',
          600: 'rgb(82, 82, 91)',
          700: 'rgb(63, 63, 70)',
          800: 'rgb(39, 39, 42)',
          900: 'rgb(24, 24, 27)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
