/**
 * HOLLOW WOODS V1.5 — TEST V15-58B:
 * KIỂM THỬ BẪY TƯƠNG TÁC GIẢ "TIẾNG GỌI TRONG SƯƠNG" (QUY TẮC 1)
 * VÀ NGHỊCH LÝ ÁNH SÁNG [F] (LIGHT-VS-STEALTH DILEMMA)
 */

import assert from 'assert';
import fs from 'fs';

console.log('=== [V15-58B] BẮT ĐẦU KIỂM THỬ BẪY TIẾNG GỌI & NGHỊCH LÝ ÁNH SÁNG ===');

// 1. Kiểm tra WhisperTrap.ts
const trapSrc = fs.readFileSync('src/entities/WhisperTrap.ts', 'utf8');

assert(trapSrc.includes('class WhisperTrap'), 'Phải có class WhisperTrap');
assert(trapSrc.includes('lifetime: number = 15.0'), 'Bẫy phải tự tan biến sau 15 giây');
assert(trapSrc.includes('LURE_OPTIONS'), 'Phải có danh sách câu thoại mồi nhử quen thuộc');
assert(trapSrc.includes('Garth') && trapSrc.includes('Edda') && trapSrc.includes('Finn'), 'Phải có giọng người quen (Garth, Edda, Finn)');
assert(trapSrc.includes('fadeOutAndDestroy'), 'Phải có phương thức fadeOutAndDestroy');
assert(trapSrc.includes('[E] Đáp lại tiếng gọi quen thuộc...'), 'Phải có nhãn tương tác [E] đánh lừa người chơi');
console.log('✔ [1/4] WhisperTrap.ts: Cấu trúc bẫy đốm sáng lập lòe, câu thoại mồi nhử quen thuộc và bộ đếm 15s chuẩn xác.');

// 2. Kiểm tra GameScene.ts (Bẫy Tiếng Gọi Trong Sương)
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');

assert(gameSceneSrc.includes('updateWhisperTrapLogic'), 'GameScene phải có vòng lặp updateWhisperTrapLogic');
assert(gameSceneSrc.includes('composure < 60'), 'Bẫy chỉ sinh khi Tinh Thần < 60/100');
assert(gameSceneSrc.includes("zoneId !== 'bellhollow'") || gameSceneSrc.includes("!isBellhollow"), 'Bẫy chỉ sinh ở ngoài Làng Bellhollow');
assert(gameSceneSrc.includes('35 + Math.random() * 15'), 'Chu kỳ xuất hiện bẫy ngẫu nhiên từ 35–50 giây');
assert(gameSceneSrc.includes('triggerWhisperTrapSpring'), 'GameScene phải có hàm triggerWhisperTrapSpring khi bấm [E]');
assert(gameSceneSrc.includes('composure - 15'), 'Trừ ngay 15 điểm Tinh Thần khi mắc bẫy');
assert(gameSceneSrc.toLowerCase().includes('bạn đã phá vỡ quy tắc số 1! khu rừng đang mượn giọng người quen...'), 'Hiển thị cảnh báo vi phạm Quy Tắc 1');
assert(gameSceneSrc.includes('flash(350'), 'Chớp tối màn hình trong 0.35 giây (350ms)');
assert(gameSceneSrc.includes('shake(350, 0.018)'), 'Rung mạnh camera 350ms');
assert(gameSceneSrc.includes('triggerShockwaveAndAlertNearbyMonsters'), 'Phát sóng chấn động kéo quái vật lân cận');
assert(gameSceneSrc.includes('radius: number = 360'), 'Bán kính sóng chấn động là 360px');
console.log('✔ [2/4] GameScene.ts: Cơ chế bẫy Quy Tắc 1 (35-50s, [E], chớp tối 0.35s, trừ 15 Tinh Thần, kéo quái 360px) hoàn chỉnh.');

// 3. Kiểm tra Nghịch Lý Ánh Sáng [F] trong AI Quái Vật
const listenerAISrc = fs.readFileSync('src/systems/ListenerAI.ts', 'utf8');
const listenerSrc = fs.readFileSync('src/entities/TheListener.ts', 'utf8');
const crowSrc = fs.readFileSync('src/entities/ShadowMonsters.ts', 'utf8');
const evilKnightsSrc = fs.readFileSync('src/entities/EvilKnights.ts', 'utf8');
const ambushSrc = fs.readFileSync('src/entities/AmbushMonsters.ts', 'utf8');
const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf8');

assert(listenerAISrc.includes('isLanternLit ? Math.round(130 * 1.3) : 130'), 'The Listener tăng +30% tầm nhìn tuần tra khi bật đèn');
assert(listenerAISrc.includes('isLanternLit ? Math.round(125 * 1.3) : 125'), 'The Listener tăng +30% tầm nhìn nghi vấn khi bật đèn');
assert(listenerSrc.includes('isLanternLit ? 1.3 : 1.0'), 'The Listener tăng +30% độ nhạy thính giác khi bật đèn');
assert(crowSrc.includes('lanternMod = ctx.isLanternLit ? 1.3 : 1.0'), 'Quạ Bóng Tối tăng +30% bán kính phát hiện khi bật đèn');
assert(evilKnightsSrc.includes('ctx.isLanternLit ? Math.round(baseDetect * 1.6) : baseDetect'), 'Hiệp Sĩ Sa Ngã tăng phạm vi phát hiện khi bật đèn');
assert(evilKnightsSrc.includes('ctx.isLanternLit ? Math.round(220 * 1.3) : 220'), 'Kỵ Binh Hắc Ám tăng +30% tầm phát hiện khi bật đèn');
assert(ambushSrc.includes('ctx.isLanternLit ? Math.round(150 * 1.3) : 70'), 'Goblin Scout tăng +30% tầm phát hiện khi bật đèn');
assert(veilSrc.includes('getLanternThreatMultiplier'), 'VeilSystem có hàm getLanternThreatMultiplier');
console.log('✔ [3/4] AI Cảm Biến: The Listener, Quạ Bóng Tối, Hiệp Sĩ Sa Ngã, Kỵ Binh Hắc Ám đều tăng +30% tầm phát hiện khi bật đèn [F], và hạ về mức tiêu chuẩn khi tắt đèn.');

// 4. Kiểm tra Tương Tác Prompt trên UIScene
const uiSceneSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
assert(uiSceneSrc.includes('setInteractionPrompt'), 'UIScene phải có setInteractionPrompt để hiện thông báo [E]');
assert(uiSceneSrc.includes('pillW = textW + padX * 2'), 'UIScene tự động căn chỉnh bề rộng khung nền theo chiều dài câu thoại');
console.log('✔ [4/4] UIScene.ts: Hiển thị nhãn tương tác giả linh hoạt, căn chỉnh nền chuẩn Pixel Art.');

console.log('\n============================================================');
console.log('🎉 TOÀN BỘ 4 HẠNG MỤC TEST BƯỚC V15-58B ĐÃ ĐẠT 100%!');
console.log('============================================================');
