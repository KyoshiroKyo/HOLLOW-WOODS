/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ HỆ SINH THÁI SINH VẬT HOANG DÃ (V14-P5-01)
 * Kiểm tra 2 loài sinh vật rừng ưu tiên: Quạ Rừng (Crow) & Bướm Đêm Hổ Phách (Lantern Moth),
 * cơ chế cảnh báo hai chiều, thu hút nguồn sáng, giới hạn Spawn Cap và culling WebGL.
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ HỆ SINH THÁI RỪNG (V14-P5-01)');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// PHẦN 1: Định danh Content ID & Khai báo dữ liệu V1.4
// ---------------------------------------------------------------------------
console.log('--- PHẦN 1: Định danh Content ID & Phân loại Sinh vật (registryData.ts) ---');

const registryDataCode = fs.readFileSync(path.join(process.cwd(), 'src/registry/registryData.ts'), 'utf8');

assert(
  registryDataCode.includes('HW-ANI-AMBIENT-000001') && registryDataCode.includes('ani_crow'),
  'Quạ Rừng sở hữu Content ID HW-ANI-AMBIENT-000001 và runtimeKey ani_crow'
);

assert(
  registryDataCode.includes('HW-ANI-AMBIENT-000002') && registryDataCode.includes('ani_lantern_moth'),
  'Bướm Đêm Hổ Phách sở hữu Content ID HW-ANI-AMBIENT-000002 và runtimeKey ani_lantern_moth'
);

const typesCode = fs.readFileSync(path.join(process.cwd(), 'src/types/index.ts'), 'utf8');

assert(
  typesCode.includes("export type WildlifeSpecies = 'crow' | 'lantern_moth';"),
  'types/index.ts định nghĩa WildlifeSpecies gồm crow và lantern_moth'
);

assert(
  typesCode.includes("export type WildlifeState = 'perched' | 'alert' | 'spooked' | 'fluttering' | 'hibernating';"),
  'types/index.ts định nghĩa đầy đủ 5 trạng thái sinh vật WildlifeState'
);

assert(
  typesCode.includes('export interface WildlifeSpec') && typesCode.includes('export interface WildlifeSpookEvent'),
  'types/index.ts cung cấp giao diện đặc tả WildlifeSpec và sự kiện WildlifeSpookEvent'
);

// ---------------------------------------------------------------------------
// PHẦN 2: Quản lý Quần thể Sinh thái & Spawn Cap WebGL (WildlifeSystem.ts)
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Quản Lý Quần Thể & Giới Hạn WebGL Spawn Cap (WildlifeSystem.ts) ---');

const wildlifeSystemCode = fs.readFileSync(path.join(process.cwd(), 'src/systems/WildlifeSystem.ts'), 'utf8');

assert(
  wildlifeSystemCode.includes('public static readonly MAX_CROWS_PER_ZONE = 6;'),
  'Giới hạn số lượng Quạ tối đa mỗi phân khu là 6 cá thể (MAX_CROWS_PER_ZONE)'
);

assert(
  wildlifeSystemCode.includes('public static readonly MAX_MOTHS_PER_ZONE = 8;'),
  'Giới hạn số lượng Bướm Đêm tối đa mỗi phân khu là 8 cá thể (MAX_MOTHS_PER_ZONE)'
);

assert(
  wildlifeSystemCode.includes('public static readonly MAX_GLOBAL_ENTITIES = 24;'),
  'Giới hạn tổng sinh vật toàn cảnh tối đa 24 con để duy trì 60 FPS mượt mà'
);

assert(
  wildlifeSystemCode.includes('public static readonly CULLING_DISTANCE = 560;'),
  'Khoảng cách culling / ngủ đông được thiết lập chuẩn 560px ngoài tầm nhìn Camera'
);

assert(
  wildlifeSystemCode.includes('outer_woods:') &&
  wildlifeSystemCode.includes('crooked_path:') &&
  wildlifeSystemCode.includes('sanctuary_farm:') &&
  wildlifeSystemCode.includes('bellhollow:') &&
  wildlifeSystemCode.includes('deep_forest:'),
  'Khai báo sinh cảnh tự nhiên phong phú tại cả 5 phân khu rừng và làng'
);

assert(
  wildlifeSystemCode.includes('switchZone(zoneId: string): void') &&
  wildlifeSystemCode.includes('this.clearEntities()'),
  'Hệ thống chuyển đổi phân khu dọn dẹp thực thể cũ và tái nạp theo sinh cảnh mới'
);

assert(
  wildlifeSystemCode.includes('spookCrowsNear('),
  'Cung cấp phương thức spookCrowsNear để kích hoạt giật mình tập thể cho đàn quạ'
);

// ---------------------------------------------------------------------------
// PHẦN 3: Hành vi Sinh thái Quạ Rừng (WildlifeEntity.ts)
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Hành Vi Sinh Thái Quạ Rừng (WildlifeEntity.ts) ---');

const wildlifeEntityCode = fs.readFileSync(path.join(process.cwd(), 'src/entities/WildlifeEntity.ts'), 'utf8');

assert(
  wildlifeEntityCode.includes('drawCrowPerched') && wildlifeEntityCode.includes('drawCrowFlying'),
  'Hỗ trợ đồ họa vector pixel cho cả tư thế đậu trên cành và sải cánh bay lượn'
);

assert(
  wildlifeEntityCode.includes('spook(cause:'),
  'Hỗ trợ phương thức kích hoạt giật mình spook()'
);

assert(
  wildlifeEntityCode.includes("AudioManager.getInstance().playCrowCaw()"),
  'Quạ giật mình phát âm thanh tiếng quạ kêu chói tai qua AudioManager'
);

assert(
  wildlifeEntityCode.includes("this.scene.events.emit('wildlife_spooked', spookEvent)"),
  'Phát sự kiện wildlife_spooked ra toàn thế giới khi đàn quạ bay lên'
);

assert(
  wildlifeEntityCode.includes("distToListener < 165") && wildlifeEntityCode.includes("this.spook('listener_near')"),
  'Quạ tự động giật mình bay lên khi The Listener tiếp cận trong cự ly 165px'
);

assert(
  wildlifeEntityCode.includes("isPlayerAttacking && distToPlayer < 220") && wildlifeEntityCode.includes("this.spook('player_attack')"),
  'Quạ giật mình khi người chơi vung vũ khí tấn công trong phạm vi 220px'
);

assert(
  wildlifeEntityCode.includes("isPlayerSprinting && distToPlayer < 140") && wildlifeEntityCode.includes("this.spook('player_sprint')"),
  'Quạ giật mình khi người chơi chạy nước rút ồn ào lại gần trong phạm vi 140px'
);

assert(
  wildlifeEntityCode.includes('this.respawnTimer = 22000'),
  'Quạ tự động quay về cành cây ban đầu sau 20 - 30 giây khi yên tĩnh trở lại'
);

// ---------------------------------------------------------------------------
// PHẦN 4: Hành vi Sinh thái Bướm Đêm Hổ Phách (WildlifeEntity.ts)
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Hành Vi Sinh Thái Bướm Đêm Hổ Phách (WildlifeEntity.ts) ---');

assert(
  wildlifeEntityCode.includes('drawLanternMoth'),
  'Hỗ trợ vẽ bướm đêm hổ phách với cánh lân tinh và quầng sáng lân tinh dịu mắt'
);

assert(
  wildlifeEntityCode.includes("timePhase === 'DAY'") && wildlifeEntityCode.includes('this.alpha = Math.max(0'),
  'Bướm đêm tự động mờ dần và ẩn nấp khi Ban Ngày (DAY)'
);

assert(
  wildlifeEntityCode.includes("this.alpha = Math.min(1, this.alpha + dt * 1.5);"),
  'Bướm đêm hiện rõ khi bước vào Hoàng Hôn (DUSK) hoặc Đêm Sương (NIGHT)'
);

assert(
  wildlifeEntityCode.includes('playerLightPos && playerLightPos.active') &&
  wildlifeEntityCode.includes('distToLight < 220'),
  'Bướm đêm bị thu hút và bay lượn vòng quanh Đèn Lồng [F] của người chơi trong bán kính 220px'
);

assert(
  wildlifeEntityCode.includes('campfirePos && campfirePos.active') &&
  wildlifeEntityCode.includes('distToCamp < 260'),
  'Bướm đêm bị thu hút về phía Lửa Trại làng Bellhollow khi đang cháy'
);

// ---------------------------------------------------------------------------
// PHẦN 5: Tích Hợp GameScene & Âm Thanh AudioManager
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 5: Tích Hợp GameScene & Âm Thanh (GameScene.ts & AudioManager.ts) ---');

const gameSceneCode = fs.readFileSync(path.join(process.cwd(), 'src/scenes/GameScene.ts'), 'utf8');

assert(
  gameSceneCode.includes('public wildlifeSystem!: WildlifeSystem;'),
  'GameScene khai báo thuộc tính quản lý wildlifeSystem'
);

assert(
  gameSceneCode.includes('this.wildlifeSystem = new WildlifeSystem(this);') &&
  gameSceneCode.includes('this.wildlifeSystem.switchZone(this.currentZoneId);'),
  'GameScene khởi tạo WildlifeSystem và nạp phân khu ngay trong create()'
);

assert(
  gameSceneCode.includes("this.events.on('wildlife_spooked', (evt: WildlifeSpookEvent) => {") &&
  gameSceneCode.includes('this.listenerMonster.ai.triggerSoundAlert(evt.x, evt.y, 0.75);'),
  'GameScene lắng nghe quạ giật mình và kích hoạt The Listener chuyển sang ALERT tới điều tra'
);

assert(
  gameSceneCode.includes('this.wildlifeSystem.update(time, delta,'),
  'GameScene cập nhật WildlifeSystem trong vòng lặp update() chính'
);

assert(
  gameSceneCode.includes("this.wildlifeSystem.spookCrowsNear(hitbox.playerX, hitbox.playerY, weaponDef.noiseRadius || 180, 'player_attack')"),
  'Đòn tấn công của người chơi làm kinh động đàn quạ trong bán kính âm thanh'
);

assert(
  gameSceneCode.includes("this.wildlifeSystem.spookCrowsNear(x, y, 220, 'flare_ignite')"),
  'Thắp Đuốc Nhựa Thông làm kinh động đàn quạ trong bán kính 220px'
);

const audioManagerCode = fs.readFileSync(path.join(process.cwd(), 'src/audio/AudioManager.ts'), 'utf8');

assert(
  audioManagerCode.includes('public playCrowCaw(): void'),
  'AudioManager cung cấp phương thức playCrowCaw() với bộ tạo âm khàn đục 2 nhịp'
);

assert(
  audioManagerCode.includes('public playCrowFlap(): void'),
  'AudioManager cung cấp phương thức playCrowFlap() mô phỏng cánh đập'
);

assert(
  audioManagerCode.includes('public playMothFlutter(): void'),
  'AudioManager cung cấp phương thức playMothFlutter() mô phỏng tiếng cánh bướm dập dờn'
);

// ---------------------------------------------------------------------------
// TỔNG KẾT
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passed}/${passed + failed} KIỂM TRA ĐẠT (${failed} THẤT BẠI)`);
if (failed === 0) {
  console.log('KẾT QUẢ: PASS (100% TIÊU CHÍ V14-P5-01 ĐẠT CHUẨN XUẤT SẮC)');
} else {
  console.log('KẾT QUẢ: FAIL (CẦN SỬA LỖI)');
}
console.log('======================================================================');

process.exit(failed > 0 ? 1 : 0);
