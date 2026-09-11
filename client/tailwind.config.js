/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Finto theme palette — nested (used as finto-primary, finto-dark, etc.) */
        finto: {
          primary:       "#96e761",
          "primary-hover": "#80d64a",
          dark:          "#1e3717",
          surface:       "#ffffff",
          "surface-alt": "#fafafa",
          border:        "#e5e7eb",
          text:          "#111827",
          muted:         "#6b7280",

          /* Flat aliases so bg-finto-bg / bg-finto-primary / text-finto-text etc. all resolve */
          bg:            "#fafafa",   /* alias for surface-alt */
        },
        /* Keep terminal tokens for any residual refs */
        terminal: {
          bg:      "#080C14",
          surface: "#0D1421",
          raised:  "#111827",
          border:  "#1E2D45",
        },
      },
      fontFamily: {
        sans:  ["Inter", "Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
        serif: ["Times New Roman", "Times", "Georgia", "serif"],
        mono:  ["Courier New", "Courier", "monospace"],
      },
      boxShadow: {
        finto: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "finto-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        "glow-blue":  "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-red":   "0 0 20px rgba(239, 68, 68, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink:   "blink 1s step-end infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
