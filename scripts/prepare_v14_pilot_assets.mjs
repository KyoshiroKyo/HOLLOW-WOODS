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
  path.join(targetBase, 'village')
];

for (const d of dirs) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

console.log('1. Copying and verifying Updated-Trees (Pack 2)...');
const trees = ['Oak.png', 'Birch.png', 'Maple.png'];
const treeTargetNames = ['tree_oak_mossy_v14.png', 'tree_birch_amber_v14.png', 'tree_maple_crimson_v14.png'];

trees.forEach((t, i) => {
  const src = path.join(stagingDir, '02_updated_trees', t);
  const dest = path.join(targetBase, 'trees', treeTargetNames[i]);
  fs.copyFileSync(src, dest);
  console.log(`  Copied ${t} -> ${treeTargetNames[i]} (${fs.statSync(dest).size} bytes)`);
});

console.log('\n2. Slicing Forest-Asset-Pack (Pack 3)...');
const sheetPath = path.join(stagingDir, '03_forest_asset_pack', 'Forest-Asset-Pack-Sheet.png');
const sheetPng = PNG.sync.read(fs.readFileSync(sheetPath));

function sliceRect(png, x, y, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      const srcIdx = ((y + cy) * png.width + (x + cx)) * 4;
      const dstIdx = (cy * w + cx) * 4;
      out.data[dstIdx] = png.data[srcIdx];
      out.data[dstIdx + 1] = png.data[srcIdx + 1];
      out.data[dstIdx + 2] = png.data[srcIdx + 2];
      out.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return out;
}

// Bounding boxes determined in Step 2:
// [1] Hollow/Stump tree: (100, 2) - 42x63
// [2] Hollow trunk: (4, 4) - 43x61
// [3] Chopped stump / tree: (50, 4) - 46x61
// [4] Fallen log / stump: (146, 4) - 46x61
// [5] Branch/log: (204, 29) - 27x36
// [6] Cattails / reed: (257, 35) - 16x30
// [7-12] Mushrooms / small flowers: (195, 70), (213, 70), (228, 70), etc.
// [14] Chopped stump: (56, 79) - 34x50
// [15] Stump: (106, 79) - 29x50
// [25] Rock large: (229, 103) - 22x22
// [26] Rock medium: (261, 103) - 22x22
// [27] Bush/Moss clump: (197, 104) - 22x21

const slices = [
  { name: 'props/tree_hollow_ancient_v14.png', x: 4, y: 4, w: 43, h: 61 },
  { name: 'props/prop_stump_mossy_large_v14.png', x: 50, y: 4, w: 46, h: 61 },
  { name: 'props/prop_fallen_log_mossy_v14.png', x: 146, y: 4, w: 46, h: 61 },
  { name: 'foliage/prop_swamp_cattails_v14.png', x: 257, y: 35, w: 16, h: 30 },
  { name: 'foliage/prop_mushroom_cluster_v14.png', x: 195, y: 70, w: 45, h: 25 },
  { name: 'foliage/prop_fern_cluster_v14.png', x: 197, y: 104, w: 22, h: 21 },
  { name: 'props/rock_mossy_forest_01_v14.png', x: 229, y: 103, w: 22, h: 22 },
  { name: 'props/rock_mossy_forest_02_v14.png', x: 261, y: 103, w: 22, h: 22 }
];

for (const s of slices) {
  const destPath = path.join(targetBase, s.name);
  const sliced = sliceRect(sheetPng, s.x, s.y, s.w, s.h);
  fs.writeFileSync(destPath, PNG.sync.write(sliced));
  console.log(`  Exported ${s.name} (${s.w}x${s.h} px)`);
}

console.log('\n3. Extracting Grass & Dirt Tiles from TX Master (Pack 4)...');
const txGrassPath = path.join(stagingDir, '04_pixel_art_top_down_basic', 'Texture', 'TX Tileset Grass.png');
const txGrassPng = PNG.sync.read(fs.readFileSync(txGrassPath));

// TX Tileset Grass is 256x256, 16x16 tiles. We can extract 32x32 tiles (2x2 tiles):
// Tile A: pure forest grass top-left (0, 0, 32, 32)
// Tile B: forest grass with wild clovers/flowers (64, 0, 32, 32)
// Tile C: forest grass with soft moss patch (0, 64, 32, 32)
// Tile Dirt A: dirt trail center (32, 96, 32, 32)
// Tile Dirt B: dirt trail with pebble/roots (64, 96, 32, 32)

const tileSlices = [
  { name: 'tiles/tile_forest_grass_v14_a.png', x: 0, y: 0, w: 32, h: 32 },
  { name: 'tiles/tile_forest_grass_v14_b.png', x: 64, y: 0, w: 32, h: 32 },
  { name: 'tiles/tile_forest_grass_v14_c.png', x: 0, y: 64, w: 32, h: 32 },
  { name: 'tiles/tile_dirt_trail_v14_a.png', x: 32, y: 96, w: 32, h: 32 },
  { name: 'tiles/tile_dirt_trail_v14_b.png', x: 64, y: 96, w: 32, h: 32 }
];

for (const s of tileSlices) {
  const destPath = path.join(targetBase, s.name);
  const sliced = sliceRect(txGrassPng, s.x, s.y, s.w, s.h);
  fs.writeFileSync(destPath, PNG.sync.write(sliced));
  console.log(`  Exported ${s.name} (${s.w}x${s.h} px)`);
}

console.log('\n4. Color grading Hunter Camp props from The Fan-tasy Tileset (Pack 5)...');
function desaturateAndDarken(srcPath, destPath, factor = 0.72) {
  const png = PNG.sync.read(fs.readFileSync(srcPath));
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 0) {
      let r = png.data[i];
      let g = png.data[i + 1];
      let b = png.data[i + 2];
      // Convert to gray
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      // Mix towards gray (desaturate) and darken
      r = Math.round((r * 0.7 + gray * 0.3) * factor);
      g = Math.round((g * 0.7 + gray * 0.3) * factor);
      b = Math.round((b * 0.7 + gray * 0.3) * factor);
      png.data[i] = Math.min(255, Math.max(0, r));
      png.data[i + 1] = Math.min(255, Math.max(0, g));
      png.data[i + 2] = Math.min(255, Math.max(0, b));
    }
  }
  fs.writeFileSync(destPath, PNG.sync.write(png));
  console.log(`  Processed ${path.basename(destPath)}`);
}

const woodPileSrc = path.join(stagingDir, '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)/Art/Props/Wood_Pile_1.png');
const barrelSrc = path.join(stagingDir, '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)/Art/Props/Barrel_Small_Empty.png');

if (fs.existsSync(woodPileSrc)) {
  desaturateAndDarken(woodPileSrc, path.join(targetBase, 'village/prop_wood_pile_v14.png'), 0.70);
}
if (fs.existsSync(barrelSrc)) {
  desaturateAndDarken(barrelSrc, path.join(targetBase, 'village/prop_barrel_aged_v14.png'), 0.70);
}

console.log('\nAll V1.4 pilot assets prepared successfully in public/assets/environment/v14/');
