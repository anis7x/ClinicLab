/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical/Tech Palette
        primary: {
          DEFAULT: '#1e3a8a', // blue-900
          dark: '#1e3a8a',
          light: '#3b82f6',
        },
        accent: {
          DEFAULT: '#22d3ee', // cyan-400
          hover: '#06b6d4',
        }
      },
      fontFamily: {
        heading: ['Cairo', 'sans-serif'],
        body: ['Tajawal', 'sans-serif'],
        sans: ['Tajawal', 'sans-serif'], // Default to Tajawal
      },
    },
  },
  plugins: [],
}
