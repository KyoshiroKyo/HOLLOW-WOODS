import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== VERIFYING C4-13-19: INVISIBLE WALLS, BANNER HYSTERESIS & SHRINE TEXTURES ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Check zones.json
const zonesPath = path.resolve('src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

const runeZone = zonesData.zones.find(z => z.id === 'ancient_rune_puzzle');
assert(runeZone !== undefined, 'ancient_rune_puzzle exists in zones.json');
assert(runeZone && runeZone.colliders.length === 0, 'ancient_rune_puzzle has 0 blocking invisible colliders');

const shrineZone = zonesData.zones.find(z => z.id === 'broken_bell_shrine');
assert(shrineZone !== undefined, 'broken_bell_shrine exists in zones.json');
const shrineMainAltarCol = shrineZone?.colliders.find(c => c.id === 'shrine_main_altar');
assert(!shrineMainAltarCol, 'shrine_main_altar 96x64 box removed from broken_bell_shrine in zones.json');

const mireZone = zonesData.zones.find(z => z.id === 'silent_mire');
assert(mireZone !== undefined, 'silent_mire exists in zones.json');
const mireOldPool = mireZone?.colliders.find(c => c.id === 'mire_water_pool');
assert(!mireOldPool, 'mire_water_pool removed so boardwalk (y: 285..325) is not blocked');
const duplicatePillar1 = mireZone?.colliders.find(c => c.id === 'pillar_1');
assert(!duplicatePillar1, 'Duplicate pillar_1 collider removed from silent_mire');

// 2. Check WorldBuilder.ts
const wbPath = path.resolve('src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');

assert(!wbContent.includes('ctx.fillRect(courtyardCX - 60, courtyardCY - 30, 120, 60);'),
  'Misaligned 120x60 grey background rectangle removed from Broken Bell Shrine terrain');

assert(!wbContent.includes('createCrackedBellRuins(4500, 205);'),
  'Floating mid-air bell call removed from renderBrokenBellShrineDecorations');

assert(!wbContent.includes('const altarFront = this.scene.add.image(x + w / 2, y + 25, SPRITE_STONE_ALTAR);'),
  'Overlapping boulder (SPRITE_STONE_ALTAR) covering the shrine removed from createShrineAltar');

assert(wbContent.includes('this.colliderGroup.create(x + w / 2, y + 10, undefined)') &&
       wbContent.includes('setSize(48, 16)'),
  'Compact 48x16 collider placed at shrine rear wall (freeing front courtyard)');

assert(wbContent.includes('setSize(18, 14)') && wbContent.includes('setOffset(-9, -7)'),
  'Compact 18x14 collider placed at runestone pillar foot');

assert(wbContent.includes('setSize(28, 14)') && wbContent.includes('setOffset(-14, -7)'),
  'Compact 28x14 collider placed at stone altar foot');

assert(wbContent.includes("if (this.activeZoneId === 'ancient_rune_puzzle')") &&
       wbContent.includes('const margin = 80;'),
  'detectCurrentZone implements 80px hysteresis margin for ancient_rune_puzzle');

// 3. Check GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneContent.includes('lastZoneBannerTime: number = 0;') &&
       gameSceneContent.includes('lastBannerZoneId: string = \'\';'),
  'GameScene has lastZoneBannerTime and lastBannerZoneId state variables');

assert(gameSceneContent.includes('now - this.lastZoneBannerTime >= 4000') &&
       gameSceneContent.includes('this.currentZoneId !== this.lastBannerZoneId'),
  'GameScene throttles zone banner and screen shake behind 4s cooldown and zone inequality');

// 4. Check UIScene.ts
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8');

assert(uiSceneContent.includes('lastBannerShownTime: number = 0;') &&
       uiSceneContent.includes('lastBannerZoneTitle: string = \'\';'),
  'UIScene has lastBannerShownTime and lastBannerZoneTitle state variables');

assert(uiSceneContent.includes('now - this.lastBannerShownTime < 4000 && this.lastBannerZoneTitle === atmosphere.titleVietnamese'),
  'UIScene guards showZoneBanner against re-triggering within 4 seconds for same title');

// 5. Check PNG assets
function checkBorderTouch(pngPath) {
  const data = fs.readFileSync(pngPath);
  const png = PNG.sync.read(data);
  let touches = 0;
  for (let x = 0; x < png.width; x++) {
    if (png.data[x * 4 + 3] > 10) touches++;
    if (png.data[((png.height - 1) * png.width + x) * 4 + 3] > 10) touches++;
  }
  for (let y = 0; y < png.height; y++) {
    if (png.data[(y * png.width) * 4 + 3] > 10) touches++;
    if (png.data[(y * png.width + png.width - 1) * 4 + 3] > 10) touches++;
  }
  return { width: png.width, height: png.height, touches };
}

const shrinePng = checkBorderTouch('public/assets/environment/sprites/broken_shrine.png');
assert(shrinePng.width === 96 && shrinePng.height === 80, `broken_shrine.png is 96x80 (actual: ${shrinePng.width}x${shrinePng.height})`);
assert(shrinePng.touches === 0, `broken_shrine.png has 0 pixels touching borders (actual: ${shrinePng.touches})`);

const altarPng = checkBorderTouch('public/assets/environment/sprites/stone_altar.png');
assert(altarPng.width === 60 && altarPng.height === 42, `stone_altar.png is 60x42 (actual: ${altarPng.width}x${altarPng.height})`);
assert(altarPng.touches === 0, `stone_altar.png has 0 pixels touching borders (actual: ${altarPng.touches})`);

console.log(`\n==========================================`);
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log(`==========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL C4-13-19 VERIFICATIONS PASSED SUCCESSFULLY!');
}
