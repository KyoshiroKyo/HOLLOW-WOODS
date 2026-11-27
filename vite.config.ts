import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const EXCLUDED_DIST_EXTENSIONS = new Set(['.rar', '.zip', '.7z', '.tar', '.gz', '.bak', '.tmp', '.psd', '.aseprite']);

function stripNonRuntimeFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += stripNonRuntimeFiles(full);
    } else if (EXCLUDED_DIST_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      fs.unlinkSync(full);
      removed++;
    }
  }
  return removed;
}

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
      },
      closeBundle() {
        const distDir = path.resolve(process.cwd(), 'dist');
        const removed = stripNonRuntimeFiles(distDir);
        if (removed > 0) {
          console.log(`[p2game-cleaner] Excluded ${removed} non-runtime archive/backup file(s) from dist/`);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser') || id.includes('node_modules\\phaser')) {
            return 'vendor-phaser';
          }
          if (id.includes('/src/data/') || id.includes('\\src\\data\\')) {
            return 'game-data';
          }
        }
      }
    }
  }
});
