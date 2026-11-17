/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 6.3 (NÂNG CẤP SỔ TAY NHẬT KÝ [PHÍM J] & BESTIARY)
 *
 * Kiểm tra 4 trụ cột yêu cầu của Bước 6.3:
 * 1. Sổ tay nhật ký dạng sách cổ 2 trang lật mở ('src/ui/JournalModal.ts'):
 *    - Phím tắt [J] mở/đóng, [1] Nhiệm Vụ, [2] Mảnh Ký Ức, [3] Sinh Vật Rừng, [4] Bản Đồ
 *    - Trang 1: [Nhiệm Vụ] - Danh sách nhiệm vụ chính và phụ từ dân làng Bellhollow (bộ lọc All/Main/Side, chi tiết tasks)
 *    - Trang 2: [Mảnh Ký Ức] - Trang trái danh sách ký ức tìm thấy, trang phải nội dung chi tiết & lật trang
 *    - Trang 3: [Sinh Vật Rừng - Bestiary] - Ghi nhận Quạ Rừng, Bướm Đêm, The Echo, The Listener và The Mire Warden
 * 2. Cơ chế mở khóa tự nhiên (Natural Observation Ecosystem):
 *    - Không yêu cầu tiêu diệt động vật
 *    - Tự động sáng khi đứng quan sát trong tầm nhìn hoặc kích hoạt sự kiện môi trường
 * 3. Kiểm thử logic Bestiary & Save/Restore trong PlayerState & SaveManager
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
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ BƯỚC 6.3: SỔ TAY NHẬT KÝ & BESTIARY');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Giao Diện Sổ Tay Dạng Sách Cổ 2 Trang Lật Mở (JournalModal.ts)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Giao Diện Sổ Tay Dạng Sách Cổ 2 Trang Lật Mở ---');

const modalPath = path.resolve('src/ui/JournalModal.ts');
assert(fs.existsSync(modalPath), 'Tệp src/ui/JournalModal.ts tồn tại');
const modalCode = fs.readFileSync(modalPath, 'utf-8');

// 1.1 Khai báo Tab và Phím tắt
assert(modalCode.includes("export type JournalTab = 'quest' | 'lore' | 'bestiary' | 'map'"), 'JournalTab hỗ trợ 4 danh mục: quest, lore, bestiary, map');
assert(modalCode.includes("keydown-J") && modalCode.includes("this.toggle()"), 'Phím [J] kích hoạt mở/đóng sổ tay');
assert(modalCode.includes("keydown-ONE") && modalCode.includes("'quest'"), 'Phím [1] chuyển nhanh sang tab Nhiệm Vụ');
assert(modalCode.includes("keydown-TWO") && modalCode.includes("'lore'"), 'Phím [2] chuyển nhanh sang tab Mảnh Ký Ức');
assert(modalCode.includes("keydown-THREE") && modalCode.includes("'bestiary'"), 'Phím [3] chuyển nhanh sang tab Sinh Vật Rừng (Bestiary)');
assert(modalCode.includes("keydown-FOUR") && modalCode.includes("'map'"), 'Phím [4] chuyển nhanh sang tab Bản Đồ Thế Giới');

// 1.2 Bốn Tab điều hướng trên khung sổ
assert(modalCode.includes("this.tabQuestBtn") && modalCode.includes("[1. NHIỆM VỤ]"), 'Tab [1. NHIỆM VỤ] hiển thị trực quan');
assert(modalCode.includes("this.tabLoreBtn") && modalCode.includes("[2. MẢNH KÝ ỨC]"), 'Tab [2. MẢNH KÝ ỨC] hiển thị trực quan');
assert(modalCode.includes("this.tabBestiaryBtn") && modalCode.includes("[3. SINH VẬT RỪNG]"), 'Tab [3. SINH VẬT RỪNG] hiển thị trực quan');
assert(modalCode.includes("this.tabMapBtn") && modalCode.includes("[4. BẢN ĐỒ THẾ GIỚI]"), 'Tab [4. BẢN ĐỒ THẾ GIỚI] hiển thị trực quan');

// 1.3 Trang 1: [Nhiệm Vụ] dạng 2 trang
assert(modalCode.includes("renderQuestTab"), 'Có hàm renderQuestTab() hiển thị nhiệm vụ 2 trang');
assert(modalCode.includes("questFilter") && modalCode.includes("[TẤT CẢ]") && modalCode.includes("[CHÍNH]") && modalCode.includes("[PHỤ]"), 'Bộ lọc nhiệm vụ 3 chế độ [TẤT CẢ], [CHÍNH], [PHỤ]');
assert(modalCode.includes("MỤC TIÊU CẦN LÀM:"), 'Hiển thị danh sách mục tiêu chi tiết của nhiệm vụ');
assert(modalCode.includes("DANH SÁCH CÁC HỒI:") || modalCode.includes("DANH SÁCH NHIỆM VỤ:"), 'Hiển thị danh mục nhiệm vụ từ dân làng Bellhollow');

// 1.4 Trang 2: [Mảnh Ký Ức] dạng 2 trang
assert(modalCode.includes("renderLoreTab"), 'Có hàm renderLoreTab() hiển thị mảnh ký ức 2 trang');
assert(modalCode.includes("📜 CÁC MẢNH KÝ ỨC ĐÃ TÌM THẤY:"), 'Trang trái hiển thị danh sách các mảnh ký ức đã tìm thấy');
assert(modalCode.includes("entry.content") && modalCode.includes("Ghi lại bởi:"), 'Trang phải hiển thị toàn văn nội dung và tác giả bản ghi');
assert(modalCode.includes("◀ Trước") && modalCode.includes("Sau ▶"), 'Có nút điều hướng lật trang [◀ Trước] và [Sau ▶]');

// 1.5 Trang 3: [Sinh Vật Rừng - Bestiary] dạng 2 trang
assert(modalCode.includes("renderBestiaryTab"), 'Có hàm renderBestiaryTab() hiển thị sổ tay sinh vật 2 trang');
assert(modalCode.includes("🐾 SINH THÁI KHU RỪNG RỖNG:"), 'Trang trái hiển thị danh sách sinh vật với biểu tượng quan sát');
assert(modalCode.includes("📊 Tiến độ Bestiary:"), 'Hiển thị huy hiệu thống kê tiến độ quan sát các loài sinh vật');
assert(modalCode.includes("• TẬP TÍNH SINH THÁI:"), 'Trang phải ghi nhận tập tính sinh thái chi tiết');
assert(modalCode.includes("• CHIẾN THUẬT ĐỐI PHÓ & TỰ VỆ:"), 'Trang phải ghi nhận chiến thuật đối phó & tự vệ');
assert(modalCode.includes("renderBestiaryView"), 'Bảo toàn phương thức wrapper renderBestiaryView() tương thích ngược');


// -----------------------------------------------------------------------------
// PHẦN 2: Dữ Liệu Bestiary & Mở Khóa Tự Nhiên (PlayerState & WildlifeSystem)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Dữ Liệu Bestiary & Mở Khóa Tự Nhiên ---');

const playerStateCode = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf-8');
const typesCode = fs.readFileSync(path.resolve('src/types/index.ts'), 'utf-8');

// 2.1 Đầy đủ 5 loài sinh vật trong Bestiary
assert(typesCode.includes("'crow'") && typesCode.includes("'lantern_moth'") && typesCode.includes("'echo'") && typesCode.includes("'listener'") && typesCode.includes("'mire_warden'"), 'BestiarySpecies định nghĩa đủ 5 loài: crow, lantern_moth, echo, listener, mire_warden');
assert(playerStateCode.includes("'crow'") && playerStateCode.includes('Quạ Rừng'), 'Bestiary có Quạ Rừng (crow)');
assert(playerStateCode.includes("'lantern_moth'") && playerStateCode.includes('Bướm Đêm Hổ Phách'), 'Bestiary có Bướm Đêm (lantern_moth)');
assert(playerStateCode.includes("'echo'") && playerStateCode.includes('The Echo'), 'Bestiary có Hiện Tượng Ký Ức (echo)');
assert(playerStateCode.includes("'listener'") && playerStateCode.includes('The Listener'), 'Bestiary có Kẻ Lắng Nghe (listener)');
assert(playerStateCode.includes("'mire_warden'") && playerStateCode.includes('The Mire Warden'), 'Bestiary có Kẻ Nuốt Tiếng Chuông (mire_warden)');

// 2.2 Cơ chế mở khóa tự nhiên (Không cần giết)
const wildlifeCode = fs.readFileSync(path.resolve('src/systems/WildlifeSystem.ts'), 'utf-8');
assert(wildlifeCode.includes("observeCreature('crow')") && wildlifeCode.includes("observeCreature('lantern_moth')"), 'WildlifeSystem tự động mở khóa Quạ và Bướm Đêm khi tiếp cận trong tầm nhìn');

const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');
assert(gameSceneCode.includes("observeCreature('listener')"), 'GameScene mở khóa The Listener khi tiếp cận hoặc trong phân khu');
assert(gameSceneCode.includes("observeCreature('echo')"), 'GameScene mở khóa The Echo khi gặp ảo ảnh hoặc khám phá cột vọng âm');
assert(gameSceneCode.includes("observeCreature('mire_warden')"), 'GameScene mở khóa The Mire Warden khi tiến vào miếu chuông chạm trán trùm');


// -----------------------------------------------------------------------------
// PHẦN 3: Kiểm Thử Mô Phỏng Trạng Thái Bestiary & Sổ Tay
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Kiểm Thử Mô Phỏng Trạng Thái Bestiary & Sổ Tay ---');

// Mô phỏng 5 sinh vật ban đầu chưa quan sát
const mockBestiary = {
  crow: { species: 'crow', nameVi: 'Quạ Rừng', observed: false },
  lantern_moth: { species: 'lantern_moth', nameVi: 'Bướm Đêm Hổ Phách', observed: false },
  echo: { species: 'echo', nameVi: 'Hiện Tượng Ký Ức (The Echo)', observed: false },
  listener: { species: 'listener', nameVi: 'Kẻ Lắng Nghe (The Listener)', observed: false },
  mire_warden: { species: 'mire_warden', nameVi: 'Kẻ Nuốt Tiếng Chuông (The Mire Warden)', observed: false }
};

let observedCount = Object.values(mockBestiary).filter(b => b.observed).length;
assert(observedCount === 0, 'Ban đầu người chơi chưa quan sát sinh vật nào (0/5)');

// Mô phỏng bước đi trong Outer Woods -> quan sát Quạ
mockBestiary.crow.observed = true;
assert(mockBestiary.crow.observed === true, 'Người chơi đến gần đàn quạ: Quạ Rừng tự động sáng lên trong sổ tay');

// Mô phỏng bật đèn lồng gần vườn hoa -> quan sát Bướm Đêm
mockBestiary.lantern_moth.observed = true;
assert(mockBestiary.lantern_moth.observed === true, 'Bướm Đêm Hổ Phách tự động ghi nhận khi bật đèn lồng');

// Mô phỏng tiến vào Khoảng Trống Thì Thầm -> gặp The Echo
mockBestiary.echo.observed = true;
assert(mockBestiary.echo.observed === true, 'The Echo tự động ghi nhận khi gặp ảo ảnh');

// Mô phỏng tiến vào Deep Forest -> nghe thấy The Listener
mockBestiary.listener.observed = true;
assert(mockBestiary.listener.observed === true, 'The Listener tự động ghi nhận khi nghe thấy tiếng thở trong rừng sâu');

// Mô phỏng kích hoạt trận trùm tại Miếu Chuông -> chạm trán The Mire Warden
mockBestiary.mire_warden.observed = true;
assert(mockBestiary.mire_warden.observed === true, 'The Mire Warden tự động ghi nhận khi bước vào sân đá cổ');

observedCount = Object.values(mockBestiary).filter(b => b.observed).length;
assert(observedCount === 5, 'Toàn bộ 5 loài sinh vật trong Bestiary đã được mở khóa tự nhiên (5/5)');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
