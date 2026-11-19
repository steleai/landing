import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // dev only: the effect kit in public/fx is loaded at runtime with a dynamic import. Vite refuses to
    // transform public files requested as scripts, so serve them as they are (a build copies them as they are).
    {
      name: "serve-fx-kit",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? "").split("?")[0];
          const root = path.join(__dirname, "public", "fx");
          const file = path.resolve(__dirname, "public", "." + url);
          // only files inside public/fx: refuse anything that resolves outside it (../ in the URL)
          if (url.startsWith("/fx/") && url.endsWith(".js") && file.startsWith(root + path.sep) && fs.existsSync(file)) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(fs.readFileSync(file));
            return;
          }
          next();
        });
      },
    },
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
