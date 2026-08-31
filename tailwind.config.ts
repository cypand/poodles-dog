import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pd: {
          black: "#0A0A0A",
          "black-2": "#161616",
          gold: "#C99A3F",
          "gold-light": "#E0B563",
          "gold-dark": "#9C7A2E",
          cream: "#FAF7F0",
          gray: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: [
          "Arial",
          "Helvetica Neue",
          "Helvetica",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
