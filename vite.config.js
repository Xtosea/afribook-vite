import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
      ],

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,png,svg,jpg}"
        ],
      },

      manifest: {
        name: "AfriBook",

        short_name: "AfriBook",

        description:
          "AfriBook social media platform",

        theme_color: "#000000",

        background_color: "#000000",

        display: "standalone",

        orientation: "portrait",

        scope: "/",

        start_url: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});