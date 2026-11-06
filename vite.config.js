import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// REV378: har build — dist/version.json (ilova yangi versiya chiqqanini shundan biladi)
const versiyaFayli = () => ({
  name: "kabutar-versiya",
  generateBundle() {
    const m = readFileSync(new URL("./src/appVersion.js", import.meta.url), "utf8").match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ v: m ? m[1] : "", t: Date.now() }) });
  },
});

export default defineConfig({
  plugins: [react(), versiyaFayli()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/recharts/")) return "charts";
          if (id.includes("/node_modules/katex/")) return "math";
          if (id.includes("/node_modules/lucide-react/")) return "icons";
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react";
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [
      "talimkabutar.uz",
      "www.talimkabutar.uz",
      "talimplatformasifrontend-production.up.railway.app",
    ],
  },
});
