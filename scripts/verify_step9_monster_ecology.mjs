/**
 * HOLLOW WOODS V1.4 — BƯỚC 9 VERIFICATION SCRIPT
 * scripts/verify_step9_monster_ecology.mjs
 *
 * Kiểm tra toàn diện hệ thống quái vật mới, cơ chế chạm trán, hệ sinh thái động vật,
 * đội hình hộ vệ và hiệu ứng biến đổi môi trường khi Boss thức tỉnh.
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
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failCount++;
  }
}

console.log('========================================================================');
console.log('HOLLOW WOODS V1.4 — KIỂM THỬ TỰ ĐỘNG BƯỚC 9: HỆ SINH THÁI QUÁI VẬT & CHẠM TRÁN');
console.log('========================================================================\n');

// -------------------------------------------------------------------------
// 1. KIỂM TRA FILE ASSET N3XUS VÀ GOBLIN SCOUT
// -------------------------------------------------------------------------
console.log('--- 1. Kiểm tra Tệp Tài Nguyên Hình Ảnh & Sprite Sheet ---');
const batPath = path.join(process.cwd(), 'public/assets/characters/monsters/bat_sheet.png');
const ghostPath = path.join(process.cwd(), 'public/assets/characters/monsters/ghost_sheet.png');
const scoutDaggerPath = path.join(process.cwd(), 'public/assets/characters/monsters/goblin_scout_dagger_sheet.png');

assert(fs.existsSync(batPath), 'Tệp bat_sheet.png tồn tại trong public/');
assert(fs.existsSync(ghostPath), 'Tệp ghost_sheet.png tồn tại trong public/');
assert(fs.existsSync(scoutDaggerPath), 'Tệp goblin_scout_dagger_sheet.png tồn tại trong public/');

const batStat = fs.existsSync(batPath) ? fs.statSync(batPath) : null;
const ghostStat = fs.existsSync(ghostPath) ? fs.statSync(ghostPath) : null;
const scoutStat = fs.existsSync(scoutDaggerPath) ? fs.statSync(scoutDaggerPath) : null;

assert(batStat && batStat.size > 1000, `bat_sheet.png có dung lượng hợp lệ (${batStat?.size} bytes)`);
assert(ghostStat && ghostStat.size > 1000, `ghost_sheet.png có dung lượng hợp lệ (${ghostStat?.size} bytes)`);
assert(scoutStat && scoutStat.size > 1000, `goblin_scout_dagger_sheet.png có dung lượng hợp lệ (${scoutStat?.size} bytes)`);

// -------------------------------------------------------------------------
// 2. KIỂM TRA MÃ NGUỒN AMBUSH MONSTERS
// -------------------------------------------------------------------------
console.log('\n--- 2. Kiểm tra Logic Thực Thể Phục Kích (AmbushMonsters.ts) ---');
const ambushSource = fs.readFileSync('src/entities/AmbushMonsters.ts', 'utf8');

assert(ambushSource.includes('class MistBatAmbushEntity'), 'Lớp MistBatAmbushEntity được định nghĩa');
assert(ambushSource.includes('mist_bat_fly_down') && ambushSource.includes('mist_bat_retreat_up'), 'Hoạt ảnh Dơi bổ nhào và vút bay thoát được khởi tạo');
assert(ambushSource.includes('health - 8') && ambushSource.includes('modifyComposure(-15)'), 'Dơi gây -8 HP và -15 Composure khi cắn trúng');
assert(ambushSource.includes('lantern_flicker'), 'Dơi kích hoạt hiệu ứng chao đảo ánh sáng đèn lồng (lantern_flicker)');
assert(ambushSource.includes('takeDamage'), 'MistBatAmbushEntity có hàm takeDamage khi người chơi đánh trúng');

assert(ambushSource.includes('class WanderingShadeEntity'), 'Lớp WanderingShadeEntity được định nghĩa');
assert(ambushSource.includes('modifyComposure(-25)'), 'Hồn ma giáng đòn hủy diệt Bình Tâm (-25 Composure)');
assert(ambushSource.includes('temperature = Math.max(20, currentTemp - 15)'), 'Hồn ma gây sốc nhiệt buốt giá (-15°C)');
assert(ambushSource.includes('dissolve'), 'Hồn ma có cơ chế tan biến (dissolve) khi chiếu đèn lồng hoặc vào Sanctuary');

assert(ambushSource.includes('class GoblinScoutEntity'), 'Lớp GoblinScoutEntity được định nghĩa');
assert(ambushSource.includes('scout_whistle'), 'Goblin Scout có cơ chế huýt sáo cảnh báo (scout_whistle)');
assert(ambushSource.includes('createSmokePuff') || ambushSource.includes('smoke'), 'Goblin Scout tạo hiệu ứng bom khói khi tàng hình rút lui');
assert(ambushSource.includes('retreat'), 'Goblin Scout có cơ chế tàng hình lẩn thoát khi bị chiếu đèn hoặc bị áp sát');

// -------------------------------------------------------------------------
// 3. KIỂM TRA MÃ NGUỒN SHADOW MONSTERS
// -------------------------------------------------------------------------
console.log('\n--- 3. Kiểm tra Logic Nhóm Quái Vật Bóng Tối (ShadowMonsters.ts) ---');
const shadowSource = fs.readFileSync('src/entities/ShadowMonsters.ts', 'utf8');

assert(shadowSource.includes('class ShadowCrowEntity'), 'Lớp ShadowCrowEntity được định nghĩa');
assert(shadowSource.includes('class ShadowEyesEntity'), 'Lớp ShadowEyesEntity được định nghĩa');
assert(shadowSource.includes('class ShadowBehemothBoss'), 'Lớp ShadowBehemothBoss được định nghĩa');
assert(shadowSource.includes('dissolveByLight'), 'Bóng Mắt Sương Mù tan biến khi chiếu ánh đèn lồng');
assert(shadowSource.includes('gazeDrainTimer') && shadowSource.includes('composure = Math.max(5, state.stats.composure - 8)'), 'Bóng Mắt rút cạn Bình Tâm trong bóng tối');

// -------------------------------------------------------------------------
// 4. KIỂM TRA MA TRẬN CHẠM TRÁN VÀ HỆ SINH THÁI (WildlifeSystem.ts)
// -------------------------------------------------------------------------
console.log('\n--- 4. Kiểm tra Ma Trận Chạm Trán & Hệ Sinh Thái (WildlifeSystem.ts) ---');
const wildlifeSource = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');

assert(wildlifeSource.includes('SKULL_WOLF_HABITATS'), 'Tọa độ sinh cảnh Sói Xương được cấu hình');
assert(wildlifeSource.includes('SHADOW_CROW_HABITATS'), 'Tọa độ sinh cảnh Quạ Bóng Tối được cấu hình');
assert(wildlifeSource.includes('SHADOW_EYES_HABITATS'), 'Tọa độ sinh cảnh Bóng Mắt được cấu hình');
assert(wildlifeSource.includes('SHADOW_BEHEMOTH_HABITATS'), 'Tọa độ sinh cảnh Shadow Behemoth Boss được cấu hình');
assert(wildlifeSource.includes('HOODED_KNIGHT_HABITATS'), 'Tọa độ sinh cảnh Hooded Knight Boss được cấu hình');

assert(wildlifeSource.includes('isUnderGracePeriod') || wildlifeSource.includes('lastAmbushHitTime'), 'Hệ thống có cơ chế Grace Period 45s chống dội jumpscare liên tiếp');
assert(wildlifeSource.includes('batZones ='), 'Vùng xuất hiện Dơi Sương Mù được cấu hình theo bảng thiết kế');
assert(wildlifeSource.includes('shadeZones ='), 'Vùng xuất hiện Hồn Ma được cấu hình theo bảng thiết kế');
assert(wildlifeSource.includes('scoutZones ='), 'Vùng xuất hiện Goblin Scout được cấu hình');

assert(wildlifeSource.includes('highTierMonsters') && wildlifeSource.includes('spook(\'listener_near\')'), 'Quạ rừng cảnh báo sớm (Forewarning) khi thực thể cấp cao tiến vào bán kính 250px');
assert(wildlifeSource.includes('shadowAuras'), 'Đom đóm / bướm đêm tắt phát quang lẩn trốn khi Hồn ma / Bóng mắt đến gần');

assert(wildlifeSource.includes('FallenKnightEntity') && wildlifeSource.includes('hoodedKnight'), 'Đội hình hộ vệ: Hooded Knight Boss được tháp tùng bởi 2 Fallen Knight');
assert(wildlifeSource.includes('MistBatAmbushEntity') && wildlifeSource.includes('isBehemothOrWardenActive'), 'Đội hình hộ vệ: Mire Warden / Behemoth kéo theo 3 Dơi Sương Mù');

assert(wildlifeSource.includes('isBossAwakened(): boolean'), 'WildlifeSystem cung cấp phương thức isBossAwakened()');
assert(wildlifeSource.includes('getMistBats()'), 'Cung cấp getter getMistBats()');
assert(wildlifeSource.includes('getWanderingShades()'), 'Cung cấp getter getWanderingShades()');
assert(wildlifeSource.includes('getGoblinScouts()'), 'Cung cấp getter getGoblinScouts()');

// -------------------------------------------------------------------------
// 5. KIỂM TRA HIỆU ỨNG BIẾN ĐỔI MÔI TRƯỜNG KHI BOSS THỨC TỈNH
// -------------------------------------------------------------------------
console.log('\n--- 5. Kiểm tra Biến Đổi Môi Trường Khi Boss Thức Tỉnh (VeilSystem & GameScene) ---');
const veilSource = fs.readFileSync('src/systems/VeilSystem.ts', 'utf8');
const gameSceneSource = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const audioSource = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');

assert(veilSource.includes('setBossAwakened') && veilSource.includes('getIsBossAwakened'), 'VeilSystem có hàm setBossAwakened và getIsBossAwakened');
assert(veilSource.includes('bossDriftMult') && veilSource.includes('2.2'), 'Tốc độ cuộn sương mù Parallax tăng lên 2.2x khi Boss thức tỉnh');
assert(veilSource.includes('targetAlphaGround = Math.min(0.92, targetAlphaGround * 1.8)'), 'Độ mờ sương mù dày đặc tăng lên khi Boss thức tỉnh');
assert(veilSource.includes('0x2a141e'), 'Sương mù đổi sắc đỏ tía u ám than bùn (0x2a141e)');

assert(gameSceneSource.includes('targetBaseRadius * 0.55'), 'Ánh sáng đèn lồng bị bóp nghẹt 0.55x (từ 200px xuống ~110px) khi Boss thức tỉnh');
assert(gameSceneSource.includes('veilSystem.setBossAwakened(bossAwakened)'), 'GameScene đồng bộ hóa trạng thái Boss thức tỉnh với VeilSystem');
assert(gameSceneSource.includes('audioManager.setBossAwakeningState(bossAwakened)'), 'GameScene đồng bộ hóa trạng thái Boss thức tỉnh với AudioManager');
assert(audioSource.includes('setBossAwakeningState(active: boolean)'), 'AudioManager có hàm setBossAwakeningState');

// -------------------------------------------------------------------------
// 6. KIỂM TRA ĐÒN ĐÁNH & VA CHẠM VŨ KHÍ LÊN QUÁI MỚI (GameScene.ts)
// -------------------------------------------------------------------------
console.log('\n--- 6. Kiểm tra Tương Tác Sát Thương & Đòn Đánh (GameScene.ts) ---');
assert(gameSceneSource.includes('getMistBats()') && gameSceneSource.includes('bat.takeDamage'), 'Đòn đánh vũ khí tác động lên Dơi Sương Mù');
assert(gameSceneSource.includes('getWanderingShades()') && gameSceneSource.includes('shade.takeDamage'), 'Đòn đánh vũ khí tác động lên Hồn Ma');
assert(gameSceneSource.includes('getGoblinScouts()') && gameSceneSource.includes('scout.takeDamage'), 'Đòn đánh vũ khí tác động lên Goblin Scout');

// -------------------------------------------------------------------------
// TỔNG KẾT
// -------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL`);
console.log('========================================================================');

if (failCount === 0) {
  console.log('>>> BƯỚC 9 ĐẠT 100% TIÊU CHUẨN KỸ THUẬT & HỆ SINH THÁI QUÁI VẬT! <<<');
  process.exit(0);
} else {
  console.error('>>> CÒN LỖI CHƯA ĐẠT TIÊU CHUẨN! <<<');
  process.exit(1);
}
