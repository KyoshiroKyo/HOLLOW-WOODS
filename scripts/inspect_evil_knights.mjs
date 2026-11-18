import fs from 'fs';
import { PNG } from 'pngjs';

console.log('=== 1. 2D SL KNIGHT ===');
const slDir = 'Pixel_Art/2D_SL_Knight_v1.0_3';
for (const f of ['Idle.png', 'Run.png', 'Attacks.png', 'crouch_attacks.png', 'Hurt.png', 'Death.png', 'Pray.png']) {
  const p = `${slDir}/${f}`;
  if (fs.existsSync(p)) {
    const png = PNG.sync.read(fs.readFileSync(p));
    const n = png.width / 128;
    console.log(`${f}: ${png.width}x${png.height} -> ${n} frames of 128x64`);
  }
}

console.log('\n=== 2. PIXEL HORSE ===');
const horseDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0';
for (const f of ['64x64_Atlas_HorseRider_I_Complete.png', '64x64_Atlas_HorseRider_II_Complete.png']) {
  const p = `${horseDir}/${f}`;
  if (fs.existsSync(p)) {
    const png = PNG.sync.read(fs.readFileSync(p));
    console.log(`${f}: ${png.width}x${png.height}`);
  }
}

console.log('\n=== 3. HOODED KNIGHT ===');
const hkDir = 'Pixel_Art/Hooded Knight Sprites/Spritesheets';
for (const f of fs.readdirSync(hkDir).filter(x => x.endsWith('.png'))) {
  const p = `${hkDir}/${f}`;
  const png = PNG.sync.read(fs.readFileSync(p));
  console.log(`${f}: ${png.width}x${png.height}`);
}
