import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    watch: {
      ignored: [
        '**/Pixel_Art/**',
        '**/Read/**',
        '**/scripts/**',
        '**/reference/**',
        '**/dist/**',
        '**/Backups/**',
        '**/release/**',
        '**/docs/**',
        '**/_unused_assets_archive/**',
        '**/staging/**',
        '**/backup_*/**'
      ]
    }
  },
  plugins: [
    {
      name: 'p2game-cleaner',
      renderChunk(code) {
        let cleaned = code.replace(/navigator\.getUserMedia/g, 'window._gum');
        cleaned = cleaned.replace(/new\s+Function\s*\(\s*["']return this["']\s*\)\s*\(\)/g, '(function(){return window})()');
        return cleaned;
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
