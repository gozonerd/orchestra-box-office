import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    outDir: "../dist",
  },
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
