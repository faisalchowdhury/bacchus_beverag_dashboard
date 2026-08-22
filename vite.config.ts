import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 4004 is the marketing site; the dashboard sits alongside it.
    port: 4010,
    host: true,
    cors: true,
  },
  build: {
    outDir: "dist",
  },
});
