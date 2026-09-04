/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#51534d',
          card: '#444640',
          darkCard: '#3b3d37',
          border: '#63655d',
          accent: '#316d7a',
          accentHover: '#275863',
        }
      }
    },
  },
  plugins: [],
}
