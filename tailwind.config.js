/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Energetic Primary: Lime Green
        primary: {
          light: "#a3e635", // lime-400
          DEFAULT: "#84cc16", // lime-500
          dark: "#65a30d", // lime-600
        },
        // Call-to-Action: Amber/Orange
        cta: {
          light: "#fcd34d", // amber-300
          DEFAULT: "#f59e0b", // amber-500
          dark: "#d97706", // amber-600
        },
        // Danger / "Leak": Red
        danger: {
          light: "#fca5a5", // red-400
          DEFAULT: "#ef4444", // red-500
          dark: "#dc2626", // red-600
        },
        // Status Colors
        status: {
          pending: "#f59e0b", // amber-500 (CTA)
          contacted: "#0ea5e9", // <-- The only blue, for "in-progress"
          meeting: "#22c55e", // green-500
          won: "#16a34a", // green-600
          lost: "#ef4444", // red-500 (Danger)
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
