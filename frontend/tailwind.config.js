/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 🦞 Legacy claw palette (kept for compatibility)
        claw: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // 🐎 Hermès-inspired craftsmanship palette
        hermes: {
          orange: '#F37021',
          'orange-light': '#FF8C42',
          'orange-dark': '#D45A10',
          brown: '#2C1810',
          'brown-light': '#4A3728',
          'brown-warm': '#6B4423',
          gold: '#C9A961',
          'gold-light': '#E0C875',
          'gold-dark': '#A68B4B',
          cream: '#FAF7F2',
          'cream-dark': '#F0EBE3',
          ink: '#1A1A1A',
          'ink-soft': '#3D3D3D',
          'ink-muted': '#8C8C8C',
          parchment: '#F5F0E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'send-flight': 'sendFlight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        sendFlight: {
          '0%': { opacity: '1', transform: 'translateX(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(40px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
};
