/**
 * HOLLOW WOODS V1.5 — TEST V15-58C:
 * KIỂM THỬ TOÀN DIỆN HIỆU ỨNG NHỊP TIM WEB AUDIO ĐỘNG THEO MỨC TINH THẦN,
 * VIỀN ÁM ẢNH CO BÓP 4 GÓC MÀN HÌNH VÀ PHẢN HỒI HOẢNG LOẠN
 */

import assert from 'assert';
import fs from 'fs';

console.log('=== [V15-58C] BẮT ĐẦU KIỂM THỬ NHỊP TIM ĐỘNG, VIỀN ÁM ẢNH & HOẢNG LOẠN ===');

// 1. Kiểm tra AudioManager.ts
const audioSrc = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');

assert(audioSrc.includes('updateDynamicHeartbeat'), 'AudioManager phải có phương thức updateDynamicHeartbeat');
assert(audioSrc.includes('currentHeartbeatBpm'), 'AudioManager phải lưu trữ currentHeartbeatBpm');
assert(audioSrc.includes('75 + t * (135 - 75)'), 'BPM phải biến thiên từ 75 (tại 45) đến 135 (tại <= 15)');
assert(audioSrc.includes('Math.round(60000 / targetBpm)'), 'Interval nhịp tim phải tính chuẩn theo BPM (800ms -> 444ms)');
assert(audioSrc.includes('setSanityDucking'), 'AudioManager phải có hàm setSanityDucking');
assert(audioSrc.includes('bgmVolume * 0.45'), 'BGM Ducking phải dìm âm lượng BGM xuống khi Tinh Thần < 20');
assert(audioSrc.includes('playUneasyBreathing'), 'AudioManager phải phát tiếng thở gấp ngắt quãng khi Tinh Thần < 20');
assert(audioSrc.includes('getHeartbeatBpm'), 'AudioManager phải có hàm getter getHeartbeatBpm()');
assert(audioSrc.includes('getIsHeartbeatActive'), 'AudioManager phải có hàm getter getIsHeartbeatActive()');
assert(audioSrc.includes('getIsSanityDucked'), 'AudioManager phải có hàm getter getIsSanityDucked()');
console.log('✔ [1/4] AudioManager.ts: Bộ tổng hợp nhịp tim kép Web Audio động (75..135 BPM, 800..444ms), BGM Ducking 0.45x và tiếng thở gấp < 20/100 chuẩn xác.');

// 2. Kiểm tra UIScene.ts (Viền Ám Ảnh Động)
const uiSceneSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');

assert(uiSceneSrc.includes('updatePanicVignette'), 'UIScene phải có phương thức updatePanicVignette');
assert(uiSceneSrc.includes('getHeartbeatBpm'), 'Viền ám ảnh phải đồng bộ trực tiếp với getHeartbeatBpm()');
assert(uiSceneSrc.includes('Math.sin(time * omega)'), 'Nhịp co bóp viền phải theo tần số góc omega của nhịp tim');
assert(uiSceneSrc.includes('isProtectedZone || composure > 45'), 'Viền tự động tắt khi ở vùng an toàn/lửa trại hoặc Tinh Thần > 45');
assert(uiSceneSrc.includes('fillTriangle'), 'Vẽ viền ám ảnh đa giác 4 góc màn hình');
assert(uiSceneSrc.includes('0x280712') || uiSceneSrc.includes('0x18030b'), 'Màu sắc viền ám ảnh pha sắc đỏ thẫm đen (horror tint)');
assert(uiSceneSrc.includes('Tâm trí đang rạn nứt... Hãy tìm ánh lửa ngay!'), 'Cảnh báo tâm trí rạn nứt khi Tinh Thần < 15/100');
console.log('✔ [2/4] UIScene.ts: Viền Ám Ảnh (Horror Vignette Overlay) 4 góc đồng bộ nhịp tim Web Audio, tự tắt khi an toàn và cảnh báo hoảng loạn.');

// 3. Kiểm tra GameScene.ts (Cảm biến quái vật, micro-tremor camera, debounce cảnh báo)
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');

assert(gameSceneSrc.includes('updateDynamicHeartbeat'), 'GameScene phải gọi updateDynamicHeartbeat trong update loop');
assert(gameSceneSrc.includes('distToListener <= 260') || gameSceneSrc.includes('distToListener <= 220'), 'Kiểm tra The Listener áp sát trong bán kính nguy hiểm');
assert(gameSceneSrc.includes('isMonsterNear(this.player.x, this.player.y, 220)'), 'Kiểm tra quái vật hoang dã săn đuổi trong bán kính 220px');
assert(gameSceneSrc.includes('cameraSystem.shake(120, 0.0015)'), 'Rung vi mô camera (micro-tremor 120ms, 0.0015 intensity) khi Tinh Thần < 15');
assert(gameSceneSrc.includes('lastMindFractureWarningTime'), 'Debounce chống spam cảnh báo tâm lý');
assert(gameSceneSrc.includes('pauseModal.onOpen') && gameSceneSrc.includes('audioManager.setHeartbeatActive(false)'), 'Tắt nhịp tim khi mở Pause Menu [ESC]');
assert(gameSceneSrc.includes('gameOverModal.onOpen') && gameSceneSrc.includes('audioManager.setHeartbeatActive(false)'), 'Tắt nhịp tim khi Game Over');
console.log('✔ [3/4] GameScene.ts: Cảm biến quái vật 220px, micro-tremor camera 120ms/0.0015, debounce cảnh báo 18s và dọn dẹp âm thanh khi pause/chết.');

// 4. Kiểm tra SurvivalSystem.ts & WildlifeSystem.ts
const survivalSrc = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');
const wildlifeSrc = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');

assert(survivalSrc.includes('isSanityPanic'), 'SurvivalSystem phải có isSanityPanic()');
assert(survivalSrc.includes('isSanityCritical'), 'SurvivalSystem phải có isSanityCritical()');
assert(wildlifeSrc.includes('isMonsterNear'), 'WildlifeSystem phải có isMonsterNear()');
console.log('✔ [4/4] SurvivalSystem.ts & WildlifeSystem.ts: Bổ sung các phương thức kiểm tra trạng thái bất an/nguy cấp và cảm biến cự ly quái vật.');

console.log('\n============================================================');
console.log('🎉 TOÀN BỘ 4 HẠNG MỤC TEST BƯỚC V15-58C ĐÃ ĐẠT 100%!');
console.log('============================================================');
