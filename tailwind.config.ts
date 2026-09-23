import type { Config } from "tailwindcss";

/**
 * Tailwind CSS 設定（v4 では globals.css の `@config` から読み込まれます）
 */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f7",
          100: "#ffe4ef",
          200: "#ffc9e0",
          300: "#ff9dc7",
          400: "#fb64a5",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        ink: {
          50: "#f8f7f8",
          100: "#efecee",
          500: "#6b5b63",
          700: "#43323a",
          900: "#2b1b22",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "Meiryo",
          "sans-serif",
        ],
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 27, 34, 0.04), 0 8px 24px -12px rgba(43, 27, 34, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
