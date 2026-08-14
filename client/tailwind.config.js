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
        primary: {
          DEFAULT: 'var(--primary-color, #ffc100)',
          light: 'rgba(var(--primary-color-rgb, 255, 193, 0), 0.8)',
          dark: 'rgba(var(--primary-color-rgb, 255, 193, 0), 1.1)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color, #1C68F5)',
          light: 'rgba(var(--secondary-color-rgb, 28, 104, 245), 0.8)',
          dark: 'rgba(var(--secondary-color-rgb, 28, 104, 245), 1.1)',
        },
        accent: {
          DEFAULT: 'var(--accent-color, #ffc100)',
          light: 'rgba(var(--accent-color-rgb, 255, 193, 0), 0.8)',
          dark: 'rgba(var(--accent-color-rgb, 255, 193, 0), 1.1)',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      }
    },
  },
  plugins: [],
}
