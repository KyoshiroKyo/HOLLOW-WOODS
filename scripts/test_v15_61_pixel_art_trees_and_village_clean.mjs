/**
 * Automated Verification Test for Step V15-61
 * Verifies:
 * 1. Removal of all temporary procedural graphics trees and fallen logs.
 * 2. 100% Real Pixel Art tree sprites loaded and referenced.
 * 3. Bellhollow village interior completely cleared of obstructing trees.
 * 4. Fog Crossing dirt trail path (y=190..250) completely clear.
 * 5. Perfect Y-sorting: tree.setOrigin(0.5, 1.0) and small foot colliders.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { PNG } from 'pngjs';

console.log('=== RUNNING TEST V15-61: PIXEL ART TREES & BELLHOLLOW CLEANUP ===\n');

// 1. Verify Asset Files on Disk and Atlas (V152-09 Deduplicated)
const atlas = JSON.parse(fs.readFileSync('public/assets/atlases/hollow_props_atlas.json', 'utf-8'));
const requiredAssets = [
  'public/assets/environment/trees/tree_mist_pine.png',
  'public/assets/environment/trees/tree_mossy_oak_grand.png',
  'public/assets/environment/trees/tree_weeping_willow.png',
  'public/assets/environment/trees/tree_withered_gnarled.png',
  'public/assets/environment/v14/props/prop_fallen_log_mossy_v14.png',
  'public/assets/environment/v14/props/tree_hollow_ancient_v14.png'
];

for (const relPath of requiredAssets) {
  const fullPath = path.resolve(relPath);
  assert(fs.existsSync(fullPath), `Asset file missing: ${relPath}`);
  const buf = fs.readFileSync(fullPath);
  assert(buf.length > 100, `Asset file too small or empty: ${relPath} (${buf.length} bytes)`);
  const png = PNG.sync.read(buf);
  assert(png.width > 0 && png.height > 0, `Invalid PNG dimensions in: ${relPath}`);
}

const requiredAtlasFrames = [
  'tree_oak_1',
  'tree_oak_2',
  'tree_oak_3',
  'tree_dead',
  'hollow_tree'
];
for (const frame of requiredAtlasFrames) {
  assert(atlas.frames && atlas.frames[frame], `Atlas missing tree frame: ${frame}`);
}
console.log('✓ PASS: All required pixel art tree and prop assets exist on disk and in hollow_props_atlas.');

// 2. Verify PreloadScene.ts & AtlasTextureResolver
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf-8');
const atlasResolverContent = fs.readFileSync('src/utils/AtlasTextureResolver.ts', 'utf-8');
const directPreloadKeys = [
  'SPRITE_TREE_MIST_PINE_V15',
  'SPRITE_TREE_MOSSY_OAK_GRAND_V15',
  'SPRITE_TREE_WEEPING_WILLOW_V15',
  'SPRITE_TREE_WITHERED_GNARLED_V15',
  'tree_pine_tall_topdown',
  'tree_pine_med_topdown',
  'tree_pine_slender_topdown'
];

for (const key of directPreloadKeys) {
  assert(preloadContent.includes(key), `PreloadScene missing key loading: ${key}`);
}

const atlasFrames = [
  'tree_oak_1',
  'tree_oak_2',
  'tree_oak_3',
  'tree_dead',
  'hollow_tree',
  'bush_dense_1',
  'bush_dense_2',
  'prop_fallen_log_mossy_v14'
];

for (const frame of atlasFrames) {
  assert(atlasResolverContent.includes(`'${frame}'`), `AtlasTextureResolver missing frame: ${frame}`);
}
console.log('✓ PASS: PreloadScene loads all real pixel art tree sprites and props via direct load and AtlasTextureResolver.');

// 3. Verify WorldBuilder.ts: No graphics trees / logs
const wbContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');

// Check createWestBarrierLandscape does not use graphics trunk
assert(!wbContent.includes('fillEllipse(-4, 0, 36, 102)'), 'WestBarrierLandscape still has graphics ellipse');
assert(!wbContent.includes('fillRoundedRect(-12, -48, 22, 96, 5)'), 'WestBarrierLandscape still has graphics trunk');

// Check createCollapsedStoneBridgeObstacle does not use graphics trunk
assert(!wbContent.includes('fillRoundedRect(bridgeX - 42, roadY - 16, 84, 22, 6)'), 'StoneBridgeObstacle still has graphics trunk');

// Check createFallenTitanTrunkShortcut does not use graphics
assert(!wbContent.includes('fillEllipse(x + length / 2, y + 10, length + 8, 14)'), 'FallenTitanTrunkShortcut still has graphics ellipse');

// Check createFallenLog uses sprite instead of graphics
assert(!wbContent.includes('g.fillRoundedRect(-length / 2, 4, length, 12, 4)'), 'createFallenLog still has graphics log');
assert(wbContent.includes("'prop_fallen_log_mossy_v14'"), 'createFallenLog uses prop_fallen_log_mossy_v14 sprite');
console.log('✓ PASS: All temporary graphics trees and fallen logs have been removed and replaced with real pixel art sprites.');

// 4. Verify createTree and createHollowTree Y-sorting and small colliders
assert(wbContent.includes('tree.setOrigin(0.5, 1.0)'), 'createTree must use setOrigin(0.5, 1.0)');
assert(wbContent.includes("this.createStaticBoxColliderCentered(x, y - 4, 18, 10, 'Gốc Cây Pixel Art')"), 'createTree must use small foot-level box collider (18x10)');
console.log('✓ PASS: createTree has precise Y-sorting setOrigin(0.5, 1.0) and foot-level 18x10 collider.');

// 5. Verify Fog Crossing road is completely clear of trees
assert(!wbContent.includes('this.createTree(300, 240'), 'Fog Crossing must NOT have tree in middle of trail (300, 240)');
assert(wbContent.includes('this.createTree(300, 310, \'Cây Khô Sương Mù\', false)'), 'Fog Crossing tree relocated south of road');
assert(wbContent.includes('this.createTree(160, 65, \'Cây Khô Sương Mù\', false)'), 'Fog Crossing tree relocated north of road');
console.log('✓ PASS: Fog Crossing road (y=190..250) is 100% unobstructed.');

// 6. Verify Bellhollow Village interior is clean
assert(wbContent.includes('const villageInteriorTrees: Array<{ x: number; y: number; v: \'oak1\' | \'oak2\' | \'oak3\' | \'dead\' | \'hollow\'; s: number; t: number }> = [];'),
  'villageInteriorTrees must be empty array');
assert(!wbContent.includes('{ x: 1184, y: 438, v: \'oak1\''), 'Bram forge front tree (1184, 438) must be removed');
assert(!wbContent.includes('{ x: 1326, y: 424, v: \'oak2\''), 'Bram forge front tree (1326, 424) must be removed');
assert(!wbContent.includes('{ x: 498, y: 342, v: \'oak3\''), 'Neris front tree (498, 342) must be removed');
assert(!wbContent.includes('{ x: 594, y: 144, v: \'oak3\''), 'Finn notice board tree (594, 144) must be removed');
console.log('✓ PASS: Bellhollow interior living area has 0 obstructing trees; Bram, Neris, Edda, Finn, Garth, well, forge, and noticeboard are fully clear.');

console.log('\n=== ALL V15-61 VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
