import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kesho: {
          green: {
            50: "#eefbf3", 100: "#d6f5e1", 300: "#7fdba9",
            500: "#1fa863", 600: "#188a51", 700: "#136b3f", 900: "#0a3d24",
          },
          orange: {
            50: "#fff6ed", 100: "#ffe8cf", 300: "#ffb861",
            500: "#f5820c", 600: "#d9690a", 700: "#b3520a", 900: "#5c2b06",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
