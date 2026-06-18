/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          bg: '#14141E',
          card: '#1C1C28',
          highlight: '#252634',
          border: '#2E2F3E',
        },
        gold: {
          400: '#FACC15',
          500: '#EAB308',
        }
      }
    },
  },
  plugins: [],
}
