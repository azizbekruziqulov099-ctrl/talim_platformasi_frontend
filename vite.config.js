import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // REV308: rasmlar JS ichiga base64 bo'lib kirmasin — aks holda dars xonasi bilan 2+ MB yuklanardi (684 ta ustoz
    // yuzi kadri va kutubxona rasmlari). Endi har rasm alohida fayl: faqat kerakli ustoz/rasm yuklanadi.
    assetsInlineLimit: (file) => (/\.(webp|png|jpe?g|gif)$/i.test(file) ? false : undefined),
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
