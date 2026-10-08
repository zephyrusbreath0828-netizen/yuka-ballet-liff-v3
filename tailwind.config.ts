import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ballet: {
          50: "#fdf2f6",
          100: "#fce7f1",
          200: "#fbcfe3",
          300: "#f9a8cb",
          400: "#f472b0",
          500: "#e8549a",
          600: "#d63381",
          700: "#b91f66",
          800: "#9a1c56",
          900: "#831a4b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
