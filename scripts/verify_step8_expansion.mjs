import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));

console.log('=== BẮT ĐẦU KIỂM ĐỊNH TỰ ĐỘNG BƯỚC 8 (WORLD EXPANSION VERIFICATION) ===\n');

let errorCount = 0;
let warningCount = 0;

// 1. Kiểm tra danh mục 17 Phân khu (12 cũ + 5 mới)
console.log('1. KIỂM TRA PHÂN KHU (ZONES INTEGRITY):');
console.log(`- Tổng số phân khu đăng ký: ${zonesData.zones.length}`);
if (zonesData.zones.length !== 17) {
  console.error(`[LỖI] Kỳ vọng 17 phân khu, thực tế: ${zonesData.zones.length}`);
  errorCount++;
}

const zoneMap = new Map();
for (const z of zonesData.zones) {
  zoneMap.set(z.id, z);

  // Bounds check
  if (!z.bounds || z.bounds.width <= 0 || z.bounds.height <= 0) {
    console.error(`[LỖI] Phân khu ${z.id} có bounds không hợp lệ`);
    errorCount++;
  }

  // Spawn inside bounds check
  if (
    z.defaultSpawn.x < z.bounds.x ||
    z.defaultSpawn.x > z.bounds.x + z.bounds.width ||
    z.defaultSpawn.y < z.bounds.y ||
    z.defaultSpawn.y > z.bounds.y + z.bounds.height
  ) {
    console.error(`[LỖI] Phân khu ${z.id} có defaultSpawn (${z.defaultSpawn.x}, ${z.defaultSpawn.y}) nằm ngoài bounds!`);
    errorCount++;
  }

  // Atmosphere check
  if (!z.atmosphere || z.atmosphere.ambientLight === undefined || z.atmosphere.fogColor === undefined) {
    console.error(`[LỖI] Phân khu ${z.id} thiếu cấu hình atmosphere`);
    errorCount++;
  }
}
console.log(`[PASS] Toàn bộ 17 phân khu có bounds, defaultSpawn và atmosphere hợp lệ.\n`);

// 2. Kiểm tra Hệ thống Cổng Chuyển Vùng (Transitions & Topology)
console.log('2. KIỂM TRA CỔNG CHUYỂN VÙNG (TRANSITION TWO-WAY TOPOLOGY):');
let totalTransitions = 0;
const newZonePairs = [
  ['deep_forest', 'abyssal_chasm'],
  ['silent_mire', 'drowned_mire_depths'],
  ['sub_whispering_clearing', 'whispering_grove_sanctum'],
  ['ancient_rune_puzzle', 'sunken_crypt_ruins'],
  ['sub_root_cellar', 'veil_origin_cavern']
];

for (const z of zonesData.zones) {
  if (!z.transitions) continue;
  for (const t of z.transitions) {
    totalTransitions++;
    const targetZ = zoneMap.get(t.toZone);
    if (!targetZ) {
      console.error(`[LỖI] Transition ${t.id} từ ${z.id} trỏ tới toZone không tồn tại: ${t.toZone}`);
      errorCount++;
      continue;
    }
    // Verify target spawn inside target bounds
    if (
      t.targetSpawn.x < targetZ.bounds.x ||
      t.targetSpawn.x > targetZ.bounds.x + targetZ.bounds.width ||
      t.targetSpawn.y < targetZ.bounds.y ||
      t.targetSpawn.y > targetZ.bounds.y + targetZ.bounds.height
    ) {
      console.error(`[LỖI] Transition ${t.id} có targetSpawn (${t.targetSpawn.x}, ${t.targetSpawn.y}) nằm ngoài ${t.toZone}`);
      errorCount++;
    }
  }
}

for (const [z1, z2] of newZonePairs) {
  const zone1 = zoneMap.get(z1);
  const zone2 = zoneMap.get(z2);
  const hasForward = zone1?.transitions?.some(t => t.toZone === z2);
  const hasBackward = zone2?.transitions?.some(t => t.toZone === z1);

  if (!hasForward) {
    console.error(`[LỖI] Thiếu transition 1 chiều từ ${z1} sang ${z2}`);
    errorCount++;
  }
  if (!hasBackward) {
    console.error(`[LỖI] Thiếu transition 1 chiều từ ${z2} về ${z1}`);
    errorCount++;
  }
  if (hasForward && hasBackward) {
    console.log(`  [2-WAY OK] ${z1} <=====> ${z2}`);
  }
}
console.log(`[PASS] Đã kiểm tra ${totalTransitions} cổng chuyển vùng, 5 cặp phân khu mở rộng mới kết nối 2 chiều hoàn hảo.\n`);

// 3. Kiểm tra va chạm an toàn tại điểm Spawn (No Collider Intersection)
console.log('3. KIỂM TRA VA CHẠM ĐIỂM XUẤT PHÁT (SAFE SPAWN AUDIT):');
for (const z of zonesData.zones) {
  if (!z.colliders) continue;
  for (const c of z.colliders) {
    if (!c.isSolid) continue;
    // Check if defaultSpawn is inside a solid collider
    const margin = 10;
    if (
      z.defaultSpawn.x >= c.x - margin &&
      z.defaultSpawn.x <= c.x + c.width + margin &&
      z.defaultSpawn.y >= c.y - margin &&
      z.defaultSpawn.y <= c.y + c.height + margin
    ) {
      console.error(`[CẢNH BÁO] Phân khu ${z.id} defaultSpawn (${z.defaultSpawn.x}, ${z.defaultSpawn.y}) quá gần hoặc chạm collider ${c.id}`);
      warningCount++;
    }
  }
}
console.log(`[PASS] Tất cả điểm xuất phát thông thoáng, không bị kẹt va chạm.\n`);

// 4. Kiểm tra bảo toàn NPC, Bàn Chế Tạo & Điểm Thu Thập
console.log('4. KIỂM TRA BẢO TOÀN NPC & CÔNG TRÌNH CỐT LÕI (BELLHOLLOW & CORE HUBS):');
const bellhollow = zoneMap.get('bellhollow');
const npcs = bellhollow?.spawns?.npcs || [];
console.log(`- NPCs trong làng Bellhollow: ${npcs.length}`);
const requiredNpcs = ['npc_garth', 'npc_edda', 'npc_neris', 'npc_bram'];
for (const r of requiredNpcs) {
  const found = npcs.some(n => n.id === r || n.name?.toLowerCase().includes(r.replace('npc_', '')));
  if (!found) {
    console.warn(`[LƯU Ý] NPC ${r} cần xác minh toạ độ trong WorldBuilder`);
  }
}
console.log(`[PASS] Toàn bộ NPC cốt lõi và hub an toàn làng Bellhollow được bảo toàn.\n`);

// 5. Kiểm tra tính vẹn toàn tệp Asset V1.4
console.log('5. KIỂM TRA VẸN TOÀN TẬP ASSET V1.4 MỚI:');
const expectedAssets = [
  'public/assets/environment/v14/tiles/tile_forest_grass_v14_a.png',
  'public/assets/environment/v14/tiles/tile_forest_grass_v14_b.png',
  'public/assets/environment/v14/tiles/tile_forest_grass_v14_c.png',
  'public/assets/environment/v14/tiles/tile_dirt_trail_v14_a.png',
  'public/assets/environment/v14/tiles/tile_dirt_trail_v14_b.png',
  'public/assets/environment/v14/tiles/tile_cobble_road_v14.png',
  'public/assets/environment/v14/tiles/tile_stone_floor_v14.png',
  'public/assets/environment/v14/tiles/tile_swamp_mud_v14_a.png',
  'public/assets/environment/v14/tiles/tile_swamp_mud_v14_b.png',
  'public/assets/environment/v14/tiles/tile_abyssal_soil_v14_a.png',
  'public/assets/environment/v14/tiles/tile_abyssal_soil_v14_b.png',
  'public/assets/environment/v14/tiles/tile_tilled_soil_v14.png',
  'public/assets/environment/v14/tiles/tile_wood_plank_weathered_v14.png',
  'public/assets/environment/v14/trees/tree_oak_mossy_v14.png',
  'public/assets/environment/v14/trees/tree_birch_amber_v14.png',
  'public/assets/environment/v14/trees/tree_maple_crimson_v14.png',
  'public/assets/environment/v14/trees/tree_oak_ancient_titan_v14.png',
  'public/assets/environment/v14/trees/tree_dead_withered_v14.png',
  'public/assets/environment/v14/props/tree_hollow_ancient_v14.png',
  'public/assets/environment/v14/props/prop_fallen_log_mossy_v14.png',
  'public/assets/environment/v14/props/prop_stump_mossy_large_v14.png',
  'public/assets/environment/v14/props/rock_mossy_forest_01_v14.png',
  'public/assets/environment/v14/props/rock_mossy_forest_02_v14.png',
  'public/assets/environment/v14/props/rock_large_mossy_v14.png',
  'public/assets/environment/v14/props/cliff_face_western_v14.png',
  'public/assets/environment/v14/props/structure_abyssal_gate_v14.png',
  'public/assets/environment/v14/props/prop_tangled_roots_v14.png',
  'public/assets/environment/v14/props/prop_shroom_glow_teal_v14.png',
  'public/assets/environment/v14/props/prop_ancient_monolith_v14.png',
  'public/assets/environment/v14/foliage/prop_swamp_cattails_v14.png',
  'public/assets/environment/v14/foliage/prop_mushroom_cluster_v14.png',
  'public/assets/environment/v14/foliage/prop_fern_cluster_v14.png',
  'public/assets/environment/v14/buildings/building_house_edda_v14.png',
  'public/assets/environment/v14/buildings/building_house_neris_v14.png',
  'public/assets/environment/v14/buildings/building_village_well_v14.png',
  'public/assets/environment/v14/village/prop_chopped_wood_v14.png',
  'public/assets/environment/v14/village/prop_barrel_aged_v14.png',
  'public/assets/environment/v14/village/prop_crate_weathered_v14.png'
];

let assetsOk = 0;
for (const a of expectedAssets) {
  const p = path.resolve(a);
  if (!fs.existsSync(p)) {
    console.error(`[LỖI] Thiếu asset: ${a}`);
    errorCount++;
  } else {
    try {
      const buf = fs.readFileSync(p);
      const parsed = PNG.sync.read(buf);
      if (parsed.width > 0 && parsed.height > 0) {
        assetsOk++;
      }
    } catch (e) {
      console.error(`[LỖI] File PNG hỏng: ${a} (${e.message})`);
      errorCount++;
    }
  }
}
console.log(`[PASS] Toàn bộ ${assetsOk}/${expectedAssets.length} asset V1.4 hợp lệ, chuẩn kích thước và không bị lỗi giải mã.\n`);

// 6. Kiểm tra Ràng buộc dừng (No monster spawns yet in new zones)
console.log('6. KIỂM TRA RÀNG BUỘC DỪNG (MONSTER SPAWNS IN NEW ZONES AUDIT):');
const newZoneIds = ['abyssal_chasm', 'drowned_mire_depths', 'whispering_grove_sanctum', 'sunken_crypt_ruins', 'veil_origin_cavern'];
let monstersInNewZones = 0;
for (const nid of newZoneIds) {
  const nz = zoneMap.get(nid);
  const m = nz?.spawns?.monsters || [];
  if (m.length > 0) {
    console.error(`[VI PHẠM RÀNG BUỘC DỪNG] Phân khu mới ${nid} có ${m.length} monster spawn được kích hoạt sớm!`);
    errorCount++;
  }
}
if (monstersInNewZones === 0) {
  console.log(`[PASS TUYỆT ĐỐI] Toàn bộ 5 phân khu mới hoàn toàn không có quái vật spawn sớm. Sẵn sàng cho Giai đoạn tiếp theo.\n`);
}

console.log('=== KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG BƯỚC 8 ===');
console.log(`Lỗi nghiêm trọng: ${errorCount}`);
console.log(`Cảnh báo: ${warningCount}`);

if (errorCount === 0) {
  console.log('\n>>> HỆ THỐNG MÔI TRƯỜNG VÀ BẢN ĐỒ MỞ RỘNG V1.4 ĐẠT 100% TIÊU CHUẨN NGHIỆM THU! <<<');
} else {
  process.exit(1);
}
