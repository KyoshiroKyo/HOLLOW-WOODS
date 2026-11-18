import fs from 'fs';
import { PNG } from 'pngjs';

const files = [
  'public/assets/characters/villagers/npc_garth.png',
  'public/assets/characters/villagers/npc_edda.png',
  'public/assets/characters/villagers/npc_neris.png',
  'public/assets/characters/villagers/npc_finn.png',
  'public/assets/characters/villagers/npc_blacksmith.png',
  'public/assets/characters/npcs/npc_garth.png',
  'public/assets/characters/npcs/npc_edda.png',
  'public/assets/characters/npcs/npc_neris.png',
  'public/assets/characters/npcs/npc_finn.png',
  'public/assets/characters/npcs/npc_blacksmith.png',
  'public/assets/characters/garth.png',
  'public/assets/characters/edda.png',
  'public/assets/characters/neris.png'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const png = PNG.sync.read(fs.readFileSync(f));
    let minX = png.width, maxX = -1, minY = png.height, maxY = -1;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        if (png.data[idx + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`${f.padEnd(55)}: ${png.width}x${png.height} -> Bounds: X=[${minX}..${maxX}] (W=${maxX-minX+1}), Y=[${minY}..${maxY}] (H=${maxY-minY+1})`);
  }
}
