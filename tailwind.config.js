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
          DEFAULT: '#121212',
          lighter: '#1e1e1e',
          input: '#252525',
        },
        ultraviolet: {
          darker: '#320066',
          dark: '#5a00cc',
          DEFAULT: '#6a00ff',
          light: '#7c1fff',
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#a0a0a0',
        },
        error: {
          DEFAULT: '#d32f2f',
          light: '#ef5350',
        }
      },
      borderColor: {
        DEFAULT: '#2a2a2a',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'card-image-gradient': "linear-gradient(180deg, rgba(0,0,0,0.13) 0%, rgba(0,0,0,0.13) 99%)"
      }
    },
  },
  plugins: [],
}; 