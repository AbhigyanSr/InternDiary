/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "page-bg": "#FAF9F5",
        "sidebar-bg": "#FFFFFF",
        "card-bg": "#FFFFFF",
        accent: "#09090B",
        "accent-hover": "#27272A",
        "text-primary": "#09090B",
        "text-muted": "#71717A",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        soft: "0 10px 28px rgba(0, 0, 0, 0.32)",
        elevated: "0 14px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
