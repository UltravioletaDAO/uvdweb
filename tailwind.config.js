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
        },

        /* Custom dashboard */
        primary: {
          DEFAULT: "#18794e",
          foreground: "#fff1f2",
        },
        secondary: {
          DEFAULT: '#27272f',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272f',
          foreground: '#8c8fa1',
        },
        accent: {
          DEFAULT: '#27272f',
          foreground: '#fafafa',
        },
        popover: {
          DEFAULT: '#1a1a1f',
          foreground: '"#fafafa',
        },
        border: '#27272f',
        input: '#27272f',
        ring: '#18794e',

        snapshot: {
          DEFAULT: '#2a69d8',
          foreground: '#fafafa',
        },
        token: {
          DEFAULT: '#7c1fff',
          foreground: '#fafafa',
        },
        funds: {
          DEFAULT: '#f59e0b',
          foreground: '#fafafa',
        },
        community: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        rewards: {
          DEFAULT: '#facc15',
          foreground: '#fafafa',
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        }
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
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