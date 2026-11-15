import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
console.log('=== AUDIT ALL TRANSITIONS IN ZONES.JSON ===');

let total = 0;
for (const zone of data.zones) {
  console.log(`\nZone: ${zone.id} (${zone.titleVietnamese}) - Bounds: [${zone.bounds.x}, ${zone.bounds.y}, ${zone.bounds.width}, ${zone.bounds.height}]`);
  console.log(`  Default Spawn: (${zone.defaultSpawn.x}, ${zone.defaultSpawn.y})`);
  console.log(`  Transitions (${zone.transitions.length}):`);
  for (const t of zone.transitions) {
    total++;
    const trig = t.triggerRect;
    console.log(`    - ID: ${t.id} [${t.fromZone} -> ${t.toZone}]`);
    console.log(`      status: ${t.status}, barrier: ${t.barrierType}`);
    console.log(`      trigger: [${trig.x}, ${trig.y}, ${trig.width}, ${trig.height}]`);
    console.log(`      spawn: (${t.targetSpawn.x}, ${t.targetSpawn.y}), return: (${t.returnPoint.x}, ${t.returnPoint.y})`);
    
    // Check if targetSpawn is inside target zone bounds
    const targetZone = data.zones.find(z => z.id === t.toZone);
    if (targetZone) {
      const tb = targetZone.bounds;
      const inBounds = t.targetSpawn.x >= tb.x && t.targetSpawn.x <= tb.x + tb.width &&
                       t.targetSpawn.y >= tb.y && t.targetSpawn.y <= tb.y + tb.height;
      if (!inBounds) {
        console.warn(`      ⚠️ WARNING: targetSpawn (${t.targetSpawn.x}, ${t.targetSpawn.y}) OUTSIDE target bounds [${tb.x}, ${tb.y}, ${tb.width}, ${tb.height}]`);
      }
    }
  }
}
console.log(`\nTOTAL TRANSITIONS: ${total}`);
