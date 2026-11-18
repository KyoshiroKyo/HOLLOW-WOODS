import fs from 'fs';
import { PNG } from 'pngjs';

function inspectPNG(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Not found: ${filePath}`);
    return;
  }
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  console.log(`${filePath}: width=${png.width}, height=${png.height}`);
}

inspectPNG('staging/monster_audit/01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/bat/bat-sheet.png');
inspectPNG('staging/monster_audit/01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/ghost/ghost-sheet.png');
inspectPNG('staging/monster_audit/02_goblin_scout/goblin_scout_v5_weapons_dagger_1_silhouette.png');
