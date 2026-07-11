import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "KESHO — Spend Smarter Today. Secure Tomorrow.",
        short_name: "KESHO",
        description: "Personal financial companion for Kenya and beyond.",
        theme_color: "#1fa863",
        background_color: "#0a3d24",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@kesho/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: { port: 5173 },
});
