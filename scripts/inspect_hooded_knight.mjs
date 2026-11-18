import fs from 'fs';
import { PNG } from 'pngjs';

const hkDir = 'Pixel_Art/Hooded Knight Sprites/Spritesheets';

function testFw(file, fw, fh) {
  const buf = fs.readFileSync(`${hkDir}/${file}`);
  const png = PNG.sync.read(buf);
  const n = png.width / fw;
  console.log(`\n${file} with fw=${fw}, fh=${fh} -> ${n} frames:`);
  for (let i = 0; i < n; i++) {
    let minX = fw, maxX = 0, minY = fh, maxY = 0, count = 0;
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const idx = (y * png.width + (i * fw + x)) << 2;
        if (png.data[idx + 3] > 20) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`  Frame ${i}: count=${count}, x=${minX}-${maxX}, y=${minY}-${maxY}`);
  }
}

testFw('hooded knight attack.png', 180, 100);
testFw('hooded knight idle.png', 100, 100);
testFw('hooded knight idle.png', 80, 100);
testFw('hooded knight powerup.png', 100, 180);
testFw('hooded knight powerup - effects.png', 100, 180);
testFw('run-idle transition.png', 100, 125);
