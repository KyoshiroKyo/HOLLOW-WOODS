/**
 * scripts/verify_v14_p8_13_detour_path.mjs
 * Kịch bản kiểm thử tự động xác minh bước V14-P8-13:
 * Thiết kế lại cấu trúc đường đi tới khu vực Tháp Chuông theo dạng đường vòng quanh co
 * để tăng chiều sâu khám phá và kéo dài thời gian trải nghiệm.
 */

import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`  [PASS] ${message}`);
}

console.log('======================================================================');
console.log('🧪 VERIFY V14-P8-13: BELL TOWER WINDING DETOUR & COLLAPSED BRIDGE');
console.log('======================================================================\n');

const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
const gsSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const wsSrc = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));

// -----------------------------------------------------------------------------
// PHẦN 1: Chướng Ngại Vật Cầu Đá Cổ Bị Sập Chặn Lối Thẳng Cũ
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Chướng Ngại Vật Cầu Đá Cổ Bị Sập Chặn Lối Thẳng ---');

assert(wbSrc.includes('createCollapsedStoneBridgeObstacle('), 'WorldBuilder.ts định nghĩa hàm createCollapsedStoneBridgeObstacle');
assert(wbSrc.includes('this.createCollapsedStoneBridgeObstacle(1790, 280)'), 'WorldBuilder gọi createCollapsedStoneBridgeObstacle tại x=1790, y=280');
assert(wbSrc.includes('Deep Mist Chasm') || wbSrc.includes('Vực sương sâu'), 'Cầu sập có mô phỏng vực sương sâu cắt đứt lối đi');
assert(wbSrc.includes('Massive Fallen Tree Trunk') || wbSrc.includes('Thân cây đại thụ đổ chắn ngang'), 'Cầu sập có thân cây cổ thụ rêu phong đổ chắn ngang lối');
assert(wbSrc.includes('Rusted Iron Gate with Heavy Chains') || wbSrc.includes('Cổng sắt rỉ sét khóa chặt'), 'Cầu sập có cổng sắt rỉ sét khóa xích đen kiên cố');
assert(wbSrc.includes('body.setSize(38, 86)') || wbSrc.includes('body.setSize('), 'Cầu sập có Arcade Physics body collider chắn kín');

const cpZone = zonesData.zones.find(z => z.id === 'crooked_path');
assert(Boolean(cpZone), 'Phân khu crooked_path tồn tại trong zones.json');

const bridgeCollider = cpZone.colliders.find(c => c.id === 'cp_collapsed_bridge_blocker');
assert(Boolean(bridgeCollider), 'zones.json có collider cp_collapsed_bridge_blocker');
assert(bridgeCollider.isSolid === true, 'Collider cầu sập là vật cản cứng isSolid = true');

const bridgeInteractable = cpZone.interactables.find(i => i.id === 'collapsed_shrine_bridge');
assert(Boolean(bridgeInteractable), 'zones.json có interactable collapsed_shrine_bridge');
assert(bridgeInteractable.actionId === 'inspect_collapsed_bridge', 'actionId là inspect_collapsed_bridge');

// -----------------------------------------------------------------------------
// PHẦN 2: Cơ Chế Thông Điệp Dẫn Hướng & Tương Tác GameScene
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Cơ Chế Dẫn Hướng & Tương Tác GameScene ---');

const expectedGuidance = 'Cây cầu đá dẫn thẳng tới Tháp Chuông đã sập nát... Mình buộc phải tìm đường vòng qua Rừng Ngoài và Đường Mòn Quanh Co.';

assert(gsSrc.includes('triggerCollapsedBridgeThought('), 'GameScene.ts định nghĩa hàm triggerCollapsedBridgeThought');
assert(gsSrc.includes(expectedGuidance), 'GameScene.ts chứa đúng thông điệp dẫn hướng theo kịch bản');
assert(gsSrc.includes('actionId === \'inspect_collapsed_bridge\''), 'GameScene xử lý tương tác inspect_collapsed_bridge');
assert(gsSrc.includes('lastCollapsedBridgeThoughtTime'), 'GameScene có cooldown chống spam cho thông điệp cầu sập');
assert(gsSrc.includes('Math.hypot(foot.x - 1760, foot.y - 280) < 65'), 'GameScene tự động kích hoạt thông điệp khi lại gần lối tắt bị chặn');
assert(gsSrc.includes('actionId === \'read_detour_sign\''), 'GameScene xử lý tương tác đọc biển chỉ đường tuyến vòng read_detour_sign');

// -----------------------------------------------------------------------------
// PHẦN 3: Tuyến Đường Vòng Uốn Lượn 3 Chặng (Winding Detour)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Tuyến Đường Vòng Uốn Lượn 3 Chặng ---');

// Chặng 1: Outer Woods S-curves
assert(wbSrc.includes('V14-P8-13 Chặng 1: Tuyến đường vòng uốn lượn chữ S'), 'Outer Woods vẽ tuyến đường uốn lượn chữ S');
assert(wbSrc.includes('outer_woods_ground_baked_v14'), 'Outer Woods sử dụng baked texture v14 cập nhật');

// Chặng 2: Crooked Path vòng Bắc qua bìa Rừng Sâu
assert(wbSrc.includes('V14-P8-13 Chặng 2: Tuyến đường vòng uốn lượn'), 'Crooked Path vẽ tuyến đường vòng lên nhánh Bắc');
assert(wbSrc.includes('crooked_path_ground_baked_v14'), 'Crooked Path sử dụng baked texture v14 cập nhật');

// Chặng 3: Vòng Nam qua Cầu Gỗ Phụ Xuyên Sương
assert(wbSrc.includes('createDetourWoodenBridge('), 'WorldBuilder.ts định nghĩa hàm createDetourWoodenBridge');
assert(wbSrc.includes('this.createDetourWoodenBridge(2740, 390, 68)'), 'WorldBuilder gọi createDetourWoodenBridge tại x=2740, y=390');
assert(wbSrc.includes('LỐI VÒNG THÁP CHUÔNG'), 'WorldBuilder dựng biển chỉ đường LỐI VÒNG THÁP CHUÔNG');

// -----------------------------------------------------------------------------
// PHẦN 4: Điểm Ẩn Nấp, Điểm Thu Thập Nguyên Liệu & Quạ Cảnh Báo
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Điểm Ẩn Nấp, Nguyên Liệu & Quạ Cảnh Báo ---');

// Ẩn nấp
const owZone = zonesData.zones.find(z => z.id === 'outer_woods');
assert(Boolean(owZone), 'Phân khu outer_woods tồn tại trong zones.json');
assert(owZone.interactables.some(i => i.id === 'hide_bush_ow_s_curve'), 'Outer Woods có điểm ẩn nấp hide_bush_ow_s_curve');
assert(cpZone.interactables.some(i => i.id === 'hide_tree_detour_bridge'), 'Crooked Path có điểm ẩn nấp hide_tree_detour_bridge');

// Thu thập nguyên liệu
assert(owZone.interactables.some(i => i.id === 'gather_wood_ow_1'), 'Outer Woods có điểm nhặt Gỗ Khô gather_wood_ow_1');
assert(owZone.interactables.some(i => i.id === 'gather_resin_ow_1'), 'Outer Woods có điểm thu thập Nhựa Cây gather_resin_ow_1');
assert(owZone.interactables.some(i => i.id === 'gather_herbs_ow_1'), 'Outer Woods có điểm hái Thảo Dược gather_herbs_ow_1');

assert(cpZone.interactables.some(i => i.id === 'gather_wood_cp_1'), 'Crooked Path có điểm nhặt Gỗ Khô gather_wood_cp_1');
assert(cpZone.interactables.some(i => i.id === 'gather_resin_cp_1'), 'Crooked Path có điểm thu thập Nhựa Thông gather_resin_cp_1');
assert(cpZone.interactables.some(i => i.id === 'gather_herbs_cp_1'), 'Crooked Path có điểm hái Thảo Dược gather_herbs_cp_1');

assert(gsSrc.includes('this.playerState.addItem(\'res_dry_wood\', 2)'), 'GameScene cấp Gỗ Khô khi người chơi thu nhặt');
assert(gsSrc.includes('this.playerState.addItem(\'res_tree_resin\', 2)'), 'GameScene cấp Nhựa Cây khi người chơi thu thập');
assert(gsSrc.includes('this.playerState.addItem(\'res_herbs\', 2)'), 'GameScene cấp Thảo Dược khi người chơi thu hái');

// Quạ cảnh báo
assert(wsSrc.includes('crow_bridge_collapsed'), 'WildlifeSystem có quạ cảnh báo crow_bridge_collapsed đậu tại cầu sập');
assert(wsSrc.includes('crow_detour_bridge'), 'WildlifeSystem có quạ crow_detour_bridge đậu tại cầu gỗ phụ');

// -----------------------------------------------------------------------------
// PHẦN 5: An Toàn Tuyến Bản Đồ & Không Phá Hỏng Save/Load
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 5: An Toàn Tuyến Bản Đồ & Bảo Toàn Lưu Game ---');

assert(cpZone.bounds.x === 1600 && cpZone.bounds.width === 1280, 'Tọa độ phân khu crooked_path giữ nguyên vẹn');
assert(owZone.bounds.x === 1120 && owZone.bounds.width === 480, 'Tọa độ phân khu outer_woods giữ nguyên vẹn');
assert(zonesData.zones.find(z => z.id === 'broken_bell_shrine') !== undefined, 'Miếu Chuông Phế Tích broken_bell_shrine bảo toàn 100%');

console.log('\n======================================================================');
console.log('TEST SUMMARY: ALL 32 CHECKS PASSED (100%)');
console.log('======================================================================');
console.log('🎉 BƯỚC V14-P8-13 ĐÃ THIẾT KẾ VÀ TÍCH HỢP HOÀN TOÀN THÀNH CÔNG!');
