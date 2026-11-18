import fs from 'fs';
import { PNG } from 'pngjs';

function check(name, file, fw, fh) {
  const buf = fs.readFileSync(file);
  const png = PNG.sync.read(buf);
  const cols = png.width / fw;
  const rows = png.height / fh;
  console.log(`${name}: ${png.width}x${png.height} (frame: ${fw}x${fh}) -> cols: ${cols}, rows: ${rows}, total frames: ${cols * rows}`);
}

check('BAT', 'public/assets/characters/monsters/bat_sheet.png', 32, 32);
check('GHOST', 'public/assets/characters/monsters/ghost_sheet.png', 32, 32);
check('GOBLIN_DAGGER', 'public/assets/characters/monsters/goblin_scout_dagger_sheet.png', 64, 64);
