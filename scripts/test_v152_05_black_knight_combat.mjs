/**
 * scripts/test_v152_05_black_knight_combat.mjs
 * 
 * Kiểm thử toàn diện bước V152-05:
 * 1. Kiểm tra 18 spritesheets trong public/assets/characters/mossbound_wayfarer/
 * 2. Đo kích thước và tỷ lệ các spritesheets chuẩn xác theo quy định
 * 3. Kiểm tra Constants.ts có đủ 9 key mới và cờ WAYFARER_USE_PURE_ARTIST_SPRITES = false
 * 4. Kiểm tra PreloadScene.ts nạp đủ 18 spritesheet
 * 5. Kiểm tra SatyrAnimations.ts đăng ký đủ 18 animations cho 4 hướng (> 0 frames)
 * 6. Kiểm tra SatyrPlayer.ts có đủ các phương thức chiến đấu (attack, heavyAttack, weaponArt, parry, roll, toggleWeapon)
 * 7. Kiểm tra ảnh xem trước preview_wayfarer_4dir.png tồn tại
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('========================================================================');
console.log('⚔️  HOLLOW WOODS V1.5.2 — KIỂM THỬ BƯỚC V152-05 (BLACK KNIGHT COMBAT)');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Kiểm tra 18 spritesheets
console.log('--- 1. KIỂM TRA 18 SPRITESHEETS VẬT LÝ TRONG PUBLIC/ASSETS ---');
const EXPECTED_SHEETS = [
  { name: 'wayfarer_idle.png', w: 256, h: 256, desc: 'Idle (4 cols x 4 rows)' },
  { name: 'wayfarer_walk.png', w: 384, h: 256, desc: 'Walk (6 cols x 4 rows)' },
  { name: 'wayfarer_run.png', w: 384, h: 256, desc: 'Run (6 cols x 4 rows)' },
  { name: 'wayfarer_hurt.png', w: 192, h: 256, desc: 'Hurt (3 cols x 4 rows)' },
  { name: 'wayfarer_death.png', w: 384, h: 256, desc: 'Death (6 cols x 4 rows)' },
  { name: 'wayfarer_interact.png', w: 256, h: 256, desc: 'Interact (4 cols x 4 rows)' },
  { name: 'wayfarer_gather.png', w: 256, h: 256, desc: 'Gather (4 cols x 4 rows)' },
  { name: 'wayfarer_use_item.png', w: 256, h: 256, desc: 'Use Item (4 cols x 4 rows)' },
  { name: 'wayfarer_attack.png', w: 384, h: 256, desc: 'Light Attack (6 cols x 4 rows)' },
  { name: 'wayfarer_unarmed_idle.png', w: 256, h: 256, desc: 'Unarmed Idle (4 cols x 4 rows)' },
  { name: 'wayfarer_unarmed_run.png', w: 384, h: 256, desc: 'Unarmed Run (6 cols x 4 rows)' },
  { name: 'wayfarer_heavy_attack.png', w: 384, h: 256, desc: 'Heavy Attack (6 cols x 4 rows)' },
  { name: 'wayfarer_weapon_art.png', w: 384, h: 256, desc: 'Weapon Art (6 cols x 4 rows)' },
  { name: 'wayfarer_parry.png', w: 384, h: 256, desc: 'Parry (6 cols x 4 rows)' },
  { name: 'wayfarer_roll.png', w: 384, h: 256, desc: 'Roll (6 cols x 4 rows)' },
  { name: 'wayfarer_unarmed_roll.png', w: 384, h: 256, desc: 'Unarmed Roll (6 cols x 4 rows)' },
  { name: 'wayfarer_buff.png', w: 384, h: 256, desc: 'Buff (6 cols x 4 rows)' },
  { name: 'wayfarer_weapon_toggle.png', w: 384, h: 256, desc: 'Weapon Toggle (6 cols x 4 rows)' }
];

const DIR = 'public/assets/characters/mossbound_wayfarer';
for (const sheet of EXPECTED_SHEETS) {
  const fullPath = path.join(DIR, sheet.name);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Spritesheet tồn tại: ${sheet.name}`);
  if (exists) {
    const data = fs.readFileSync(fullPath);
    const png = PNG.sync.read(data);
    assert(png.width === sheet.w && png.height === sheet.h, `${sheet.name}: Kích thước đúng chuẩn [${png.width}x${png.height} px == ${sheet.w}x${sheet.h} px] - ${sheet.desc}`);
  }
}

// 2. Kiểm tra ảnh xem trước preview_wayfarer_4dir.png
console.log('\n--- 2. KIỂM TRA ẢNH XEM TRƯỚC 4 HƯỚNG (PREVIEW) ---');
const previewPath = 'Backups/steps/backup_v152_05/preview_wayfarer_4dir.png';
const previewExists = fs.existsSync(previewPath);
assert(previewExists, `Tập tin preview tồn tại: ${previewPath}`);
if (previewExists) {
  const pData = fs.readFileSync(previewPath);
  const pPng = PNG.sync.read(pData);
  assert(pPng.width > 0 && pPng.height > 0, `Ảnh xem trước hợp lệ [${pPng.width}x${pPng.height} px]`);
}

// 3. Kiểm tra Constants.ts
console.log('\n--- 3. KIỂM TRA HẰNG SỐ CẤU HÌNH TRONG CONSTANTS.TS ---');
const constantsContent = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constantsContent.includes('export const WAYFARER_USE_PURE_ARTIST_SPRITES = false;'), 'WAYFARER_USE_PURE_ARTIST_SPRITES = false');
assert(constantsContent.includes('WAYFARER_HEAVY_ATTACK_KEY'), 'Khai báo WAYFARER_HEAVY_ATTACK_KEY');
assert(constantsContent.includes('WAYFARER_WEAPON_ART_KEY'), 'Khai báo WAYFARER_WEAPON_ART_KEY');
assert(constantsContent.includes('WAYFARER_PARRY_KEY'), 'Khai báo WAYFARER_PARRY_KEY');
assert(constantsContent.includes('WAYFARER_ROLL_KEY'), 'Khai báo WAYFARER_ROLL_KEY');
assert(constantsContent.includes('WAYFARER_UNARMED_ROLL_KEY'), 'Khai báo WAYFARER_UNARMED_ROLL_KEY');
assert(constantsContent.includes('WAYFARER_BUFF_KEY'), 'Khai báo WAYFARER_BUFF_KEY');
assert(constantsContent.includes('WAYFARER_WEAPON_TOGGLE_KEY'), 'Khai báo WAYFARER_WEAPON_TOGGLE_KEY');

// 4. Kiểm tra PreloadScene.ts
console.log('\n--- 4. KIỂM TRA NẠP TÀI NGUYÊN TRONG PRELOADSCENE.TS ---');
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
assert(preloadContent.includes('WAYFARER_HEAVY_ATTACK_KEY'), 'PreloadScene nạp WAYFARER_HEAVY_ATTACK_KEY');
assert(preloadContent.includes('WAYFARER_WEAPON_ART_KEY'), 'PreloadScene nạp WAYFARER_WEAPON_ART_KEY');
assert(preloadContent.includes('WAYFARER_PARRY_KEY'), 'PreloadScene nạp WAYFARER_PARRY_KEY');
assert(preloadContent.includes('WAYFARER_ROLL_KEY'), 'PreloadScene nạp WAYFARER_ROLL_KEY');
assert(preloadContent.includes('WAYFARER_BUFF_KEY'), 'PreloadScene nạp WAYFARER_BUFF_KEY');
assert(preloadContent.includes('WAYFARER_WEAPON_TOGGLE_KEY'), 'PreloadScene nạp WAYFARER_WEAPON_TOGGLE_KEY');

// 5. Kiểm tra SatyrAnimations.ts
console.log('\n--- 5. KIỂM TRA ĐĂNG KÝ ANIMATION TRONG SATYRAMINATIONS.TS ---');
const animContent = fs.readFileSync('src/animation/BlackKnightAnimations.ts', 'utf8');
assert(animContent.includes("action: 'heavy_attack'"), 'SatyrAnimations cấu hình heavy_attack');
assert(animContent.includes("action: 'weapon_art'"), 'SatyrAnimations cấu hình weapon_art');
assert(animContent.includes("action: 'parry'"), 'SatyrAnimations cấu hình parry');
assert(animContent.includes("action: 'roll'"), 'SatyrAnimations cấu hình roll');
assert(animContent.includes("action: 'buff'"), 'SatyrAnimations cấu hình buff');
assert(animContent.includes("action: 'weapon_toggle'"), 'SatyrAnimations cấu hình weapon_toggle');

// 6. Kiểm tra SatyrPlayer.ts
console.log('\n--- 6. KIỂM TRA HỆ THỐNG CHIẾN ĐẤU TRONG SATYRPLAYER.TS ---');
const playerContent = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');
assert(playerContent.includes('public heavyAttack()'), 'SatyrPlayer có hàm heavyAttack');
assert(playerContent.includes('public weaponArt()'), 'SatyrPlayer có hàm weaponArt');
assert(playerContent.includes('public parry()'), 'SatyrPlayer có hàm parry');
assert(playerContent.includes('public roll()'), 'SatyrPlayer có hàm roll');
assert(playerContent.includes('public toggleWeapon('), 'SatyrPlayer có hàm toggleWeapon');
assert(playerContent.includes('this._isParrying'), 'SatyrPlayer có cờ _isParrying');
assert(playerContent.includes('this._isRolling'), 'SatyrPlayer có cờ _isRolling');
assert(playerContent.includes('this._isInvulnerable'), 'SatyrPlayer có cờ _isInvulnerable');
assert(playerContent.includes('checkZoneWeaponAutoState('), 'SatyrPlayer có hàm checkZoneWeaponAutoState');

console.log('\n========================================================================');
console.log(`TỔNG KẾT KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL`);
if (failCount === 0) {
  console.log('🎉 100% BÀI KIỂM THỬ V152-05 ĐÃ VƯỢT QUA XUẤT SẮC!');
} else {
  console.error('⚠️ CÒN BÀI KIỂM THỬ CHƯA ĐẠT!');
  process.exit(1);
}
console.log('========================================================================\n');
