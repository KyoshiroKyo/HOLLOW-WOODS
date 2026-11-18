import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const p = path.resolve('staging/monster_audit/02_goblin_scout/goblin_scout_v5_weapons_dagger_1_silhouette.png');
const png = PNG.sync.read(fs.readFileSync(p));

console.log(`Goblin file: ${png.width}x${png.height}`);
const jsonPath = path.resolve('staging/monster_audit/02_goblin_scout/goblin_scout_v5_weapons_dagger_1_silhouette.json');
const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Check frame 0 or frame 37 (idle weapon)
const frames = Array.isArray(meta.frames) ? meta.frames : Object.entries(meta.frames);
console.log(`Number of frames in json: ${frames.length}`);
console.log('Sample frames:');
for (let i = 0; i < Math.min(5, frames.length); i++) {
  const f = Array.isArray(meta.frames) ? meta.frames[i] : frames[i][1];
  const name = Array.isArray(meta.frames) ? `frame_${i}` : frames[i][0];
  console.log(`  ${name}: rect=(${f.frame.x}, ${f.frame.y}, ${f.frame.w}, ${f.frame.h}), sourceSize=(${f.sourceSize.w}x${f.sourceSize.h})`);
}

// Check non-transparent pixels in one frame rect
const f0 = Array.isArray(meta.frames) ? meta.frames[0] : frames[0][1];
let nonZeroInF0 = 0;
let minX = 999, maxX = 0, minY = 999, maxY = 0;
for (let y = f0.frame.y; y < f0.frame.y + f0.frame.h; y++) {
  for (let x = f0.frame.x; x < f0.frame.x + f0.frame.w; x++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 0) {
      nonZeroInF0++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`Frame 0 active pixels: ${nonZeroInF0}, bounds relative to frame: (${minX - f0.frame.x}, ${minY - f0.frame.y}) - (${maxX - f0.frame.x}, ${maxY - f0.frame.y})`);

// Let's inspect the colors in the entire image
const colorSet = new Set();
for (let i = 0; i < png.data.length; i += 4) {
  if (png.data[i + 3] > 10) {
    colorSet.add(`${png.data[i]},${png.data[i+1]},${png.data[i+2]},${png.data[i+3]}`);
  }
}
console.log(`Total unique colors in PNG: ${colorSet.size}`);
console.log(`Sample colors:`, Array.from(colorSet).slice(0, 10));
