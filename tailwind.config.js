/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "obsidian-950": "#0A0A0C",
        "obsidian-900": "#111113",
        "obsidian-800": "#1A1A1D",
        "glass-surface": "rgba(255,255,255,0.03)",
        "glass-border": "rgba(255,255,255,0.06)",
        "accent-blue": "#5b9cf5",
        "accent-purple": "#9b6dff",
        "accent-emerald": "#10b981",
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
