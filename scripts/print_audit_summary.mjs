import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/audit_results.json', 'utf8'));

console.log('--- SPRITESHEETS AUDIT ---');
data.spritesheets.forEach(s => {
  console.log(`${s.key.padEnd(32)} Frame: ${String(s.frameWidth).padStart(3)}x${String(s.frameHeight).padEnd(3)} | Img: ${String(s.pngWidth).padStart(4)}x${String(s.pngHeight).padEnd(4)} | Frames: ${String(s.totalFrames).padStart(2)} | ${s.relPath}`);
});

console.log('\n--- SCALE USAGES IN ENTITIES & WORLDBUILDER ---');
data.scaleUsages.forEach(u => {
  console.log(`[${u.file.replace('src/', '').padEnd(30)}:${String(u.line).padStart(4)}] ${u.code}`);
});

// Let's inspect buildings in WorldBuilder.ts
const wb = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
const buildingMatches = [...wb.matchAll(/this\.createBuilding\s*\(\s*([^;]+)\)/g)].map(m => m[1]);
console.log('\n--- BUILDINGS IN WORLDBUILDER ---');
buildingMatches.forEach(b => console.log('Building: ' + b));

// Let's inspect NPCs in NPCEntity.ts
const npc = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
console.log('\n--- NPC SETUP IN NPCENTITY.TS ---');
npc.split('\n').forEach((l, i) => {
  if (l.includes('setSize') || l.includes('setOffset') || l.includes('setScale') || l.includes('body.')) {
    console.log(`[NPCEntity:${i+1}] ${l.trim()}`);
  }
});
