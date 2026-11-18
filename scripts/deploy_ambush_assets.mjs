import fs from 'fs';
import path from 'path';

const copies = [
  {
    src: 'staging/monster_audit/01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/bat/bat-sheet.png',
    dest: 'public/assets/characters/monsters/bat_sheet.png'
  },
  {
    src: 'staging/monster_audit/01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/ghost/ghost-sheet.png',
    dest: 'public/assets/characters/monsters/ghost_sheet.png'
  },
  {
    src: 'staging/monster_audit/02_goblin_scout/goblin_scout_v5_weapons_dagger_1_silhouette.png',
    dest: 'public/assets/characters/monsters/goblin_scout_dagger_sheet.png'
  }
];

for (const c of copies) {
  if (fs.existsSync(c.src)) {
    fs.copyFileSync(c.src, c.dest);
    console.log(`Copied ${c.src} -> ${c.dest}`);
  } else {
    console.error(`Not found: ${c.src}`);
  }
}
