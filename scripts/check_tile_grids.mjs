import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingDir = path.resolve('staging/env_audit');

function checkTileGrid(relPath, testTileSizes = [16, 32, 48]) {
  const fullPath = path.join(stagingDir, relPath);
  if (!fs.existsSync(fullPath)) return;
  const png = PNG.sync.read(fs.readFileSync(fullPath));
  console.log(`Checking ${relPath} (${png.width}x${png.height}):`);
  for (const s of testTileSizes) {
    const cols = png.width / s;
    const rows = png.height / s;
    const isInteger = Number.isInteger(cols) && Number.isInteger(rows);
    console.log(`  Grid ${s}x${s}: ${cols} cols x ${rows} rows -> ${isInteger ? 'EXACT MATCH' : 'NOT ALIGNED'}`);
  }
}

checkTileGrid('01_resurrected_rpg/Grass.png', [16, 32, 64]);
checkTileGrid('01_resurrected_rpg/Wall.png', [16, 32, 64]);
checkTileGrid('01_resurrected_rpg/Props.png', [16, 32, 64]);
checkTileGrid('04_pixel_art_top_down_basic/Texture/TX Tileset Grass.png', [16, 32, 64]);
checkTileGrid('05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Ground Tileset/Tileset_Ground.png', [16, 32]);
checkTileGrid('05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Buildings/Atlas/Buildings.png', [16, 32]);
checkTileGrid('06_shadow_series/SHADOW Series - The Free Assets/SHADOW Series - Pixel Tile Map Asset Pack 3/tile map.png', [16, 24, 32, 48]);
