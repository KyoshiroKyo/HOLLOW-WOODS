/**
 * HOLLOW WOODS V1.5 - KIỂM TRA BỘ SPRITE BOSS BÓNG TỐI SHADOW SERIES (V15-42)
 * File: scripts/test_v15_42_wetlands_boss_sprite.mjs
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
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

console.log('=== TEST V15-42: SHADOW SERIES WETLANDS BOSS SPRITE INTEGRATION ===\n');

// 1. Kiểm tra 6 file spritesheet trong runtime
const bossSpriteDir = path.join(projectRoot, 'public/assets/characters/bosses/wetlands_boss');
const expectedSpritesheets = [
  'boss_wetlands_idle.png',
  'boss_wetlands_walk.png',
  'boss_wetlands_attack1.png',
  'boss_wetlands_attack2.png',
  'boss_wetlands_hit.png',
  'boss_wetlands_death.png'
];

console.log('1. Kiểm tra tồn tại 6 tệp spritesheet trong public/assets/characters/bosses/wetlands_boss/:');
for (const sheet of expectedSpritesheets) {
  const filePath = path.join(bossSpriteDir, sheet);
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  assert(exists && size > 400, `Spritesheet ${sheet} tồn tại (${size} bytes)`);
}

// 2. Kiểm tra Constants.ts
console.log('\n2. Kiểm tra hằng số trong src/config/Constants.ts:');
const constantsPath = path.join(projectRoot, 'src/config/Constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_IDLE'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_IDLE');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_WALK'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_WALK');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_ATTACK1'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_ATTACK1');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_ATTACK2'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_ATTACK2');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_HIT'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_HIT');
assert(constantsContent.includes('SPRITE_BOSS_WETLANDS_DEATH'), 'Constants.ts chứa SPRITE_BOSS_WETLANDS_DEATH');

// 3. Kiểm tra PreloadScene.ts
console.log('\n3. Kiểm tra Nạp và Đăng ký Animation trong src/scenes/PreloadScene.ts:');
const preloadPath = path.join(projectRoot, 'src/scenes/PreloadScene.ts');
const preloadContent = fs.readFileSync(preloadPath, 'utf8');
assert(preloadContent.includes('boss_wetlands_idle'), 'PreloadScene tải boss_wetlands_idle');
assert(preloadContent.includes('frameWidth: 247') && preloadContent.includes('frameHeight: 87'), 'PreloadScene cắt đúng khung hình 247x87');
assert(preloadContent.includes('anim_boss_wetlands_idle'), 'PreloadScene tạo anim_boss_wetlands_idle');
assert(preloadContent.includes('anim_boss_wetlands_walk'), 'PreloadScene tạo anim_boss_wetlands_walk');
assert(preloadContent.includes('anim_boss_wetlands_attack1'), 'PreloadScene tạo anim_boss_wetlands_attack1');
assert(preloadContent.includes('anim_boss_wetlands_hit'), 'PreloadScene tạo anim_boss_wetlands_hit');
assert(preloadContent.includes('anim_boss_wetlands_death'), 'PreloadScene tạo anim_boss_wetlands_death');

// 4. Kiểm tra MireWardenBoss.ts
console.log('\n4. Kiểm tra Thực thể MireWardenBoss.ts:');
const bossPath = path.join(projectRoot, 'src/entities/MireWardenBoss.ts');
const bossContent = fs.readFileSync(bossPath, 'utf8');
assert(bossContent.includes('this.bossSprite = scene.add.sprite(0, 0, SPRITE_BOSS_WETLANDS_IDLE)'), 'MireWardenBoss khởi tạo bossSprite');
assert(bossContent.includes('this.bossSprite.setOrigin(0.336, 0.988)'), 'MireWardenBoss căn chuẩn Origin (0.336, 0.988)');
assert(bossContent.includes('this.bossSprite.setScale(1.8)'), 'MireWardenBoss áp dụng scale 1.8');
assert(bossContent.includes('body.setSize(84, 44)'), 'MireWardenBoss căn chỉnh hitbox chuẩn (84, 44)');
assert(!bossContent.includes('this.bodyGfx ='), 'MireWardenBoss đã loại bỏ hoàn toàn procedural bodyGfx');

// 5. Kiểm tra GameScene.ts
console.log('\n5. Kiểm tra Logic Sát thương & Tử trận trong src/scenes/GameScene.ts:');
const gameScenePath = path.join(projectRoot, 'src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneContent.includes('distP <= 48 && !this.mireWardenBoss.isStaggered'), 'GameScene căn chỉnh khoảng cách va chạm lao húc distP <= 48');
assert(gameSceneContent.includes("this.triggerPlayerDeath('Gục ngã trước cú lao húc cuồng nộ của Kẻ Nuốt Tiếng Chuông...')"), 'GameScene kích hoạt triggerPlayerDeath khi máu chạm 0 trong phòng Boss');
assert(gameSceneContent.includes("data.playerPos = { x: 2360, y: 720 };"), 'GameScene khôi phục về Trạm Lửa Sir Vaelen (x: 2360, y: 720) khi hồi sinh sau cái chết ở Boss');

console.log(`\n==================================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('TẤT CẢ CÁC ĐIỀU KIỆN V15-42 ĐÃ ĐẠT CHUẨN 100%!');
  process.exit(0);
}
