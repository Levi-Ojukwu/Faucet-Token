/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4d5b49',
          50: '#f2f4f0',
          100: '#e5e9e0',
          200: '#cbd3c1',
          300: '#b1bda2',
          400: '#97a783',
          500: '#7d9164',
          600: '#4d5b49',
          700: '#3d4a39',
          800: '#2d3a29',
          900: '#1d2919',
        },
        secondary: {
          DEFAULT: '#ab8476',
          50: '#f7f4f0',
          100: '#efe9e0',
          200: '#dfd3c1',
          300: '#cfbda2',
          400: '#bfa783',
          500: '#ab8476',
          600: '#9b7466',
          700: '#8b6456',
          800: '#7b5446',
          900: '#6b4436',
        },
        accent: '#f5f5f5',
        dark: '#1a1a1a',
        light: '#ffffff',
        border: '#e5e5e5',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
