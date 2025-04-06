import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add proper module resolution
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Clear cache on start
  cacheDir: '.vite',
  server: {
    force: true // Force the server to restart and clear the cache
  }
});