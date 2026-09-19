/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b14',
          850: '#0d1322',
          800: '#131b2e',
          700: '#1e293b',
          600: '#334155',
        },
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
