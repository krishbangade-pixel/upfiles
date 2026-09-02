/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#0B0D12',
        bgSidebar: '#0F1117',
        bgCard: '#151821',
        bgSecondary: '#191C25',
        bgInput: '#11141B',
        borderColor: '#252936',
        primaryPurple: '#7C5CFF',
        primaryHover: '#6D4FF5',
      },
    },
  },
  plugins: [],
}
