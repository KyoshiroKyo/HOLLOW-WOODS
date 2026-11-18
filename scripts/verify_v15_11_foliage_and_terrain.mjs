import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('--- KIỂM TRA TOÀN DIỆN BƯỚC V15-11: THỰC VẬT RỪNG SƯƠNG & MẶT ĐẤT LIỀN MẠCH ---');

const expectedAssets = [
  { p: 'public/assets/environment/trees/tree_mist_pine.png', w: 112, h: 160, desc: 'Thông sương mù' },
  { p: 'public/assets/environment/trees/tree_mossy_oak_grand.png', w: 144, h: 160, desc: 'Sồi già rêu phủ' },
  { p: 'public/assets/environment/trees/tree_weeping_willow.png', w: 128, h: 152, desc: 'Liễu rủ đầm lầy' },
  { p: 'public/assets/environment/trees/tree_withered_gnarled.png', w: 112, h: 144, desc: 'Cây khô trơ cành' },
  { p: 'public/assets/environment/foliage/decal_wild_grass.png', w: 32, h: 24, desc: 'Bụi cỏ dại' },
  { p: 'public/assets/environment/foliage/decal_fern_cluster.png', w: 36, h: 28, desc: 'Cụm dương xỉ' },
  { p: 'public/assets/environment/foliage/decal_glowing_mushrooms.png', w: 32, h: 24, desc: 'Nấm phát sáng' },
  { p: 'public/assets/environment/foliage/decal_autumn_leaves.png', w: 36, h: 24, desc: 'Lá mùa thu sương' },
  { p: 'public/assets/environment/foliage/decal_pebbles_stones.png', w: 32, h: 20, desc: 'Sỏi đá ven đường' },
  { p: 'public/assets/environment/foliage/decal_swamp_puddle.png', w: 48, h: 28, desc: 'Vũng nước đầm lầy' },
];

let allPassed = true;

for (const item of expectedAssets) {
  if (!fs.existsSync(item.p)) {
    console.error(`[FAIL] Không tìm thấy file: ${item.p}`);
    allPassed = false;
    continue;
  }
  const buf = fs.readFileSync(item.p);
  const png = PNG.sync.read(buf);
  if (png.width === item.w && png.height === item.h) {
    console.log(`[PASS] ${item.desc}: ${item.p} -> (${png.width}x${png.height}) px [CHÍNH XÁC]`);
  } else {
    console.error(`[FAIL] ${item.desc}: Kích thước sai lệch ${png.width}x${png.height}, kỳ vọng ${item.w}x${item.h}`);
    allPassed = false;
  }
}

// Kiểm tra Constants.ts
const constantsContent = fs.readFileSync('src/config/Constants.ts', 'utf8');
const requiredConstants = [
  'SPRITE_TREE_MIST_PINE_V15',
  'SPRITE_TREE_MOSSY_OAK_GRAND_V15',
  'SPRITE_TREE_WEEPING_WILLOW_V15',
  'SPRITE_TREE_WITHERED_GNARLED_V15',
  'SPRITE_DECAL_WILD_GRASS_V15',
  'SPRITE_DECAL_FERN_CLUSTER_V15',
  'SPRITE_DECAL_GLOWING_MUSHROOMS_V15',
  'SPRITE_DECAL_AUTUMN_LEAVES_V15',
  'SPRITE_DECAL_PEBBLES_STONES_V15',
  'SPRITE_DECAL_SWAMP_PUDDLE_V15'
];

for (const c of requiredConstants) {
  if (constantsContent.includes(c)) {
    console.log(`[PASS] Hằng số ${c} có mặt trong Constants.ts`);
  } else {
    console.error(`[FAIL] Thiếu hằng số ${c} trong Constants.ts`);
    allPassed = false;
  }
}

// Kiểm tra PreloadScene.ts
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
for (const c of requiredConstants) {
  if (preloadContent.includes(c)) {
    console.log(`[PASS] PreloadScene nạp ${c}`);
  } else {
    console.error(`[FAIL] PreloadScene thiếu nạp ${c}`);
    allPassed = false;
  }
}

// Kiểm tra WorldBuilder.ts
const worldBuilderContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
const methodsToCheck = [
  'createTree',
  'createGroundDecal',
  'createBellhollowGroundDecals',
  'SPRITE_TREE_MOSSY_OAK_GRAND_V15',
  'SPRITE_DECAL_PEBBLES_STONES_V15',
  'SPRITE_DECAL_AUTUMN_LEAVES_V15',
  'SPRITE_DECAL_WILD_GRASS_V15',
  'SPRITE_DECAL_FERN_CLUSTER_V15',
  'SPRITE_DECAL_GLOWING_MUSHROOMS_V15',
  'SPRITE_DECAL_SWAMP_PUDDLE_V15'
];

for (const m of methodsToCheck) {
  if (worldBuilderContent.includes(m)) {
    console.log(`[PASS] WorldBuilder tích hợp ${m}`);
  } else {
    console.error(`[FAIL] WorldBuilder thiếu ${m}`);
    allPassed = false;
  }
}

// Kiểm tra hiệu ứng feathered transitions
if (worldBuilderContent.includes('ctx.ellipse') && worldBuilderContent.includes('drawOrganicDirtPath')) {
  console.log(`[PASS] Đường đất drawOrganicDirtPath đã áp dụng thuật toán Feathered Transition (ellipse & organic noise)`);
} else {
  console.error(`[FAIL] Thiếu thuật toán Feathered Transition trong drawOrganicDirtPath`);
  allPassed = false;
}

if (worldBuilderContent.includes('drawCobbleCourtyard') && (worldBuilderContent.includes('Feathered Border') || worldBuilderContent.includes('Feathered Perimeter Pavers'))) {
  console.log(`[PASS] Sân đá drawCobbleCourtyard đã áp dụng thuật toán Feathered Transition (viền chuyển tiếp tự nhiên)`);
} else {
  console.error(`[FAIL] Thiếu thuật toán Feathered Transition trong drawCobbleCourtyard`);
  allPassed = false;
}

if (allPassed) {
  console.log('\n>>> TẤT CẢ CÁC BÀI KIỂM TRA BƯỚC V15-11 ĐỀU THÀNH CÔNG 100%! <<<');
  process.exit(0);
} else {
  console.error('\n>>> CÓ LỖI XẢY RA TRONG KIỂM TRA BƯỚC V15-11! <<<');
  process.exit(1);
}
