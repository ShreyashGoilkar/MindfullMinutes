/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#6F9275',
          50: '#F2F6F1',
          100: '#E7EFE5',
          200: '#D0DDCC',
          300: '#B2C7AC',
          400: '#8FAA93',
          500: '#6F9275',
          600: '#5A7B61',
          700: '#48634E',
          800: '#374E3F',
          900: '#294536',
        },
        cream: '#F8F7F2',
        forest: '#294536',
        'soft-blue': '#DCEAF0',
        'soft-peach': '#F4E3D6',
        error: '#B42318',
        success: '#39734A',
        'text-main': '#26342B',
        'text-secondary': '#748077',
        'card-border': '#E5E9E2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '16px',
      },
      transitionTimingFunction: {
        'breath': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  },
  plugins: [],
};
