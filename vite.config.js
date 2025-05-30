import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Read all files and directories in the source directory
  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    
    // Check if it's a directory or file
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Recursively copy directories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      copyFileSync(srcPath, destPath);
    }
  }
}

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
        main: resolve(__dirname, 'src/index.html'),
        blog: resolve(__dirname, 'src/blog.html'),
        blogPost: resolve(__dirname, 'src/blog-post.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('three')) {
            return 'three';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600 // Optional: Adjust if needed after chunking
  },
  plugins: [
    {
      name: 'copy-blog-content',
      closeBundle() {
        // Copy blog content to dist folder
        copyDir('src/blog', 'dist/blog');
        console.log('✓ Blog content copied to dist folder');
      }
    }
  ]
});