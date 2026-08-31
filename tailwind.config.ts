import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F1B2D",
          navyLight: "#16233A",
          red: "#E53935",
          blue: "#2563EB",
        },
        severity: {
          critical: "#E53935",
          high: "#F59E0B",
          medium: "#EAB308",
          low: "#22C55E",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
