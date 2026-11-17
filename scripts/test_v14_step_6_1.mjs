/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 6.1
 * (3 Tiểu Khu Khám Phá Gắn Liền Cấu Trúc Bản Đồ Hiện Hữu & Kiểm Tra Va Chạm)
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

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 6.1 (3 TIỂU KHU & VA CHẠM)');
console.log('======================================================================\n');

const zonesRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf-8'));
const zones = zonesRaw.zones;

// -----------------------------------------------------------------------------
// 1. TIỂU KHU 1: XƯỞNG CHUÔNG BỎ HOANG (ABANDONED BELL WORKSHOP)
// -----------------------------------------------------------------------------
console.log('--- 1. Xưởng Chuông Bỏ Hoang (Abandoned Bell Workshop) ---');
const subBell = zones.find(z => z.id === 'sub_bell_workshop');
assert(subBell !== undefined, 'sub_bell_workshop được khai báo trong zones.json');
assert(subBell.name === 'Abandoned Bell Workshop', 'Tên vùng chuẩn Abandoned Bell Workshop');
assert(subBell.titleVietnamese === 'Xưởng Chuông Bỏ Hoang', 'Tiêu đề tiếng Việt chuẩn Xưởng Chuông Bỏ Hoang');

// Kiểm tra liên kết từ Outer Woods
const outerWoods = zones.find(z => z.id === 'outer_woods');
const toBell = outerWoods?.transitions?.find(t => t.toZone === 'sub_bell_workshop');
assert(toBell !== undefined, 'Outer Woods có điểm chuyển tiếp to_bell_workshop ở rìa phía Đông');

// Kiểm tra bàn thao tác cổ, Phôi Sắt Cổ Ngữ, Khuôn đúc chuông và Nhật ký thợ rèn
const bellInteractables = subBell.interactables || [];
assert(bellInteractables.some(i => i.id === 'inspect_ancient_workbench'), 'Có Bàn Thao Tác Cổ (inspect_ancient_workbench)');
assert(bellInteractables.some(i => i.id === 'inspect_runed_iron_part'), 'Có Phụ Kiện Sắt Rèn / Phôi Sắt Cổ Ngữ (inspect_runed_iron_part)');
assert(bellInteractables.some(i => i.id === 'inspect_bell_mold'), 'Có Khuôn Đúc Chuông Cũ (inspect_bell_mold)');
assert(bellInteractables.some(i => i.id === 'inspect_blacksmith_journal'), 'Có Mảnh Nhật Ký Thợ Rèn (inspect_blacksmith_journal)');

// Kiểm tra colliders xưởng chuông
const bellColliders = subBell.colliders || [];
assert(bellColliders.length >= 6, `Xưởng Chuông có đủ ${bellColliders.length} hộp va chạm bảo vệ viền và công trình`);
assert(bellColliders.some(c => c.id === 'bw_forge_table' && c.isSolid), 'Bàn rèn / lò đúc có hộp va chạm rắn bw_forge_table');

// -----------------------------------------------------------------------------
// 2. TIỂU KHU 2: HẦM RỄ CỔ (ROOT CELLAR)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Hầm Rễ Cổ (Root Cellar) ---');
const subRoot = zones.find(z => z.id === 'sub_root_cellar');
assert(subRoot !== undefined, 'sub_root_cellar được khai báo trong zones.json');
assert(subRoot.name === 'Root Cellar', 'Tên vùng chuẩn Root Cellar');
assert(subRoot.titleVietnamese === 'Hầm Rễ Cổ', 'Tiêu đề tiếng Việt chuẩn Hầm Rễ Cổ');

// Kiểm tra liên kết từ Sanctuary Farm
const farm = zones.find(z => z.id === 'sanctuary_farm');
const toCellar = farm?.transitions?.find(t => t.toZone === 'sub_root_cellar');
assert(toCellar !== undefined, 'Sanctuary Farm có lối vào bí mật to_root_cellar dưới nền đất');

// Kiểm tra Nấm Rừng quý hiếm, nguồn nước ngầm thanh khiết và rễ cây đại thụ
const rootInteractables = subRoot.interactables || [];
assert(rootInteractables.some(i => i.id === 'inspect_rare_mushrooms'), 'Có Khóm Nấm Rừng Quý Hiếm (inspect_rare_mushrooms)');
assert(rootInteractables.some(i => i.id === 'inspect_pure_spring'), 'Có Nguồn Nước Ngầm Thanh Khiết để nấu trà (inspect_pure_spring)');
assert(rootInteractables.some(i => i.id === 'inspect_rare_roots'), 'Có Khóm Rễ Thuốc Cổ (inspect_rare_roots)');
assert(rootInteractables.some(i => i.id === 'inspect_cellar_lock'), 'Có Cơ Quan Ánh Sáng Rễ Cổ (inspect_cellar_lock)');

// Kiểm tra colliders hầm rễ
const rootColliders = subRoot.colliders || [];
assert(rootColliders.length >= 6, `Hầm Rễ Cổ có đủ ${rootColliders.length} hộp va chạm bảo vệ viền và địa hình ngầm`);
assert(rootColliders.some(c => c.id === 'rc_central_pillar' && c.isSolid), 'Cột trụ đá rễ cây có va chạm rắn rc_central_pillar');
assert(rootColliders.some(c => c.id === 'rc_spring_pool' && c.isSolid), 'Vũng nước ngầm có va chạm rc_spring_pool');

// -----------------------------------------------------------------------------
// 3. TIỂU KHU 3: KHOẢNG TRỐNG THÌ THẦM (WHISPERING CLEARING)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Khoảng Trống Thì Thầm (Whispering Clearing) ---');
const subEcho = zones.find(z => z.id === 'sub_whispering_clearing');
assert(subEcho !== undefined, 'sub_whispering_clearing được khai báo trong zones.json');
assert(subEcho.name === 'Whispering Clearing', 'Tên vùng chuẩn Whispering Clearing');
assert(subEcho.titleVietnamese === 'Khoảng Trống Thì Thầm', 'Tiêu đề tiếng Việt chuẩn Khoảng Trống Thì Thầm');

// Kiểm tra liên kết từ Deep Forest
const deepForest = zones.find(z => z.id === 'deep_forest');
const toClearing = deepForest?.transitions?.find(t => t.toZone === 'sub_whispering_clearing');
assert(toClearing !== undefined, 'Deep Forest có điểm chuyển tiếp to_whispering_clearing dẫn vào khoảng trống');

// Kiểm tra 3 cột đá vọng âm dẫn đường
const echoInteractables = subEcho.interactables || [];
assert(echoInteractables.some(i => i.id === 'inspect_echo_pillar_1'), 'Có Cột Vọng Âm Phía Bắc (inspect_echo_pillar_1)');
assert(echoInteractables.some(i => i.id === 'inspect_echo_pillar_2'), 'Có Cột Vọng Âm Trung Tâm (inspect_echo_pillar_2)');
assert(echoInteractables.some(i => i.id === 'inspect_echo_pillar_3'), 'Có Cột Vọng Âm Phía Đông (inspect_echo_pillar_3)');

// Kiểm tra colliders các cột đá và thân cây cổ thụ uốn cong bao quanh
const echoColliders = subEcho.colliders || [];
assert(echoColliders.length >= 10, `Khoảng Trống Thì Thầm có đủ ${echoColliders.length} hộp va chạm bảo vệ viền, 3 cột đá và cây cổ thụ`);
assert(echoColliders.some(c => c.id === 'wc_pillar_1' && c.isSolid), 'Cột đá vọng âm 1 có va chạm rắn');
assert(echoColliders.some(c => c.id === 'wc_curved_tree_nw' && c.isSolid), 'Thân cây uốn cong Tây-Bắc có va chạm rắn');

// -----------------------------------------------------------------------------
// 4. KIỂM TRA WORLDBUILDER & TÍCH HỢP COLLIDERS
// -----------------------------------------------------------------------------
console.log('\n--- 4. Kiểm tra WorldBuilder.ts & Tích Hợp Mỹ Thuật / Va Chạm ---');
const wbCode = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf-8');

assert(wbCode.includes('renderSubBellWorkshopTerrain'), 'WorldBuilder có renderSubBellWorkshopTerrain');
assert(wbCode.includes('renderSubBellWorkshopDecorations'), 'WorldBuilder có renderSubBellWorkshopDecorations');
assert(wbCode.includes('renderSubRootCellarTerrain'), 'WorldBuilder có renderSubRootCellarTerrain');
assert(wbCode.includes('renderSubRootCellarDecorations'), 'WorldBuilder có renderSubRootCellarDecorations');
assert(wbCode.includes('renderSubWhisperingClearingTerrain'), 'WorldBuilder có renderSubWhisperingClearingTerrain');
assert(wbCode.includes('renderSubWhisperingClearingDecorations'), 'WorldBuilder có renderSubWhisperingClearingDecorations');

// Kiểm tra GameScene xử lý tương tác 3 tiểu khu
const gsCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');
assert(gsCode.includes('inspect_ancient_workbench'), 'GameScene xử lý tương tác inspect_ancient_workbench');
assert(gsCode.includes('collect_rare_mushrooms'), 'GameScene xử lý tương tác collect_rare_mushrooms');
assert(gsCode.includes('collect_pure_spring'), 'GameScene xử lý tương tác collect_pure_spring');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT BƯỚC 6.1: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> BƯỚC 6.1 (3 TIỂU KHU & VA CHẠM) ĐẠT CHUẨN 100%! <<<\n');
  process.exit(0);
}
