/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-14A:
 * CHUẨN HÓA BỘ SPRITE NPC HIỆP SĨ CANH LỬA & TÁCH BẠCH TÀI NGUYÊN VỚI HIỆP SĨ TÀ ÁC
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-14A: HIỆP SĨ CANH LỬA   ');
console.log('======================================================================\n');

// --- PHẦN 1: KIỂM TRA TÀI NGUYÊN ĐỒ HỌA CHUẨN HÓA CỦA NPC HIỆP SĨ CANH LỬA ---
console.log('--- PHẦN 1: Kiểm Tra Tài Nguyên Đồ Họa Chuẩn Hóa NPC Hiệp Sĩ Canh Lửa ---');

const prayPath = 'public/assets/characters/npcs/campfire_knight_pray_sheet.png';
const idlePath = 'public/assets/characters/npcs/campfire_knight_idle_sheet.png';
const portraitPath = 'public/assets/characters/npcs/portrait_campfire_knight.png';

assert(fs.existsSync(prayPath), 'Tệp campfire_knight_pray_sheet.png tồn tại trong npcs/');
if (fs.existsSync(prayPath)) {
  const prayImg = PNG.sync.read(fs.readFileSync(prayPath));
  assert(prayImg.width === 768 && prayImg.height === 64, `Spritesheet Quỳ Cầu Nguyện chuẩn 768x64 px (12 frames 64x64) [Thực tế: ${prayImg.width}x${prayImg.height}]`);
  
  // Kiểm tra góc trên nền trong suốt (alpha = 0)
  const cornerAlpha = prayImg.data[3];
  assert(cornerAlpha === 0, 'Nền hoạt ảnh cầu nguyện là RGBA trong suốt');

  // Kiểm tra sự hiện diện của bóng đổ elip mềm dưới chân (quanh cx=32, cy=60, alpha xấp xỉ 0.25 tức ~64)
  const shadowAlpha = prayImg.data[(60 * 768 + 32) * 4 + 3];
  assert(shadowAlpha > 40 && shadowAlpha <= 75, `Có bóng đổ elip mềm dưới chân (alpha ~0.25) [Thực tế: ${shadowAlpha}/255 = ${(shadowAlpha/255).toFixed(2)}]`);

  // Kiểm tra bàn chân chạm đất ở đáy khung (y=62..63)
  let footDetected = false;
  for (let x = 20; x <= 44; x++) {
    if (prayImg.data[(63 * 768 + x) * 4 + 3] > 0 || prayImg.data[(62 * 768 + x) * 4 + 3] > 0) {
      footDetected = true;
      break;
    }
  }
  assert(footDetected, 'Điểm tựa bàn chân căn chuẩn đáy khung bottom-center (y=62..63)');
}

assert(fs.existsSync(idlePath), 'Tệp campfire_knight_idle_sheet.png tồn tại trong npcs/');
if (fs.existsSync(idlePath)) {
  const idleImg = PNG.sync.read(fs.readFileSync(idlePath));
  assert(idleImg.width === 512 && idleImg.height === 64, `Spritesheet Đứng Trò Chuyện chuẩn 512x64 px (8 frames 64x64) [Thực tế: ${idleImg.width}x${idleImg.height}]`);
  
  const cornerAlpha = idleImg.data[3];
  assert(cornerAlpha === 0, 'Nền hoạt ảnh đứng là RGBA trong suốt');

  const shadowAlpha = idleImg.data[(60 * 512 + 32) * 4 + 3];
  assert(shadowAlpha > 40 && shadowAlpha <= 75, `Có bóng đổ elip mềm dưới chân (alpha ~0.25) [Thực tế: ${shadowAlpha}/255 = ${(shadowAlpha/255).toFixed(2)}]`);

  let footDetected = false;
  for (let x = 20; x <= 44; x++) {
    if (idleImg.data[(63 * 512 + x) * 4 + 3] > 0 || idleImg.data[(62 * 512 + x) * 4 + 3] > 0) {
      footDetected = true;
      break;
    }
  }
  assert(footDetected, 'Điểm tựa bàn chân đứng căn chuẩn đáy khung bottom-center (y=62..63)');
}

assert(fs.existsSync(portraitPath), 'Tệp portrait_campfire_knight.png tồn tại trong npcs/');
if (fs.existsSync(portraitPath)) {
  const portImg = PNG.sync.read(fs.readFileSync(portraitPath));
  assert(portImg.width === 64 && portImg.height === 64, `Chân dung NPC Hiệp Sĩ Canh Lửa chuẩn 64x64 px [Thực tế: ${portImg.width}x${portImg.height}]`);
  
  const cornerAlpha = portImg.data[3];
  assert(cornerAlpha === 0, 'Nền chân dung NPC là RGBA trong suốt');

  // Kiểm tra có pixel giáp bạc của nhân vật ở vùng trung tâm (x=24..40, y=20..44)
  let centerPixels = 0;
  for (let y = 20; y <= 44; y++) {
    for (let x = 24; x <= 40; x++) {
      if (portImg.data[(y * 64 + x) * 4 + 3] > 20) {
        centerPixels++;
      }
    }
  }
  assert(centerPixels > 100, `Chân dung chứa chi tiết đầu/vai giáp bạc sắc nét [Pixel nhận diện: ${centerPixels}]`);
}

// Kiểm tra bản sao tương thích trong villagers/
assert(fs.existsSync('public/assets/characters/villagers/campfire_knight_pray_sheet.png'), 'Bản sao tương thích campfire_knight_pray_sheet.png trong villagers/');
assert(fs.existsSync('public/assets/characters/villagers/campfire_knight_idle_sheet.png'), 'Bản sao tương thích campfire_knight_idle_sheet.png trong villagers/');
assert(fs.existsSync('public/assets/characters/villagers/portrait_campfire_knight.png'), 'Bản sao tương thích portrait_campfire_knight.png trong villagers/');

// --- PHẦN 2: KIỂM TRA TÁCH BẠCH HOÀN TOÀN TÀI NGUYÊN VỚI NHÓM HIỆP SĨ TÀ ÁC ---
console.log('\n--- PHẦN 2: Kiểm Tra Tách Bạch Hoàn Toàn Tài Nguyên Với Hiệp Sĩ Tà Ác ---');

const evilKnightsSrc = fs.readFileSync('src/entities/EvilKnights.ts', 'utf8');

assert(evilKnightsSrc.includes('EVIL_KNIGHTS_ASSET_CONTRACT'), 'EvilKnights.ts định nghĩa hợp đồng ràng buộc EVIL_KNIGHTS_ASSET_CONTRACT');
assert(evilKnightsSrc.includes("FACTION: 'EVIL_KNIGHTS'"), "EvilKnights.ts xác định rõ phe phái FACTION: 'EVIL_KNIGHTS'");
assert(evilKnightsSrc.includes('PROHIBITED_NPC_ASSETS'), 'EvilKnights.ts có danh sách nghiêm cấm dùng tài nguyên NPC giáp bạc');

// Kiểm tra xem EvilKnights có import hoặc gọi nhầm tài nguyên của NPC Campfire Knight không
const hasForbiddenUsage = (
  evilKnightsSrc.includes('SPRITE_CAMPFIRE_KNIGHT') ||
  evilKnightsSrc.includes('PORTRAIT_CAMPFIRE_KNIGHT') ||
  evilKnightsSrc.includes('assets/characters/npcs/campfire_knight')
);
assert(!hasForbiddenUsage, 'EvilKnights.ts TUYỆT ĐỐI KHÔNG dùng chung bất kỳ sprite/chân dung nào của Hiệp Sĩ Canh Lửa');

// Kiểm tra các thực thể kẻ thù vẫn dùng đúng sprite tà ác của chúng
assert(evilKnightsSrc.includes('SPRITE_FALLEN_KNIGHT'), 'FallenKnightEntity sử dụng đúng SPRITE_FALLEN_KNIGHT');
assert(evilKnightsSrc.includes('SPRITE_DREAD_HORSEMAN'), 'DreadHorsemanEntity sử dụng đúng SPRITE_DREAD_HORSEMAN');
assert(evilKnightsSrc.includes('SPRITE_HOODED_KNIGHT'), 'HoodedKnightBoss sử dụng đúng SPRITE_HOODED_KNIGHT');

// Kiểm tra file enemies không bị ghi đè nhầm
assert(fs.existsSync('public/assets/characters/enemies/fallen_knight_sheet.png'), 'Tệp fallen_knight_sheet.png nguyên vẹn');
assert(fs.existsSync('public/assets/characters/enemies/dread_horseman_sheet.png'), 'Tệp dread_horseman_sheet.png nguyên vẹn');
assert(fs.existsSync('public/assets/characters/bosses/hooded_knight_sheet.png'), 'Tệp hooded_knight_sheet.png nguyên vẹn');

// --- PHẦN 3: KIỂM TRA ĐĂNG KÝ HỆ THỐNG (CONSTANTS, PRELOAD, CONTENT REGISTRY) ---
console.log('\n--- PHẦN 3: Kiểm Tra Đăng Ký Constants, PreloadScene & Content Registry ---');

const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constantsSrc.includes("SPRITE_CAMPFIRE_KNIGHT_PRAY = 'campfire_knight_pray_sheet'"), 'Constants.ts định nghĩa SPRITE_CAMPFIRE_KNIGHT_PRAY');
assert(constantsSrc.includes("SPRITE_CAMPFIRE_KNIGHT_IDLE = 'campfire_knight_idle_sheet'"), 'Constants.ts định nghĩa SPRITE_CAMPFIRE_KNIGHT_IDLE');
assert(constantsSrc.includes("PORTRAIT_CAMPFIRE_KNIGHT = 'portrait_campfire_knight'"), 'Constants.ts định nghĩa PORTRAIT_CAMPFIRE_KNIGHT');

const preloadSrc = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
assert(preloadSrc.includes('SPRITE_CAMPFIRE_KNIGHT_PRAY'), 'PreloadScene nạp SPRITE_CAMPFIRE_KNIGHT_PRAY');
assert(preloadSrc.includes('SPRITE_CAMPFIRE_KNIGHT_IDLE'), 'PreloadScene nạp SPRITE_CAMPFIRE_KNIGHT_IDLE');
assert(preloadSrc.includes('PORTRAIT_CAMPFIRE_KNIGHT'), 'PreloadScene nạp PORTRAIT_CAMPFIRE_KNIGHT');

const registryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf8'));
const assetIds = (registryJson.assets || []).map(a => a.assetId);
const entryIds = (registryJson.entries || []).map(e => e.id);

assert(assetIds.includes('HW-AST-CHAR-CAMPFIREKNIGHT-PRAY'), 'Đã đăng ký HW-AST-CHAR-CAMPFIREKNIGHT-PRAY trong content_registry.json');
assert(assetIds.includes('HW-AST-CHAR-CAMPFIREKNIGHT-IDLE'), 'Đã đăng ký HW-AST-CHAR-CAMPFIREKNIGHT-IDLE trong content_registry.json');
assert(assetIds.includes('HW-AST-PORT-CAMPFIREKNIGHT'), 'Đã đăng ký HW-AST-PORT-CAMPFIREKNIGHT trong content_registry.json');
assert(entryIds.includes('HW-NPC-KNIGHT-000001'), 'Đã đăng ký NPC HW-NPC-KNIGHT-000001 (Hiệp Sĩ Canh Lửa) trong content_registry.json');

const registryDataSrc = fs.readFileSync('src/registry/registryData.ts', 'utf8');
assert(registryDataSrc.includes('HW-AST-CHAR-CAMPFIREKNIGHT-PRAY'), 'registryData.ts đồng bộ HW-AST-CHAR-CAMPFIREKNIGHT-PRAY');
assert(registryDataSrc.includes('HW-AST-CHAR-CAMPFIREKNIGHT-IDLE'), 'registryData.ts đồng bộ HW-AST-CHAR-CAMPFIREKNIGHT-IDLE');
assert(registryDataSrc.includes('HW-AST-PORT-CAMPFIREKNIGHT'), 'registryData.ts đồng bộ HW-AST-PORT-CAMPFIREKNIGHT');
assert(registryDataSrc.includes('HW-NPC-KNIGHT-000001'), 'registryData.ts đồng bộ HW-NPC-KNIGHT-000001');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passed} / ${total} BÀI KIỂM THỬ ĐẠT (PASS)`);
console.log('======================================================================');

if (passed !== total) {
  process.exit(1);
}
