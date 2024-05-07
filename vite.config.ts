import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite({ routesDirectory: "src/frontend/routes", generatedRouteTree: "src/frontend/routeTree.gen.ts" })],
  build: {
    outDir: "dist/public",
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000/",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend"),
    },
  },
});
