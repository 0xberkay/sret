import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  // Use the repository name as base when deployed to GitHub Pages
  base: './', // Changed from '/sret/' to './'
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  }
});