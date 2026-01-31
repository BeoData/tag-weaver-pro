import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          media: ['music-metadata-browser', 'buffer'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast', 'lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('file-type')) {
          return;
        }
        warn(warning);
      },
    },
  },
}));
