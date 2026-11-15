/** @type {import('tailwindcss').Config} */
// Design tokens mirror the CSS custom properties in src/index.css.
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
        "page-bg": "#F7F6F2",
        "sidebar-bg": "#F7F6F2",
        "card-bg": "#FFFFFF",
        accent: "#315C48",
        "accent-hover": "#24453A",
        "text-primary": "#242424",
        "text-muted": "#777777",
        // Warm neutral scale: existing text-zinc-* / border-zinc-* utilities
        // across the pages pick up the editorial palette from here.
        zinc: {
          50: "#FAF9F6",
          100: "#F1EFE9",
          200: "#E5E2DA",
          300: "#D3CFC4",
          400: "#A8A39A",
          500: "#777777",
          600: "#5E5E5E",
          700: "#474747",
          800: "#333333",
          900: "#242424",
          950: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "6px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(36, 36, 36, 0.04)",
        elevated: "0 6px 20px rgba(36, 36, 36, 0.08)",
      },
    },
  },
  plugins: [],
};
