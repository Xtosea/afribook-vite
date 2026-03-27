import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/afribook/", // ✅ This tells Vite that your app is hosted under /afribook/
  server: {
    historyApiFallback: true, // for SPA routing
  },
});