import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const root = path.resolve('staging/monster_audit/03_shadow_series');

// 1. Hallokin
console.log('=== ENTITY 1: HALLOKIN ===');
const hallokinDir = path.join(root, 'SHADOW Series - Hallokin (free)/png (free)');
if (fs.existsSync(hallokinDir)) {
  const files = fs.readdirSync(hallokinDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(hallokinDir, f)));
    // In Hallokin, each frame is usually 64x64, 96x96, or 128x128. Let's find frame width.
    // The height is 128px.
    const frameH = png.height;
    // Let's test standard divisors for width
    let frameW = frameH;
    if (png.width % 64 === 0 && png.height === 128) {
      // Let's test if frame is 128x128 or 64x128 or 96x128
      const nFrames128 = png.width / 128;
      const nFrames96 = png.width / 96;
      const nFrames64 = png.width / 64;
      console.log(`  ${f}: ${png.width}x${png.height} -> if frame 128w: ${nFrames128} frames; if 96w: ${nFrames96} frames; if 64w: ${nFrames64} frames`);
    } else {
      console.log(`  ${f}: ${png.width}x${png.height}`);
    }
  }
}

// 2. Shadeflit
console.log('\n=== ENTITY 2: SHADEFLIT ===');
const shadeflitDir = path.join(root, 'SHADOW Series - Shadeflit (Free)');
if (fs.existsSync(shadeflitDir)) {
  const files = fs.readdirSync(shadeflitDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(shadeflitDir, f)));
    console.log(`  ${f}: ${png.width}x${png.height}`);
  }
}

// 3. The Blind Huntress
console.log('\n=== ENTITY 3: THE BLIND HUNTRESS ===');
const huntressDir = path.join(root, 'SHADOW Series - The Blind Huntress/Sprite Sheet');
if (fs.existsSync(huntressDir)) {
  const files = fs.readdirSync(huntressDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(huntressDir, f)));
    const frameH = png.height;
    const nFrames = png.width / 240; // 240 is common width in huntress (e.g. 240x128)
    console.log(`  ${f}: ${png.width}x${png.height} -> width/240 = ${png.width / 240}, width/128 = ${png.width / 128}, width/48 = ${png.width / 48}`);
  }
}

// Also check the folder in "SHADOW Series - The Free Assets"
const huntressDir2 = path.join(root, 'SHADOW Series - The Free Assets/SHADOW Series - The Blind Huntress/Sprite Sheet');
if (fs.existsSync(huntressDir2)) {
  console.log('In SHADOW Series - The Free Assets/The Blind Huntress:');
  const files = fs.readdirSync(huntressDir2).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(huntressDir2, f)));
    console.log(`  ${f}: ${png.width}x${png.height}`);
  }
}

// 4. The Shadowed Wetlands Boss
console.log('\n=== ENTITY 4: THE SHADOWED WETLANDS BOSS ===');
const bossDir = path.join(root, 'SHADOW Series - The Shadowed Wetlands Boss v1.1/Sprite Sheet');
if (fs.existsSync(bossDir)) {
  const files = fs.readdirSync(bossDir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(bossDir, f)));
    console.log(`  ${f}: ${png.width}x${png.height} -> width/247 = ${png.width / 247}`);
  }
  const newDir = path.join(bossDir, 'new');
  if (fs.existsSync(newDir)) {
    const nfiles = fs.readdirSync(newDir).filter(f => f.endsWith('.png'));
    for (const f of nfiles) {
      const png = PNG.sync.read(fs.readFileSync(path.join(newDir, f)));
      console.log(`  new/${f}: ${png.width}x${png.height} -> width/247 = ${png.width / 247}`);
    }
  }
}
