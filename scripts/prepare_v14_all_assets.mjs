import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingDir = path.resolve('staging/env_audit');
const targetBase = path.resolve('public/assets/environment/v14');

const dirs = [
  path.join(targetBase, 'trees'),
  path.join(targetBase, 'props'),
  path.join(targetBase, 'foliage'),
  path.join(targetBase, 'tiles'),
  path.join(targetBase, 'village'),
  path.join(targetBase, 'buildings')
];

for (const d of dirs) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function sliceAndSave(srcPng, sx, sy, sw, sh, destPath, colorFilter = null) {
  const outPng = new PNG({ width: sw, height: sh });
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const srcIdx = ((sy + y) * srcPng.width + (sx + x)) << 2;
      const dstIdx = (y * sw + x) << 2;

      let r = srcPng.data[srcIdx];
      let g = srcPng.data[srcIdx + 1];
      let b = srcPng.data[srcIdx + 2];
      let a = srcPng.data[srcIdx + 3];

      if (colorFilter) {
        [r, g, b, a] = colorFilter(r, g, b, a, x, y);
      }

      outPng.data[dstIdx] = Math.max(0, Math.min(255, r));
      outPng.data[dstIdx + 1] = Math.max(0, Math.min(255, g));
      outPng.data[dstIdx + 2] = Math.max(0, Math.min(255, b));
      outPng.data[dstIdx + 3] = Math.max(0, Math.min(255, a));
    }
  }
  fs.writeFileSync(destPath, PNG.sync.write(outPng));
  console.log(`[SAVED] ${path.basename(destPath)} (${sw}x${sh} px, ${fs.statSync(destPath).size} bytes)`);
}

console.log('--- 1. PREPARING EXPANSION TILES ---');
// 1.1 Cobblestone Road Tile (32x32) from TX Tileset Stone Ground
const stoneGroundPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/TX Tileset Stone Ground.png')));
sliceAndSave(stoneGroundPng, 0, 0, 32, 32, path.join(targetBase, 'tiles/tile_cobble_road_v14.png'), (r, g, b, a) => {
  // Darken slightly for Dark Woodland vibe
  return [Math.round(r * 0.82), Math.round(g * 0.85), Math.round(b * 0.80), a];
});

// 1.2 Stone Floor Tile (32x32) from TX Struct
const structPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/TX Struct.png')));
sliceAndSave(structPng, 32, 64, 32, 32, path.join(targetBase, 'tiles/tile_stone_floor_v14.png'), (r, g, b, a) => {
  return [Math.round(r * 0.78), Math.round(g * 0.80), Math.round(b * 0.75), a];
});

// 1.3 Weathered Wood Plank Tile (32x32)
sliceAndSave(structPng, 96, 96, 32, 32, path.join(targetBase, 'tiles/tile_wood_plank_weathered_v14.png'), (r, g, b, a) => {
  // Weathered gray-brown timber
  return [Math.round(r * 0.75), Math.round(g * 0.70), Math.round(b * 0.65), a];
});

// 1.4 Swamp Mud Tiles (32x32)
const grassPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/TX Tileset Grass.png')));
sliceAndSave(grassPng, 64, 64, 32, 32, path.join(targetBase, 'tiles/tile_swamp_mud_v14_a.png'), (r, g, b, a) => {
  // Deep dark mossy peat mud #182218
  return [Math.round(r * 0.40), Math.round(g * 0.48), Math.round(b * 0.35), a];
});
sliceAndSave(grassPng, 96, 64, 32, 32, path.join(targetBase, 'tiles/tile_swamp_mud_v14_b.png'), (r, g, b, a) => {
  return [Math.round(r * 0.36), Math.round(g * 0.44), Math.round(b * 0.38), a];
});

// 1.5 Abyssal Soil Tiles (32x32)
sliceAndSave(grassPng, 0, 0, 32, 32, path.join(targetBase, 'tiles/tile_abyssal_soil_v14_a.png'), (r, g, b, a) => {
  // Cold dark abyssal violet-charcoal #111516
  return [Math.round(r * 0.28), Math.round(g * 0.30), Math.round(b * 0.38), a];
});
sliceAndSave(grassPng, 32, 0, 32, 32, path.join(targetBase, 'tiles/tile_abyssal_soil_v14_b.png'), (r, g, b, a) => {
  return [Math.round(r * 0.24), Math.round(g * 0.26), Math.round(b * 0.34), a];
});

// 1.6 Tilled Soil Tile (32x32) from The Fan-tasy Tileset
const fantasyGroundPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Ground Tileset/Tileset_Ground.png')));
sliceAndSave(fantasyGroundPng, 0, 32, 32, 32, path.join(targetBase, 'tiles/tile_tilled_soil_v14.png'), (r, g, b, a) => {
  // Rich dark loam #2a1e14
  return [Math.round(r * 0.65), Math.round(g * 0.55), Math.round(b * 0.45), a];
});

console.log('--- 2. PREPARING EXPANSION TREES & PROPS ---');
// 2.1 Colossal Titan Oak Tree (113x139) from TX Plant with Shadow
const plantWithShadowPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/Extra/TX Plant with Shadow.png')));
sliceAndSave(plantWithShadowPng, 24, 14, 113, 139, path.join(targetBase, 'trees/tree_oak_ancient_titan_v14.png'));

// 2.2 Withered Dead Tree (32x48) from TX Plant
const txPlantPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/TX Plant.png')));
sliceAndSave(txPlantPng, 32, 192, 32, 48, path.join(targetBase, 'trees/tree_dead_withered_v14.png'), (r, g, b, a) => {
  // Desaturated ash-grey deadwood
  const avg = (r + g + b) / 3;
  return [Math.round(avg * 0.8), Math.round(avg * 0.8), Math.round(avg * 0.75), a];
});

// 2.3 Large Mossy Rock (64x48) from TX Props with Shadow
const propsWithShadowPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '04_pixel_art_top_down_basic/Texture/Extra/TX Props with Shadow.png')));
sliceAndSave(propsWithShadowPng, 40, 16, 64, 48, path.join(targetBase, 'props/rock_large_mossy_v14.png'));

// 2.4 Cliff Face Western (32x48) from Resurrected RPG Wall
const wallPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '01_resurrected_rpg/Wall.png')));
sliceAndSave(wallPng, 0, 0, 32, 48, path.join(targetBase, 'props/cliff_face_western_v14.png'), (r, g, b, a) => {
  // Lower brightness -25% to blend into dark woodland cliffs
  return [Math.round(r * 0.75), Math.round(g * 0.75), Math.round(b * 0.72), a];
});

// 2.5 Abyssal Void Gate (160x59) from SHADOW Series
const gateSrc = path.join(stagingDir, '06_shadow_series/SHADOW Series - Void Gate/SHADOW Series - Abyssal Gate.png');
fs.copyFileSync(gateSrc, path.join(targetBase, 'props/structure_abyssal_gate_v14.png'));
console.log(`[COPIED] structure_abyssal_gate_v14.png (160x59 px)`);

// 2.6 Tangled Roots (48x32) from Forest Asset Pack
const forestSheetPng = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '03_forest_asset_pack/Forest-Asset-Pack-Sheet.png')));
sliceAndSave(forestSheetPng, 100, 2, 42, 63, path.join(targetBase, 'props/prop_tangled_roots_v14.png'));

// 2.7 Teal Bioluminescent Mushroom (24x24)
sliceAndSave(forestSheetPng, 308, 100, 10, 25, path.join(targetBase, 'props/prop_shroom_glow_teal_v14.png'), (r, g, b, a) => {
  // Shift to ethereal teal #2ecc71 / #1abc9c
  return [Math.round(r * 0.4), Math.round(g * 1.2), Math.round(b * 1.4), a];
});

// 2.8 Ancient Monolith / Rune Pillar (32x64)
sliceAndSave(structPng, 0, 128, 32, 64, path.join(targetBase, 'props/prop_ancient_monolith_v14.png'), (r, g, b, a) => {
  return [Math.round(r * 0.75), Math.round(g * 0.8), Math.round(b * 0.75), a];
});

console.log('--- 3. PREPARING VILLAGE BUILDINGS (PACK 5) ---');
// 3.1 House Edda (157x112)
const houseEddaSrc = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Buildings/House_Hay_2.png')));
sliceAndSave(houseEddaSrc, 0, 0, 157, 112, path.join(targetBase, 'buildings/building_house_edda_v14.png'), (r, g, b, a) => {
  // Darken thatch, keep warm amber on lit windows
  return [Math.round(r * 0.82), Math.round(g * 0.78), Math.round(b * 0.70), a];
});

// 3.2 House Neris (128x128)
const houseNerisSrc = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Buildings/House_Hay_4_Purple.png')));
sliceAndSave(houseNerisSrc, 0, 0, 128, 128, path.join(targetBase, 'buildings/building_house_neris_v14.png'), (r, g, b, a) => {
  // Deep dark herbalist cottage
  return [Math.round(r * 0.80), Math.round(g * 0.76), Math.round(b * 0.78), a];
});

// 3.3 Village Well (56x75)
const wellSrc = PNG.sync.read(fs.readFileSync(path.join(stagingDir, '05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Buildings/Well_Hay_1.png')));
sliceAndSave(wellSrc, 0, 0, 56, 75, path.join(targetBase, 'buildings/building_village_well_v14.png'), (r, g, b, a) => {
  return [Math.round(r * 0.85), Math.round(g * 0.82), Math.round(b * 0.75), a];
});

console.log('All expansion assets generated successfully!');
