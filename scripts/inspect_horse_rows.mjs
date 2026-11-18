import fs from 'fs';
import { PNG } from 'pngjs';

const horseDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0';
const hBuf = fs.readFileSync(`${horseDir}/64x64_Atlas_HorseRider_II_Complete.png`);
const hPng = PNG.sync.read(hBuf);

for (let r = 0; r < 6; r++) {
  console.log(`\nRow ${r}:`);
  for (let c = 0; c < 7; c++) {
    let minX = 64, maxX = 0, minY = 64, maxY = 0, count = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = ((r * 64 + y) * hPng.width + (c * 64 + x)) << 2;
        if (hPng.data[idx + 3] > 20) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (count > 0) {
      console.log(`  Col ${c}: count=${count}, x=${minX}-${maxX}, y=${minY}-${maxY}`);
    }
  }
}
