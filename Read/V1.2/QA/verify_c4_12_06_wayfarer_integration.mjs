/**
 * Script Kiểm Chứng Tự Động Chất Lượng Tích Hợp Nhân Vật The Mossbound Wayfarer (C4-12-06 QA)
 * Dự án: HOLLOW WOODS V1.2 (The Fog That Remembers)
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${details}`);
  }
}

console.log('================================================================');
console.log('QA VERIFICATION SUITE — COMMAND C4-12-06');
console.log('TÍCH HỢP NHÂN VẬT THE MOSSBOUND WAYFARER VÀO ENGINE & GAMEPLAY');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// NHÓM 1: KIỂM TRA TỒN TẠI TÀI NGUYÊN VÀ FILE SPRITE SHEET
// -----------------------------------------------------------------------------
console.log('--- NHÓM 1: TÀI NGUYÊN SPRITE SHEET & PORTRAIT ---');

const WAYFARER_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'mossbound_wayfarer');
const REQUIRED_SPRITES = [
  'wayfarer_idle.png',
  'wayfarer_walk.png',
  'wayfarer_run.png',
  'wayfarer_attack.png',
  'wayfarer_hurt.png',
  'wayfarer_death.png',
  'wayfarer_interact.png',
  'wayfarer_gather.png',
  'wayfarer_use_item.png',
  'wayfarer_portrait.png',
  'wayfarer_animation_manifest.json'
];

for (const file of REQUIRED_SPRITES) {
  const filePath = path.join(WAYFARER_DIR, file);
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  assert(exists && size > 0, `File tài nguyên tồn tại: ${file}`, `Size: ${size} bytes`);
}

const SATYR_PORTRAIT_PATH = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'satyr', 'satyr_portrait.png');
assert(fs.existsSync(SATYR_PORTRAIT_PATH) && fs.statSync(SATYR_PORTRAIT_PATH).size > 0, 'Chân dung satyr_portrait.png đồng bộ');

// -----------------------------------------------------------------------------
// NHÓM 2: KIỂM TRA HẰNG SỐ CẤU HÌNH (Constants.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 2: HẰNG SỐ CẤU HÌNH (Constants.ts) ---');

const CONSTANTS_PATH = path.join(ROOT_DIR, 'src', 'config', 'Constants.ts');
const constantsContent = fs.readFileSync(CONSTANTS_PATH, 'utf-8');

assert(constantsContent.includes("export const WAYFARER_IDLE_KEY = 'wayfarer_idle';"), 'WAYFARER_IDLE_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_WALK_KEY = 'wayfarer_walk';"), 'WAYFARER_WALK_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_RUN_KEY = 'wayfarer_run';"), 'WAYFARER_RUN_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_ATTACK_KEY = 'wayfarer_attack';"), 'WAYFARER_ATTACK_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_HURT_KEY = 'wayfarer_hurt';"), 'WAYFARER_HURT_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_DEATH_KEY = 'wayfarer_death';"), 'WAYFARER_DEATH_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_INTERACT_KEY = 'wayfarer_interact';"), 'WAYFARER_INTERACT_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_GATHER_KEY = 'wayfarer_gather';"), 'WAYFARER_GATHER_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_USE_ITEM_KEY = 'wayfarer_use_item';"), 'WAYFARER_USE_ITEM_KEY khai báo đúng');
assert(constantsContent.includes("export const WAYFARER_PORTRAIT_KEY = 'wayfarer_portrait';"), 'WAYFARER_PORTRAIT_KEY khai báo đúng');

assert(constantsContent.includes('export const WAYFARER_FRAME_WIDTH = 64;'), 'WAYFARER_FRAME_WIDTH = 64');
assert(constantsContent.includes('export const WAYFARER_FRAME_HEIGHT = 64;'), 'WAYFARER_FRAME_HEIGHT = 64');
assert(constantsContent.includes('export const WAYFARER_ORIGIN_X = 0.5;'), 'WAYFARER_ORIGIN_X = 0.5 (bottom-center)');
assert(constantsContent.includes('export const WAYFARER_ORIGIN_Y = 0.90625;'), 'WAYFARER_ORIGIN_Y = 0.90625 (y=58/64)');
assert(constantsContent.includes('export const WAYFARER_BODY_WIDTH = 14;'), 'WAYFARER_BODY_WIDTH = 14 px');
assert(constantsContent.includes('export const WAYFARER_BODY_HEIGHT = 8;'), 'WAYFARER_BODY_HEIGHT = 8 px');
assert(constantsContent.includes('export const WAYFARER_BODY_OFFSET_X = 25;'), 'WAYFARER_BODY_OFFSET_X = 25 px');
assert(constantsContent.includes('export const WAYFARER_BODY_OFFSET_Y = 50;'), 'WAYFARER_BODY_OFFSET_Y = 50 px');

// -----------------------------------------------------------------------------
// NHÓM 3: KIỂM TRA NẠP TÀI NGUYÊN (PreloadScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 3: NẠP TÀI NGUYÊN (PreloadScene.ts) ---');

const PRELOAD_PATH = path.join(ROOT_DIR, 'src', 'scenes', 'PreloadScene.ts');
const preloadContent = fs.readFileSync(PRELOAD_PATH, 'utf-8');

assert(preloadContent.includes('WAYFARER_IDLE_KEY'), 'PreloadScene import WAYFARER_IDLE_KEY');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_IDLE_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_idle.png'"), 'Nạp wayfarer_idle spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_WALK_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_walk.png'"), 'Nạp wayfarer_walk spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_RUN_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_run.png'"), 'Nạp wayfarer_run spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_ATTACK_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_attack.png'"), 'Nạp wayfarer_attack spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_HURT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_hurt.png'"), 'Nạp wayfarer_hurt spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_DEATH_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_death.png'"), 'Nạp wayfarer_death spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_INTERACT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_interact.png'"), 'Nạp wayfarer_interact spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_GATHER_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_gather.png'"), 'Nạp wayfarer_gather spritesheet');
assert(preloadContent.includes("this.load.spritesheet(WAYFARER_USE_ITEM_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_use_item.png'"), 'Nạp wayfarer_use_item spritesheet');
assert(preloadContent.includes("this.load.image(WAYFARER_PORTRAIT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_portrait.png'"), 'Nạp wayfarer_portrait');

// -----------------------------------------------------------------------------
// NHÓM 4: KIỂM TRA ĐĂNG KÝ HOẠT ẢNH (SatyrAnimations.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 4: ĐĂNG KÝ HOẠT ẢNH (SatyrAnimations.ts) ---');

const ANIMS_PATH = path.join(ROOT_DIR, 'src', 'animation', 'SatyrAnimations.ts');
const animsContent = fs.readFileSync(ANIMS_PATH, 'utf-8');

assert(animsContent.includes('export function registerWayfarerAnimations'), 'Xuất hàm registerWayfarerAnimations');
assert(animsContent.includes('export function registerSatyrAnimations'), 'Xuất hàm registerSatyrAnimations');
assert(animsContent.includes("const DIRECTIONS = ['down', 'up', 'left', 'right']"), 'Hỗ trợ 4 hướng down, up, left, right');
assert(animsContent.includes('const wayfarerKey = `wayfarer_${cfg.action}_${dir}`;'), 'Tạo key wayfarer_<action>_<dir>');
assert(animsContent.includes('const satyrKey = `satyr_${cfg.action}_${dir}`;'), 'Tạo alias satyr_<action>_<dir>');
assert(animsContent.includes('registerWayfarerAnimations(anims);'), 'SatyrAnimations tự động gọi registerWayfarerAnimations');

// -----------------------------------------------------------------------------
// NHÓM 5: THỰC THỂ NGƯỜI CHƠI (SatyrPlayer.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 5: THỰC THỂ NGƯỜI CHƠI (SatyrPlayer.ts) ---');

const PLAYER_PATH = path.join(ROOT_DIR, 'src', 'entities', 'SatyrPlayer.ts');
const playerContent = fs.readFileSync(PLAYER_PATH, 'utf-8');

assert(playerContent.includes('WAYFARER_IDLE_KEY'), 'SatyrPlayer import WAYFARER_IDLE_KEY');
assert(playerContent.includes('this.setOrigin(WAYFARER_ORIGIN_X, WAYFARER_ORIGIN_Y);'), 'Đặt origin điểm neo bàn chân (0.5, 0.90625)');
assert(playerContent.includes('body.setSize(WAYFARER_BODY_WIDTH, WAYFARER_BODY_HEIGHT);'), 'Đặt collider bàn chân 14x8 px');
assert(playerContent.includes('body.setOffset(WAYFARER_BODY_OFFSET_X, WAYFARER_BODY_OFFSET_Y);'), 'Đặt collider offset 25, 50 px');
assert(playerContent.includes('public playInteract(): boolean'), 'Có hàm playInteract()');
assert(playerContent.includes('public playGather(): boolean'), 'Có hàm playGather()');
assert(playerContent.includes('public playUseItem(): boolean'), 'Có hàm playUseItem()');
assert(playerContent.includes('public isActionLocked(): boolean'), 'Có hàm isActionLocked()');
assert(playerContent.includes('public isGathering(): boolean'), 'Có getter isGathering()');
assert(playerContent.includes('public isInteracting(): boolean'), 'Có getter isInteracting()');
assert(playerContent.includes('public isUsingItem(): boolean'), 'Có getter isUsingItem()');
assert(playerContent.includes('this.setFlipX(false);'), 'Không lật gương cho sprite 4 hướng Wayfarer');

// -----------------------------------------------------------------------------
// NHÓM 6: TÍCH HỢP HÀNH ĐỘNG GAMEPLAY (GameScene.ts & UIScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 6: TÍCH HỢP HÀNH ĐỘNG GAMEPLAY ---');

const GAME_SCENE_PATH = path.join(ROOT_DIR, 'src', 'scenes', 'GameScene.ts');
const gameSceneContent = fs.readFileSync(GAME_SCENE_PATH, 'utf-8');

assert(gameSceneContent.includes('this.player.playInteract();') && gameSceneContent.includes('this.dialogueSystem.startDialogue(dKey);'), 'Nói chuyện NPC kích hoạt playInteract()');
assert(gameSceneContent.includes('this.player.playGather();') && gameSceneContent.includes('checkHarvestNearby'), 'Thu thập tài nguyên kích hoạt playGather()');
assert(gameSceneContent.includes('this.player.playInteract();') && gameSceneContent.includes('executeMapInteraction'), 'Tương tác bản đồ kích hoạt playInteract()');
assert(gameSceneContent.includes('this.player.playUseItem();'), 'GameScene gọi playUseItem khi dùng nhanh phím 1 / 2');

const UI_SCENE_PATH = path.join(ROOT_DIR, 'src', 'scenes', 'UIScene.ts');
const uiSceneContent = fs.readFileSync(UI_SCENE_PATH, 'utf-8');

assert(uiSceneContent.includes('gameScene.player.playUseItem()'), 'UIScene gọi playUseItem khi dùng Thuốc Đắp hoặc Bình Dầu');
assert(uiSceneContent.includes("key = 'wayfarer_portrait';"), 'UIScene hiển thị chân dung The Mossbound Wayfarer');

const DIALOGUE_PATH = path.join(ROOT_DIR, 'src', 'systems', 'DialogueSystem.ts');
const dialogueContent = fs.readFileSync(DIALOGUE_PATH, 'utf-8');

assert(dialogueContent.includes("portraitKey = 'wayfarer_portrait';"), 'DialogueSystem gán chân dung mặc định wayfarer_portrait');

// -----------------------------------------------------------------------------
// NHÓM 7: KIỂM TRA MANIFEST & METRICS KHỚP 100%
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 7: ĐỐI SOÁT MANIFEST HOẠT ẢNH ---');

const MANIFEST_PATH = path.join(WAYFARER_DIR, 'wayfarer_animation_manifest.json');
const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

assert(manifestData.sheets.length === 9, 'Manifest định nghĩa đủ 9 bảng sprite sheet');
assert(manifestData.frameCell.width === 64 && manifestData.frameCell.height === 64, 'Kích thước ô frame chuẩn 64x64 px');
assert(manifestData.frameCell.footAnchor.originX === 0.5 && manifestData.frameCell.footAnchor.originY === 0.90625, 'Điểm neo bàn chân trùng khớp (0.5, 0.90625)');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL CHECKS PASSED (100% HOÀN TẤT TÍCH HỢP C4-12-06)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
