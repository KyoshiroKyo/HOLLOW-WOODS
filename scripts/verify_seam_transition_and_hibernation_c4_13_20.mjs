import fs from 'fs';
import path from 'path';

console.log('=== VERIFYING C4-13-20: SEAM TRANSITION (ANTI-SPLIT) & ZONE HIBERNATION ===\n');

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

// 1. Kiểm tra WorldBuilder.ts
const wbPath = path.resolve('src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');

assert(wbContent.includes('this.renderZoneBoundaryTransitions();'),
  'WorldBuilder.buildWorld() calls renderZoneBoundaryTransitions()');

assert(wbContent.includes('toLX(2680)') && wbContent.includes('toLX(2880)') && wbContent.includes('eastMireTransition'),
  'renderCrookedPathTerrain implements 200px wide eastMireTransition gradient (2680..2880)');

assert(wbContent.includes('sp.lx >= toLX(2760)') && wbContent.includes('#413a2c') && wbContent.includes('#564d3b'),
  'renderCrookedPathTerrain harmonizes road layers approaching x = 2880 with damp marsh dirt');

assert(wbContent.includes('toLX(3080)') && wbContent.includes('westForestTransition'),
  'renderSilentMireTerrain implements 200px wide westForestTransition gradient (2880..3080)');

assert(wbContent.includes('sp.lx < toLX(2940)) continue;'),
  'renderSilentMireTerrain delays boardwalk planks to 2940 for seamless 2880..2940 road junction');

assert(wbContent.includes('renderZoneBoundaryTransitions(): void'),
  'WorldBuilder defines renderZoneBoundaryTransitions() method');

assert(wbContent.includes('renderCrookedPathToMireTransition(2880)') &&
       wbContent.includes('renderMireToShrineTransition(4000)') &&
       wbContent.includes('renderVillageToForestTransition(1600)'),
  'renderZoneBoundaryTransitions covers Crooked Path -> Mire (2880), Mire -> Shrine (4000), Village -> Forest (1600)');

assert(wbContent.includes('stoneList = [') && (wbContent.includes('stonesGfx.setDepth(-88)') || wbContent.includes('stonesGfx.setDepth(DEPTH_GROUND_STONES)')),
  'renderCrookedPathToMireTransition scatters natural pebbles and fieldstones along road edges');

assert(wbContent.includes('this.createDenseBush(seamX - 35, 235)') &&
       wbContent.includes('this.createDenseBush(seamX + 25, 245)'),
  'renderCrookedPathToMireTransition places dense pixel-art bushes straddling the boundary');

assert(wbContent.includes('addSeamFog(seamX - 15, 195, 25)') &&
       wbContent.includes('addSeamFog(seamX, 300, 20)'),
  'renderCrookedPathToMireTransition adds drifting border mist layer over the seam');

assert(wbContent.includes('hibernateDistantZoneObjects(currentZoneId: ZoneId): void'),
  'WorldBuilder defines hibernateDistantZoneObjects() for distant zone optimization');

assert(wbContent.includes('obj.gameObject.setActive(isInside);'),
  'WorldBuilder.updateCameraCulling synchronizes setActive(isInside) to optimize CPU and render list');

// 2. Kiểm tra VeilSystem.ts
const veilPath = path.resolve('src/systems/VeilSystem.ts');
const veilContent = fs.readFileSync(veilPath, 'utf8');

assert(veilContent.includes('private transitionMistOverlay: Phaser.GameObjects.Graphics;'),
  'VeilSystem defines transitionMistOverlay graphics');

assert(veilContent.includes('this.transitionMistOverlay.setDepth(8400);') &&
       veilContent.includes('this.transitionMistOverlay.fillRect(0, 0, 1280, 720);'),
  'VeilSystem initializes transitionMistOverlay covering full screen at depth 8400 below HUD');

assert(veilContent.includes('triggerZoneTransitionMist(duration: number = 350, onMidpoint?: () => void): void'),
  'VeilSystem defines triggerZoneTransitionMist() with ~0.35s duration');

assert(veilContent.includes('this.transitionMistOverlay.destroy();'),
  'VeilSystem.destroy() cleans up transitionMistOverlay safely');

// 3. Kiểm tra GameScene.ts
const gamePath = path.resolve('src/scenes/GameScene.ts');
const gameContent = fs.readFileSync(gamePath, 'utf8');

assert(gameContent.includes('this.veilSystem.triggerZoneTransitionMist(350);'),
  'GameScene triggers 0.35s mist fade transition upon crossing zone boundaries');

assert(gameContent.includes('this.worldBuilder.hibernateDistantZoneObjects(detectedZone);'),
  'GameScene triggers distant zone hibernation in handleZoneLogic()');

assert(gameContent.includes('this.worldBuilder.hibernateDistantZoneObjects(trans.toZone);'),
  'GameScene triggers distant zone hibernation in executeTransition()');

console.log(`\n==========================================`);
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log(`==========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL C4-13-20 VERIFICATIONS PASSED SUCCESSFULLY!');
}
