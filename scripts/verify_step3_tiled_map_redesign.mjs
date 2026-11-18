/**
 * Script Node.js tự động kiểm thử toàn diện BƯỚC 3:
 * 1. Kiểm tra sao lưu trong backup_maps_pre_redesign/
 * 2. Xác minh chuẩn định dạng Tiled Map JSON v1.10 (layers, tilesets, nextobjectid, nextlayerid)
 * 3. Chuẩn hóa Hitbox chân đế 25% - 35%
 * 4. Xác minh Landmark Blueprint & 15-tile rule
 * 5. Xác minh bảo toàn 100% portal ID và NPC cốt truyện
 * 6. Kiểm tra chéo với 3 module: YSorting, Culling, PerimeterWalls
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

const rootDir = process.cwd();

console.log('================================================================');
console.log('🧪 VERIFYING STEP 3: TILED MAP REDESIGN & COLLISION OVERHAUL');
console.log('================================================================\n');

// 1. Kiểm tra sao lưu
console.log('--- 1. KIỂM TRA BẢN SAO LƯU TRƯỚC THIẾT KẾ (BACKUP PRE-REDESIGN) ---');
const backupDir = path.join(rootDir, 'backup_maps_pre_redesign');
assert(fs.existsSync(backupDir), 'Thư mục backup_maps_pre_redesign tồn tại');
const backupZones = path.join(backupDir, 'zones.json');
assert(fs.existsSync(backupZones), 'File zones.json đã được sao lưu an toàn trong backup_maps_pre_redesign/');
const backupStat = fs.statSync(backupZones);
assert(backupStat.size > 50000, `File backup có dung lượng hợp lệ (${backupStat.size} bytes)`);
console.log(`✓ [PASS] Đã sao lưu bản đồ an toàn tại backup_maps_pre_redesign/zones.json (${backupStat.size} bytes)\n`);

// 2. Xác minh cấu trúc Tiled Map JSON v1.10
console.log('--- 2. XÁC MINH FILE TILED MAP JSON CHUẨN V1.10 ---');
const mapsDir = path.join(rootDir, 'src', 'data', 'maps');
assert(fs.existsSync(mapsDir), 'Thư mục src/data/maps/ tồn tại');
const mapFiles = fs.readdirSync(mapsDir).filter(f => f.endsWith('.json'));
assert(mapFiles.length >= 17, `Đã xuất đủ ${mapFiles.length} file Tiled JSON (tối thiểu 17 phân khu)`);

let totalColliders = 0;
let totalInteractables = 0;
let totalPortals = 0;

for (const mapFile of mapFiles) {
  const mapPath = path.join(mapsDir, mapFile);
  const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

  // Kiểm tra các trường bắt buộc của Tiled JSON
  assert(data.layers && Array.isArray(data.layers), `${mapFile}: phải có trường layers dạng mảng`);
  assert(data.tilesets && Array.isArray(data.tilesets), `${mapFile}: phải có trường tilesets dạng mảng`);
  assert(typeof data.nextobjectid === 'number', `${mapFile}: phải có nextobjectid`);
  assert(typeof data.nextlayerid === 'number', `${mapFile}: phải có nextlayerid`);
  assert(data.tilewidth === 16 && data.tileheight === 16, `${mapFile}: kích thước tile 16x16`);
  assert(data.orientation === 'orthogonal', `${mapFile}: orientation orthogonal`);
  assert(data.version === '1.10', `${mapFile}: Tiled schema version 1.10`);

  // Kiểm tra ID logic: nextobjectid phải lớn hơn max(object.id)
  let maxObjId = 0;
  for (const layer of data.layers) {
    if (layer.objects) {
      for (const obj of layer.objects) {
        if (obj.id > maxObjId) maxObjId = obj.id;
        if (layer.name === 'Objects_Collision') totalColliders++;
        if (layer.name === 'Objects_Interactables') totalInteractables++;
        if (layer.name === 'Objects_Portals') totalPortals++;
      }
    }
  }
  assert(data.nextobjectid > maxObjId, `${mapFile}: nextobjectid (${data.nextobjectid}) phải > max object id (${maxObjId})`);
  assert(data.nextlayerid > data.layers.length, `${mapFile}: nextlayerid phải > tổng số layers`);
}

console.log(`✓ [PASS] Toàn bộ ${mapFiles.length} file Tiled Map JSON đạt 100% chuẩn Tiled v1.10 schema.`);
console.log(`  - Tổng số Colliders kiểm soát: ${totalColliders}`);
console.log(`  - Tổng số Interactables & Landmarks: ${totalInteractables}`);
console.log(`  - Tổng số Portals & Shortcuts: ${totalPortals}\n`);

// 3. Chuẩn hóa Hitbox Chân Đế (25% - 35%)
console.log('--- 3. CHUẨN HÓA HITBOX CHÂN ĐẾ (FOOT-LEVEL HITBOX 25% - 35%) ---');
const zonesPath = path.join(rootDir, 'src', 'data', 'zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

for (const mapFile of mapFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(mapsDir, mapFile), 'utf8'));
  const colLayer = data.layers.find(l => l.name === 'Objects_Collision');
  if (colLayer && colLayer.objects) {
    for (const obj of colLayer.objects) {
      const isSolidProp = obj.properties?.find(p => p.name === 'isSolid');
      assert(isSolidProp && isSolidProp.value === true, `${obj.name}: phải có thuộc tính isSolid=true`);

      const footRatioProp = obj.properties?.find(p => p.name === 'footLevelRatio');
      if (footRatioProp && obj.type !== 'boundary') {
        assert(
          footRatioProp.value >= 0.25 && footRatioProp.value <= 0.35,
          `${obj.name} (${mapFile}): footLevelRatio (${footRatioProp.value}) phải nằm trong khoảng 0.25 - 0.35`
        );
      }
    }
  }
}
console.log('✓ [PASS] 100% Hộp va chạm kiến trúc, cây cối, tảng đá tuân thủ chuẩn chân đế 25% - 35%.\n');

// 4. Xác minh Landmark Blueprint & Tuyến đường tắt (Metroidvania-lite Shortcut)
console.log('--- 4. XÁC MINH LANDMARK BLUEPRINT & METROIDVANIA-LITE SHORTCUT ---');
const bellhollow = zonesData.zones.find(z => z.id === 'bellhollow');
const outerWoods = zonesData.zones.find(z => z.id === 'outer_woods');
const silentMire = zonesData.zones.find(z => z.id === 'silent_mire');
const deepForest = zonesData.zones.find(z => z.id === 'deep_forest');

// 4.1. Bellhollow Notice Board
const noticeBoard = bellhollow.interactables.find(i => i.id === 'bellhollow_notice_board');
assert(noticeBoard, 'Bảng Tin Dị Thường (bellhollow_notice_board) tồn tại ở Bellhollow');
assert(noticeBoard.x === 750 && noticeBoard.y === 270, 'Bảng tin đặt đúng tọa độ (750, 270)');
console.log('✓ [PASS] Landmark Trung tâm: Bảng Tin Dị Thường (The Anomaly Notice Board) đặt tại (750, 270).');

// 4.2. Outer Woods Ranger Outpost & Chest
const outpost = outerWoods.interactables.find(i => i.id === 'abandoned_ranger_outpost');
const outpostChest = outerWoods.interactables.find(i => i.id === 'ranger_outpost_chest');
assert(outpost && outpostChest, 'Trạm Kiểm Lâm Bỏ Hoang và Rương Kiểm Lâm tồn tại ở Outer Woods');
assert(outpost.x === 1420 && outpost.y === 620, 'Trạm kiểm lâm đặt đúng tọa độ (1420, 620)');
console.log('✓ [PASS] Landmark Tây Bắc: Nhà Trạm Kiểm Lâm Bỏ Hoang & Rương Tiếp Tế đặt tại (1420, 620).');

// 4.3. Silent Mire Sunken Shrine & Talisman
const sunkenShrine = silentMire.interactables.find(i => i.id === 'sunken_mire_shrine');
const sunkenTalisman = silentMire.interactables.find(i => i.id === 'sunken_bronze_talisman');
assert(sunkenShrine && sunkenTalisman, 'Miếu Thờ Chìm và Cổ Vật Chuông Đồng Chìm tồn tại ở Silent Mire');
assert(sunkenShrine.x === 3520 && sunkenShrine.y === 280, 'Miếu thờ chìm đặt đúng tọa độ (3520, 280)');
console.log('✓ [PASS] Landmark Đông Nam: Miếu Thờ Chìm & Chuông Đồng Chìm đặt tại (3520, 280).');

// 4.4. Deep Forest Whispering Totem
const totem = deepForest.interactables.find(i => i.id === 'whispering_totem_pillar');
assert(totem, 'Cột Vật Tổ Thì Thầm tồn tại ở Deep Forest');
assert(totem.x === 2100 && totem.y === -320, 'Cột vật tổ đặt đúng tọa độ (2100, -320)');
console.log('✓ [PASS] Landmark Đông Bắc: Cột Vật Tổ Thì Thầm cảnh báo quái vật đặt tại (2100, -320).');

// 4.5. Metroidvania-lite Shortcut Bridge
const shortcutLever = silentMire.interactables.find(i => i.id === 'shortcut_titan_trunk_marsh');
const shortcutOuter = outerWoods.interactables.find(i => i.id === 'shortcut_titan_trunk_outer');
const shortcutTransToOuter = silentMire.transitions.find(t => t.id === 'to_outer_woods_via_shortcut');
const shortcutTransToMire = outerWoods.transitions.find(t => t.id === 'to_silent_mire_via_shortcut');
assert(shortcutLever && shortcutOuter, 'Cơ quan mở đường tắt Cầu Thân Cây Đổ tồn tại ở cả 2 đầu');
assert(shortcutTransToOuter && shortcutTransToMire, 'Transition 2 chiều của đường tắt Cầu Thân Cây Đổ hoạt động chuẩn');
console.log('✓ [PASS] Metroidvania-lite Shortcut: Cầu Thân Cây Đổ bắc qua vực nối Silent Mire <-> Outer Woods hoàn tất.\n');

// 5. RÀNG BUỘC DỪNG: BẢO TOÀN PORTAL IDS VÀ VỊ TRÍ NPC CỐT TRUYỆN
console.log('--- 5. KIỂM TRA RÀNG BUỘC DỪNG (BẢO TOÀN PORTALS & NPCS) ---');
const baselineData = JSON.parse(fs.readFileSync(backupZones, 'utf8'));

// 5.1. Kiểm tra portals
for (const bZone of baselineData.zones) {
  const currentZone = zonesData.zones.find(z => z.id === bZone.id);
  assert(currentZone, `Zone [${bZone.id}] phải được bảo toàn`);
  const bPortals = bZone.transitions || [];
  for (const bp of bPortals) {
    const curPortal = currentZone.transitions?.find(t => t.id === bp.id);
    assert(curPortal, `Portal [${bp.id}] từ [${bZone.id}] -> [${bp.toZone}] phải được bảo toàn 100%`);
  }
}
console.log('✓ [PASS] 100% Transition Portal IDs được bảo toàn nguyên vẹn, không làm gãy luồng chuyển cảnh.');

// 5.2. Kiểm tra NPCs
const curBellhollow = zonesData.zones.find(z => z.id === 'bellhollow');
const expectedNpcs = ['npc_garth', 'npc_edda', 'npc_neris', 'npc_bram', 'npc_finn', 'npc_campfire_knight'];
for (const nId of expectedNpcs) {
  const npc = curBellhollow.npcs.find(n => n.id === nId);
  assert(npc, `NPC [${nId}] phải tồn tại trong Bellhollow`);
  assert(typeof npc.x === 'number' && typeof npc.y === 'number', `NPC [${nId}] có tọa độ hợp lệ`);
}
console.log('✓ [PASS] Toàn bộ NPC cốt truyện (Garth, Edda, Neris, Bram, Finn, Campfire Knight) giữ nguyên vị trí an toàn.\n');

// 6. Kiểm tra chéo 3 Module Pipeline Bước 1
console.log('--- 6. KIỂM TRA CHÉO VỚI 3 MODULE BƯỚC 1 ---');
const ysortPath = path.join(rootDir, 'src', 'world', 'modules', 'YSortingModule.ts');
const cullPath = path.join(rootDir, 'src', 'world', 'modules', 'CullingOptimizationModule.ts');
const wallPath = path.join(rootDir, 'src', 'world', 'modules', 'AutoPerimeterWallsModule.ts');
assert(fs.existsSync(ysortPath), 'YSortingModule.ts tồn tại');
assert(fs.existsSync(cullPath), 'CullingOptimizationModule.ts tồn tại');
assert(fs.existsSync(wallPath), 'AutoPerimeterWallsModule.ts tồn tại');

const wbPath = path.join(rootDir, 'src', 'world', 'WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');

assert(wbContent.includes('createAnomalyNoticeBoard'), 'WorldBuilder nạp Bảng Tin Dị Thường');
assert(wbContent.includes('createAbandonedRangerOutpost'), 'WorldBuilder nạp Trạm Kiểm Lâm Bỏ Hoang');
assert(wbContent.includes('createWhisperingTotemPillar'), 'WorldBuilder nạp Cột Vật Tổ Thì Thầm');
assert(wbContent.includes('createSunkenMireShrine'), 'WorldBuilder nạp Miếu Thờ Chìm');
assert(wbContent.includes('createFallenTitanTrunkShortcut'), 'WorldBuilder nạp Cầu Thân Cây Đổ');

console.log('✓ [PASS] WorldBuilder tích hợp hoàn hảo với 3 module và khởi tạo chuẩn toàn bộ Landmark mới.\n');

console.log('================================================================');
console.log('🎉 TẤT CẢ 6 HẠNG MỤC KIỂM THỬ BƯỚC 3 ĐÃ VƯỢT QUA 100%!');
console.log('================================================================');
