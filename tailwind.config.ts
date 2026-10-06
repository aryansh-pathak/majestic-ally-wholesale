import type { Config } from "tailwindcss";

/**
 * MAJESTIC ALLY brand palette.
 * Matches the retail site's clean white + near-black look, with a warm
 * saddle-tan accent for an equestrian feel. Swap any value here and the whole
 * portal updates. "brand" = near-black ink scale (primary); "saddle" = accent.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — warm near-black / charcoal (buttons, headers, text)
        brand: {
          DEFAULT: "#2b2620",
          50: "#f7f6f4",
          100: "#eceae6",
          200: "#d8d4cc",
          300: "#b7b0a4",
          400: "#8f877a",
          500: "#6d655a",
          600: "#4f4840",
          700: "#3a352e",
          800: "#2b2620",
          900: "#1a1713",
        },
        // Accent — saddle leather / tan
        saddle: {
          DEFAULT: "#b07a3c",
          light: "#d0a46c",
          dark: "#875b26",
        },
        // Near-white page background
        cream: "#faf9f6",
        ink: "#1a1713",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
