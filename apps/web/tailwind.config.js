/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      // Used by CodeRunner game
      colors: {
        bg: "#070b17",
        panel: "#0f172a",
        neon: "#22d3ee",
        success: "#22c55e",
        danger: "#f43f5e",
      },
      boxShadow: {
        neon: "0 0 20px rgba(34, 211, 238, 0.35)",
      },
    },
  },
  plugins: [],
};
