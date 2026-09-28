import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { cvDocument } from "./src/lib/cv";
import { seedProfile } from "./src/data/profile";

function resumePage(): Plugin {
  const html = () => cvDocument(seedProfile);
  return {
    name: "resume-page",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== "/resume.html" && path !== "/resume") return next();
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "resume.html", source: html() });
    },
  };
}

export default defineConfig({
  build: {
    cssMinify: "esbuild",
    minify: "esbuild",
  },
  plugins: [
    resumePage(),
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
        related_applications: [
          {
            platform: "webapp",
            url: "https://synthetix-labz.cloud/manifest.webmanifest",
          },
        ],
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
        navigateFallbackDenylist: [/^\/resume(?:\.html)?$/],
      },
    }),
  ],
});
