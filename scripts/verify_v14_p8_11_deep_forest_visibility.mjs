import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('🧪 VERIFY V14-P8-11: DEEP FOREST CHARACTER VISIBILITY & DEPTH SYSTEM');
console.log('================================================================');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}${details ? ': ' + details : ''}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// Test 1: Constants.ts Layer Depths
// -------------------------------------------------------------
console.log('\n--- Test 1: Constants Layer Depths Definition ---');
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');

const requiredConstants = [
  'DEPTH_GROUND_BASE',
  'DEPTH_GROUND_FOOTING',
  'DEPTH_GROUND_TURF',
  'DEPTH_GROUND_STONES',
  'DEPTH_GROUND_FLORA',
  'DEPTH_GROUND_WATER',
  'DEPTH_GROUND_DECALS',
  'DEPTH_GROUND_MIST',
  'DEPTH_VEIL_GROUND_FOG',
  'DEPTH_VEIL_PINK_DAWN'
];

requiredConstants.forEach(c => {
  assert(constantsSrc.includes(c), `Constants.ts defines ${c}`);
});

// Parse values
function extractConstant(name) {
  const m = constantsSrc.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*(-?\\d+);`));
  return m ? Number(m[1]) : null;
}

const dBase = extractConstant('DEPTH_GROUND_BASE');
const dFooting = extractConstant('DEPTH_GROUND_FOOTING');
const dTurf = extractConstant('DEPTH_GROUND_TURF');
const dStones = extractConstant('DEPTH_GROUND_STONES');
const dFlora = extractConstant('DEPTH_GROUND_FLORA');
const dWater = extractConstant('DEPTH_GROUND_WATER');
const dDecals = extractConstant('DEPTH_GROUND_DECALS');
const dMist = extractConstant('DEPTH_GROUND_MIST');
const dFog = extractConstant('DEPTH_VEIL_GROUND_FOG');
const dPink = extractConstant('DEPTH_VEIL_PINK_DAWN');

assert(dBase === -10000, `DEPTH_GROUND_BASE is -10000 (actual: ${dBase})`);
assert(dFooting === -9500, `DEPTH_GROUND_FOOTING is -9500 (actual: ${dFooting})`);
assert(dTurf === -9200, `DEPTH_GROUND_TURF is -9200 (actual: ${dTurf})`);
assert(dStones === -9100, `DEPTH_GROUND_STONES is -9100 (actual: ${dStones})`);
assert(dFlora === -9000, `DEPTH_GROUND_FLORA is -9000 (actual: ${dFlora})`);
assert(dWater === -8900, `DEPTH_GROUND_WATER is -8900 (actual: ${dWater})`);
assert(dDecals === -8500, `DEPTH_GROUND_DECALS is -8500 (actual: ${dDecals})`);
assert(dMist === -8000, `DEPTH_GROUND_MIST is -8000 (actual: ${dMist})`);
assert(dFog === -7000, `DEPTH_VEIL_GROUND_FOG is -7000 (actual: ${dFog})`);
assert(dPink === -6900, `DEPTH_VEIL_PINK_DAWN is -6900 (actual: ${dPink})`);

assert(
  dBase < dFooting &&
  dFooting < dTurf &&
  dTurf < dStones &&
  dStones < dFlora &&
  dFlora < dWater &&
  dWater < dDecals &&
  dDecals < dMist &&
  dMist < dFog &&
  dFog < dPink &&
  dPink < -6000,
  'Strict monotonic ordering of ground layer hierarchy below -6000'
);

// -------------------------------------------------------------
// Test 2: WorldBuilder.ts Clean Depth Migration
// -------------------------------------------------------------
console.log('\n--- Test 2: WorldBuilder.ts Depth Hygiene ---');
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');

const forbiddenLiterals = ['setDepth(-98)', 'setDepth(-97)', 'setDepth(-95)', 'setDepth(-90)', 'setDepth(-88)', 'setDepth(-80)', 'setDepth(-65)', 'setDepth(-40)', 'setDepth(-100)'];
forbiddenLiterals.forEach(lit => {
  assert(!wbSrc.includes(lit), `WorldBuilder.ts contains no deprecated literal '${lit}'`);
});

assert(wbSrc.includes('groundImg.setDepth(DEPTH_GROUND_BASE)'), 'WorldBuilder.ts uses DEPTH_GROUND_BASE for groundImg');
assert(wbSrc.includes('ground.setDepth(DEPTH_GROUND_BASE)'), 'WorldBuilder.ts uses DEPTH_GROUND_BASE for subzone ground');
assert(wbSrc.includes('mist.setDepth(DEPTH_GROUND_MIST)'), 'WorldBuilder.ts uses DEPTH_GROUND_MIST for boundary mist');

// -------------------------------------------------------------
// Test 3: VeilSystem.ts Depth Hygiene
// -------------------------------------------------------------
console.log('\n--- Test 3: VeilSystem.ts Depth Hygiene ---');
const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf8');

assert(!veilSrc.includes('setDepth(-40)'), 'VeilSystem.ts contains no deprecated setDepth(-40)');
assert(!veilSrc.includes('setDepth(-38)'), 'VeilSystem.ts contains no deprecated setDepth(-38)');
assert(veilSrc.includes('this.fogLayerGround.setDepth(DEPTH_VEIL_GROUND_FOG)'), 'VeilSystem.ts uses DEPTH_VEIL_GROUND_FOG');
assert(veilSrc.includes('this.fogLayerPinkDawn.setDepth(DEPTH_VEIL_PINK_DAWN)'), 'VeilSystem.ts uses DEPTH_VEIL_PINK_DAWN');

// -------------------------------------------------------------
// Test 4: Zone Coordinates Margin of Safety
// -------------------------------------------------------------
console.log('\n--- Test 4: Zone Negative Coordinates Margin of Safety ---');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8')).zones;

const deepForest = zonesData.find(z => z.id === 'deep_forest');
assert(Boolean(deepForest), 'deep_forest zone exists');
const dfMinY = deepForest.bounds.y;
const dfMaxY = deepForest.bounds.y + deepForest.bounds.height;
assert(dfMinY === -640 && dfMaxY === 0, `Deep Forest bounds Y range is [${dfMinY}..${dfMaxY}]`);

// Any player depth in Deep Forest is at least dfMinY (-640)
const minPlayerDepthDF = dfMinY;
const safetyMarginDF = minPlayerDepthDF - dFog; // e.g. -640 - (-7000) = +6360
assert(safetyMarginDF >= 6000, `Deep Forest safety margin over Veil Ground Fog is >= 6000 units (actual: ${safetyMarginDF})`);
assert(minPlayerDepthDF > dBase, `Player min depth (${minPlayerDepthDF}) > Ground Base (${dBase})`);
assert(minPlayerDepthDF > dMist, `Player min depth (${minPlayerDepthDF}) > Ground Mist (${dMist})`);

const whispering = zonesData.find(z => z.id === 'sub_whispering_clearing');
assert(Boolean(whispering), 'sub_whispering_clearing zone exists');
const whMinY = whispering.bounds.y;
const safetyMarginWH = whMinY - dFog;
assert(safetyMarginWH >= 6000, `Whispering Clearing safety margin over Veil Ground Fog is >= 6000 units (actual: ${safetyMarginWH})`);

const bellhollow = zonesData.find(z => z.id === 'bellhollow');
assert(Boolean(bellhollow), 'bellhollow zone exists');
const bhMinY = bellhollow.bounds.y;
const safetyMarginBH = bhMinY - dFog;
assert(safetyMarginBH >= 6000, `Bellhollow safety margin over Veil Ground Fog is >= 6000 units (actual: ${safetyMarginBH})`);

// -------------------------------------------------------------
// Test 5: SatyrPlayer Display Guardrails
// -------------------------------------------------------------
console.log('\n--- Test 5: SatyrPlayer Display Guardrails ---');
const playerSrc = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf8');

assert(playerSrc.includes('C4-14-11 Display Guardrail'), 'SatyrPlayer.ts contains C4-14-11 Display Guardrail');
assert(playerSrc.includes('if (!this.stats.isHiding && !this._isDead)'), 'Guardrail checks not hiding and not dead');
assert(playerSrc.includes('if (!this.visible)'), 'Guardrail asserts visible = true');
assert(playerSrc.includes('if (!this._isHurt && this.alpha < 1)'), 'Guardrail asserts alpha = 1');
assert(playerSrc.includes('fallbackIdle'), 'safePlayAnim contains fallbackIdle safety');
assert(playerSrc.includes('this.setAlpha(1);'), 'exitHiding restores full alpha');

// -------------------------------------------------------------
// Test 6: GameScene Zone Transition Guardrails
// -------------------------------------------------------------
console.log('\n--- Test 6: GameScene Transition Guardrails ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');

assert(gameSceneSrc.includes('V14-P8-11: Tự động thoát trạng thái ẩn nấp và tái xác nhận hiển thị nhân vật 100%'), 'GameScene seamless transition auto-exits hiding and reasserts 100% display');
assert(gameSceneSrc.includes('C4-13-02 / V14-P8-11: Bảo đảm nhân vật thoát trạng thái ẩn nấp'), 'GameScene portal transition auto-exits hiding and reasserts display');
assert(gameSceneSrc.includes('if (!this.player.isHurt() && this.player.alpha < 1) this.player.setAlpha(1);'), 'GameScene update loop reasserts alpha');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL V14-P8-11 DEEP FOREST VISIBILITY CHECKS PASSED 100%!\n');
}
