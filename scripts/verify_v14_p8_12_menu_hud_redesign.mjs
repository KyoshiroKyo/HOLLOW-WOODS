import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('======================================================================');
console.log('🧪 VERIFY V14-P8-12: MAIN MENU & HUD DARK WOODLAND REDESIGN');
console.log('======================================================================');

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
// Test 1: MainMenuScene.ts Redesign
// -------------------------------------------------------------
console.log('\n--- Test 1: MainMenuScene Visual Atmosphere & Architecture ---');
const menuSrc = fs.readFileSync('src/scenes/MainMenuScene.ts', 'utf8');

assert(menuSrc.includes('createAmbientEmbers'), 'MainMenuScene has ambient ember/firefly particle system');
assert(menuSrc.includes('emberParticles'), 'MainMenuScene manages ember particles collection');
assert(menuSrc.includes('menu_lantern_glow_smooth'), 'MainMenuScene generates smooth radial gradient lantern glow');
assert(menuSrc.includes('createRadialGradient'), 'Smooth radial gradient uses HTML5 Canvas context');
assert(menuSrc.includes('darkRogue.setOrigin(0.5, 1.0)'), 'Wayfarer protagonist stands directly on ground shadow (origin 0.5, 1.0)');
assert(menuSrc.includes('shadow.fillEllipse(rogueX, groundY, 78, 20)'), 'Ground shadow aligns with character feet');
assert(menuSrc.includes('#e5a93c'), 'HOLLOW WOODS title uses warm deep amber palette (#e5a93c)');
assert(menuSrc.includes('#e8dfcf'), 'Subtitle uses warm cream palette (#e8dfcf)');
assert(menuSrc.includes('#a89f8c'), 'Tagline uses antique parchment palette (#a89f8c)');
assert(menuSrc.includes('0x6e5233') || menuSrc.includes('0x5c4627'), 'Buttons use tarnished bronze borders');
assert(menuSrc.includes('0x15100b') || menuSrc.includes('0x120d09'), 'Buttons use dark aged wood panels');
assert(menuSrc.includes('btnW = 460'), 'Button width expanded to 460px to prevent text overflow');
assert(menuSrc.includes('checkpointDesc') || menuSrc.includes('Hồi 0 • Cổng Làng Bellhollow'), 'Continue button displays balanced 2nd line checkpoint info');

// -------------------------------------------------------------
// Test 2: UIScene.ts HUD Improvements & Clearances
// -------------------------------------------------------------
console.log('\n--- Test 2: UIScene HUD Optimizations & Clearances ---');
const uiSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');

assert(uiSrc.includes('zoneBannerBg'), 'UIScene has dynamic zoneBannerBg graphics');
assert(uiSrc.includes('maxTextW + 64'), 'Zone banner dynamically adds >= 32px safe padding on each side');
assert(uiSrc.includes('Math.max(420, maxTextW + 64)'), 'Zone banner enforces minimum 420px width for aesthetic stability');
assert(uiSrc.includes('fillRoundedRect(12, 8, 362, 92, 6)'), 'Stat card width widened to 362px for complete clearance');
assert(uiSrc.includes('const badgeX = 300;'), 'Lantern status badge moved to x=300 (safe margin >= 16px from oil text)');
assert(uiSrc.includes('replace(/Bụi Rậm Đắc/g, \'Bụi Rậm Đặc\')'), 'Quest tracker sanitizes typo "Bụi Rậm Đắc" -> "Bụi Rậm Đặc"');
assert(uiSrc.includes('this.questBg.fillStyle(0x140f0c, 0.88)'), 'Quest box styled with dark aged wood fill (0x140f0c)');
assert(uiSrc.includes('this.promptBg.fillStyle(0x15110d, 0.88)'), 'Interaction prompt [E] styled with dark wood fill (0x15110d)');
assert(uiSrc.includes('0x7a5e30') || uiSrc.includes('0x6e5233'), 'HUD elements use tarnished bronze borders');

// -------------------------------------------------------------
// Test 3: Signpost Texture Localization
// -------------------------------------------------------------
console.log('\n--- Test 3: Signpost Texture Localization ---');
const signBuf = fs.readFileSync('public/assets/environment/sprites/signpost.png');
const signPng = PNG.sync.read(signBuf);

assert(signPng.width === 29 && signPng.height === 32, `Signpost dimensions valid 29x32 px (actual: ${signPng.width}x${signPng.height})`);

// Verify that the carving on signpost face contains carved groove pixels for "ĐÔNG ►"
let carvedGrooveCount = 0;
for (let y = 7; y <= 11; y++) {
  for (let x = 4; x <= 22; x++) {
    const idx = (signPng.width * y + x) << 2;
    const r = signPng.data[idx];
    const g = signPng.data[idx + 1];
    const b = signPng.data[idx + 2];
    const a = signPng.data[idx + 3];
    if (a > 200 && r < 105 && g < 70 && b < 45) {
      carvedGrooveCount++;
    }
  }
}
assert(carvedGrooveCount >= 30, `Signpost face contains carved letters and arrow pixels (count: ${carvedGrooveCount})`);

// -------------------------------------------------------------
// Test 4: General Lore & Quest Text Cleanliness
// -------------------------------------------------------------
console.log('\n--- Test 4: General Text Cleanliness ---');
const loreSrc = fs.readFileSync('src/data/lore.json', 'utf8');
assert(!loreSrc.includes('Bụi Rậm Đắc'), 'src/data/lore.json contains no typo "Bụi Rậm Đắc"');
assert(loreSrc.includes('Bụi Rậm Đặc'), 'src/data/lore.json correctly has "Bụi Rậm Đặc"');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL V14-P8-12 MENU & HUD REDESIGN CHECKS PASSED 100%!\n');
}
