import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    cssMinify: "esbuild",
    minify: "esbuild",
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: ["favicon.svg", "icon-maskable.svg"],
      manifest: {
        id: "/",
        name: "Synthetix Labz",
        short_name: "Labz",
        description:
          "James Elton Coffman III — Synthetix Labz. AI systems, live PWAs, and field software.",
        theme_color: "#0a0a12",
        background_color: "#0a0a12",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icon-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,webmanifest,jpg,jpeg,png,webp,mp4,webm}"],
        navigateFallback: "index.html",
      },
    }),
  ],
});
