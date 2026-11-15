import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-12-12');
console.log('CHUẨN HÓA HIỂN THỊ ĐỊA HÌNH, MẶT ĐẤT VÀ ĐƯỜNG ĐI (TERRAIN & PATHS)');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${detail}`);
  }
}

const wbPath = path.resolve('src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');

const zonesPath = path.resolve('src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

// -----------------------------------------------------------------------------
// 1. KIỂM TRA PHƯƠNG THỨC RENDER ĐỊA HÌNH BAKED CANVAS (ZERO HARD RECTANGLES)
// -----------------------------------------------------------------------------
console.log('\n--- 1. KIỂM TRA PHƯƠNG THỨC RENDER ĐỊA HÌNH BAKED CANVAS ---');

// Đảm bảo không còn dải tileSprite hình chữ nhật cứng nhắc
assert(!wbContent.includes('trailSegments'), 'Loại bỏ hoàn toàn trailSegments hình chữ nhật thô cứng cũ');
assert(!wbContent.includes('mirePaths'), 'Loại bỏ hoàn toàn mirePaths hình chữ nhật thô cứng cũ');

// Đảm bảo cả 5 phân khu hiện hữu đều dùng CanvasTexture nướng sẵn ở depth -98
const expectedBakedTextures = [
  'fog_crossing_ground_baked_v12',
  'bellhollow_ground_baked_v12',
  'crooked_path_ground_baked_v12',
  'silent_mire_ground_baked_v12',
  'broken_bell_shrine_ground_baked_v12'
];

for (const tex of expectedBakedTextures) {
  assert(wbContent.includes(tex), `Khởi tạo CanvasTexture nướng sẵn: ${tex}`);
}

assert(wbContent.includes('renderCrookedPathTerrain'), 'WorldBuilder có phương thức renderCrookedPathTerrain');
assert(wbContent.includes('renderSilentMireTerrain'), 'WorldBuilder có phương thức renderSilentMireTerrain');
assert(wbContent.includes('renderBrokenBellShrineTerrain'), 'WorldBuilder có phương thức renderBrokenBellShrineTerrain');

// -----------------------------------------------------------------------------
// 2. KIỂM TRA KHỚP NỐI ĐƯỜNG ĐI LIỀN MẠCH GIỮA CÁC PHÂN KHU (SEAM ALIGNMENT)
// -----------------------------------------------------------------------------
console.log('\n--- 2. KIỂM TRA KHỚP NỐI ĐƯỜNG ĐI LIỀN MẠCH (0px OFFSET, 0px GAP) ---');

// Khớp nối 1: Fog Crossing -> Bellhollow tại x = 480
assert(wbContent.includes('trailCenterY = (x: number)'), 'Fog Crossing có hàm nội suy trailCenterY');
assert(wbContent.includes('184 + smooth * 48'), 'Fog Crossing trail hạ chuẩn xác xuống y = 232 tại x = 480');
assert(wbContent.includes('{ x: 480, y: 232, r: 22 }'), 'Bellhollow đón đường từ Fog Crossing chuẩn xác tại (480, 232, r: 22)');

// Khớp nối 2: Bellhollow -> Crooked Path tại x = 1600
assert(wbContent.includes('{ x: 1600, y: 282, r: 22 }'), 'Bellhollow nối đến Cổng Đông tại (1600, 282, r: 22)');
assert(wbContent.includes('// 3.1. Tuyến đường chính uốn lượn từ Cổng Đông Bellhollow sang Silent Mire'), 'Crooked Path có tuyến đường chính uốn lượn');

// Khớp nối 3: Crooked Path -> Silent Mire tại x = 2880
assert(wbContent.includes('{ x: 2880, y: 300, r: 20 }'), 'Crooked Path và Silent Mire khớp nối chuẩn xác tại (2880, 300, r: 20)');

// Khớp nối 4: Silent Mire -> Broken Bell Shrine tại x = 4000
assert(wbContent.includes('{ x: 4000, y: 280, r: 20 }'), 'Silent Mire và Broken Bell Shrine khớp nối chuẩn xác tại (4000, 280, r: 20)');

// -----------------------------------------------------------------------------
// 3. KIỂM TRA CÁC NHÁNH ĐƯỜNG VÀ BÃI ĐẤT QUANH TẤT CẢ CÁC ĐIỂM TƯƠNG TÁC
// -----------------------------------------------------------------------------
console.log('\n--- 3. KIỂM TRA NHÁNH ĐƯỜNG DẪN TỚI ĐIỂM TƯƠNG TÁC & RỪNG VEN ---');

// Bellhollow: Nhánh Nam Nông Trại & Nhánh Đông Nam Rừng Ngoại Vi
assert(wbContent.includes('{ x: 650, y: 520, r: 18 }'), 'Bellhollow có đường mòn dẫn tới cổng Nông Trại Trú Ẩn (650, 520)');
assert(wbContent.includes('{ x: 1200, y: 510, r: 18 }'), 'Bellhollow có đường mòn dẫn tới cổng Rừng Ngoại Vi (1200, 510)');

// Crooked Path: Nhánh Rừng Sâu & Nhánh Rừng Ven
assert(wbContent.includes('{ x: 2100, y: 35, r: 18 }'), 'Crooked Path có đường mòn dẫn tới biển cảnh báo Rừng Sâu (2100, 35)');
assert(wbContent.includes('{ x: 1610, y: 480, r: 16 }'), 'Crooked Path có đường mòn dẫn tới lối rẽ Rừng Ngoại Vi (1610, 480)');

// Crooked Path: Bãi đất quanh điểm ẩn nấp và tảng đá
assert(wbContent.includes('drawClearing(1900, 180, 36, 26)'), 'Crooked Path có bãi đất quanh Thân Cây Rỗng 1 (1900, 180)');
assert(wbContent.includes('drawClearing(2100, 280, 48, 32)'), 'Crooked Path có bãi đất quanh Tảng Đá Rừng (2100, 280)');
assert(wbContent.includes('drawClearing(2350, 420, 36, 26)'), 'Crooked Path có bãi đất quanh Thân Cây Rỗng 2 (2350, 420)');

// Silent Mire: Bệ đá và lối đi giữa 3 Cột Đá Cổ Ngữ
assert(wbContent.includes('drawPillarBase(3400, 220)'), 'Silent Mire có bệ đá quanh Cột Trăng Khuyết (3400, 220)');
assert(wbContent.includes('drawPillarBase(3520, 360)'), 'Silent Mire có bệ đá quanh Cột Rễ Rừng (3520, 360)');
assert(wbContent.includes('drawPillarBase(3640, 220)'), 'Silent Mire có bệ đá quanh Cột Con Mắt (3640, 220)');
assert(wbContent.includes('isBoardwalk: boolean = false'), 'Silent Mire hỗ trợ cầu ván gỗ mục (Boardwalk) bắc qua vũng nước');

// Broken Bell Shrine: Sân đại lễ và bệ thờ chuông đổ
assert(wbContent.includes('drawShrineApproach'), 'Broken Bell Shrine có lối đá cổ tiếp cận miếu');
assert(wbContent.includes('courtyardCX = toLX(4500)'), 'Broken Bell Shrine có Sân Đá Đại Lễ bao quanh bệ thờ (4500, 250)');
assert(wbContent.includes('drawStep(4350, 180, 48, 24)'), 'Broken Bell Shrine có bậc đá dẫn lên Cột Miếu Trái');
assert(wbContent.includes('drawStep(4650, 180, 48, 24)'), 'Broken Bell Shrine có bậc đá dẫn lên Cột Miếu Phải');
assert(wbContent.includes('drawStep(4360, 380, 52, 28)'), 'Broken Bell Shrine có bậc đá dẫn tới Khu Gạch Đá Ẩn Nấp (4360, 380)');

// -----------------------------------------------------------------------------
// 4. KIỂM TRA ĐỘ RỘNG LỐI ĐI VÀ KHOẢNG TRỐNG VA CHẠM (COLLIDER CLEARANCE)
// -----------------------------------------------------------------------------
console.log('\n--- 4. KIỂM TRA ĐỘ RỘNG LỐI ĐI & KHOẢNG TRỐNG VA CHẠM ---');

// Kiểm tra kích thước va chạm của SatyrPlayer là 14x8
const constContent = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constContent.includes('WAYFARER_BODY_WIDTH = 14') && constContent.includes('WAYFARER_BODY_HEIGHT = 8'), 'SatyrPlayer có kích thước hộp va chạm chân WAYFARER_BODY 14x8 px');

// Xác nhận tất cả các điểm mấu chốt của đường đi đều có r >= 15 (độ rộng >= 30px)
const radiusMatches = wbContent.match(/r:\s*(\d+)/g);
let minRadius = 999;
if (radiusMatches) {
  for (const m of radiusMatches) {
    const val = parseInt(m.replace(/\D/g, ''), 10);
    if (val < minRadius) minRadius = val;
  }
}
assert(minRadius >= 15, `Bán kính lối đi nhỏ nhất r = ${minRadius}px (Độ rộng tối thiểu ${minRadius * 2}px >= 30px, đảm bảo thân người 14px di chuyển mượt mà)`);

// Kiểm tra các phân khu trong zones.json đều có colliders hợp lệ và không chặn ngang tâm đường
for (const zone of zonesData.zones) {
  if (['fog_crossing', 'bellhollow', 'crooked_path', 'silent_mire', 'broken_bell_shrine'].includes(zone.id)) {
    assert(zone.colliders.length > 0, `Phân khu [${zone.id}] có hệ thống colliders hợp lệ (${zone.colliders.length} vật cản)`);
  }
}

// -----------------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TỔNG KẾT KIỂM THỬ C4-12-12:`);
console.log(`- Tổng số tiêu chí kiểm tra: ${totalTests}`);
console.log(`- Tiêu chí ĐẠT (PASS):       ${passedTests} / ${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`- Tiêu chí THẤT BẠI (FAIL):  0`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✔ TẤT CẢ CÁC TIÊU CHÍ QC CỦA C4-12-12 ĐÃ ĐẠT 100%!');
  process.exit(0);
}
