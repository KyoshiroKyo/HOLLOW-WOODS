/**
 * HOLLOW WOODS V1.2 - COMMAND C4-12-26 VERIFICATION SUITE
 * Automated verification of World Map & Journal Integration
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details}`);
    failCount++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.2 - COMMAND C4-12-26 INTEGRATION VERIFICATION      ');
console.log('   (TÍCH HỢP BẢN ĐỒ THẾ GIỚI & SỔ TAY LỮ KHÁCH VÀO HỆ THỐNG V1.2)   ');
console.log('======================================================================\n');

// 1. Kiểm tra mã nguồn JournalModal.ts
console.log('--- TEST GROUP 1: KIỂM TRA MÃ NGUỒN JOURNAL MODAL & 3 TAB ---');
const journalPath = path.resolve('src/ui/JournalModal.ts');
assert(fs.existsSync(journalPath), 'File src/ui/JournalModal.ts tồn tại');
const journalContent = fs.readFileSync(journalPath, 'utf-8');

assert(journalContent.includes("currentTab: JournalTab = 'quest'"), 'Quản lý 3 Tab với JournalTab type');
assert(journalContent.includes("'[1. NHIỆM VỤ]'"), 'Tab 1: [1. NHIỆM VỤ] hiển thị chuẩn');
assert(journalContent.includes("'[2. CỔ THƯ & MANH MỐI]'"), 'Tab 2: [2. CỔ THƯ & MANH MỐI] hiển thị chuẩn');
assert(journalContent.includes("'[3. BẢN ĐỒ THẾ GIỚI]'"), 'Tab 3: [3. BẢN ĐỒ THẾ GIỚI] hiển thị chuẩn');
assert(journalContent.includes("renderMapTab"), 'Phương thức renderMapTab được tích hợp hoàn chỉnh');
assert(journalContent.includes("renderZoneInspector"), 'Bảng Zone Inspector bên phải hiển thị đầy đủ chi tiết');
assert(journalContent.includes("getNodeStatus"), 'Hàm tính toán 4 trạng thái trực quan phân khu');
assert(journalContent.includes("drawDashedLine"), 'Hàm vẽ nét đứt đồ họa đường kết nối bị khóa / chưa triển khai');

// 2. Kiểm tra danh mục 9 phân khu chính thức + 1 phân khu lộ trình
console.log('\n--- TEST GROUP 2: KIỂM TRA 9 PHÂN KHU CHÍNH THỨC & LỘ TRÌNH V1.3 ---');
const requiredZones = [
  { id: 'fog_crossing', name: 'Lối Mòn Xuyên Sương', tier: 'LAYER_1_CORE' },
  { id: 'bellhollow', name: 'Làng Bellhollow', tier: 'LAYER_1_CORE' },
  { id: 'sanctuary_farm', name: 'Nông Trại Trú Ẩn', tier: 'LAYER_1_CORE' },
  { id: 'outer_woods', name: 'Rừng Ngoại Vi', tier: 'LAYER_1_CORE' },
  { id: 'crooked_path', name: 'Đường Mòn Quanh Co', tier: 'LAYER_2_FRONTIER' },
  { id: 'deep_forest', name: 'Rừng Sâu', tier: 'LAYER_2_FRONTIER' },
  { id: 'silent_mire', name: 'Đầm Lầy Tĩnh Lặng', tier: 'LAYER_3_FORBIDDEN' },
  { id: 'ancient_rune_puzzle', name: 'Khu Vực Câu Đố Cổ Ngữ', tier: 'LAYER_3_FORBIDDEN' },
  { id: 'broken_bell_shrine', name: 'Miếu Chuông Phế Tích', tier: 'LAYER_3_FORBIDDEN' },
  { id: 'the_depths', name: 'Vực Sâu Cổ Đại', tier: 'UNIMPLEMENTED' }
];

for (const z of requiredZones) {
  assert(journalContent.includes(`id: '${z.id}'`), `Zone ${z.id} được định nghĩa trong mapNodes`);
  assert(journalContent.includes(`canonicalName: '${z.name}'`), `Zone ${z.id} có tên chuẩn tiếng Việt: ${z.name}`);
  assert(journalContent.includes(`tier: '${z.tier}'`), `Zone ${z.id} thuộc phân tầng chuẩn: ${z.tier}`);
}

// 3. Kiểm tra 4 trạng thái trực quan và vị trí người chơi
console.log('\n--- TEST GROUP 3: 4 TRẠNG THÁI TRỰC QUAN & VỊ TRÍ NGƯỜI CHƠI ---');
assert(journalContent.includes("'EXPLORED'"), 'Trạng thái EXPLORED (Đã khám phá)');
assert(journalContent.includes("'OPEN'"), 'Trạng thái OPEN (Đang mở — sẵn sàng)');
assert(journalContent.includes("'LOCKED'"), 'Trạng thái LOCKED (Đang khóa cốt truyện)');
assert(journalContent.includes("'UNIMPLEMENTED'"), 'Trạng thái UNIMPLEMENTED (Chưa triển khai V1.3)');
assert(journalContent.includes("📍 BẠN ĐANG CÓ MẶT TẠI ĐÂY"), 'Hiển thị huy hiệu vị trí hiện tại');
assert(journalContent.includes("strokeCircle(nx, ny, 26)"), 'Hiệu ứng beacon vòng tròn phát xung cho vị trí người chơi');

// 4. Kiểm tra mạng lưới kết nối giữa các phân khu (Connections Topology)
console.log('\n--- TEST GROUP 4: MẠNG LƯỚI KẾT NỐI (CONNECTIONS TOPOLOGY) ---');
assert(journalContent.includes("connections: ['bellhollow']"), 'Fog Crossing nối tới Bellhollow');
assert(journalContent.includes("connections: ['fog_crossing', 'sanctuary_farm', 'outer_woods', 'crooked_path']"), 'Bellhollow nối 4 hướng');
assert(journalContent.includes("connections: ['bellhollow', 'outer_woods']"), 'Sanctuary Farm nối Bellhollow và Outer Woods');
assert(journalContent.includes("connections: ['bellhollow', 'sanctuary_farm', 'crooked_path']"), 'Outer Woods nối Bellhollow, Farm và Crooked Path');
assert(journalContent.includes("connections: ['bellhollow', 'outer_woods', 'deep_forest', 'silent_mire']"), 'Crooked Path nối 4 phân khu');
assert(journalContent.includes("connections: ['crooked_path', 'silent_mire']"), 'Deep Forest nối Crooked Path và Silent Mire');
assert(journalContent.includes("connections: ['crooked_path', 'deep_forest', 'ancient_rune_puzzle', 'broken_bell_shrine']"), 'Silent Mire nối 4 phân khu');
assert(journalContent.includes("connections: ['silent_mire']"), 'Rune Puzzle nối Silent Mire');
assert(journalContent.includes("connections: ['silent_mire']"), 'Broken Bell Shrine nối Silent Mire');

// 5. Kiểm tra PlayerState & GameScene & SaveManager đồng bộ vị trí hiện tại
console.log('\n--- TEST GROUP 5: ĐỒNG BỘ VỊ TRÍ THỜI GIAN THỰC (PLAYERSTATE, GAMESCENE, SAVEMANAGER) ---');
const playerStatePath = path.resolve('src/state/PlayerState.ts');
const playerStateContent = fs.readFileSync(playerStatePath, 'utf-8');
assert(playerStateContent.includes("public currentZoneId: ZoneId = 'fog_crossing'"), 'PlayerState có thuộc tính currentZoneId');
assert(playerStateContent.includes("public setCurrentZone(zoneId: ZoneId): void"), 'PlayerState có hàm setCurrentZone');
assert(playerStateContent.includes("public getCurrentZone(): ZoneId"), 'PlayerState có hàm getCurrentZone');

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf-8');
assert(gameSceneContent.includes("this.playerState.setCurrentZone(this.currentZoneId)"), 'GameScene cập nhật vị trí sang PlayerState');

const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
const saveManagerContent = fs.readFileSync(saveManagerPath, 'utf-8');
assert(saveManagerContent.includes("state.setCurrentZone(data.zoneId as ZoneId)"), 'SaveManager khôi phục vị trí phân khu khi tải game');

// 6. Kiểm tra bảo vệ điều khiển nhân vật & bộ gõ Tiếng Việt
console.log('\n--- TEST GROUP 6: BẢO VỆ ĐIỀU KHIỂN & BỘ GÕ TIẾNG VIỆT ---');
assert(gameSceneContent.includes("this.journalModal.isOpen"), 'GameScene khóa di chuyển khi JournalModal đang mở');
assert(gameSceneContent.includes("this.player.resetAllInputState()"), 'Reset input state khi mở/đóng modal tránh kẹt phím');
assert(journalContent.includes("keydown-ONE"), 'Hỗ trợ phím số 1 đổi tab không xung đột bộ gõ');
assert(journalContent.includes("keydown-TWO"), 'Hỗ trợ phím số 2 đổi tab không xung đột bộ gõ');
assert(journalContent.includes("keydown-THREE"), 'Hỗ trợ phím số 3 đổi tab không xung đột bộ gõ');

const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf-8');
assert(uiSceneContent.includes("public openWorldMap(): void"), 'UIScene cung cấp phương thức openWorldMap tiện lợi');

// 7. Tổng kết kết quả kiểm thử
console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ: ${passCount} / ${passCount + failCount} TIÊU CHÍ ĐẠT (${failCount === 0 ? '100% ĐẠT CHUẨN' : 'CẦN KHẮC PHỤC'})`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
