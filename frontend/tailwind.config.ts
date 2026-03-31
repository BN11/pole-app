import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // POLE brand colors
        primary: {
          DEFAULT: '#00FF87',
          50: '#E5FFF4',
          100: '#CCFFE9',
          200: '#99FFD3',
          300: '#66FFBC',
          400: '#33FFA5',
          500: '#00FF87',
          600: '#00CC6C',
          700: '#009951',
          800: '#006636',
          900: '#00331B',
        },
        dark: {
          DEFAULT: '#0A0A0F',
          50:  '#1A1A2E',
          100: '#12121A',
          200: '#0E0E16',
          300: '#0A0A0F',
        },
        surface: {
          DEFAULT: '#12121A',
          hover: '#1A1A2E',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 135, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 255, 135, 0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
