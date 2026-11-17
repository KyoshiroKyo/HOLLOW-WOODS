import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ BƯỚC V14-P8-03');
console.log('   (Hitbox 4 Hướng, Đuốc Nhựa Thông Cắm Đất & Lắng Nghe Nghi Ngờ 2s)');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
  }
}

// ----------------------------------------------------------------------
// 1. KIỂM THỬ THÔNG SỐ VŨ KHÍ TỰ VỆ & KHÔNG CÓ ĐỘ BỀN (EQUIPMENT SYSTEM)
// ----------------------------------------------------------------------
console.log('--- 1. Thông Số Hitbox, Knockback & Độ Bền 3 Vũ Khí ---');

const equipSysContent = fs.readFileSync('src/systems/EquipmentSystem.ts', 'utf-8');

test('Walking Staff (Gậy Gỗ) cấu hình chuẩn: reach 42, knockback 20, stagger 500ms, damage 10, cooldown 600ms, noiseRadius 120', () => {
  assert(equipSysContent.includes('wpn_walking_staff: {'), 'wpn_walking_staff phải tồn tại');
  assert(equipSysContent.includes('reach: 42'), 'reach phải là 42');
  assert(equipSysContent.includes('knockback: 20') || equipSysContent.includes('knockbackDistance: 20'), 'knockback phải là 20');
  assert(equipSysContent.includes('damage: 10'), 'damage phải là 10');
  assert(equipSysContent.includes('staggerDuration: 500'), 'staggerDuration phải là 500');
  assert(equipSysContent.includes('attackCooldown: 600'), 'attackCooldown phải là 600');
  assert(equipSysContent.includes('noiseRadius: 120'), 'noiseRadius phải là 120');
});

test('Iron-Tipped Spear (Giáo Gỗ Bịt Sắt) cấu hình chuẩn: reach 72, knockback 45, stagger 850ms, damage 25, cooldown 900ms, noiseRadius 120', () => {
  assert(equipSysContent.includes('wpn_iron_spear: {'), 'wpn_iron_spear phải tồn tại');
  assert(equipSysContent.includes('reach: 72'), 'reach phải là 72');
  assert(equipSysContent.includes('knockback: 45') || equipSysContent.includes('knockbackDistance: 45'), 'knockback phải là 45');
  assert(equipSysContent.includes('damage: 25'), 'damage phải là 25');
  assert(equipSysContent.includes('staggerDuration: 850'), 'staggerDuration phải là 850');
  assert(equipSysContent.includes('attackCooldown: 900'), 'attackCooldown phải là 900');
  assert(equipSysContent.includes('noiseRadius: 120'), 'noiseRadius phải là 120');
});

test('Hunting Hatchet (Rìu Đi Rừng) cấu hình chuẩn: reach 36, knockback 25, stagger 600ms, damage 18, cooldown 550ms, noiseRadius 120, woodcuttingMultiplier 2.0', () => {
  assert(equipSysContent.includes('wpn_hunting_hatchet: {'), 'wpn_hunting_hatchet phải tồn tại');
  assert(equipSysContent.includes('reach: 36'), 'reach phải là 36');
  assert(equipSysContent.includes('knockback: 25') || equipSysContent.includes('knockbackDistance: 25'), 'knockback phải là 25');
  assert(equipSysContent.includes('damage: 18'), 'damage phải là 18');
  assert(equipSysContent.includes('staggerDuration: 600'), 'staggerDuration phải là 600');
  assert(equipSysContent.includes('attackCooldown: 550'), 'attackCooldown phải là 550');
  assert(equipSysContent.includes('woodcuttingMultiplier: 2.0'), 'woodcuttingMultiplier phải là 2.0');
  assert(equipSysContent.includes('noiseRadius: 120'), 'noiseRadius phải là 120');
});

test('Toàn bộ vũ khí sinh tồn tuyệt đối KHÔNG có cơ chế độ bền (durability === false)', () => {
  assert(equipSysContent.includes('hasDurability(): boolean'), 'hasDurability method phải tồn tại');
  assert(equipSysContent.includes('return false;'), 'hasDurability phải luôn trả về false');
});

// ----------------------------------------------------------------------
// 2. KIỂM THỬ TÍNH TOÁN HITBOX 4 HƯỚNG VÀ PHẢN ỨNG TRÚNG ĐÒN (SATYRPLAYER & GAMESCENE)
// ----------------------------------------------------------------------
console.log('\n--- 2. Hitbox 4 Hướng, Chớp Đỏ Hurt Flash & Knockback ---');

const satyrContent = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf-8');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

test('SatyrPlayer tính toán hitbox 4 hướng (Đông, Tây, Nam, Bắc) theo reach của vũ khí', () => {
  assert(satyrContent.includes("case 'left': hitX -= reach; break;"), 'Hướng trái (Tây) hitX -= reach');
  assert(satyrContent.includes("case 'right': hitX += reach; break;"), 'Hướng phải (Đông) hitX += reach');
  assert(satyrContent.includes("case 'up': hitY -= reach; break;"), 'Hướng lên (Bắc) hitY -= reach');
  assert(satyrContent.includes("case 'down': hitY += reach; break;"), 'Hướng xuống (Nam) hitY += reach');
  assert(satyrContent.includes('weaponDef.attackCooldown'), 'Phải kiểm tra hồi chiêu vũ khí attackCooldown');
});

test('Đòn đánh trúng kẻ địch kích hoạt hiệu ứng chớp đỏ (hurt flash: setTint(0xff3333) trong 160ms)', () => {
  assert(gameSceneContent.includes('setTint(0xff3333)'), 'Kẻ địch phải được phủ tint 0xff3333 khi trúng đòn');
  assert(gameSceneContent.includes('160'), 'Thời gian chớp đỏ phải là 160ms');
  assert(gameSceneContent.includes('clearTint()'), 'Phải xóa tint sau 160ms');
});

test('Đòn đánh trúng kẻ địch áp dụng đẩy lùi (Knockback) và làm choáng (Stagger) theo hướng đánh', () => {
  assert(gameSceneContent.includes('knockbackDist'), 'Phải tính toán khoảng cách knockback');
  assert(gameSceneContent.includes('triggerAttackCooldown'), 'Phải kích hoạt làm choáng quái vật theo staggerDuration');
  assert(gameSceneContent.includes('noiseRad'), 'Phải phát sóng âm cảnh báo');
});

// ----------------------------------------------------------------------
// 3. KIỂM THỬ CƠ CHẾ CẮM ĐUỐC NHỰA THÔNG XUỐNG ĐẤT (RESIN FLARE)
// ----------------------------------------------------------------------
console.log('\n--- 3. Cơ Chế Cắm Đuốc Nhựa Thông Xuống Đất (15 Giây) ---');

test('GameScene cung cấp phương thức plantResinFlare cắm đuốc tại chân nhân vật', () => {
  assert(gameSceneContent.includes('plantResinFlare('), 'Phải có method plantResinFlare');
  assert(gameSceneContent.includes("removeItem('item_resin_flare', 1)"), 'Phải tiêu hao 1 item_resin_flare');
  assert(gameSceneContent.includes('duration: 15000'), 'Thời gian tồn tại của đuốc phải đúng 15 giây (15000ms)');
  assert(gameSceneContent.includes('radius: 200'), 'Bán kính bảo vệ của đuốc phải là 200px');
});

test('Đuốc Nhựa Thông tích cực xua tan sương mù trong bán kính chiếu sáng', () => {
  assert(gameSceneContent.includes('plantedFlares.length > 0'), 'Dirty check và erase fog phải quét qua plantedFlares');
  assert(gameSceneContent.includes('this.fogOfWarLayer.erase'), 'Phải xóa sương mù quanh tọa độ đuốc');
});

test('Đuốc Nhựa Thông tích cực xua đuổi The Echo và ngăn The Listener tiếp cận (repelByFlare)', () => {
  assert(gameSceneContent.includes('repelByFlare'), 'Phải gọi repelByFlare trên The Listener');
  assert(gameSceneContent.includes('echo.dissolve()'), 'Phải xua tan The Echo khi lại gần quầng sáng đuốc');
});

// ----------------------------------------------------------------------
// 4. KIỂM THỬ NHỊP LẮNG NGHE NGHI NGỜ 2 GIÂY CỦA THE LISTENER
// ----------------------------------------------------------------------
console.log('\n--- 4. Trí Tuệ Nhân Tạo The Listener (2s Nghi Ngờ Nghe Ngóng) ---');

const listenerAIContent = fs.readFileSync('src/systems/ListenerAI.ts', 'utf-8');
const listenerEntityContent = fs.readFileSync('src/entities/TheListener.ts', 'utf-8');

test('The Listener dừng lại đúng 2.0 giây (alertTimer = 2000) khi nghe tiếng động lạ', () => {
  assert(listenerAIContent.includes('alertTimer = 2000'), 'Phải thiết lập alertTimer = 2000 khi nghe âm thanh');
  assert(listenerAIContent.includes('this.alertTimer -= delta'), 'Phải đếm ngược alertTimer trong updateAlert');
  assert(listenerAIContent.includes('this.listener.setVelocity(0, 0)'), 'Phải đứng yên dừng lại khi đang nghe ngóng');
});

test('The Listener xoay đầu về hướng phát ra tiếng động trong thời gian nghi ngờ nghe ngóng', () => {
  assert(listenerAIContent.includes('this.listener.setFlipX(this.targetInvestigateX > this.listener.x)'), 'Phải xoay đầu về hướng targetInvestigateX');
});

test('The Listener và ListenerAI triển khai phương thức repelByFlare', () => {
  assert(listenerAIContent.includes('repelByFlare('), 'ListenerAI phải có repelByFlare');
  assert(listenerEntityContent.includes('repelByFlare('), 'TheListener phải có repelByFlare');
});

// ----------------------------------------------------------------------
// 5. KIỂM THỬ THE ECHO & ECHO APPARITION TƯƠNG TÁC ÁNH NHÌN & TÀN TRO PHÁT SÁNG
// ----------------------------------------------------------------------
console.log('\n--- 5. The Echo & EchoApparition (Ánh Nhìn -5 Composure & Tàn Tro) ---');

const theEchoContent = fs.readFileSync('src/entities/TheEcho.ts', 'utf-8');
const echoSysContent = fs.readFileSync('src/systems/EchoSystem.ts', 'utf-8');
const echoApparitionExists = fs.existsSync('src/entities/EchoApparition.ts');

test('File src/entities/EchoApparition.ts tồn tại và kế thừa TheEcho', () => {
  assert(echoApparitionExists, 'File EchoApparition.ts phải tồn tại');
  const echoAppContent = fs.readFileSync('src/entities/EchoApparition.ts', 'utf-8');
  assert(echoAppContent.includes('class EchoApparition extends TheEcho'), 'EchoApparition phải kế thừa TheEcho');
});

test('The Echo kiểm tra ánh nhìn trực diện (Direct Gaze): chỉ trừ -5 Composure khi Đèn Lồng đang TẮT', () => {
  assert(theEchoContent.includes('checkDirectGaze('), 'TheEcho phải có method checkDirectGaze');
  assert(theEchoContent.includes('if (isLanternLit) return false;'), 'Nếu đèn lồng BẬT thì không bị trừ tĩnh tâm');
  assert(theEchoContent.includes('modifyComposure(-5)'), 'Nhìn trực diện trong bóng tối phải giảm nhẹ 5 điểm Tĩnh Tâm (-5 Composure)');
});

test('The Echo tan biến thành tàn tro phát sáng kèm thì thầm ký ức (lore) khi người chơi lại gần', () => {
  assert(theEchoContent.includes('dissolve('), 'TheEcho phải có dissolve');
  assert(theEchoContent.includes('0xaed6f1') || theEchoContent.includes('glowing ash') || theEchoContent.includes('p.fillCircle'), 'Phải sinh hạt tàn tro phát sáng');
  assert(echoSysContent.includes('dissolveEcho('), 'EchoSystem phải kích hoạt dissolve khi lại gần 48px');
});

// ----------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ
// ----------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ V14-P8-03: ${passedTests}/${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('   >>> TẤT CẢ CÁC MỤC NGHIỆM THU ĐẠT CHUẨN 100%! <<<');
} else {
  console.log('   >>> CÓ MỤC KIỂM THỬ KHÔNG ĐẠT, CẦN KIỂM TRA LẠI! <<<');
}
console.log('======================================================================\n');

process.exit(passedTests === totalTests ? 0 : 1);
