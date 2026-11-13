import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const tempDir = path.resolve('Read/V3.0/Temp/executioner/Undead executioner puppet/png');

function analyzeFile(filename) {
  const filepath = path.join(tempDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }
  const data = fs.readFileSync(filepath);
  const png = PNG.sync.read(data);
  console.log(`\n=== ${filename} ===`);
  console.log(`Width: ${png.width}, Height: ${png.height}`);

  // Tìm bounding box tổng quát
  let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
  let nonZero = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (y * png.width + x) * 4;
      const a = png.data[idx + 3];
      if (a > 20) {
        nonZero++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Total non-transparent pixels: ${nonZero}`);
  console.log(`Bounding box: x: ${minX}..${maxX} (w=${maxX - minX + 1}), y: ${minY}..${maxY} (h=${maxY - minY + 1})`);
}

analyzeFile('idle.png');
analyzeFile('idle2.png');
analyzeFile('summonIdle.png');
analyzeFile('summonAppear.png');

