/**
 * HOLLOW WOODS V3.0 – SCRIPT GHÉP CÔNG TRÌNH KIẾN TRÚC PIXEL ART (PASS T05)
 * Ghép các tile thật từ public/assets/environment/tilesets/:
 *   - castle_timber_frame_wall.png (16×16)
 *   - castle_wood_door_wall.png (16×16)
 *   - castle_roof_thatch.png (64×64)
 *   - castle_roof_red.png (64×64)
 *   - castle_roof_blue.png (64×64)
 *   - castle_tower_red_roof.png (64×64)
 *   - castle_castle_wall_mossy.png (16×16)
 * 
 * Xuất 4 file hoàn chỉnh vào public/assets/environment/sprites/:
 *   - house_edda.png (112×80 px)
 *   - house_neris.png (112×80 px)
 *   - bell_tower.png (80×112 px)
 *   - broken_shrine.png (96×80 px)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();
const TILESET_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'sprites');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. Nạp các tileset thành phần
function loadPng(fileName) {
  const fullPath = path.join(TILESET_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    console.error(`[PASS T05 ERROR] Không tìm thấy tile: ${fullPath}`);
    process.exit(1);
  }
  return PNG.sync.read(fs.readFileSync(fullPath));
}

const tileTimberWall = loadPng('castle_timber_frame_wall.png');      // 16×16
const tileDoorWall = loadPng('castle_wood_door_wall.png');          // 16×16
const roofThatch = loadPng('castle_roof_thatch.png');                // 64×64
const roofRed = loadPng('castle_roof_red.png');                      // 64×64
const roofBlue = loadPng('castle_roof_blue.png');                    // 64×64
const towerRoof = loadPng('castle_tower_red_roof.png');              // 64×64
const tileStoneMossy = loadPng('castle_castle_wall_mossy.png');      // 16×16

console.log('[PASS T05] Đã nạp thành công 7 tileset kiến trúc gốc!');

// 2. Các hàm bổ trợ xử lý pixel
function createBuffer(w, h) {
  const p = new PNG({ width: w, height: h });
  // Mặc định khởi tạo tất cả pixel trong suốt (A = 0)
  p.data.fill(0);
  return p;
}

function setPixel(target, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= target.width || y < 0 || y >= target.height) return;
  const idx = (y * target.width + x) << 2;
  if (a >= 255) {
    target.data[idx] = r;
    target.data[idx + 1] = g;
    target.data[idx + 2] = b;
    target.data[idx + 3] = 255;
  } else if (a > 0) {
    const sa = a / 255;
    const da = target.data[idx + 3] / 255;
    const outA = sa + da * (1 - sa);
    target.data[idx] = Math.round((r * sa + target.data[idx] * da * (1 - sa)) / outA);
    target.data[idx + 1] = Math.round((g * sa + target.data[idx + 1] * da * (1 - sa)) / outA);
    target.data[idx + 2] = Math.round((b * sa + target.data[idx + 2] * da * (1 - sa)) / outA);
    target.data[idx + 3] = Math.round(outA * 255);
  }
}

function fillRect(target, rx, ry, rw, rh, r, g, b, a = 255) {
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      setPixel(target, x, y, r, g, b, a);
    }
  }
}

function blit(target, src, dx, dy, sx = 0, sy = 0, sw = src.width, sh = src.height) {
  for (let y = 0; y < sh; y++) {
    const targetY = dy + y;
    if (targetY < 0 || targetY >= target.height) continue;
    for (let x = 0; x < sw; x++) {
      const targetX = dx + x;
      if (targetX < 0 || targetX >= target.width) continue;

      const srcIdx = ((sy + y) * src.width + (sx + x)) << 2;
      const sa = src.data[srcIdx + 3];
      if (sa === 0) continue;

      setPixel(target, targetX, targetY, src.data[srcIdx], src.data[srcIdx + 1], src.data[srcIdx + 2], sa);
    }
  }
}

function savePng(png, fileName, label) {
  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`✓ [${label}] Đã lưu: ${fileName} (${png.width}×${png.height} px) -> ${outPath}`);
}

// =========================================================================
// 3. TẠO CÔNG TRÌNH 1: house_edda.png (Nhà Thảo Mộc Edda: 112×80 px)
// =========================================================================
function buildHouseEdda() {
  const W = 112;
  const H = 80;
  const house = createBuffer(W, H);

  // A. Lợp mái tranh (Thatch Roof) từ y = 0 đến 47 (cao 48px)
  // Lát lặp thatch texture (64x64) trên vùng 112x48
  for (let ty = 0; ty < 48; ty += 16) {
    for (let tx = 0; tx < W; tx += 16) {
      blit(house, roofThatch, tx, ty, (tx % 64), (ty % 64), 16, 16);
    }
  }

  // Cắt vát mái hình thang cân (A-frame roof slope)
  // Đỉnh mái tại y = 0 hẹp x = 20..91; Đáy mái tại y = 47 x = 0..111
  for (let y = 0; y < 48; y++) {
    const slope = (47 - y) / 47; // 1 tại đỉnh, 0 tại đáy
    const margin = Math.round(slope * 22); // lùi vào 22px ở đỉnh mỗi bên
    for (let x = 0; x < margin; x++) {
      // Xóa pixel bên trái
      const lIdx = (y * W + x) << 2;
      house.data[lIdx + 3] = 0;
      // Xóa pixel bên phải
      const rX = W - 1 - x;
      const rIdx = (y * W + rX) << 2;
      house.data[rIdx + 3] = 0;
    }
    // Viền bóng đổ rìa mái dốc (shadow border)
    if (margin < W / 2) {
      setPixel(house, margin, y, 90, 70, 20, 240);
      setPixel(house, margin + 1, y, 140, 110, 30, 220);
      setPixel(house, W - 1 - margin, y, 70, 50, 15, 240);
      setPixel(house, W - 2 - margin, y, 100, 80, 25, 220);
    }
  }

  // Viền riềm mái rủ xuống tạo bóng râm che tường phía dưới (y = 46..48)
  for (let x = 0; x < W; x++) {
    const idx = (47 * W + x) << 2;
    if (house.data[idx + 3] > 0) {
      setPixel(house, x, 48, 40, 30, 15, 230);
    }
  }

  // B. Xây tường tầng trên (y = 48..63, cao 16px)
  // 7 blocks timber frame wall (16x16)
  for (let col = 0; col < 7; col++) {
    blit(house, tileTimberWall, col * 16, 48);
  }

  // C. Xây tường tầng trệt & cửa gỗ (y = 64..79, cao 16px)
  for (let col = 0; col < 7; col++) {
    if (col === 3) {
      // Cột chính giữa (col = 3, x = 48..63): Cửa gỗ
      blit(house, tileDoorWall, 48, 64);
    } else {
      // Các cột còn lại: tường khung gỗ
      blit(house, tileTimberWall, col * 16, 64);
    }
  }

  // D. Chân móng tường kiên cố và bóng đổ tiếp xúc đất (y = 78..79)
  for (let x = 0; x < W; x++) {
    setPixel(house, x, 78, 45, 40, 35, 120);
    setPixel(house, x, 79, 25, 25, 25, 180);
  }

  savePng(house, 'house_edda.png', 'Nhà Thảo Mộc Edda');
}

// =========================================================================
// 4. TẠO CÔNG TRÌNH 2: house_neris.png (Nhà Canh Gác Neris: 112×80 px)
// =========================================================================
function buildHouseNeris() {
  const W = 112;
  const H = 80;
  const house = createBuffer(W, H);

  // A. Lợp mái ngói đỏ (Red Tile Roof) từ y = 0 đến 47
  for (let ty = 0; ty < 48; ty += 16) {
    for (let tx = 0; tx < W; tx += 16) {
      blit(house, roofRed, tx, ty, (tx % 64), (ty % 64), 16, 16);
    }
  }

  // Vát mái dốc chữ A
  for (let y = 0; y < 48; y++) {
    const slope = (47 - y) / 47;
    const margin = Math.round(slope * 22);
    for (let x = 0; x < margin; x++) {
      const lIdx = (y * W + x) << 2;
      house.data[lIdx + 3] = 0;
      const rX = W - 1 - x;
      const rIdx = (y * W + rX) << 2;
      house.data[rIdx + 3] = 0;
    }
    // Viền bóng mái ngói đỏ
    if (margin < W / 2) {
      setPixel(house, margin, y, 100, 30, 25, 240);
      setPixel(house, margin + 1, y, 150, 45, 35, 220);
      setPixel(house, W - 1 - margin, y, 70, 20, 20, 240);
      setPixel(house, W - 2 - margin, y, 110, 30, 30, 220);
    }
  }

  // Bóng đổ viền mái xuống tường (y = 48)
  for (let x = 0; x < W; x++) {
    const idx = (47 * W + x) << 2;
    if (house.data[idx + 3] > 0) {
      setPixel(house, x, 48, 35, 20, 20, 230);
    }
  }

  // B. Tầng trên (y = 48..63, cao 16px): Khung gỗ
  for (let col = 0; col < 7; col++) {
    blit(house, tileTimberWall, col * 16, 48);
  }

  // C. Tầng trệt kiên cố bằng đá rêu phong ở 2 cánh góc (y = 64..79)
  // Cột 0, 1: Đá rêu phong; Cột 2: Khung gỗ; Cột 3: Cửa gỗ; Cột 4: Khung gỗ; Cột 5, 6: Đá rêu phong
  blit(house, tileStoneMossy, 0, 64);
  blit(house, tileStoneMossy, 16, 64);
  blit(house, tileTimberWall, 32, 64);
  blit(house, tileDoorWall, 48, 64);
  blit(house, tileTimberWall, 64, 64);
  blit(house, tileStoneMossy, 80, 64);
  blit(house, tileStoneMossy, 96, 64);

  // D. Chân móng vững chắc tiếp xúc nền đất
  for (let x = 0; x < W; x++) {
    setPixel(house, x, 78, 40, 35, 35, 130);
    setPixel(house, x, 79, 20, 20, 25, 190);
  }

  savePng(house, 'house_neris.png', 'Nhà Canh Gác Neris');
}

// =========================================================================
// 5. TẠO CÔNG TRÌNH 3: bell_tower.png (Tháp Chuông Làng Bellhollow: 80×112 px)
// =========================================================================
function buildBellTower() {
  const W = 80;
  const H = 112;
  const tower = createBuffer(W, H);

  // A. Chóp nón ngói đỏ trên đỉnh (y = 0..39, cao 40px)
  // Trích xuất chóp nón từ towerRoof (64×64), căn giữa tại x = 8..71
  // towerRoof có chóp nón ở y: 0..35, x: 0..63
  blit(tower, towerRoof, 8, 4, 0, 0, 64, 36);

  // Thêm chóp kim loại / giá treo chuông trên đỉnh nón (x: 39..40, y: 0..3)
  setPixel(tower, 39, 0, 218, 165, 32, 255);
  setPixel(tower, 40, 0, 218, 165, 32, 255);
  setPixel(tower, 39, 1, 184, 134, 11, 255);
  setPixel(tower, 40, 1, 184, 134, 11, 255);
  setPixel(tower, 38, 2, 139, 69, 19, 255);
  setPixel(tower, 39, 2, 205, 133, 63, 255);
  setPixel(tower, 40, 2, 205, 133, 63, 255);
  setPixel(tower, 41, 2, 139, 69, 19, 255);

  // B. Buồng treo chuông cổ (Bell Chamber, y = 40..71, cao 32px)
  // 1. Cột đá rêu 2 bên mép tháp: Cột 0 (x: 8..23) và Cột 4 (x: 56..71)
  blit(tower, tileStoneMossy, 8, 40);
  blit(tower, tileStoneMossy, 8, 56);
  blit(tower, tileStoneMossy, 56, 40);
  blit(tower, tileStoneMossy, 56, 56);

  // 2. Không gian buồng chuông mở (x: 24..55, y: 40..71): Nền tối sâu thẳm
  fillRect(tower, 24, 40, 32, 32, 22, 24, 28, 255);

  // 3. Xà ngang gỗ chịu lực treo chuông (y: 42..44, x: 24..55)
  fillRect(tower, 24, 42, 32, 3, 90, 60, 35, 255);
  // Dây xích sắt treo chuông ở giữa (x: 39..40, y: 45..49)
  setPixel(tower, 39, 45, 100, 105, 115, 255);
  setPixel(tower, 40, 45, 140, 145, 155, 255);
  setPixel(tower, 39, 46, 120, 125, 135, 255);
  setPixel(tower, 40, 46, 90, 95, 105, 255);
  setPixel(tower, 39, 47, 100, 105, 115, 255);
  setPixel(tower, 40, 47, 140, 145, 155, 255);
  setPixel(tower, 39, 48, 120, 125, 135, 255);
  setPixel(tower, 40, 48, 90, 95, 105, 255);

  // 4. QUẢ CHUÔNG ĐỒNG CỔ (The Ancient Bronze Bell) - x: 32..47, y: 49..67 (rộng 16px, cao 19px)
  // Đỉnh chuông (y: 49..51, rộng 8px, x: 36..43)
  fillRect(tower, 36, 49, 8, 3, 160, 120, 40, 255);
  // Thân chuông phình ra (y: 52..59, rộng 12px, x: 34..45)
  fillRect(tower, 34, 52, 12, 8, 184, 134, 30, 255);
  // Vành miệng chuông loe rộng (y: 60..64, rộng 16px, x: 32..47)
  fillRect(tower, 32, 60, 16, 4, 150, 105, 25, 255);
  // Rìa viền và hoa văn chuông đồng
  fillRect(tower, 31, 63, 18, 2, 218, 165, 32, 255);
  // Lưỡi chuông nhô ra phía dưới (x: 39..40, y: 65..67)
  setPixel(tower, 39, 65, 100, 70, 20, 255);
  setPixel(tower, 40, 65, 120, 85, 30, 255);
  setPixel(tower, 39, 66, 130, 90, 30, 255);
  setPixel(tower, 40, 66, 110, 80, 25, 255);
  setPixel(tower, 39, 67, 160, 110, 35, 255);
  setPixel(tower, 40, 67, 140, 95, 30, 255);

  // Lan can đá trước buồng chuông (y: 68..71, x: 24..55)
  for (let x = 24; x < 56; x++) {
    const isPost = (x % 6 === 0);
    setPixel(tower, x, 68, 70, 75, 70, 255);
    setPixel(tower, x, 69, isPost ? 90 : 50, isPost ? 95 : 55, isPost ? 90 : 50, 255);
    setPixel(tower, x, 70, 60, 65, 60, 255);
    setPixel(tower, x, 71, 40, 45, 40, 255);
  }

  // C. Thân tháp và chân tháp bằng đá rêu kiên cố (y = 72..111, cao 40px)
  // 5 cột x 16px = 80px
  for (let col = 0; col < 5; col++) {
    blit(tower, tileStoneMossy, col * 16, 72);
    blit(tower, tileStoneMossy, col * 16, 88);
    // Hàng chân tháp y: 104..111 (cắt 8px)
    blit(tower, tileStoneMossy, col * 16, 104, 0, 0, 16, 8);
  }

  // Cửa vòm đá dẫn vào tháp ở chân (x: 32..47, y: 88..111)
  // Khung vòm cửa
  for (let y = 88; y <= 111; y++) {
    for (let x = 32; x <= 47; x++) {
      if (y === 88 && (x <= 33 || x >= 46)) continue; // bo tròn góc vòm trên
      setPixel(tower, x, y, 18, 20, 22, 255); // bóng tối bên trong tháp
    }
  }
  // Viền đá đẽo quanh vòm cửa
  for (let x = 33; x <= 46; x++) {
    setPixel(tower, x, 87, 85, 95, 80, 255);
  }

  // D. Chân tháp bám đất sương mù
  for (let x = 0; x < W; x++) {
    setPixel(tower, x, 110, 35, 40, 35, 140);
    setPixel(tower, x, 111, 20, 22, 20, 210);
  }

  savePng(tower, 'bell_tower.png', 'Tháp Chuông Làng Bellhollow');
}

// =========================================================================
// 6. TẠO CÔNG TRÌNH 4: broken_shrine.png (Miếu Chuông Đổ Nát: 96×80 px)
// =========================================================================
function buildBrokenShrine() {
  const W = 96;
  const H = 80;
  const shrine = createBuffer(W, H);

  // A. Mái miếu cổ sụp đổ (y = 0..31, cao 32px)
  // 1. Phía bên trái (x = 8..47): Mảng mái ngói xanh cổ phủ rêu phong dốc nghiêng
  for (let ty = 8; ty < 32; ty += 16) {
    for (let tx = 8; tx < 48; tx += 16) {
      blit(shrine, roofBlue, tx, ty, (tx % 64), (ty % 64), 16, 16);
    }
  }
  // Cắt vát mái trái
  for (let y = 0; y < 32; y++) {
    const leftMargin = Math.round((31 - y) * 0.4);
    for (let x = 0; x < 8 + leftMargin; x++) {
      const idx = (y * W + x) << 2;
      shrine.data[idx + 3] = 0;
    }
  }

  // 2. Phía bên phải (x = 48..87): Mái đã sụp đổ, trơ xà gỗ mục và đá vụn gãy nham nhở
  // Các đầu xà gỗ mục gãy nhô ra
  fillRect(shrine, 48, 12, 14, 4, 80, 55, 30, 255);
  fillRect(shrine, 48, 20, 22, 4, 70, 50, 25, 255);
  fillRect(shrine, 48, 26, 8, 3, 60, 45, 20, 255);
  // Đá vụn rơi trên xà
  setPixel(shrine, 62, 11, 95, 105, 90, 255);
  setPixel(shrine, 63, 11, 110, 120, 105, 255);
  setPixel(shrine, 70, 19, 90, 100, 85, 255);
  setPixel(shrine, 71, 19, 80, 90, 75, 255);

  // B. Trụ cột đá rêu phong nâng đỡ miếu (y = 32..63, cao 32px)
  // Cột trái nguyên vẹn (x: 12..27, y: 32..63)
  blit(shrine, tileStoneMossy, 12, 32);
  blit(shrine, tileStoneMossy, 12, 48);

  // Cột phải bị gãy vụn ở lưng chừng (x: 68..83)
  // Phần cột còn lại ở dưới (y: 48..63)
  blit(shrine, tileStoneMossy, 68, 48);
  // Phần đỉnh cột bị vỡ nham nhở (y: 44..47)
  fillRect(shrine, 68, 44, 10, 4, 75, 85, 70, 255);
  fillRect(shrine, 72, 41, 4, 3, 85, 95, 80, 255);

  // Vách đá phong hóa phía sau bàn thờ (x: 28..67, y: 32..63)
  fillRect(shrine, 28, 32, 40, 32, 28, 32, 30, 220);
  // Dây leo và rêu phong rủ từ trần xuống vách
  for (let x = 28; x < 68; x += 4) {
    const vineLen = 6 + (x % 11);
    for (let vy = 32; vy < 32 + vineLen; vy++) {
      setPixel(shrine, x, vy, 40, 85, 45, 230);
      setPixel(shrine, x + 1, vy + 1, 30, 70, 35, 200);
    }
  }

  // C. Bệ thờ đá trung tâm đặt Lưỡi Chuông Cổ (y = 56..79, cao 24px)
  // Bệ đá tế lễ 3 bậc uy nghiêm (x: 20..75)
  // Bậc 1 (y: 68..79, rộng 56px, x: 20..75)
  fillRect(shrine, 20, 68, 56, 12, 60, 68, 62, 255);
  // Viền đá bệ dưới
  fillRect(shrine, 18, 70, 60, 2, 85, 95, 85, 255);

  // Bậc 2 (y: 62..67, rộng 44px, x: 26..69)
  fillRect(shrine, 26, 62, 44, 6, 75, 85, 78, 255);
  fillRect(shrine, 24, 63, 48, 2, 100, 115, 100, 255);

  // Bậc 3 - Bàn đặt bảo vật (y: 56..61, rộng 32px, x: 32..63)
  fillRect(shrine, 32, 56, 32, 6, 90, 100, 92, 255);
  fillRect(shrine, 30, 57, 36, 2, 120, 135, 120, 255);

  // D. Biểu tượng Lưỡi Chuông Cổ trên bệ thờ (The Bell Clapper Relic pedestal)
  // Hốc thờ trung tâm tỏa ánh sáng huyền bí (x: 44..51, y: 50..55)
  fillRect(shrine, 44, 50, 8, 6, 184, 134, 11, 240);
  fillRect(shrine, 45, 51, 6, 4, 218, 165, 32, 255);
  setPixel(shrine, 47, 49, 255, 223, 0, 255);
  setPixel(shrine, 48, 49, 255, 223, 0, 255);

  // Đá vụn rơi vương vãi trên nền đất hoang tàn
  setPixel(shrine, 80, 72, 90, 100, 90, 255);
  setPixel(shrine, 81, 72, 110, 120, 110, 255);
  setPixel(shrine, 81, 73, 70, 80, 70, 255);
  setPixel(shrine, 84, 75, 85, 95, 85, 255);
  setPixel(shrine, 14, 74, 90, 100, 90, 255);
  setPixel(shrine, 15, 74, 110, 120, 110, 255);

  // Chân bệ thờ tiếp xúc nền đầm lầy sương mù
  for (let x = 0; x < W; x++) {
    const idx = (78 * W + x) << 2;
    if (shrine.data[idx + 3] > 0) {
      setPixel(shrine, x, 78, 30, 35, 30, 140);
      setPixel(shrine, x, 79, 15, 18, 16, 200);
    }
  }

  savePng(shrine, 'broken_shrine.png', 'Miếu Chuông Đổ Nát');
}

// 7. Chạy lắp ráp toàn bộ 4 công trình
console.log('[PASS T05] Bắt đầu lắp ráp 4 công trình kiến trúc pixel art...');
buildHouseEdda();
buildHouseNeris();
buildBellTower();
buildBrokenShrine();
console.log('[PASS T05] Hoàn thành lắp ráp xuất sắc 4 công trình kiến trúc!');

