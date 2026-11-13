import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    watch: {
      ignored: ['**/Pixel_Art/**', '**/Read/**', '**/scripts/**', '**/reference/**', '**/dist/**']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
