import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING C4-12-30: WORLD AESTHETIC POLISH & UI HARMONIZATION ===');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify zones.json tiered atmosphere
console.log('\n--- 1. Zone Atmosphere Tiered Gradation ---');
const zonesJsonPath = path.resolve('src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesJsonPath, 'utf8'));

const zoneAtmospheres = {};
for (const z of zonesData.zones) {
  zoneAtmospheres[z.id] = z.atmosphere;
}

// Core tier
assert(zoneAtmospheres['sanctuary_farm']?.fogAlpha === 0.18, 'sanctuary_farm fogAlpha is 0.18');
assert(zoneAtmospheres['sanctuary_farm']?.ambientLight === 0.86, 'sanctuary_farm ambientLight is 0.86');
assert(zoneAtmospheres['bellhollow']?.fogAlpha === 0.22, 'bellhollow fogAlpha is 0.22');
assert(zoneAtmospheres['bellhollow']?.ambientLight === 0.80, 'bellhollow ambientLight is 0.80');
assert(zoneAtmospheres['outer_woods']?.fogAlpha === 0.35, 'outer_woods fogAlpha is 0.35');
assert(zoneAtmospheres['outer_woods']?.ambientLight === 0.65, 'outer_woods ambientLight is 0.65');

// Frontier tier
assert(zoneAtmospheres['crooked_path']?.fogAlpha === 0.58, 'crooked_path fogAlpha is 0.58');
assert(zoneAtmospheres['crooked_path']?.ambientLight === 0.38, 'crooked_path ambientLight is 0.38');
assert(zoneAtmospheres['deep_forest']?.fogAlpha === 0.78, 'deep_forest fogAlpha is 0.78');
assert(zoneAtmospheres['deep_forest']?.ambientLight === 0.25, 'deep_forest ambientLight is 0.25');

// Forbidden tier
assert(zoneAtmospheres['ancient_rune_puzzle']?.fogAlpha === 0.65, 'ancient_rune_puzzle fogAlpha is 0.65');
assert(zoneAtmospheres['silent_mire']?.fogAlpha === 0.75, 'silent_mire fogAlpha is 0.75');
assert(zoneAtmospheres['broken_bell_shrine']?.fogAlpha === 0.82, 'broken_bell_shrine fogAlpha is 0.82');

// Gradation consistency check: core < frontier <= forbidden
assert(
  zoneAtmospheres['bellhollow'].fogAlpha < zoneAtmospheres['outer_woods'].fogAlpha &&
  zoneAtmospheres['outer_woods'].fogAlpha < zoneAtmospheres['crooked_path'].fogAlpha &&
  zoneAtmospheres['crooked_path'].fogAlpha < zoneAtmospheres['deep_forest'].fogAlpha &&
  zoneAtmospheres['deep_forest'].fogAlpha <= zoneAtmospheres['broken_bell_shrine'].fogAlpha,
  'fogAlpha increases consistently across zones from core to forbidden'
);

// 2. Verify UIScene depths and safe margins
console.log('\n--- 2. UIScene Depth Hierarchy & Safe Margins ---');
const uiSceneCode = fs.readFileSync(path.resolve('src/scenes/UIScene.ts'), 'utf8');

assert(uiSceneCode.includes('this.zoneBannerContainer.setDepth(8500);'), 'zoneBannerContainer depth explicitly set to 8500');
assert(uiSceneCode.includes('this.quickSlotContainer.setDepth(8000);'), 'quickSlotContainer depth explicitly set to 8000');
assert(uiSceneCode.includes('setDepth(8200)'), 'promptText depth explicitly set to 8200');
assert(uiSceneCode.includes('Phaser.Math.Clamp(sx, 180, 1100)'), 'promptText horizontal safe margin clamped to [180, 1100]');
assert(uiSceneCode.includes('Phaser.Math.Clamp(sy, 60, 620)'), 'promptText vertical safe margin clamped to [60, 620]');

// 3. Verify NPCEntity nameplate & prompt badge polish
console.log('\n--- 3. NPCEntity Nameplate & Interaction Badge Polish ---');
const npcEntityCode = fs.readFileSync(path.resolve('src/entities/NPCEntity.ts'), 'utf8');

assert(npcEntityCode.includes('0x090d0b, 0.94'), 'NPCEntity nameplate has high-contrast background (0x090d0b, 0.94)');
assert(npcEntityCode.includes('0x9b7b4d'), 'NPCEntity nameplate has antique bronze border (0x9b7b4d)');
assert(npcEntityCode.includes('0xd4af37'), 'NPCEntity nameplate has inner gold accent (0xd4af37)');
assert(npcEntityCode.includes('0x0a0f0d, 0.96'), 'NPCEntity prompt bubble has high-contrast dark background (0x0a0f0d, 0.96)');
assert(npcEntityCode.includes('0xe67e22'), 'NPCEntity prompt bubble has vibrant amber border (0xe67e22)');

// 4. Verify WorldBuilder ground footings & mist depths
console.log('\n--- 4. WorldBuilder Footings & Atmospheric Mist Depths ---');
const wbCode = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');

assert(wbCode.includes('footingGfx.setDepth(-95);'), 'Building footings set to depth -95');
assert(wbCode.includes('towerFooting.setDepth(-95);'), 'Bell tower footing set to depth -95');
assert(wbCode.includes('cottageFooting.setDepth(-95);'), 'Southwest cottage footing set to depth -95');

// Check environmental mist depths
const mistDepthMatches = wbCode.match(/mist\.setDepth\(-65\);/g) || [];
assert(mistDepthMatches.length === 5, `addBoundaryMist/addMist/addFog set to depth -65 (found ${mistDepthMatches.length}/5)`);
assert(wbCode.includes('fog.setDepth(-65);'), 'Broken Bell Shrine fog set to depth -65');

// 5. Verify VeilSystem smooth transitions & zone awareness
console.log('\n--- 5. VeilSystem Smooth Layering & Zone Awareness ---');
const veilCode = fs.readFileSync(path.resolve('src/systems/VeilSystem.ts'), 'utf8');

assert(veilCode.includes('public update(time: number, delta: number, inDeepFogZone: boolean, zoneId?: string): void'), 'VeilSystem.update accepts zoneId parameter');
assert(veilCode.includes("zoneId === 'bellhollow' || zoneId === 'sanctuary_farm'"), 'VeilSystem handles core safe zones with delicate veil');
assert(veilCode.includes('Linear(this.fogLayer1.alpha, targetAlpha1, 0.04);'), 'VeilSystem lerp factor smoothed to 0.04');

const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gameSceneCode.includes('this.veilSystem.update(time, delta, inDeepFog, this.currentZoneId);'), 'GameScene passes currentZoneId to VeilSystem');

console.log('\n======================================================');
console.log(`Total checks: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> ALL C4-12-30 POLISH & HARMONIZATION CRITERIA VERIFIED SUCCESSFULLY! <<<');
}
