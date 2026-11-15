import fs from 'fs';
import { PNG } from 'pngjs';

const buf = fs.readFileSync('public/assets/characters/satyr/satyr_sheet.png');
const png = PNG.sync.read(buf);
console.log('satyr_sheet.png dimensions:', png.width, 'x', png.height);

const cols = 22;
const rows = 4;
const fw = 64;
const fh = 64;

const rowNames = ['DOWN (Row 0)', 'LEFT (Row 1)', 'RIGHT (Row 2)', 'UP (Row 3)'];

for (let r = 0; r < rows; r++) {
  console.log('\n=== ' + rowNames[r] + ' ===');
  for (let c = 0; c < cols; c++) {
    const frameIdx = r * cols + c;
    let minX = 64, maxX = -1, minY = 64, maxY = -1, count = 0;
    let sumX = 0, sumY = 0;
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const px = c * fw + x;
        const py = r * fh + y;
        const idx = (py * png.width + px) * 4;
        const a = png.data[idx + 3];
        if (a > 30) {
          count++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const w = maxX >= minX ? (maxX - minX + 1) : 0;
    const h = maxY >= minY ? (maxY - minY + 1) : 0;
    const avgX = count > 0 ? (sumX / count).toFixed(1) : '-';
    const avgY = count > 0 ? (sumY / count).toFixed(1) : '-';
    console.log(`Col ${c.toString().padStart(2)} | Frame ${frameIdx.toString().padStart(2)}: count=${count.toString().padStart(4)} | bbox=[${minX.toString().padStart(2)},${minY.toString().padStart(2)} - ${maxX.toString().padStart(2)},${maxY.toString().padStart(2)}] | size=${w.toString().padStart(2)}x${h.toString().padStart(2)} | center=(${avgX}, ${avgY})`);
  }
}
