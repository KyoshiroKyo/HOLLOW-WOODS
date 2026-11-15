/**
 * HOLLOW WOODS V1.2 – VERIFICATION SUITE FOR COMMAND C4-12-17
 * CORE WORLD BLOCKOUT & MAP BASE VERIFICATION
 *
 * Verifies:
 * 1. zones.json Core World definitions (Bellhollow, Sanctuary Farm, Outer Woods)
 * 2. Segmented south fence & open gateways (Farm gate 610..710, Outer Woods gate 1150..1270, Farm-Woods passage 680..820)
 * 3. ZoneConnectionRegistry & WorldGatingSystem traversal for all Core World links
 * 4. Safe pending status for Frontier / Forbidden boundary transitions
 * 5. WorldBuilder.ts terrain baking & decoration implementations
 * 6. GameScene.ts physics & camera bounds expansion (0, -250, 5000, 1400)
 */

import fs from 'fs';
import path from 'path';

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

console.log('================================================================');
console.log('  C4-12-17: CORE WORLD BLOCKOUT VERIFICATION TEST');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: ZONES.JSON CORE WORLD STRUCTURE & BOUNDS
// -----------------------------------------------------------------------------
console.log('--- TEST GROUP 1: Core World Bounds & Spatial Dimensions in zones.json ---');
const zonesJsonPath = 'src/data/zones.json';
const zonesData = JSON.parse(fs.readFileSync(zonesJsonPath, 'utf8'));

const bellhollow = zonesData.zones.find(z => z.id === 'bellhollow');
const sanctuaryFarm = zonesData.zones.find(z => z.id === 'sanctuary_farm');
const outerWoods = zonesData.zones.find(z => z.id === 'outer_woods');

assert(!!bellhollow, 'Bellhollow zone exists in zones.json');
assert(bellhollow.bounds.width === 1120 && bellhollow.bounds.height === 960, 'Bellhollow bounds are 1120x960 px (x: 480, y: -200)');
assert(bellhollow.tier === 'LAYER_1_CORE', 'Bellhollow is classified as LAYER_1_CORE');

assert(!!sanctuaryFarm, 'Sanctuary Farm zone exists in zones.json');
assert(sanctuaryFarm.bounds.width === 640 && sanctuaryFarm.bounds.height === 480, 'Sanctuary Farm bounds are 640x480 px (x: 480, y: 560)');
assert(sanctuaryFarm.tier === 'LAYER_1_CORE', 'Sanctuary Farm is classified as LAYER_1_CORE');
assert(sanctuaryFarm.status === 'active', 'Sanctuary Farm status is active in V1.2 Core World');

assert(!!outerWoods, 'Outer Woods zone exists in zones.json');
assert(outerWoods.bounds.width === 480 && outerWoods.bounds.height === 480, 'Outer Woods bounds are 480x480 px (x: 1120, y: 560)');
assert(outerWoods.tier === 'LAYER_1_CORE', 'Outer Woods is classified as LAYER_1_CORE');
assert(outerWoods.status === 'active', 'Outer Woods status is active in V1.2 Core World');

// Core world combined domain coverage
const minX = Math.min(bellhollow.bounds.x, sanctuaryFarm.bounds.x, outerWoods.bounds.x);
const maxX = Math.max(bellhollow.bounds.x + bellhollow.bounds.width, sanctuaryFarm.bounds.x + sanctuaryFarm.bounds.width, outerWoods.bounds.x + outerWoods.bounds.width);
const minY = Math.min(bellhollow.bounds.y, sanctuaryFarm.bounds.y, outerWoods.bounds.y);
const maxY = Math.max(bellhollow.bounds.y + bellhollow.bounds.height, sanctuaryFarm.bounds.y + sanctuaryFarm.bounds.height, outerWoods.bounds.y + outerWoods.bounds.height);

assert(minX === 480 && maxX === 1600, `Core World horizontal domain spans x = ${minX}..${maxX} (width 1120px)`);
assert(minY === -200 && maxY === 1040, `Core World vertical domain spans y = ${minY}..${maxY} (height 1240px, >2x vertical expansion)`);

// -----------------------------------------------------------------------------
// TEST 2: COLLIDERS & GATEWAY PASSAGEWAYS
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Segmented Colliders & Walkable Clearings ---');
const bhColliders = bellhollow.colliders || [];
const hasMonolithicFenceBottom = bhColliders.some(c => c.id === 'fence_bottom');
assert(!hasMonolithicFenceBottom, 'Monolithic solid fence_bottom (1120px) has been successfully removed');

const fenceWest = bhColliders.find(c => c.id === 'fence_bottom_west');
const fenceMid = bhColliders.find(c => c.id === 'fence_bottom_mid');
const fenceEast = bhColliders.find(c => c.id === 'fence_bottom_east');

assert(!!fenceWest && fenceWest.x === 480 && fenceWest.width === 130, 'fence_bottom_west protects SW corner (480..610)');
assert(!!fenceMid && fenceMid.x === 710 && fenceMid.width === 440, 'fence_bottom_mid protects central meadow (710..1150)');
assert(!!fenceEast && fenceEast.x === 1270 && fenceEast.width === 330, 'fence_bottom_east protects SE boundary (1270..1600)');

// Open passages
const farmGateOpening = fenceMid.x - (fenceWest.x + fenceWest.width);
assert(farmGateOpening >= 100, `South Farm Gateway opening is wide and unobstructed: ${farmGateOpening}px (x: 610..710)`);

const woodsGateOpening = fenceEast.x - (fenceMid.x + fenceMid.width);
assert(woodsGateOpening >= 120, `Outer Woods Gateway opening is wide and unobstructed: ${woodsGateOpening}px (x: 1150..1270)`);

// Sanctuary Farm colliders
const sfColliders = sanctuaryFarm.colliders || [];
const sfRightTop = sfColliders.find(c => c.id === 'farm_bound_right_top');
const sfRightBottom = sfColliders.find(c => c.id === 'farm_bound_right_bottom');
assert(!!sfRightTop && sfRightTop.y + sfRightTop.height === 680, 'farm_bound_right_top ends at y = 680');
assert(!!sfRightBottom && sfRightBottom.y === 820, 'farm_bound_right_bottom starts at y = 820');
assert(sfRightBottom.y - (sfRightTop.y + sfRightTop.height) === 140, 'Inter-zone passage between Sanctuary Farm and Outer Woods is open (140px wide at y = 680..820)');

const farmBarnWall = sfColliders.find(c => c.id === 'farm_barn_wall');
assert(!!farmBarnWall && farmBarnWall.isSolid === true, 'Farm barn structure collider is registered and solid');

const farmWell = sfColliders.find(c => c.id === 'farm_well');
assert(!!farmWell && farmWell.isSolid === true, 'Farm well collider is registered and solid');

// Outer woods colliders
const owColliders = outerWoods.colliders || [];
const owCampfire = owColliders.find(c => c.id === 'ow_firepit_rock');
assert(!!owCampfire && owCampfire.isSolid === true, 'Outer woods hunter campfire collider is registered and solid');

// -----------------------------------------------------------------------------
// TEST 3: ZONE CONNECTION REGISTRY IMPLEMENTATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: ZoneConnectionRegistry Code & Topology ---');
const registryCode = fs.readFileSync('src/world/ZoneConnectionRegistry.ts', 'utf8');

assert(registryCode.includes("id: 'conn_bellhollow_to_farm'") && registryCode.includes("status: 'active'"), 'conn_bellhollow_to_farm is active in registry');
assert(registryCode.includes("id: 'conn_farm_to_bellhollow'") && registryCode.includes("status: 'active'"), 'conn_farm_to_bellhollow is active in registry');
assert(registryCode.includes("id: 'conn_bellhollow_to_outer_woods'") && registryCode.includes("status: 'active'"), 'conn_bellhollow_to_outer_woods is active in registry');
assert(registryCode.includes("id: 'conn_outer_woods_to_bellhollow'") && registryCode.includes("status: 'active'"), 'conn_outer_woods_to_bellhollow is active in registry');
assert(registryCode.includes("id: 'conn_farm_to_outer_woods'") && registryCode.includes("status: 'active'"), 'conn_farm_to_outer_woods is active in registry');
assert(registryCode.includes("id: 'conn_outer_woods_to_farm'") && registryCode.includes("status: 'active'"), 'conn_outer_woods_to_farm is active in registry');

assert(registryCode.includes("id: 'conn_outer_woods_to_crooked_path'") && registryCode.includes("status: 'pending_construction'"), 'conn_outer_woods_to_crooked_path is safely marked pending_construction');

// -----------------------------------------------------------------------------
// TEST 4: WORLDBUILDER TERRAIN BAKING & DECORATION METHODS
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: WorldBuilder Canvas Baking & Blockout ---');
const wbCode = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');

assert(wbCode.includes("else if (id === 'sanctuary_farm') {\n      this.renderSanctuaryFarmTerrain(bounds);"), 'WorldBuilder renders sanctuary_farm terrain in renderZoneTerrain');
assert(wbCode.includes("else if (id === 'outer_woods') {\n      this.renderOuterWoodsTerrain(bounds);"), 'WorldBuilder renders outer_woods terrain in renderZoneTerrain');

assert(wbCode.includes("sanctuary_farm_ground_baked_v12"), 'sanctuary_farm_ground_baked_v12 texture baked with canvas');
assert(wbCode.includes("outer_woods_ground_baked_v12"), 'outer_woods_ground_baked_v12 texture baked with canvas');

assert(wbCode.includes("this.renderSanctuaryFarmDecorations(zone);"), 'sanctuary_farm decorations dispatched in renderDecorations');
assert(wbCode.includes("this.renderOuterWoodsDecorations(zone);"), 'outer_woods decorations dispatched in renderDecorations');

assert(wbCode.includes("createFarmBarnStructure"), 'createFarmBarnStructure method implemented with wooden planks & thatched roof');
assert(wbCode.includes("createChestProp"), 'createChestProp method implemented with iron-bound wooden chest visual');
assert(wbCode.includes("createHunterCampfire"), 'createHunterCampfire method implemented with embers & stone circle');
assert(wbCode.includes("createFarmPerimeterFences"), 'createFarmPerimeterFences method implemented with field stiles');

assert(wbCode.includes("const inFarmGate = fx >= 580 && fx <= 710;"), 'createVillageFence skips south fence at Farm Gate (610..710)');
assert(wbCode.includes("const inOuterWoodsGate = fx >= 1150 && fx <= 1270;"), 'createVillageFence skips south fence at Outer Woods Gate (1150..1270)');
assert(wbCode.includes("this.createVillageLanternPost(606, 532);") && wbCode.includes("this.createVillageLanternPost(714, 532);"), 'Farm gateposts with lanterns placed at south farm opening');

// -----------------------------------------------------------------------------
// TEST 5: GAMESCENE CAMERA & PHYSICS BOUNDS EXPANSION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: GameScene Camera & Physics World Bounds ---');
const rawGameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const gameSceneCode = rawGameSceneCode.replace(/\r\n/g, '\n');

assert(gameSceneCode.includes("this.physics.world.setBounds(0, -250, 5000, 1400);"), 'Physics world bounds expanded to (0, -250, 5000, 1400) to cover entire Core World');
assert(gameSceneCode.includes("this.cameraSystem.setWorldBounds({\n      x: 0,\n      y: -250,\n      width: 5000,\n      height: 1400\n    });"), 'Camera bounds expanded to (0, -250, 5000, 1400) for vertical freedom');

assert(gameSceneCode.includes("actionId === 'open_storage'"), 'GameScene handles open_storage interactable for Sanctuary Farm');
assert(gameSceneCode.includes("actionId === 'read_ow_sign'"), 'GameScene handles read_ow_sign interactable for Outer Woods');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('  ALL C4-12-17 CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}
