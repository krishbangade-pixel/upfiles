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
          bg: '#18191b',
          card: '#222428',
          darkCard: '#1d1e21',
          border: '#34373d',
          accent: '#316d7a',
          accentHover: '#275863',
        }
      }
    },
  },
  plugins: [],
}
