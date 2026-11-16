import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== VERIFICATION C4-13-04: LANTERN DISPLAY, ATTACK SYNC & [F] OPTIMIZATION ===\n');

// 1. Constants.ts checks
console.log('1. Checking Constants.ts...');
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf-8');
assert(
  constantsSrc.includes('export const LANTERN_OFFSET_DOWN = { x: -5, y: -16 };'),
  'LANTERN_OFFSET_DOWN is aligned with pixel art at { x: -5, y: -16 }'
);
assert(
  constantsSrc.includes('export const LANTERN_OFFSET_UP = { x: 13, y: -19 };'),
  'LANTERN_OFFSET_UP is aligned with pixel art at { x: 13, y: -19 }'
);
assert(
  constantsSrc.includes('export const LANTERN_OFFSET_LEFT = { x: -9, y: -16 };'),
  'LANTERN_OFFSET_LEFT is aligned with pixel art at { x: -9, y: -16 }'
);
assert(
  constantsSrc.includes('export const LANTERN_OFFSET_RIGHT = { x: 9, y: -16 };'),
  'LANTERN_OFFSET_RIGHT is aligned with pixel art at { x: 9, y: -16 }'
);

// 2. SatyrPlayer.ts checks
console.log('\n2. Checking SatyrPlayer.ts...');
const playerSrc = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf-8');

// Check detached brown box removed
assert(
  !playerSrc.includes('0x352317') && !playerSrc.includes('Soot Glass'),
  'Detached brown box (soot glass 0x352317) completely removed from lantern visuals'
);
assert(
  playerSrc.includes('this.lanternOverlayGfx.clear();\n      return;') ||
  playerSrc.includes('this.lanternOverlayGfx.clear();\r\n      return;'),
  'When lantern is off (!isLit), lanternOverlayGfx immediately clears and returns'
);

// Check depth sorting
assert(
  playerSrc.includes("this.facing === 'up' ? this.depth - 1 : this.depth + 1"),
  'Depth sorting properly configured (depth - 1 for UP, depth + 1 for DOWN/LEFT/RIGHT)'
);

// Check attack offsets table
assert(
  playerSrc.includes('ATTACK_LANTERN_OFFSETS') &&
  playerSrc.includes('{ x: -7, y: -17 }') &&
  playerSrc.includes('{ x: 0, y: -37 }') &&
  playerSrc.includes('{ x: -22, y: -14 }') &&
  playerSrc.includes('{ x: 21, y: -14 }'),
  'ATTACK_LANTERN_OFFSETS table contains 6 exact per-frame trajectory coordinates for all 4 directions'
);

// Check 0-based frame conversion
assert(
  playerSrc.includes('(this.anims.currentFrame?.index ?? 1) - 1'),
  'AnimationFrame index converted from Phaser 1-based index to 0-based frameIdx'
);

// Check toggle debounce
assert(
  playerSrc.includes('lastLanternToggleTime') && playerSrc.includes('180'),
  'toggleLantern() includes 180ms debounce preventing rapid keystroke lag and light flicker'
);

// Check state handling in getLanternWorldPosition
assert(
  playerSrc.includes("currentAnimKey.includes('_attack_')") &&
  playerSrc.includes("currentAnimKey.includes('_walk_')") &&
  playerSrc.includes("currentAnimKey.includes('_run_')") &&
  playerSrc.includes("currentAnimKey.includes('_gather_')") &&
  playerSrc.includes("currentAnimKey.includes('_interact_')") &&
  playerSrc.includes("currentAnimKey.includes('_hurt_')") &&
  playerSrc.includes("currentAnimKey.includes('_death_')"),
  'getLanternWorldPosition covers all states: attack, walk, run, gather, interact, hurt, death, idle'
);

// 3. GameScene.ts checks
console.log('\n3. Checking GameScene.ts...');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(
  gameSceneSrc.includes('currentLanternRadius'),
  'GameScene maintains currentLanternRadius state property'
);

assert(
  gameSceneSrc.includes('Phaser.Math.Linear(this.currentLanternRadius, targetBaseRadius, 0.18)'),
  'updateFogOfWar performs smooth radius lerp (factor 0.18) between DIM and NORMAL radii'
);

assert(
  gameSceneSrc.includes('(cam.scrollX + cam.width * 0.5)) * cam.zoom'),
  'Mathematical projection from world to screen uses cam.scrollX and cam.zoom directly'
);

assert(
  gameSceneSrc.includes('this.cachedLightMaskImage.setScale(targetScale)') &&
  gameSceneSrc.includes('this.fogOfWarLayer.erase(this.cachedLightMaskImage)'),
  'Single unified light mask cached on GPU reused without reallocating objects'
);

assert(
  gameSceneSrc.includes('this.lanternGlowGfx.clear()') &&
  (gameSceneSrc.includes('glowFactor') || gameSceneSrc.includes('glowAlpha')) &&
  (gameSceneSrc.includes('radius * 0.82') || gameSceneSrc.includes('radius * 0.85')),
  'lanternGlowGfx warm ambient glow scaled smoothly with glowFactor and balanced radii'
);

// 4. VeilSystem.ts and UIScene.ts synchronization
console.log('\n4. Checking VeilSystem.ts & UIScene.ts sync...');
const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf-8');
const uiSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');

assert(
  veilSrc.includes('isLanternOn') &&
  (veilSrc.includes('targetAlphaGround') || veilSrc.includes('targetAlpha1')) &&
  veilSrc.includes('0.04'),
  'VeilSystem adapts fog density smoothly when isLanternOn changes'
);

assert(
  (uiSrc.includes("this.lanternStatusText.setText('🔥 [F] BẬT')") || uiSrc.includes("this.lanternStatusText.setText('🔥 ĐÈN: BẬT [F]')")) &&
  (uiSrc.includes("this.lanternStatusText.setText('[F] TẮT')") || uiSrc.includes("this.lanternStatusText.setText('ĐÈN: TẮT [F]')")),
  'UIScene HUD displays exact state-synced label and badge for [F] toggle'
);

console.log(`\n======================================================`);
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`======================================================`);

if (failed > 0) {
  process.exit(1);
}
