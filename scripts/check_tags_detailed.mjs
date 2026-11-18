import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingRoot = path.resolve('staging/monster_audit');

// Let's inspect the layout of bat and ghost in N3XUS
const batJson = JSON.parse(fs.readFileSync(path.join(stagingRoot, '01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/bat/bat-sheet.json'), 'utf8'));
const ghostJson = JSON.parse(fs.readFileSync(path.join(stagingRoot, '01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters/ghost/ghost-sheet.json'), 'utf8'));

console.log('BAT animations:');
for (const t of batJson.meta.frameTags) {
  console.log(`  ${t.name.padEnd(15)}: frames ${String(t.from).padStart(3)}..${String(t.to).padStart(3)} (${t.to - t.from + 1}f)`);
}

console.log('\nGHOST animations:');
for (const t of ghostJson.meta.frameTags) {
  console.log(`  ${t.name.padEnd(15)}: frames ${String(t.from).padStart(3)}..${String(t.to).padStart(3)} (${t.to - t.from + 1}f)`);
}

// Check if Hallokin has aseprite or info
const halloAse = path.join(stagingRoot, '03_shadow_series/SHADOW Series - Hallokin (free)/SHADOW Series - Hallokin (free).aseprite');
console.log('\nHallokin Aseprite exists:', fs.existsSync(halloAse));
