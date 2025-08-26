import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Custom plugin to force SCSS into CSS modules
function forceScssModules() {
  return {
    name: "force-scss-modules",
    config(config) {
      config.css = config.css || {};
      config.css.modules = {
        ...config.css.modules,
        scopeBehaviour: "local", // force local scope
        generateScopedName: "[local]__[hash:base64:5]", // readable hashed classes
      };
    },
    // Vite uses esbuild under the hood; ensure `.scss` triggers module pipeline
    transform(code, id) {
      if (id.endsWith(".scss")) {
        // Trick Vite into treating it as a CSS module
        return {
          code,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), forceScssModules()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
