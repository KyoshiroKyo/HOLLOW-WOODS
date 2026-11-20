import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const publicAssetsDir = path.join(ROOT_DIR, 'public', 'assets');
const assetEntries = [];

function scanAssets(dir, relPath = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const rel = path.join(relPath, item).split(path.sep).join('/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanAssets(full, rel);
    } else {
      assetEntries.push({
        path: 'public/assets/' + rel,
        size: stat.size,
        ext: path.extname(item).toLowerCase()
      });
    }
  }
}

scanAssets(publicAssetsDir);
assetEntries.sort((a, b) => a.path.localeCompare(b.path));

const assetSummary = {
  totalFiles: assetEntries.length,
  totalBytes: assetEntries.reduce((acc, cur) => acc + cur.size, 0),
  categories: {
    audio: assetEntries.filter(a => a.path.includes('/audio/')),
    maps: assetEntries.filter(a => a.path.includes('/maps/')),
    characters: assetEntries.filter(a => a.path.includes('/characters/')),
    environment: assetEntries.filter(a => a.path.includes('/environment/')),
    monsters: assetEntries.filter(a => a.path.includes('/monsters/')),
    ui: assetEntries.filter(a => a.path.includes('/ui/'))
  }
};

fs.writeFileSync(path.join(ROOT_DIR, 'ASSETS_MANIFEST.json'), JSON.stringify(assetSummary, null, 2), 'utf8');
console.log(`✓ ASSETS_MANIFEST.json updated: ${assetEntries.length} files (${(assetSummary.totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`  - audio: ${assetSummary.categories.audio.length}`);
console.log(`  - characters: ${assetSummary.categories.characters.length}`);
console.log(`  - environment: ${assetSummary.categories.environment.length}`);
console.log(`  - ui: ${assetSummary.categories.ui.length}`);
