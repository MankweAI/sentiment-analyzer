/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vibrant, No-Blue Palette
        primary: {
          DEFAULT: "#16a34a", // Green
          dark: "#15803d",
          light: "#dcfceb",
        },
        cta: {
          DEFAULT: "#f59e0b", // Amber
          dark: "#d97706",
          light: "#fffbeb",
        },
        danger: {
          DEFAULT: "#dc2626", // Red
          dark: "#b91c1c",
          light: "#fef2f2",
        },
        // Status Colors (Note: sky-500 is used for a neutral 'Contacted' status)
        "status-meeting": "#16a34a",
        "status-won": "#15803d",
        "status-lost": "#dc2626",
        "status-pending": "#f59e0b",
        "sky-500": "#0ea5e9",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
