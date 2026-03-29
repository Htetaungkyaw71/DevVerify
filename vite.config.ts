import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const onlineCompilerApiKey =
    env.ONLINECOMPILER_API_KEY || env.VITE_ONLINECOMPILER_API_KEY || "";

  return {
    server: {
      host: "::",
      port: 3000,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api/onlinecompiler/execute": {
          target: "https://api.onlinecompiler.io",
          changeOrigin: true,
          rewrite: () => "/api/run-code-sync/",
          headers: {
            Authorization: onlineCompilerApiKey,
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            router: ["react-router-dom"],
            redux: ["redux", "@reduxjs/toolkit", "react-redux"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          },
        },
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500,
    },
  };
});
