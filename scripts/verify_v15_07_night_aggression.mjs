/**
 * KIỂM THỬ TỰ ĐỘNG BƯỚC V15-07: HỆ SỐ HUNG HÃN BAN ĐÊM (NIGHT AGGRESSION MULTIPLIER)
 * Kiểm tra kết nối DayNightSystem với ListenerAI và SkullWolfEntity, cùng tín hiệu cảnh báo đêm xuống
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- KIỂM TRA BƯỚC V15-07: HỆ SỐ HUNG HÃN BAN ĐÊM (NIGHT AGGRESSION) ---');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
    failCount++;
  }
}

const dayNightCode = fs.readFileSync('src/systems/DayNightSystem.ts', 'utf-8');
const listenerAiCode = fs.readFileSync('src/systems/ListenerAI.ts', 'utf-8');
const theListenerCode = fs.readFileSync('src/entities/TheListener.ts', 'utf-8');
const skullWolfCode = fs.readFileSync('src/entities/SkullWolfEntity.ts', 'utf-8');
const wildlifeCode = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf-8');
const audioCode = fs.readFileSync('src/audio/AudioManager.ts', 'utf-8');
const gameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

console.log('\n[1/6] Kiểm tra DayNightSystem.ts (Cấu hình NightAggressionConfig):');

test('DayNightSystem định nghĩa giao diện NightAggressionConfig', () => {
  assert(dayNightCode.includes('interface NightAggressionConfig'), 'Thiếu NightAggressionConfig interface');
});

test('DayNightSystem có phương thức static getNightAggressionConfig', () => {
  assert(dayNightCode.includes('static getNightAggressionConfig(phase: TimePhase): NightAggressionConfig'), 'Thiếu getNightAggressionConfig');
});

test('BAN NGÀY (DAY): The Listener tuần tra chậm (30 px/s), Sói Xương nghỉ ngơi (wolfActive = false)', () => {
  assert(dayNightCode.includes('listenerPatrolSpeed: 30'), 'Tốc độ tuần tra ban ngày phải là 30 px/s');
  assert(dayNightCode.includes('wolfActive: false'), 'Sói xương phải nghỉ ngơi ban ngày');
  assert(dayNightCode.includes('listenerSuspicionListenTimeMs: 2000'), 'Thời gian nghe ngóng ban ngày là 2.0s');
  assert(dayNightCode.includes('listenerHearingRadius: 140'), 'Bán kính nghe ban ngày là 140 px');
});

test('HOÀNG HÔN (DUSK): Quái vật thức giấc, bán kính nghe tăng 15%', () => {
  assert(dayNightCode.includes('listenerHearingRadius: 161'), 'Bán kính nghe hoàng hôn phải là 161 px (140 * 1.15)');
  assert(dayNightCode.includes('wolfHearingRadiusMultiplier: 1.15'), 'Sói xương có hệ số nghe 1.15');
});

test('ĐÊM SƯƠNG (NIGHT): Săn Đêm Hung Hãn (+30% chase, +40% hearing, 0.75s listen, +25% wolf lunge, breach light)', () => {
  assert(dayNightCode.includes('listenerChaseSpeed: 136.5'), 'Tốc độ truy đuổi ban đêm phải là 136.5 px/s (105 * 1.30)');
  assert(dayNightCode.includes('listenerHearingRadius: 196'), 'Bán kính phát hiện bước chân ban đêm phải là 196 px (140 * 1.40)');
  assert(dayNightCode.includes('listenerSuspicionListenTimeMs: 750'), 'Thời gian nghi ngờ ban đêm phải giảm còn 750ms (0.75s)');
  assert(dayNightCode.includes('listenerLostSightTimeMs: 3500'), 'Bám theo vết tích 3.5s trước khi mất dấu');
  assert(dayNightCode.includes('listenerSearchDurationMs: 6500'), 'Tìm kiếm 6.5s trước khi từ bỏ');
  assert(dayNightCode.includes('wolfLungeSpeed: 243.75'), 'Tốc độ vồ của Sói Xương ban đêm phải là 243.75 px/s (195 * 1.25)');
  assert(dayNightCode.includes('wolfLightPerimeterOffset: 15'), 'Khoảng cách ép sát rìa quầng sáng là 15 px');
  assert(dayNightCode.includes('wolfFlankingEnabled: true'), 'Kích hoạt bọc sườn theo cặp ban đêm');
  assert(dayNightCode.includes('wolfBreachLowComposure: true'), 'Bình Tâm < 25%: Sói Xương dám lao chồm qua ánh sáng');
});

console.log('\n[2/6] Kiểm tra ListenerAI.ts (Áp dụng hệ số vào AI Kẻ Lắng Nghe):');

test('ListenerAI có thuộc tính currentPhase và aggressionConfig', () => {
  assert(listenerAiCode.includes('private currentPhase: TimePhase'), 'Thiếu currentPhase');
  assert(listenerAiCode.includes('private aggressionConfig: NightAggressionConfig'), 'Thiếu aggressionConfig');
});

test('ListenerAI có phương thức setTimePhase và getAggressionConfig', () => {
  assert(listenerAiCode.includes('public setTimePhase(phase: TimePhase): void'), 'Thiếu setTimePhase');
  assert(listenerAiCode.includes('public getAggressionConfig(): NightAggressionConfig'), 'Thiếu getAggressionConfig');
});

test('ListenerAI áp dụng listenerPatrolSpeed và listenerChaseSpeed', () => {
  assert(listenerAiCode.includes('this.aggressionConfig.listenerPatrolSpeed'), 'Chưa dùng listenerPatrolSpeed');
  assert(listenerAiCode.includes('this.aggressionConfig.listenerChaseSpeed'), 'Chưa dùng listenerChaseSpeed');
});

test('ListenerAI áp dụng listenerSuspicionListenTimeMs (0.75s khi đêm)', () => {
  assert(listenerAiCode.includes('this.aggressionConfig.listenerSuspicionListenTimeMs'), 'Chưa dùng listenerSuspicionListenTimeMs');
});

test('ListenerAI áp dụng listenerLostSightTimeMs và listenerSearchDurationMs', () => {
  assert(listenerAiCode.includes('this.aggressionConfig.listenerLostSightTimeMs'), 'Chưa dùng listenerLostSightTimeMs');
  assert(listenerAiCode.includes('this.aggressionConfig.listenerSearchDurationMs'), 'Chưa dùng listenerSearchDurationMs');
});

console.log('\n[3/6] Kiểm tra TheListener.ts (Mắt rực đỏ & Đồng bộ âm thanh):');

test('TheListener có phương thức setTimePhase đồng bộ hearingRadius và eyesGfx', () => {
  assert(theListenerCode.includes('public setTimePhase(phase: TimePhase): void'), 'Thiếu setTimePhase trên TheListener');
  assert(theListenerCode.includes('this.ai.getAggressionConfig().listenerHearingRadius'), 'Chưa đồng bộ hearingRadius');
});

test('TheListener có phương thức onNightfall tạo hiệu ứng lóe sáng mắt đỏ', () => {
  assert(theListenerCode.includes('public onNightfall(): void'), 'Thiếu onNightfall');
  assert(theListenerCode.includes('drawGlowingEyes'), 'Thiếu vẽ mắt đỏ drawGlowingEyes');
});

console.log('\n[4/6] Kiểm tra SkullWolfEntity.ts (Sói Xương: Rút hang, Bọc sườn, Ép rìa đèn & Lao qua mép sáng):');

test('SkullWolfState bổ sung trạng thái den_rest khi Ban Ngày', () => {
  assert(skullWolfCode.includes("'den_rest'"), 'Thiếu state den_rest');
  assert(skullWolfCode.includes('handleDenRest'), 'Thiếu hàm handleDenRest');
});

test('SkullWolfContext bổ sung playerComposure và packFlankOffset', () => {
  assert(skullWolfCode.includes('playerComposure?: number'), 'Thiếu playerComposure trong SkullWolfContext');
  assert(skullWolfCode.includes('packFlankOffset?: number'), 'Thiếu packFlankOffset trong SkullWolfContext');
});

test('SkullWolfEntity có hốc mắt đầu lâu rực xanh lân tinh (phosphorus cyan)', () => {
  assert(skullWolfCode.includes('drawPhosphorusEyes'), 'Thiếu hàm drawPhosphorusEyes');
  assert(skullWolfCode.includes('0x00ffcc'), 'Màu lân tinh 0x00ffcc');
});

test('Sói Xương ép sát rìa đèn 15px vào ban đêm và tăng 25% tốc độ vồ', () => {
  assert(skullWolfCode.includes('targetDist = ctx.lightRadius + (ctx.timePhase === \'NIGHT\' ? 15 : 50)'), 'Chưa ép sát rìa đèn 15px');
  assert(skullWolfCode.includes('baseLungeSpeed * 1.25'), 'Chưa tăng 25% tốc độ vồ ban đêm');
});

test('Sói Xương dám lao chồm qua mép sáng khi Bình Tâm < 25%', () => {
  assert(skullWolfCode.includes('isPlayerLowComposure = ctx.playerComposure !== undefined && ctx.playerComposure < 25'), 'Thiếu kiểm tra Bình Tâm < 25%');
  assert(skullWolfCode.includes('canBreachLight = isNight && isPlayerLowComposure'), 'Thiếu điều kiện canBreachLight');
  assert(skullWolfCode.includes('isInLightPerimeter && !canBreachLight'), 'canBreachLight phải bỏ qua fear_light');
});

test('Sói Xương phối hợp bọc sườn (Flanking) khi săn đêm', () => {
  assert(skullWolfCode.includes('flankAngle = (isNight && ctx.packFlankOffset !== undefined) ? ctx.packFlankOffset : 0'), 'Thiếu tính flankAngle');
});

console.log('\n[5/6] Kiểm tra WildlifeSystem.ts (Truyền thông số bọc sườn theo cặp):');

test('WildlifeSystem truyền packFlankOffset (-0.61 / +0.61 rad) và playerComposure', () => {
  assert(wildlifeCode.includes('const packFlankOffset = w === 0 ? -0.61 : 0.61;'), 'Thiếu tính packFlankOffset cho cặp sói');
  assert(wildlifeCode.includes('const playerComposure = PlayerState.getInstance().stats.composure;'), 'Thiếu lấy playerComposure');
});

console.log('\n[6/6] Kiểm tra AudioManager.ts & GameScene.ts (Cảnh báo chuông nứt & sói hú xa xăm):');

test('AudioManager có playCrackedBellToll (chuông nứt âm trầm)', () => {
  assert(audioCode.includes('public playCrackedBellToll(): void'), 'Thiếu playCrackedBellToll');
});

test('AudioManager có playDistantWolfHowl (tiếng sói hú xa xăm trong sương)', () => {
  assert(audioCode.includes('public playDistantWolfHowl(): void'), 'Thiếu playDistantWolfHowl');
});

test('AudioManager có playNightfallWarningSound kết hợp chuông nứt và sói hú', () => {
  assert(audioCode.includes('public playNightfallWarningSound(): void'), 'Thiếu playNightfallWarningSound');
});

test('GameScene lắng nghe phase_changed và kích hoạt cảnh báo đêm xuống công bằng', () => {
  assert(gameSceneCode.includes("this.timeSystem.on('phase_changed'"), 'GameScene chưa lắng nghe phase_changed');
  assert(gameSceneCode.includes('this.audioManager.playNightfallWarningSound()'), 'Chưa gọi playNightfallWarningSound');
  assert(gameSceneCode.includes('this.listenerMonster.onNightfall()'), 'Chưa gọi onNightfall');
});

console.log('\n========================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL`);
console.log('========================================');

if (failCount > 0) {
  process.exit(1);
}
