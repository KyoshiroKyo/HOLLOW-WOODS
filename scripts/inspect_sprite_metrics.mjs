import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const targetSheets = [
  { name: 'wayfarer_idle', path: 'public/assets/characters/mossbound_wayfarer/wayfarer_idle.png', fw: 64, fh: 64 },
  { name: 'wayfarer_walk', path: 'public/assets/characters/mossbound_wayfarer/wayfarer_walk.png', fw: 64, fh: 64 },
  { name: 'edda_idle', path: 'public/assets/characters/villagers/edda_idle_sheet.png', fw: 64, fh: 64 },
  { name: 'neris_idle', path: 'public/assets/characters/villagers/neris_idle_sheet.png', fw: 64, fh: 64 },
  { name: 'garth_walk', path: 'public/assets/characters/villagers/garth_walk_sheet.png', fw: 64, fh: 64 },
  { name: 'blacksmith', path: 'public/assets/characters/villagers/blacksmith_sheet.png', fw: 64, fh: 64 },
  { name: 'errand_boy (finn)', path: 'public/assets/characters/villagers/errand_boy_walk_sheet.png', fw: 64, fh: 64 },
  { name: 'campfire_knight_idle', path: 'public/assets/characters/npcs/campfire_knight_idle_sheet.png', fw: 64, fh: 64 },
  { name: 'campfire_knight_pray', path: 'public/assets/characters/npcs/campfire_knight_pray_sheet.png', fw: 64, fh: 64 },
  { name: 'bat', path: 'public/assets/characters/monsters/bat_sheet.png', fw: 32, fh: 32 },
  { name: 'ghost', path: 'public/assets/characters/monsters/ghost_sheet.png', fw: 32, fh: 32 },
  { name: 'skull_wolf', path: 'public/assets/characters/monsters/skull_wolf_sheet.png', fw: 64, fh: 64 },
  { name: 'the_listener', path: 'public/assets/monsters/the_listener.png', fw: 64, fh: 64 },
  { name: 'goblin_scout', path: 'public/assets/characters/monsters/goblin_scout_dagger_sheet.png', fw: 64, fh: 64 },
  { name: 'fallen_knight', path: 'public/assets/characters/enemies/fallen_knight_sheet.png', fw: 64, fh: 64 },
  { name: 'dread_horseman', path: 'public/assets/characters/enemies/dread_horseman_sheet.png', fw: 128, fh: 96 },
  { name: 'hooded_knight', path: 'public/assets/characters/bosses/hooded_knight_sheet.png', fw: 160, fh: 160 }
];

console.log('=== SPRITE SHEET METRICS ANALYSIS ===\n');

for (const item of targetSheets) {
  if (!fs.existsSync(item.path)) {
    console.log(`[NOT FOUND] ${item.name}: ${item.path}`);
    continue;
  }
  const data = fs.readFileSync(item.path);
  const png = PNG.sync.read(data);
  const cols = Math.floor(png.width / item.fw);
  const rows = Math.floor(png.height / item.fh);

  let minXOverall = 999, maxXOverall = -1, minYOverall = 999, maxYOverall = -1;
  let maxFrameHeight = 0, maxFrameWidth = 0;

  // inspect first frame (or all frames)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let minX = item.fw, maxX = -1, minY = item.fh, maxY = -1;
      for (let y = 0; y < item.fh; y++) {
        for (let x = 0; x < item.fw; x++) {
          const px = c * item.fw + x;
          const py = r * item.fh + y;
          const idx = (py * png.width + px) * 4;
          const alpha = png.data[idx + 3];
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const frameW = maxX - minX + 1;
        const frameH = maxY - minY + 1;
        if (frameW > maxFrameWidth) maxFrameWidth = frameW;
        if (frameH > maxFrameHeight) maxFrameHeight = frameH;
        if (minX < minXOverall) minXOverall = minX;
        if (maxX > maxXOverall) maxXOverall = maxX;
        if (minY < minYOverall) minYOverall = minY;
        if (maxY > maxYOverall) maxYOverall = maxY;
      }
    }
  }

  console.log(`${item.name.padEnd(22)} | PNG: ${png.width}x${png.height} | Frame: ${item.fw}x${item.fh} (${cols}x${rows}=${cols*rows} frames)`);
  console.log(`   -> Pixel Content Bounds: X=[${minXOverall}..${maxXOverall}], Y=[${minYOverall}..${maxYOverall}]`);
  console.log(`   -> Max Pixel Dimensions: Width=${maxFrameWidth}px, Height=${maxFrameHeight}px, BottomGap=${item.fh - 1 - maxYOverall}px\n`);
}
