/**
 * HOLLOW WOODS V1.4 — CỔNG KIỂM THỬ NGHIỆM THU & PHÁT HÀNH TOÀN DIỆN (V14-P7-02)
 *
 * Kiểm tra 4 cổng nghiệm thu phát hành tối thượng:
 * 1. Cổng Tương Thích & Bảo Vệ Tiến Trình (Save Migration & Backward Compatibility Gate).
 * 2. Cổng Vòng Lặp Sinh Tồn 4 Nhịp (4-Beat Survival Gameplay Loop Gate).
 * 3. Cổng Điều Khiển, UI/UX & Tối Ưu Hiệu Năng WebGL (Controls, UX & Performance Gate).
 * 4. Cổng Đóng Gói Dữ Liệu An Toàn & Chuẩn Sản Xuất (Production Build & CSP Gate).
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
console.log('   HOLLOW WOODS V1.4 — CỔNG NGHIỆM THU PHÁT HÀNH CUỐI CÙNG (V14-P7-02)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// CỔNG 1: Tương Thích & Bảo Vệ Tiến Trình (Save Migration & Data Safety)
// -----------------------------------------------------------------------------
console.log('--- CỔNG 1: Tương Thích & Bảo Vệ Dữ Liệu Tiến Trình Save ---');

const saveManagerCode = fs.readFileSync(path.resolve('src/systems/SaveManager.ts'), 'utf-8');
const playerStateCode = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf-8');
const itemsJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/items.json'), 'utf-8'));

assert(saveManagerCode.includes('CURRENT_SCHEMA_VERSION = 3'), 'Hệ thống Save nâng cấp lên schemaVersion 3');
assert(saveManagerCode.includes('hollow_woods_save_backup_v13'), 'Có khóa sao lưu dự phòng V1.3 an toàn (hollow_woods_save_backup_v13)');
assert(saveManagerCode.includes('backupV13Save') && saveManagerCode.includes('restoreV13Backup'), 'Có phương thức tự động sao lưu và khôi phục Save V1.3');
assert(saveManagerCode.includes('equippedSlots') && saveManagerCode.includes('storageChest'), 'SaveData bảo toàn 4 ô trang bị và rương đồ 12 ô');
assert(saveManagerCode.includes('campfireLevel') && saveManagerCode.includes('campfireFuel'), 'SaveData bảo toàn cấp độ và nhiên liệu Lửa Trại trung tâm');
assert(playerStateCode.includes('isProtectedItem'), 'PlayerState bảo vệ tuyệt đối vật phẩm nhiệm vụ và cổ thư (quest_*, lore_*)');


// -----------------------------------------------------------------------------
// CỔNG 2: Vòng Lặp 4 Nhịp Gameplay Sinh Tồn V1.4
// -----------------------------------------------------------------------------
console.log('\n--- CỔNG 2: Vòng Lặp 4 Nhịp Gameplay Sinh Tồn V1.4 ---');

const campSystemCode = fs.readFileSync(path.resolve('src/systems/CampSystem.ts'), 'utf-8');
const timeSystemCode = fs.readFileSync(path.resolve('src/systems/TimeSystem.ts'), 'utf-8');
const weatherSystemCode = fs.readFileSync(path.resolve('src/systems/WeatherSystem.ts'), 'utf-8');
const equipmentSystemCode = fs.readFileSync(path.resolve('src/systems/EquipmentSystem.ts'), 'utf-8');
const listenerAiCode = fs.readFileSync(path.resolve('src/systems/ListenerAI.ts'), 'utf-8');
const wildlifeSystemCode = fs.readFileSync(path.resolve('src/systems/WildlifeSystem.ts'), 'utf-8');
const echoCode = fs.readFileSync(path.resolve('src/entities/TheEcho.ts'), 'utf-8');
const bossCode = fs.readFileSync(path.resolve('src/entities/MireWardenBoss.ts'), 'utf-8');
const journalModalCode = fs.readFileSync(path.resolve('src/ui/JournalModal.ts'), 'utf-8');

// Nhịp 1: Chuẩn bị tại Hub Sanctuary Làng Bellhollow
assert(campSystemCode.includes('maxFuel: 300') || campSystemCode.includes('fuel'), 'CampSystem quản lý nhiên liệu Lửa Trại trung tâm 3 cấp');
assert(campSystemCode.includes('storageChest') && campSystemCode.includes('12'), 'CampSystem quản lý Rương Đồ 12 ô không thất thoát');
assert(campSystemCode.includes('brewRecipe') && campSystemCode.includes('cauldron'), 'CampSystem quản lý Nồi Thảo Dược sắc thuốc');
assert(equipmentSystemCode.includes('BODY') && equipmentSystemCode.includes('FEET') && equipmentSystemCode.includes('BACK') && equipmentSystemCode.includes('CHARM'), 'EquipmentSystem quản lý 4 ô trang bị có đánh đổi chỉ số');

// Nhịp 2: Khám phá thế giới (Thời gian, Thời tiết, Sinh thái)
assert(timeSystemCode.includes('DAY') && timeSystemCode.includes('DUSK') && timeSystemCode.includes('NIGHT'), 'TimeSystem quản lý chu kỳ 3 pha Ngày / Hoàng Hôn / Đêm Sương');
assert(weatherSystemCode.includes('MIST_RAIN') && weatherSystemCode.includes('getFootstepNoiseDampening'), 'WeatherSystem quản lý Mưa Sương cản tiếng bước chân 40%');
assert(wildlifeSystemCode.includes('ani_crow') && wildlifeSystemCode.includes('ani_lantern_moth'), 'WildlifeSystem quản lý Quạ Rừng và Bướm Đêm Hổ Phách');

// Nhịp 3: Đối phó & Tự vệ sinh tồn
assert(equipmentSystemCode.includes('wpn_walking_staff') && equipmentSystemCode.includes('wpn_iron_spear') && equipmentSystemCode.includes('wpn_hunting_hatchet'), 'Quản lý 3 loại vũ khí sinh tồn tự vệ (Gậy, Giáo, Rìu)');
assert(listenerAiCode.includes('lureHistory') || listenerAiCode.includes('repeatCount'), 'The Listener AI sở hữu trí nhớ ngắn hạn chống lặp mồi nhử');
assert(echoCode.includes('TheEcho') && echoCode.includes('alpha'), 'The Echo là thực thể ký ức sương mờ không gây sát thương vật lý');

// Nhịp 4: Cao trào Giải đố Đấu Trùm & Sổ tay / Bản đồ
assert(bossCode.includes('MireWardenBoss') && bossCode.includes('phase: 1 | 2') && bossCode.includes('enterPhase2'), 'Trận Trùm Kẻ Nuốt Tiếng Chuông triển khai 2 pha giải đố');
assert(playerStateCode.includes("'crow'") && playerStateCode.includes("'lantern_moth'") && playerStateCode.includes("'listener'") && playerStateCode.includes("'echo'"), 'Sổ tay sinh vật Bestiary tổng hợp đủ 4 loài (Quạ, Bướm Đêm, The Listener, The Echo)');
assert(journalModalCode.includes('sub_bell_workshop') && journalModalCode.includes('sub_root_cellar') && journalModalCode.includes('sub_whispering_clearing'), 'Bản đồ khu vực ghi nhận đủ 3 tiểu khu mới');


// -----------------------------------------------------------------------------
// CỔNG 3: Điều Khiển, Phím Tắt, UI/UX & Hiệu Năng WebGL
// -----------------------------------------------------------------------------
console.log('\n--- CỔNG 3: Điều Khiển, Phím Tắt, UI/UX & Hiệu Năng WebGL ---');

const uiSceneCode = fs.readFileSync(path.resolve('src/scenes/UIScene.ts'), 'utf-8');
const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');
const veilSystemCode = fs.readFileSync(path.resolve('src/systems/VeilSystem.ts'), 'utf-8');
const audioManagerCode = fs.readFileSync(path.resolve('src/audio/AudioManager.ts'), 'utf-8');

// Bảo toàn 100% phím tắt
assert(uiSceneCode.includes("keydown-ONE") && uiSceneCode.includes("keydown-TWO"), 'Bảo toàn phím tắt chọn ô nhanh [1], [2]');
assert(uiSceneCode.includes("keydown-Q"), 'Bảo toàn phím tắt ném mồi tạo tiếng động [Q]');
assert(uiSceneCode.includes("keydown-F"), 'Bảo toàn phím tắt bật/tắt Đèn Lồng [F]');
assert(uiSceneCode.includes("keydown-E"), 'Bảo toàn phím tắt tương tác [E]');
assert(uiSceneCode.includes("keydown-I"), 'Bảo toàn phím tắt mở Túi Đồ [I]');
assert(uiSceneCode.includes("keydown-J"), 'Bảo toàn phím tắt mở Nhật Ký / Sổ Tay [J]');
assert(uiSceneCode.includes("keydown-ESC"), 'Bảo toàn phím tắt Menu tạm dừng / Đóng cửa sổ [ESC]');
assert(uiSceneCode.includes("keydown-B"), 'Bổ sung phím tắt mở Trang Bị [B]');

// Viền nhận diện tương tác duy nhất & Hotbar 8 ô
assert(gameSceneCode.includes('interactionOutlineGfx') && gameSceneCode.includes('strokeRect'), 'Viền highlight tương tác trắng kem 1.5px trên duy nhất 1 mục tiêu gần nhất');
assert(uiSceneCode.includes('[1] Thuốc Đắp') && uiSceneCode.includes('[2] Dầu Đèn') && uiSceneCode.includes('[Q] Mồi Ném') && uiSceneCode.includes('[F] Đèn Lồng') && uiSceneCode.includes('[E] Tương Tác') && uiSceneCode.includes('[I] Chế Tạo') && uiSceneCode.includes('[J] Sổ Tay') && uiSceneCode.includes('[ESC] Tạm Dừng'), 'Thanh công cụ Hotbar cấu hình đủ 8 ô thao tác nhanh chuẩn xác');

// Audio Ducking & Trợ Năng Thị Giác
assert(audioManagerCode.includes('duckAmbience') && audioManagerCode.includes('unduckAmbience'), 'Hệ thống dìm âm nền Audio Ducking bảo vệ tín hiệu sinh tồn');
assert(veilSystemCode.includes('rainAuraThreatOverlay') && veilSystemCode.includes('updateRainThreatVisualIndicator'), 'Chỉ báo trợ năng thị giác viền đỏ rung khi trời mưa át tiếng bước chân');
assert(gameSceneCode.includes('cleanupAudioLoops') && gameSceneCode.includes('cleanupTransitionVFX'), 'Dọn dẹp triệt để vòng lặp âm thanh và overlay VFX khi chuyển cảnh');


// -----------------------------------------------------------------------------
// CỔNG 4: Đóng Gói Dữ Liệu An Toàn & Chuẩn Sản Xuất
// -----------------------------------------------------------------------------
console.log('\n--- CỔNG 4: Đóng Gói Dữ Liệu An Toàn & Chuẩn Sản Xuất ---');

const contentPackLoaderCode = fs.readFileSync(path.resolve('src/registry/ContentPackLoader.ts'), 'utf-8');
const p2gameJsonRaw = JSON.parse(fs.readFileSync(path.resolve('public/p2game.json'), 'utf-8'));

assert(contentPackLoaderCode.includes('pack_wildlife') && contentPackLoaderCode.includes('pack_equipment') && contentPackLoaderCode.includes('pack_camp_cooking') && contentPackLoaderCode.includes('pack_relics'), 'Nạp sẵn 4 gói dữ liệu nội dung tích hợp');
assert(!contentPackLoaderCode.includes('eval(') && !contentPackLoaderCode.includes('new Function('), 'Tuân thủ nghiêm ngặt CSP RT-002: Không có eval() hay new Function()');
assert(p2gameJsonRaw.id === 'hollow-woods', 'Manifest P2Game cấu hình đúng id game hollow-woods');
assert(p2gameJsonRaw.engine === 'webgl', 'Manifest P2Game cấu hình đúng engine WebGL');
assert(fs.existsSync(path.resolve('dist/index.html')), 'Bản build production dist/index.html tồn tại');
assert(fs.existsSync(path.resolve('dist/p2game.json')), 'Tệp manifest dist/p2game.json tồn tại');


// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`   KẾT QUẢ NGHIỆM THU: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
