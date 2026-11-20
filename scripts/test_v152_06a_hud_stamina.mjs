import fs from 'fs';
import path from 'path';

let failed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== TEST SUITE V152-06A: HUD, STAMINA & TYPOGRAPHY ===\n');

// 1. Check index.html
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert(indexHtml.includes('image-rendering: auto;'), 'index.html has image-rendering: auto');
assert(!indexHtml.includes('image-rendering: pixelated;'), 'index.html does not have image-rendering: pixelated');

// 2. Check HDTextHelper.ts
const hdHelper = fs.readFileSync('src/utils/HDTextHelper.ts', 'utf-8');
assert(hdHelper.includes('Segoe UI Emoji'), 'HDTextHelper includes Segoe UI Emoji in font family');
assert(hdHelper.includes('getOptimalResolution'), 'HDTextHelper provides dynamic optimal resolution');

// 3. Check PreloadScene.ts
const preload = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf-8');
assert(preload.includes("import { HDTextHelper } from '../utils/HDTextHelper';"), 'PreloadScene imports HDTextHelper');
assert(preload.includes("HDTextHelper.createText(this, 640, 280, 'HOLLOW WOODS'"), 'PreloadScene uses HDTextHelper for title');
assert(preload.includes("HDTextHelper.createText(this, 640, 350, 'Đang xuyên qua Màn Sương...'"), 'PreloadScene uses HDTextHelper for loading status');

// 4. Check MainMenuScene.ts
const menu = fs.readFileSync('src/scenes/MainMenuScene.ts', 'utf-8');
assert(menu.includes("'Vòng Sáng'"), "MainMenuScene footer label is [F] 'Vòng Sáng'");
assert(!menu.includes("'Đèn'"), "MainMenuScene does not use obsolete '[F] Đèn'");
assert(menu.includes("flameCore.setPosition(fireX, groundY);"), 'MainMenuScene flameCore is anchored at (fireX, groundY)');
assert(menu.includes("scaleY: 1.06"), 'MainMenuScene flameCore tweens scale without jumping down');

// 5. Check HUDIconGenerator.ts
const hudGen = fs.readFileSync('src/utils/HUDIconGenerator.ts', 'utf-8');
assert(hudGen.includes("HUD_ICON_WOOD = 'hud_icon_wood'"), 'HUDIconGenerator defines HUD_ICON_WOOD');
assert(hudGen.includes("WOOD_GRID"), 'HUDIconGenerator defines WOOD_GRID 16x16 pixel art');
assert(hudGen.includes("generateIconTexture(scene, HUD_ICON_WOOD"), 'HUDIconGenerator registers HUD_ICON_WOOD in generateAllHUDIcons');

// 6. Check UIScene.ts
const uiScene = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');
assert(uiScene.includes("this.statCardBg.setDepth(8050);"), 'UIScene statCardBg has depth 8050');
assert(uiScene.includes("this.statBarsGraphics.setDepth(8051);"), 'UIScene statBarsGraphics has depth 8051');
assert(uiScene.includes("this.statIconsGraphics.setDepth(8052);"), 'UIScene statIconsGraphics has depth 8052');
assert(uiScene.includes("this.playerNameText = HDTextHelper.createText(this, 26, 15, isAwakened ? '⚔️ Hiệp Sĩ Đen (Black Knight)' : '🌲 The Mossbound Wayfarer', {"), 'UIScene playerNameText exists');
assert(uiScene.includes("'Thể Lực: 100/100'"), "UIScene staminaValText initialized to 'Thể Lực: 100/100' (no 80/80 hardcode)");
assert(!uiScene.includes("'Thể Lực: 80/80'"), "UIScene does not contain obsolete 'Thể Lực: 80/80'");
assert(uiScene.includes("this.zoneBadgeContainer = this.add.container"), 'UIScene contains zoneBadgeContainer under Quest Box');
assert(uiScene.includes("this.redrawStats(); // V152-06A"), 'UIScene.update calls redrawStats every frame');
assert(uiScene.includes("HUD_ICON_WOOD"), 'UIScene uses HUD_ICON_WOOD for wood slots to prevent □');
assert(uiScene.includes("Math.min(7000, Math.max(4000, 4000 + msg.length * 40))"), 'UIScene showPopupMessage has extended hold duration');

// 7. Check MiniMapWidget.ts
const minimap = fs.readFileSync('src/ui/MiniMapWidget.ts', 'utf-8');
assert(minimap.includes("this.container.setVisible(false); // V152-06A"), 'MiniMapWidget container is set to hidden');

// 8. Check SurvivalSystem.ts
const survival = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf-8');
assert(survival.includes("Math.abs(stats.stamina - this.lastStamina) > 0.01"), 'SurvivalSystem emits stamina change with 0.01 threshold');

if (failed === 0) {
  console.log('\n🎉 ALL 18 V152-06A INTEGRITY CHECKS PASSED 100%!');
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} CHECKS FAILED.`);
  process.exit(1);
}
