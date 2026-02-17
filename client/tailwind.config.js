/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#0A0C10',
        'sidebar-bg': '#0F1218',
        'card-bg': '#141821',
        'accent': '#F59E0B',
        'accent-hover': '#F6B94A',
        'text-primary': '#E6EAF2',
        'text-muted': '#9AA3B2',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'soft': '0 10px 28px rgba(0, 0, 0, 0.32)',
        'elevated': '0 14px 30px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}