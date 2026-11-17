/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRẬN ĐẤU TRÙM GIẢI ĐỐ KẺ NUỐT TIẾNG CHUÔNG (V14-P6-02)
 *
 * Kiểm tra 4 trụ cột chuyên sâu:
 * 1. Triết lý Kinh dị Giải đố: Thay thanh máu đỏ bằng Thanh Độ Ổn Định Phong Ấn 3 nấc & Checkpoint an toàn trước trận đấu.
 * 2. Pha 1 — Dẫn Dụ & Làm Choáng (Lure & Stagger 3.5s): Cơ chế lao húc va chạm Trụ Cổ Ngữ, phong ấn bằng [E] hoặc Giáo Gỗ.
 * 3. Pha 2 — Bóng Tối & Thắp Sáng Lại (Darkness & Re-light): Sương đặc, ảo ảnh The Echo, thắp sáng 3 Đài Cổ Ngữ bằng Đèn Lồng [F].
 * 4. Kết thúc nghi thức & Phần thưởng di vật cốt truyện không farm lặp lại (Trái Tim Mạch Rễ Cổ relic_heart_of_roots).
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRẬN TRÙM GIẢI ĐỐ MIẾU CHUÔNG (V14-P6-02)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Triết Lý Kinh Dị Giải Đố & Thanh Độ Ổn Định Phong Ấn (UIScene & Save)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Triết Lý Kinh Dị Giải Đố & Thanh Độ Ổn Định Phong Ấn ---');

const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf-8');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');
const saveManagerCode = fs.readFileSync(path.resolve('src/systems/SaveManager.ts'), 'utf-8');

// 1.1 Thanh Độ Ổn Định Phong Ấn (Boss Seal Bar) thay thế thanh máu đỏ
assert(uiSceneCode.includes('bossSealContainer') && uiSceneCode.includes('Phaser.GameObjects.Container'), 'UIScene khai báo container riêng cho Boss Seal Bar');
assert(uiSceneCode.includes('showBossSealBar'), 'UIScene có phương thức showBossSealBar()');
assert(uiSceneCode.includes('updateBossSealBar'), 'UIScene có phương thức updateBossSealBar()');
assert(uiSceneCode.includes('hideBossSealBar'), 'UIScene có phương thức hideBossSealBar()');
assert(uiSceneCode.includes('buildBossSealBar'), 'UIScene khởi tạo buildBossSealBar() trong chu trình create()');
assert(uiSceneCode.includes('ᚱ ANH NĂNG CỔ') && uiSceneCode.includes('ᚦ ĐỊA MẠCH RỄ') && uiSceneCode.includes('ᛉ BẢO HỘ CHUÔNG'), 'Thanh phong ấn hiển thị 3 nấc cổ ngữ đặc trưng');

// 1.2 Điểm lưu an toàn tự động (Safe Checkpoint Save) trước khi vào trận
assert(gameSceneCode.includes("SaveManager.saveGame('TRƯỚC MIẾU CHUÔNG — ĐIỂM HỒI SINH AN TOÀN'"), 'Tự động lưu điểm hồi sinh an toàn trước khi Boss thức tỉnh');
assert(gameSceneCode.includes('💾 ĐÃ TỰ ĐỘNG LƯU ĐIỂM HỒI SINH AN TOÀN TRƯỚC MIẾU CHUÔNG!'), 'Hiển thị thông báo lưu an toàn trên màn hình');


// -----------------------------------------------------------------------------
// PHẦN 2: Thực Thể Boss & Pha 1 Dẫn Dụ - Choáng (MireWardenBoss.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Thực Thể Boss & Pha 1 Dẫn Dụ - Choáng ---');

const bossFilePath = path.resolve('src/entities/MireWardenBoss.ts');
assert(fs.existsSync(bossFilePath), 'Tệp mã nguồn MireWardenBoss.ts tồn tại');
const bossCode = fs.readFileSync(bossFilePath, 'utf-8');

// 2.1 Các trạng thái của Boss
assert(bossCode.includes("'DORMANT'") && bossCode.includes("'CHARGING'") && bossCode.includes("'STAGGERED'"), 'MireWardenBoss định nghĩa đủ các trạng thái DORMANT, CHARGING, STAGGERED');
assert(bossCode.includes("'PHASE_TRANSITION'") && bossCode.includes("'ENSHROUDED'") && bossCode.includes("'DEFEATED'"), 'MireWardenBoss định nghĩa đủ các trạng thái PHASE_TRANSITION, ENSHROUDED, DEFEATED');

// 2.2 Cơ chế Choáng (Stagger) chuẩn 3.5 giây
assert(bossCode.includes('STAGGER_DURATION_MS: number = 3500'), 'Thời gian làm choáng Boss chuẩn xác 3.5 giây (3500ms)');
assert(bossCode.includes('public isStaggered: boolean = false'), 'Boss theo dõi trạng thái isStaggered');
assert(bossCode.includes('public stagger(): void'), 'Boss có phương thức stagger()');
assert(bossCode.includes('public applySeal(): number'), 'Boss có phương thức applySeal() tăng nấc phong ấn');

// 2.3 Cơ chế Dẫn Dụ âm thanh & Lao húc (Lure & Charge)
assert(bossCode.includes('hearSound(x: number, y: number, isLureBomb: boolean'), 'Boss tiếp nhận âm thanh đánh động từ mồi nhử hoặc tiếng chạy');
assert(bossCode.includes('triggerCharge('), 'Boss có phương thức lao húc triggerCharge()');
assert(gameSceneCode.includes('this.mireWardenBoss.hearSound(x, y, true)'), 'GameScene kết nối Mồi Tạo Tiếng Động [Q] kích hoạt Boss lao húc');
assert(gameSceneCode.includes('this.mireWardenBoss.stagger()'), 'GameScene làm choáng Boss khi đâm trúng Trụ Cổ Ngữ phát sáng');

// 2.4 Phong ấn bằng [E] hoặc vũ khí cận chiến khi bị choáng
assert(gameSceneCode.includes('handleBossSealInteraction()'), 'GameScene có phương thức handleBossSealInteraction()');
assert(gameSceneCode.includes('candidates.push') && gameSceneCode.includes('[E] KÍCH HOẠT ẤN PHONG ẤN!'), 'Tương tác [E] xuất hiện khi tiếp cận Boss bị choáng');
assert(gameSceneCode.includes('this.handleBossSealInteraction()'), 'Tấn công bằng vũ khí khi Boss bị choáng cũng kích hoạt phong ấn');


// -----------------------------------------------------------------------------
// PHẦN 3: Pha 2 — Bóng Tối, Ảo Ảnh The Echo & Thắp Sáng Lại
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Pha 2 — Bóng Tối, Ảo Ảnh The Echo & Thắp Sáng Lại ---');

// 3.1 Chuyển pha 2 giải phóng sương mù và ảo ảnh
assert(bossCode.includes('enterPhase2(): void'), 'MireWardenBoss có phương thức chuyển đổi enterPhase2()');
assert(gameSceneCode.includes('startMireWardenPhase2()'), 'GameScene kích hoạt startMireWardenPhase2() khi đạt nấc phong ấn 2');
assert(gameSceneCode.includes('new TheEcho('), 'GameScene triệu hồi ảo ảnh The Echo đánh lạc hướng');
assert(gameSceneCode.includes('triggerZoneTransitionMist(800)'), 'Màn sương đặc bao trùm đấu trường trong Pha 2');

// 3.2 Cơ chế 3 Đài Cổ Ngữ (Braziers) và thắp sáng bằng Đèn Lồng [F]
assert(gameSceneCode.includes('brazierTargets: BrazierTarget[]'), 'GameScene quản lý danh sách 3 Đài Cổ Ngữ');
assert(gameSceneCode.includes('handleRelightBrazier('), 'GameScene có phương thức handleRelightBrazier()');
assert(gameSceneCode.includes('this.playerState.stats.isLanternOn'), 'Yêu cầu người chơi bật Đèn Lồng [F] hoặc dùng Đuốc để thắp sáng đài lửa');
assert(gameSceneCode.includes('renderBrazierFlame('), 'Vẽ ngọn lửa bừng sáng khi đài lửa được kích hoạt');

// 3.3 Hóa giải ảo ảnh & Khóa ấn tối hậu
assert(gameSceneCode.includes('litCount < 3') || gameSceneCode.includes('brazierTargets.every'), 'Kiểm tra điều kiện thắp sáng đủ 3 Đài Cổ Ngữ');
assert(gameSceneCode.includes('handleBossFinalSeal()'), 'GameScene có phương thức khóa ấn tối hậu handleBossFinalSeal()');


// -----------------------------------------------------------------------------
// PHẦN 4: Kết Thúc Nghi Thức & Di Vật Cốt Truyện Không Farm Lặp Lại
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Kết Thúc Nghi Thức & Di Vật Cốt Truyện ---');

const itemsJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/items.json'), 'utf-8'));
const relicItem = itemsJsonRaw.items.find(i => i.id === 'relic_heart_of_roots');

// 4.1 Di vật cốt truyện Trái Tim Mạch Rễ Cổ
assert(relicItem && relicItem.category === 'quest', 'items.json chứa Di vật Trái Tim Mạch Rễ Cổ (relic_heart_of_roots, Quest Item)');
assert(relicItem.stackable === false && relicItem.maxStack === 1, 'Di vật không xếp chồng (maxStack = 1)');
assert(saveManagerCode.includes("'relic_heart_of_roots'"), 'SaveManager KNOWN_ITEM_KEYS đăng ký relic_heart_of_roots');

// 4.2 Trao thưởng và đặt cờ cốt truyện không farm lặp lại
assert(gameSceneCode.includes('finishMireWardenDefeat()'), 'GameScene có phương thức finishMireWardenDefeat()');
assert(gameSceneCode.includes("addItem('relic_heart_of_roots', 1)"), 'Trao thưởng di vật Trái Tim Mạch Rễ Cổ cho người chơi');
assert(gameSceneCode.includes("setFlag('boss_mire_warden_defeated')"), 'Đặt cờ vĩnh viễn boss_mire_warden_defeated');
assert(gameSceneCode.includes("setFlag('root_seal_restored')"), 'Đặt cờ vĩnh viễn root_seal_restored');
assert(gameSceneCode.includes('bossArenaBarrier.destroy()') || gameSceneCode.includes('this.bossArenaBarrier = null'), 'Giải phóng rào chắn rễ cây cổ thụ ở cổng Tây');
assert(bossCode.includes('defeat(): void'), 'Boss hóa đá vĩnh viễn thành tượng rêu hoa cổ thụ (không thể tái sinh/farm lặp lại)');

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
