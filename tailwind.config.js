/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#030014', // Deep space blue/black
          lighter: '#0F0B29', // Slightly lighter for cards/sections
          input: '#1A1633',
        },
        ultraviolet: {
          darker: '#2E1065',
          dark: '#5B21B6',
          DEFAULT: '#7C3AED', // Electric Violet
          light: '#8B5CF6',
          glow: '#A78BFA',
        },
        cyan: {
          DEFAULT: '#06b6d4',
          glow: '#22d3ee',
        },
        text: {
          primary: '#F3F4F6', // Gray-100
          secondary: '#9CA3AF', // Gray-400
          muted: '#6B7280', // Gray-500
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        border: 'rgba(255, 255, 255, 0.1)',

        // Semantic Application Colors
        snapshot: {
          DEFAULT: '#3B82F6', // Blue-500
          foreground: '#FFFFFF',
        },
        token: {
          DEFAULT: '#8B5CF6', // Violet-500
          foreground: '#FFFFFF',
        },
        funds: {
          DEFAULT: '#F59E0B', // Amber-500
          foreground: '#FFFFFF',
        },
        community: {
          DEFAULT: '#EC4899', // Pink-500
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'], // Optional for headings if we add it
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.2), 0 0 10px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6), 0 0 30px rgba(124, 58, 237, 0.4)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
        'card-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'neon': '0 0 20px rgba(124, 58, 237, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}; 