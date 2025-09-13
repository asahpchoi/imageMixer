/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#FF6B6B',
        secondary: '#FFD93D',
        accent: '#6BFFB8',
        dark: '#2C3E50',
        light: '#ECF0F1',
      },
    },
  },
  plugins: [],
}