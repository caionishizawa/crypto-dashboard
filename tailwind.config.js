/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crypto-gold': '#FFD700',
        'crypto-green': '#00FF88',
        'crypto-blue': '#0088FF',
        'crypto-purple': '#8800FF',
        'dark-brown': '#451A03',
        'dark-green': '#14532D',
        'dark-blue': '#1E3A8A',
        'dark-purple': '#581C87',
      },
      animation: {
        'gradient': 'gradient 25s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'crypto': '0 0 20px rgba(255, 215, 0, 0.3)',
        'crypto-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'crypto-blue': '0 0 20px rgba(0, 136, 255, 0.3)',
        'crypto-purple': '0 0 20px rgba(136, 0, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 