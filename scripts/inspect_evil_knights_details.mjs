import fs from 'fs';
import { PNG } from 'pngjs';

console.log('=== 1. 2D SL KNIGHT BLOCKS ===');
const slDir = 'Pixel_Art/2D_SL_Knight_v1.0_3';
for (const file of ['Idle.png', 'Run.png', 'Hurt.png', 'Death.png', 'Pray.png', 'Attacks.png', 'crouch_attacks.png']) {
  const buf = fs.readFileSync(`${slDir}/${file}`);
  const png = PNG.sync.read(buf);
  const cols = png.width / 128;
  const rows = png.height / 64;
  console.log(`\n${file} (${png.width}x${png.height} -> ${cols} cols x ${rows} rows):`);
  let frameIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let minX = 128, maxX = 0, minY = 64, maxY = 0, count = 0;
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = ((r * 64 + y) * png.width + (c * 128 + x)) << 2;
          if (png.data[idx + 3] > 20) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (count > 0) {
        console.log(`  [r=${r}, c=${c} -> #${frameIdx}]: count=${count}, x=${minX}-${maxX} (w=${maxX-minX+1}), y=${minY}-${maxY} (h=${maxY-minY+1})`);
      }
      frameIdx++;
    }
  }
}

console.log('\n=== 2. PIXEL HORSE ATLAS ROWS ===');
const horseDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0';
const hBuf = fs.readFileSync(`${horseDir}/64x64_Atlas_HorseRider_II_Complete.png`);
const hPng = PNG.sync.read(hBuf);
console.log(`HorseRider II: ${hPng.width}x${hPng.height} (7 cols x 6 rows of 64x64)`);
for (let r = 0; r < 6; r++) {
  let rowCounts = [];
  for (let c = 0; c < 7; c++) {
    let count = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = ((r * 64 + y) * hPng.width + (c * 64 + x)) << 2;
        if (hPng.data[idx + 3] > 20) count++;
      }
    }
    rowCounts.push(count);
  }
  console.log(`  Row ${r}: [${rowCounts.join(', ')}]`);
}

console.log('\n=== 3. HOODED KNIGHT FRAMES ===');
const hkDir = 'Pixel_Art/Hooded Knight Sprites/Spritesheets';
for (const file of ['hooded knight idle.png', 'hooded knight attack.png', 'hooded knight powerup.png', 'hooded knight powerup - effects.png', 'run-idle transition.png']) {
  const buf = fs.readFileSync(`${hkDir}/${file}`);
  const png = PNG.sync.read(buf);
  console.log(`\n${file}: ${png.width}x${png.height}`);
  // check possible divisors
  let divList = [];
  for (let d = 20; d <= 200; d++) {
    if (png.width % d === 0) divList.push(d);
  }
  console.log(`  Divisors of width: ${divList.join(', ')}`);
}
