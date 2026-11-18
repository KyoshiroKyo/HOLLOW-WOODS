import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const sheetPath = path.resolve('staging/env_audit/03_forest_asset_pack/Forest-Asset-Pack-Sheet.png');
const png = PNG.sync.read(fs.readFileSync(sheetPath));

console.log(`Forest Asset Pack Sheet: ${png.width}x${png.height}`);

// Connected components or bounding box finder for non-transparent islands
const visited = new Uint8Array(png.width * png.height);
const boxes = [];

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = y * png.width + x;
    const alpha = png.data[idx * 4 + 3];
    if (alpha > 10 && visited[idx] === 0) {
      // Flood fill to get bounding box
      let minX = x, maxX = x, minY = y, maxY = y;
      const queue = [x, y];
      visited[idx] = 1;
      let count = 0;

      while (queue.length > 0) {
        const cy = queue.pop();
        const cx = queue.pop();
        count++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < png.width && ny >= 0 && ny < png.height) {
            const nidx = ny * png.width + nx;
            if (visited[nidx] === 0 && png.data[nidx * 4 + 3] > 10) {
              visited[nidx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      if (count > 20) { // filter out tiny specks
        boxes.push({ minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixelCount: count });
      }
    }
  }
}

console.log(`Found ${boxes.length} discrete sprite elements:`);
boxes.sort((a, b) => a.minY - b.minY || a.minX - b.minX);
boxes.forEach((b, i) => {
  console.log(`  [${i+1}] Box: (${b.minX}, ${b.minY}) - ${b.width}x${b.height} px, area: ${b.pixelCount} px`);
});
