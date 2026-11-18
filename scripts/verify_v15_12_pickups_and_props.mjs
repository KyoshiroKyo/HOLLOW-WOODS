import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('--- KIỂM TRA TOÀN DIỆN BƯỚC V15-12: WORLD PICKUPS, SANCTUARY CAMP & VILLAGE PROPS ---\n');

const expectedAssets = [
  // World Pickups (24x24 px)
  { p: 'public/assets/environment/pickups/res_dry_wood.png', w: 24, h: 24, desc: 'Gỗ Khô' },
  { p: 'public/assets/environment/pickups/res_tree_resin.png', w: 24, h: 24, desc: 'Nhựa Thông' },
  { p: 'public/assets/environment/pickups/res_herbs.png', w: 24, h: 24, desc: 'Thảo Dược Bạc' },
  { p: 'public/assets/environment/pickups/res_flint.png', w: 24, h: 24, desc: 'Đá Lửa' },
  { p: 'public/assets/environment/pickups/res_runed_iron.png', w: 24, h: 24, desc: 'Phôi Sắt Cổ' },

  // Sanctuary Camp & Village Props
  { p: 'public/assets/environment/props/campfire_unlit.png', w: 48, h: 48, desc: 'Lửa Trại Chưa Thắp (Tro Tàn)' },
  { p: 'public/assets/environment/props/campfire_tier1.png', w: 48, h: 48, desc: 'Lửa Trại Cấp 1 (Duy Trì)' },
  { p: 'public/assets/environment/props/campfire_tier2.png', w: 48, h: 48, desc: 'Lửa Trại Cấp 2 (Cháy Đều)' },
  { p: 'public/assets/environment/props/campfire_tier3.png', w: 48, h: 48, desc: 'Lửa Trại Cấp 3 (Rực Rỡ)' },
  { p: 'public/assets/environment/props/prop_chest_bronze.png', w: 40, h: 32, desc: 'Rương Gỗ Đai Đồng' },
  { p: 'public/assets/environment/props/prop_cauldron_tripod.png', w: 36, h: 44, desc: 'Nồi Sắc Thảo Dược Kiềng 3 Chân' },
  { p: 'public/assets/environment/props/prop_wayfarer_tent.png', w: 64, h: 56, desc: 'Lều Vải Da Thú Của Lữ Khách' },
  { p: 'public/assets/environment/props/prop_lantern_post.png', w: 32, h: 64, desc: 'Cột Đèn Đường Gỗ Treo Đèn Lồng' },
  { p: 'public/assets/environment/props/prop_signpost_wood.png', w: 36, h: 48, desc: 'Biển Chỉ Đường Gỗ Khắc Mũi Tên' },
];

let allPassed = true;

// 1. Kiểm tra file và kích thước pixel art
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

// 2. Kiểm tra Constants.ts
const constantsContent = fs.readFileSync('src/config/Constants.ts', 'utf8');
const requiredConstants = [
  'SPRITE_RES_DRY_WOOD',
  'SPRITE_RES_TREE_RESIN',
  'SPRITE_RES_FLINT',
  'SPRITE_RES_HERBS',
  'SPRITE_RES_RUNED_IRON',
  'SPRITE_CAMPFIRE_TIER1_V15',
  'SPRITE_CAMPFIRE_TIER2_V15',
  'SPRITE_CAMPFIRE_TIER3_V15',
  'SPRITE_CAMPFIRE_UNLIT_V15',
  'SPRITE_PROP_CHEST_BRONZE_V15',
  'SPRITE_PROP_CAULDRON_TRIPOD_V15',
  'SPRITE_PROP_WAYFARER_TENT_V15',
  'SPRITE_PROP_LANTERN_POST_V15',
  'SPRITE_PROP_SIGNPOST_WOOD_V15'
];

for (const c of requiredConstants) {
  if (constantsContent.includes(c)) {
    console.log(`[PASS] Hằng số ${c} có mặt trong Constants.ts`);
  } else {
    console.error(`[FAIL] Thiếu hằng số ${c} trong Constants.ts`);
    allPassed = false;
  }
}

// 3. Kiểm tra PreloadScene.ts
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
for (const c of requiredConstants) {
  if (preloadContent.includes(c)) {
    console.log(`[PASS] PreloadScene nạp hằng số ${c}`);
  } else {
    console.error(`[FAIL] PreloadScene thiếu nạp ${c}`);
    allPassed = false;
  }
}

// 4. Kiểm tra WorldBuilder.ts
const worldBuilderContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
const worldBuilderChecks = [
  'SPRITE_PROP_SIGNPOST_WOOD_V15',
  'SPRITE_PROP_LANTERN_POST_V15',
  'SPRITE_CAMPFIRE_TIER1_V15',
  'SPRITE_CAMPFIRE_TIER2_V15',
  'SPRITE_CAMPFIRE_TIER3_V15',
  'SPRITE_CAMPFIRE_UNLIT_V15',
  'SPRITE_PROP_CHEST_BRONZE_V15',
  'SPRITE_PROP_CAULDRON_TRIPOD_V15',
  'SPRITE_PROP_WAYFARER_TENT_V15',
  'campfire_updated'
];

for (const item of worldBuilderChecks) {
  if (worldBuilderContent.includes(item)) {
    console.log(`[PASS] WorldBuilder tích hợp ${item}`);
  } else {
    console.error(`[FAIL] WorldBuilder thiếu ${item}`);
    allPassed = false;
  }
}

// 5. Kiểm tra InventorySystem.ts
const inventoryContent = fs.readFileSync('src/systems/InventorySystem.ts', 'utf8');
if (inventoryContent.includes('SPRITE_RES_RUNED_IRON') && inventoryContent.includes('mat_runed_iron')) {
  console.log('[PASS] InventorySystem hỗ trợ SPRITE_RES_RUNED_IRON và mat_runed_iron');
} else {
  console.error('[FAIL] InventorySystem thiếu hỗ trợ phôi sắt cổ');
  allPassed = false;
}

if (allPassed) {
  console.log('\n>>> TẤT CẢ CÁC BÀI KIỂM TRA BƯỚC V15-12 ĐỀU THÀNH CÔNG 100%! <<<');
  process.exit(0);
} else {
  console.error('\n>>> CÓ LỖI XẢY RA TRONG KIỂM TRA BƯỚC V15-12! <<<');
  process.exit(1);
}
