import fs from 'fs';
import { PNG } from 'pngjs';

const buf = fs.readFileSync('public/assets/characters/satyr/satyr_sheet.png');
const png = PNG.sync.read(buf);

const CELL_SIZE = 64;

console.log('=== PHÂN TÍCH VỊ TRÍ CHÂN VÀ TRỌNG TÂM CHO COLS 4 ĐẾN 9 ===\n');

for (let r = 0; r < 4; r++) {
  const rowNames = ['DOWN', 'LEFT', 'RIGHT', 'UP'];
  console.log(`\n--- HÀNG ${r} (${rowNames[r]}) ---`);
  for (let c = 4; c <= 9; c++) {
    // Tìm các pixel thấp nhất (y gần 58) để xác định chân trái / chân phải
    const footPixels = [];
    for (let y = 50; y < 64; y++) {
      for (let x = 0; x < CELL_SIZE; x++) {
        const px = c * CELL_SIZE + x;
        const py = r * CELL_SIZE + y;
        const idx = (py * png.width + px) * 4;
        if (png.data[idx + 3] > 40) {
          footPixels.push({ x, y });
        }
      }
    }
    const xList = footPixels.map(p => p.x);
    const minFootX = xList.length ? Math.min(...xList) : 0;
    const maxFootX = xList.length ? Math.max(...xList) : 0;
    const footSpan = maxFootX - minFootX;
    console.log(`Col ${c}: ${footPixels.length} foot pixels, span X=[${minFootX}..${maxFootX}] (width=${footSpan})`);
  }
}
