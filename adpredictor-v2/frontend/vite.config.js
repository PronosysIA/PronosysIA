import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" })],
  esbuild: {
    jsxInject: 'import React from "react"',
  },
  resolve: {
    alias: {
      "./i18n": path.resolve(__dirname, "./src/i18n"),
      "./components": path.resolve(__dirname, "./src/components"),
      "./pages": path.resolve(__dirname, "./src/pages"),
      "./hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
