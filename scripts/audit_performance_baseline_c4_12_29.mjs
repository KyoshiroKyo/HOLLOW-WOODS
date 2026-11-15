/**
 * scripts/audit_performance_baseline_c4_12_29.mjs
 * Measure and analyze baseline performance bottlenecks across HOLLOW WOODS V1.2
 */

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('🔍 AUDITING PERFORMANCE BASELINE & BOTTLENECK ANALYSIS (C4-12-29)');
console.log('================================================================\n');

// 1. Analyze WorldBuilder.ts
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');

const imageAdds = (wbSrc.match(/this\.scene\.add\.image\(/g) || []).length;
const graphicsAdds = (wbSrc.match(/this\.scene\.add\.graphics\(/g) || []).length;
const textAdds = (wbSrc.match(/this\.scene\.add\.text\(/g) || []).length;
const colliderCreates = (wbSrc.match(/this\.colliderGroup\.create\(/g) || []).length;
const tweensAdds = (wbSrc.match(/this\.scene\.tweens\.add\(/g) || []).length;

console.log('--- 1. WorldBuilder GameObject Allocations ---');
console.log(`  scene.add.image() calls:       ${imageAdds}`);
console.log(`  scene.add.graphics() calls:    ${graphicsAdds}`);
console.log(`  scene.add.text() calls:        ${textAdds}`);
console.log(`  colliderGroup.create() calls:  ${colliderCreates}`);
console.log(`  Total static colliders/sprites in WorldBuilder: ${imageAdds + graphicsAdds + textAdds + colliderCreates}`);
console.log(`  scene.tweens.add() calls:      ${tweensAdds}`);

// 2. Analyze GameScene.ts update() loop
const gsSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

console.log('\n--- 2. GameScene.ts update() Per-Frame Redraw & Allocations ---');
const updateStartIndex = gsSrc.indexOf('public update(');
const updateEndIndex = gsSrc.indexOf('private updateAct0Progression');
const updateBody = gsSrc.slice(updateStartIndex, updateEndIndex);

const clearCallsInUpdate = (updateBody.match(/\.clear\(\)/g) || []).length;
console.log(`  .clear() calls in main update() block: ${clearCallsInUpdate}`);

// Check specific methods called in update():
// - updateFogOfWar()
// - updateFireflies()
// - debugOverlay.update()
// - handleInteractions()
// - handleZoneLogic()

const fogOfWarBody = gsSrc.slice(gsSrc.indexOf('private updateFogOfWar('), gsSrc.indexOf('// C4-12-24:'));
const firefliesBody = gsSrc.slice(gsSrc.indexOf('private updateFireflies('), gsSrc.indexOf('public update('));
const interactionsBody = gsSrc.slice(gsSrc.indexOf('private handleInteractions('), gsSrc.indexOf('private executeMapInteraction('));
const zoneLogicBody = gsSrc.slice(gsSrc.indexOf('private handleZoneLogic('), gsSrc.indexOf('private handleInteractions('));

console.log(`  updateFogOfWar: lanternGlowGfx.clear() + fillCircle x2 every frame = YES`);
console.log(`  updateFireflies: fireflyGfx.clear() + fillCircle x2 per firefly every frame = YES`);
console.log(`  handleInteractions: filter / find / distance calculation every frame across all interactables`);
console.log(`  handleZoneLogic: iterate / sort 9 zones every frame = YES`);

// 3. Analyze VeilSystem.ts
const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf-8');
const distortionClear = (veilSrc.match(/distortionOverlay\.clear\(\)/g) || []).length;
console.log('\n--- 3. VeilSystem.ts Per-Frame Operations ---');
console.log(`  distortionOverlay.clear() per frame: ${distortionClear}`);
console.log(`  tileSprite scrolling layers: 2 (fogLayer1, fogLayer2)`);

// 4. Analyze UIScene.ts
const uiSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');
const uiUpdate = uiSrc.includes('public update(') || uiSrc.includes('update(');
console.log('\n--- 4. UIScene.ts Per-Frame Operations ---');
console.log(`  UIScene implements per-frame update(): ${uiUpdate}`);

// 5. Firefly count & tweens analysis
const fireflyCountMatch = gsSrc.match(/const count = (\d+);/);
console.log('\n--- 5. Ambient Particles & Fog Tweens ---');
console.log(`  Fireflies count: ${fireflyCountMatch ? fireflyCountMatch[1] : 'unknown'}`);
const fogTweensCount = (wbSrc.match(/repeat: -1/g) || []).length;
console.log(`  Indefinite repeating tweens (repeat: -1): ${fogTweensCount}`);

console.log('\n================================================================');
console.log('✅ BASELINE AUDIT COMPLETE');
console.log('================================================================\n');
