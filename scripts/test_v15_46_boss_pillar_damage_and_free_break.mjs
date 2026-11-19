/**
 * HOLLOW WOODS - Step V15-46 Automated Test
 * Test: Boss Root Pillars Hitbox, Damage Reception, Free Order Breaking & Boss Shield Break
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== TEST V15-46: BOSS ROOT PILLARS HITBOX, DAMAGE & FREE BREAK ===\n');

// 1. Kiểm tra MireWardenBoss.ts
const bossPath = path.resolve('src/entities/MireWardenBoss.ts');
assert(fs.existsSync(bossPath), 'MireWardenBoss.ts tồn tại');
const bossContent = fs.readFileSync(bossPath, 'utf-8');

assert(bossContent.includes('export interface RunePillarTarget'), 'RunePillarTarget interface được định nghĩa');
assert(bossContent.includes('name: string;') && bossContent.includes('hp: number;') && bossContent.includes('maxHp: number;'), 'RunePillarTarget có các thuộc tính name, hp, maxHp');
assert(bossContent.includes('public isShieldBroken: boolean = false;'), 'Boss có cờ isShieldBroken');
assert(bossContent.includes('public bossHp: number = 100;') && bossContent.includes('maxBossHp: number = 100;'), 'Boss có bossHp và maxBossHp (100 HP)');
assert(bossContent.includes('public breakShield(): void'), 'Boss có phương thức breakShield() để phá vỡ lớp khiên');
assert(bossContent.includes('public takeDamage(amount: number, fromX?: number, _fromY?: number): boolean'), 'Boss có phương thức takeDamage nhận sát thương');

// 2. Kiểm tra GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'GameScene.ts tồn tại');
const sceneContent = fs.readFileSync(gameScenePath, 'utf-8');

// Khởi tạo 3 trụ phong ấn mạch rễ
assert(sceneContent.includes("id: 'pillar_nw', name: 'Rãnh Vang Cổ'"), 'Trụ Tây Bắc Rãnh Vang Cổ được khởi tạo');
assert(sceneContent.includes("id: 'pillar_ne', name: 'Đá Mạch Rễ'"), 'Trụ Đông Bắc Đá Mạch Rễ được khởi tạo');
assert(sceneContent.includes("id: 'pillar_se', name: 'Bảo Hộ Chuông'"), 'Trụ Đông Nam Bảo Hộ Chuông được khởi tạo');
assert(sceneContent.includes('isLit: true, isShattered: false, hp: 30, maxHp: 30'), 'Cả 3 trụ mở tự do từ đầu (isLit: true, hp: 30)');

// Tương tác [E] mở rộng bán kính
assert(sceneContent.includes('distPillar <= 100'), 'Bán kính phát hiện tương tác [E] mở rộng lên đến 100px');
assert(sceneContent.includes('triggerDist: 75'), 'triggerDist của trụ đạt 75px (vượt qua collider để người chơi chạm tới)');
assert(sceneContent.includes('[E] Phá Giải Phong Ấn Mạch Rễ'), 'Nhãn tương tác rõ ràng [E] Phá Giải Phong Ấn Mạch Rễ');

// Hitbox chém vũ khí vào trụ phong ấn
assert(sceneContent.includes('for (const pillar of this.runePillarTargets)'), 'checkAttackHitboxCollisions duyệt qua toàn bộ runePillarTargets');
assert(sceneContent.includes('pillar.hp = Math.max(0, pillar.hp - dmg);'), 'Đòn đánh vũ khí trừ HP của trụ');
assert(sceneContent.includes('this.handleShatterRunePillar(pillar);'), 'Khi HP trụ <= 0 tự động gọi handleShatterRunePillar');

// Boss nhận sát thương khi khiên vỡ
assert(sceneContent.includes('this.mireWardenBoss.takeDamage(dmg'), 'Vũ khí gây sát thương trực tiếp lên Boss khi khiên vỡ');
assert(sceneContent.includes('if (this.mireWardenBoss.bossHp <= 0)'), 'Kiểm tra máu Boss <= 0 kết liễu Boss hoàn toàn');

// Phá giải phong ấn tự do và phá khiên vĩnh viễn
assert(sceneContent.includes('this.mireWardenBoss.breakShield();'), 'Khi đủ 3 trụ vỡ, gọi mireWardenBoss.breakShield()');
assert(sceneContent.includes('⚡ Phong ấn đã vỡ! Hãy tấn công kết liễu Boss hoặc khảo sát Chuông Cổ!'), 'Thông báo hướng dẫn người chơi kết liễu Boss rõ ràng');

console.log(`\nTổng kết: ${passed} PASS, ${failed} FAIL`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ CÁC ĐIỀU KIỆN V15-46 ĐỀU ĐẠT CHUẨN! <<<\n');
}
