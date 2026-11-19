import fs from 'fs';

const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));

console.log('=== CHECKING ALL TRANSITION SPAWNS AND RETURN POINTS AGAINST COLLIDERS ===');

let issues = [];

for (const z of zonesData.zones) {
  const colliders = (z.colliders || []).filter(c => c.isSolid !== false);
  for (const t of z.transitions || []) {
    // Note: targetSpawn is in target zone (t.toZone), returnPoint is in current zone (t.fromZone)
    const targetZone = zonesData.zones.find(x => x.id === t.toZone);
    const targetColliders = targetZone ? (targetZone.colliders || []).filter(c => c.isSolid !== false) : [];

    const sp = t.targetSpawn;
    if (sp) {
      for (const c of targetColliders) {
        if (sp.x >= c.x && sp.x <= c.x + c.width && sp.y >= c.y && sp.y <= c.y + c.height) {
          issues.push(`[TRAP] targetSpawn (${sp.x},${sp.y}) of transition ${t.id} (entering ${t.toZone}) is inside collider ${c.id || c.name} at (${c.x},${c.y},${c.width},${c.height})`);
        }
      }
    }

    const rp = t.returnPoint;
    if (rp) {
      for (const c of colliders) {
        if (rp.x >= c.x && rp.x <= c.x + c.width && rp.y >= c.y && rp.y <= c.y + c.height) {
          issues.push(`[TRAP] returnPoint (${rp.x},${rp.y}) of transition ${t.id} (in ${z.id}) is inside collider ${c.id || c.name} at (${c.x},${c.y},${c.width},${c.height})`);
        }
      }
    }

    const tr = t.triggerRect;
    if (tr) {
      for (const c of colliders) {
        // Check if a solid collider completely covers the trigger rect
        const overlaps = !(tr.x + tr.width <= c.x || tr.x >= c.x + c.width || tr.y + tr.height <= c.y || tr.y >= c.y + c.height);
        if (overlaps) {
          issues.push(`[TRIGGER OVERLAP in ${z.id}] Trigger ${t.id} [${tr.x},${tr.y},${tr.width},${tr.height}] overlaps solid collider ${c.id || c.name} [${c.x},${c.y},${c.width},${c.height}]`);
        }
      }
    }
  }
}

console.log('Total issues found in transitions:', issues.length);
if (issues.length > 0) {
  console.log(issues.join('\n'));
} else {
  console.log('✔ All transition triggers, targetSpawns and returnPoints are 100% free of collider traps in zones.json!');
}

console.log('\n=== CHECKING SAFESPAWNRESOLVER SANCTUARY FALLBACKS FOR ALL 17 ZONES ===');
const safeSpawnSource = fs.readFileSync('src/systems/SafeSpawnResolver.ts', 'utf8');

// Parse fallbacks from SafeSpawnResolver
const fallbackRegex = /case '([^']+)':\s*(?:\/\/[^\n]*\s*)*return \{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+)\s*\};/g;
let match;
const parsedFallbacks = {};
while ((match = fallbackRegex.exec(safeSpawnSource)) !== null) {
  parsedFallbacks[match[1]] = { x: parseInt(match[2]), y: parseInt(match[3]) };
}

let fallbackErrors = 0;
for (const z of zonesData.zones) {
  const fb = parsedFallbacks[z.id];
  if (!fb) {
    console.error(`❌ [MISSING FALLBACK] Zone ${z.id} has no explicit Sanctuary Fallback in SafeSpawnResolver.ts`);
    fallbackErrors++;
    continue;
  }
  // Check bounds
  const inBounds = fb.x >= z.bounds.x && fb.x <= z.bounds.x + z.bounds.width &&
                   fb.y >= z.bounds.y && fb.y <= z.bounds.y + z.bounds.height;
  if (!inBounds) {
    console.error(`❌ [OUT OF BOUNDS] Fallback for ${z.id} (${fb.x}, ${fb.y}) is out of bounds`, z.bounds);
    fallbackErrors++;
  }
  // Check collision (32x32 player hitbox)
  const pBox = { x: fb.x - 16, y: fb.y - 16, w: 32, h: 32 };
  for (const c of (z.colliders || []).filter(c => c.isSolid !== false)) {
    const overlap = pBox.x < c.x + c.width && pBox.x + pBox.w > c.x &&
                    pBox.y < c.y + c.height && pBox.y + pBox.h > c.y;
    if (overlap) {
      console.error(`❌ [COLLISION] Fallback for ${z.id} (${fb.x}, ${fb.y}) collides with ${c.id || c.name}`);
      fallbackErrors++;
    }
  }
}

if (fallbackErrors === 0) {
  console.log(`✔ All ${zonesData.zones.length} zones have verified, collision-free, in-bounds Sanctuary Fallback coordinates!`);
} else {
  console.error(`❌ Found ${fallbackErrors} errors in Sanctuary Fallbacks!`);
  process.exit(1);
}

