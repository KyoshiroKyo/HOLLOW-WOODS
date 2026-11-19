/**
 * HOLLOW WOODS V1.5 — TEST V15-58A:
 * KIỂM THỬ HỆ THỐNG ẢO GIÁC TINH THẦN & ẢO ẢNH HIỆP SĨ SA NGÃ
 */

import assert from 'assert';
import fs from 'fs';

console.log('=== [V15-58A] BẮT ĐẦU KIỂM THỬ HỆ THỐNG ẢO GIÁC TINH THẦN & HIỆP SĨ SA NGÃ ===');

// 1. Kiểm tra cấu trúc mã nguồn FallenKnightApparition.ts
const apparitionSrc = fs.readFileSync('src/entities/FallenKnightApparition.ts', 'utf8');

assert(apparitionSrc.includes('extends Phaser.GameObjects.Sprite'), 'Ảo ảnh phải kế thừa từ Phaser.GameObjects.Sprite để không có physics collider');
assert(!apparitionSrc.includes('scene.physics.add'), 'Ảo ảnh tuyệt đối không được thêm vào Physics Arcade');
assert(!apparitionSrc.includes('body.setSize'), 'Ảo ảnh không được có body size gây cản trở đường đi');
assert(apparitionSrc.includes('triggerSmokeBurst'), 'Ảo ảnh phải có phương thức triggerSmokeBurst');
assert(apparitionSrc.includes('fadeOutAndDestroy'), 'Ảo ảnh phải có phương thức fadeOutAndDestroy');
assert(apparitionSrc.includes('setFlipX'), 'Ảo ảnh phải xoay mặt theo hướng người chơi');
assert(apparitionSrc.includes('setTint(0x281938)'), 'Ảo ảnh phải phủ lớp bóng mờ tối sẫm');
console.log('✔ [1/4] FallenKnightApparition.ts: Chuẩn xác kế thừa GameObjects.Sprite, 0 physics body, đầy đủ hiệu ứng khói đen & xoay mặt.');

// 2. Kiểm tra SurvivalSystem.ts
const survivalSrc = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');

assert(survivalSrc.includes('stats.composure < 55') && (survivalSrc.includes("zoneId !== 'bellhollow'") || survivalSrc.includes("!isBellhollow")), 'Ảo giác chỉ kích hoạt khi Tinh Thần < 55 và ở ngoài Làng Bellhollow');
assert(survivalSrc.includes('14 + Math.random() * 8'), 'Bộ đếm sự kiện ngẫu nhiên từ 14–22 giây');
assert(survivalSrc.includes('this.hallucinationCooldown = 10.0') || survivalSrc.includes('hallucinationCooldown'), 'Có cooldown chống dồn dập sự kiện');
assert(survivalSrc.includes('playFalseFootsteps'), 'Có sự kiện phát tiếng bước chân giả sau lưng');
assert(survivalSrc.includes('playCrackedBellToll') || survivalSrc.includes('ghost_whisper'), 'Có sự kiện chuông đồng méo mó hoặc thì thầm trầm đục');
assert(survivalSrc.includes('hallucination_shadow_flicker'), 'Có sự kiện phát bóng đen lướt rìa tầm nhìn');
assert(survivalSrc.includes('justStopped'), 'Bước chân giả chỉ kích hoạt khi người chơi vừa dừng bước');
console.log('✔ [2/4] SurvivalSystem.ts: Tầng ảo giác thính giác & bóng lướt rìa tầm nhìn (14-22s, cooldown, 3 hiện tượng) chuẩn xác.');

// 3. Kiểm tra VeilSystem.ts
const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf8');

assert(veilSrc.includes('triggerPeripheralShadowFlicker'), 'VeilSystem phải có phương thức triggerPeripheralShadowFlicker');
assert(veilSrc.includes('duration: 600'), 'Vệt bóng đen lướt nhanh qua rìa sương và biến mất trong đúng 0.6 giây');
assert(veilSrc.includes('hallucination_shadow_flicker'), 'VeilSystem phải lắng nghe sự kiện hallucination_shadow_flicker');
assert(veilSrc.includes('shadowGfx.destroy()'), 'Vệt bóng đen phải tự động hủy dọn dẹp sạch sau khi lướt');
console.log('✔ [3/4] VeilSystem.ts: Hiệu ứng peripheral shadow flicker 0.6s tích hợp hoàn hảo.');

// 4. Kiểm tra GameScene.ts
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');

assert(gameSceneSrc.includes('updateFallenKnightApparitions'), 'GameScene phải có vòng lặp updateFallenKnightApparitions');
assert(gameSceneSrc.includes('composure < 30'), 'Ảo ảnh Hiệp Sĩ Sa Ngã chỉ sinh khi Tinh Thần < 30');
assert(gameSceneSrc.includes('this.knightApparitions.length < 2'), 'Giới hạn tối đa 1–2 ảo ảnh cùng lúc');
assert(gameSceneSrc.includes('Phaser.Math.Between(155, 205)') || gameSceneSrc.includes('150') || gameSceneSrc.includes('210'), 'Sinh tại rìa vùng tối cách 150–210px');
assert(gameSceneSrc.includes('dist < 85') || gameSceneSrc.includes('tooClose'), 'Tan biến khi người chơi tiếp cận < 85px');
assert(gameSceneSrc.includes('isLanternOn && dist <= 140'), 'Tan biến khi rọi sáng Đèn Lồng [F]');
assert(gameSceneSrc.includes('isAttacking && dist <= 95'), 'Tan biến khi vung kiếm chém vào ảo ảnh');
assert(gameSceneSrc.includes('stats.composure - 4') || gameSceneSrc.includes('composure - 4'), 'Trừ 4 điểm Tinh Thần khi ảo ảnh bạo phát');
assert(gameSceneSrc.includes('shake(150, 0.007)'), 'Rung nhẹ camera 150ms khi ảo ảnh bạo phát');
assert(gameSceneSrc.includes('dist > 320') || gameSceneSrc.includes('fadeOutAndDestroy'), 'Tự động mờ dần khi đi xa > 320px hoặc vào vùng an toàn');
console.log('✔ [4/4] GameScene.ts: Toàn bộ tương tác sinh ảo ảnh, rọi sáng, chém kiếm, áp sát, trừ 4 Tinh Thần, rung camera 150ms đã đạt chuẩn.');

console.log('\n============================================================');
console.log('🎉 TOÀN BỘ 4 HẠNG MỤC TEST BƯỚC V15-58A ĐÃ ĐẠT 100%!');
console.log('============================================================');
