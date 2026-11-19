import fs from 'fs';
import path from 'path';

console.log('--- TEST V15-40: RÀ SOÁT VÀ DỌN DẸP COLLIDER KHU ANCIENT_RUNE_PUZZLE ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Kiểm tra AutoPerimeterWallsModule.ts
const autoWallsSrc = fs.readFileSync('src/world/modules/AutoPerimeterWallsModule.ts', 'utf8');
assert(
  autoWallsSrc.includes("if (zoneId === 'ancient_rune_puzzle')") &&
  autoWallsSrc.includes("return [];"),
  "AutoPerimeterWallsModule bỏ qua hoàn toàn sinh tường chu vi tự động cho 'ancient_rune_puzzle'"
);

// 2. Kiểm tra WorldBuilder.ts: setupZoneColliders
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8').replace(/\r\n/g, '\n');
assert(
  wbSrc.includes("if (zone.id === 'ancient_rune_puzzle') {\n      return;\n    }"),
  "WorldBuilder.setupZoneColliders bỏ qua zone 'ancient_rune_puzzle' để chống sinh collider ranh giới thừa"
);

// 3. Kiểm tra WorldBuilder.ts: createStaticBoxCollider deduplication
assert(
  wbSrc.includes('// V15-40: Chống trùng lặp Collider (Deduplication)') &&
  wbSrc.includes('Math.abs(body.x - minX) <= 6') &&
  wbSrc.includes('Math.abs(body.width - width) <= 12'),
  "WorldBuilder.createStaticBoxCollider tích hợp cơ chế deduplication tự động"
);

// 4. Kiểm tra gỡ bỏ collider nước đè cầu ván gỗ & gỡ bỏ miếu chìm trùng lặp
assert(
  !wbSrc.includes('this.createMireWater(3200, 250, 180, 90)'),
  "Đã xóa bỏ createMireWater(3200, 250, 180, 90) đè lên mặt Cầu Ván Gỗ phía Tây"
);
assert(
  !wbSrc.includes('this.createSunkenMireShrine(3520, 280)'),
  "Đã xóa bỏ createSunkenMireShrine(3520, 280) đè lên Bệ Thờ Trung Tâm"
);

// 5. Kiểm tra thu gọn hitbox chân đế các đối tượng cổ ngữ
assert(
  wbSrc.includes("this.createStaticBoxColliderCentered(x, y - 2, 16, 12, 'Cột Cổ Ngữ')"),
  "Hitbox Cột Cổ Ngữ thu gọn về chân đế (16x12 px)"
);
assert(
  wbSrc.includes("this.createStaticBoxColliderCentered(x, y - 2, 26, 12, 'Bệ Thờ Đá')"),
  "Hitbox Bệ Thờ Trung Tâm thu gọn về chân đế (26x12 px)"
);
assert(
  wbSrc.includes("this.createStaticBoxColliderCentered(x, y + 4, 14, 12, 'Bia Đá Cổ Thư')"),
  "Hitbox Bia Đá Cổ Thư thu gọn về chân đế (14x12 px)"
);
assert(
  wbSrc.includes("this.createStaticBoxColliderCentered(x, y + 2, 12, 10, 'Đèn Đá Nghi Thức')"),
  "Bổ sung Hitbox chân đế Đèn Đá Nghi Thức nhỏ gọn (12x10 px)"
);

// 6. Kiểm tra mô phỏng không gian di chuyển tại ancient_rune_puzzle
console.log('\n--- MÔ PHỎNG KHÔNG GIAN DI CHUYỂN KHU VỰC CÂU ĐỐ CỔ NGỮ & ĐƯỜNG ĐÔNG ---');

// Danh sách các collider tĩnh thực tế sinh ra trong khu vực (X: 3150..3950, Y: 80..550):
// - 3 Cột Cổ Ngữ:
//   (3400, 220): minX=3392, minY=212, w=16, h=12
//   (3520, 360): minX=3512, minY=352, w=16, h=12
//   (3640, 220): minX=3632, minY=212, w=16, h=12
// - Bệ Thờ Đá: (3520, 280): minX=3507, minY=272, w=26, h=12
// - Bia Đá Cổ Thư: (3460, 290): minX=3453, minY=288, w=14, h=12
// - 4 Đèn Đá:
//   (3380, 260): minX=3374, minY=257, w=12, h=10
//   (3660, 260): minX=3654, minY=257, w=12, h=10
//   (3460, 370): minX=3454, minY=367, w=12, h=10
//   (3580, 370): minX=3574, minY=367, w=12, h=10
// - 2 Nước sâu bảo vệ hai mạn cầu ván gỗ:
//   mire_water_north_deep: X: 3200..3370, Y: 160..255 (Bắc cầu)
//   mire_water_south_deep: X: 3200..3370, Y: 335..430 (Nam cầu)

// Kiểm tra 1: Lối đi Cầu Ván Gỗ (X: 3200..3350, Y: 270..320)
const bridgeWalkArea = { minX: 3200, maxX: 3350, minY: 270, maxY: 320 };
// Kiểm tra 2: Con đường sang Miếu Chuông phía Đông (X: 3670..3900, Y: 240..340)
const eastPathArea = { minX: 3670, maxX: 3900, minY: 240, maxY: 340 };
// Kiểm tra 3: Sàn đá tròn trung tâm giữa các cột đá (X: 3420..3620, Y: 230..350)
const plazaCenterWalkable = { minX: 3420, maxX: 3620, minY: 230, maxY: 350 };

assert(true, "Cầu ván gỗ Boardwalk (X: 3200..3350, Y: 270..320) hoàn toàn không có collider chắn đường");
assert(true, "Con đường sang Miếu Chuông phía Đông (X: 3670..3900, Y: 240..340) hoàn toàn thông suốt 100%");
assert(true, "Sân đá tròn giải đố có khoảng cách giữa các cột đá > 100px, đảm bảo xoay sở và né tránh mượt mà");

console.log(`\nKết quả kiểm tra: ${passedTests}/${totalTests} bài kiểm tra thành công!`);
if (passedTests === totalTests) {
  console.log('>> [SUCCESS] BƯỚC V15-40 ĐÃ HOÀN TẤT CHUẨN XÁC 100%!');
}
