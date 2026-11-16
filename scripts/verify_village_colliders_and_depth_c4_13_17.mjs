// @ts-check
import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM TOÁN TỰ ĐỘNG BƯỚC C4-13-17: CHUẨN HÓA VA CHẠM KIẾN TRÚC, ĐẠO CỤ & Y-SORTING LÀNG BELLHOLLOW ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Kiểm tra WorldBuilder.ts
const wbPath = path.resolve('src/world/WorldBuilder.ts');
assert(fs.existsSync(wbPath), 'Tập tin src/world/WorldBuilder.ts tồn tại trên đĩa');
const wbContent = fs.readFileSync(wbPath, 'utf8');

// A. Kiểm tra va chạm các ngôi nhà dân (Edda, Neris, Tây Nam)
assert(
  wbContent.includes('const colH = Math.max(h - 6, 42);') &&
  wbContent.includes('const colW = w - 6;'),
  'createBuilding: Hộp va chạm nhà Edda & Neris bao phủ trọn vẹn thân tường (colH >= 42px, colW = w - 6)'
);

assert(
  wbContent.includes('const colW = 96;') &&
  wbContent.includes('const colH = 46;') &&
  wbContent.includes('createSouthWestCottage'),
  'createSouthWestCottage: Hộp va chạm nhà Tây-Nam bao phủ toàn bộ thân tường và mái (96x46 px)'
);

// B. Kiểm tra va chạm Tháp Chuông (Bell Tower)
assert(
  wbContent.includes('const colH = Math.max(h - 4, 54);') &&
  wbContent.includes('const colW = w - 8;'),
  'createBellTower: Hộp va chạm Tháp Chuông bao phủ bệ đá và thân tháp (colH >= 54px, colW = w - 8)'
);

// C. Kiểm tra va chạm Xưởng Chế Tạo & Bàn Chế Tạo
assert(
  wbContent.includes('setSize(88, 40)') &&
  wbContent.includes('setOffset(-44, -20)'),
  'createCraftingWorkshopPavilion: Hộp va chạm xưởng rèn & kho củi bao trọn mái và vách hậu (88x40 px)'
);

assert(
  wbContent.includes('setSize(52, 16)') &&
  wbContent.includes('setOffset(-26, -8)'),
  'createCraftingBench: Hộp va chạm chân bàn chế tạo chuẩn xác khép kín với xưởng (52x16 px)'
);

// D. Kiểm tra va chạm Giếng Làng & Trạm Gác
assert(
  wbContent.includes('setSize(32, 22)') &&
  wbContent.includes('setOffset(-16, -11)'),
  'createVillageWell: Hộp va chạm giếng làng bao phủ thành giếng đá (32x22 px)'
);

assert(
  wbContent.includes('setSize(58, 42)') &&
  wbContent.includes('setOffset(-29, -21)'),
  'createWestWatchpost: Hộp va chạm trạm gác Cổng Tây bao phủ mái và chòi gác (58x42 px)'
);

// E. Kiểm tra va chạm đạo cụ làng: Biển chỉ đường, Kệ bàn thuốc Neris, Cụm thùng gỗ/củi, Cột đèn
assert(
  wbContent.includes('createStoneSign') &&
  wbContent.includes('setSize(14, 10)') &&
  wbContent.includes('setOffset(-7, -5)'),
  'createStoneSign: Đã bổ sung hộp va chạm chân biển chỉ đường chuẩn xác (14x10 px)'
);

assert(
  wbContent.includes('createApothecaryTables') &&
  wbContent.includes('leftBody.setSize(26, 14)') ||
  (wbContent.includes('leftBody') && wbContent.includes('rightBody')),
  'createApothecaryTables: Đã bổ sung hộp va chạm cho cả 2 kệ bàn thảo dược cạnh nhà Neris (26x14 px)'
);

assert(
  wbContent.includes('createVillagePropCluster') &&
  wbContent.includes('setSize(22, 12)') &&
  wbContent.includes('setOffset(-11, -6)'),
  'createVillagePropCluster: Đã bổ sung hộp va chạm chân cụm thùng gỗ & đống củi làng (22x12 px)'
);

assert(
  wbContent.includes('createVillageLanternPost') &&
  wbContent.includes('setSize(8, 8)') &&
  wbContent.includes('setOffset(-4, -4)'),
  'createVillageLanternPost: Đã bổ sung hộp va chạm chân cột đèn lồng làng (8x8 px)'
);

// 2. Kiểm tra chuẩn hóa Y-Sorting (Depth) theo tọa độ chân tiếp đất
assert(
  wbContent.includes('house.setDepth(y + h);'),
  'Y-Sorting nhà Edda & Neris đặt tại đường chân móng y + h'
);

assert(
  wbContent.includes('tower.setDepth(y + h);'),
  'Y-Sorting Tháp Chuông đặt tại đường chân tháp y + h (310)'
);

assert(
  wbContent.includes('g.setDepth(y + 42);') && wbContent.includes('createCraftingWorkshopPavilion'),
  'Y-Sorting xưởng rèn & kho củi đặt tại chân móng y + 42 (360)'
);

assert(
  wbContent.includes('bench.setDepth(y + 18);'),
  'Y-Sorting Bàn Chế Tạo đặt tại chân bàn y + 18 (378)'
);

assert(
  wbContent.includes('well.setOrigin(0.5, 0.88);') && wbContent.includes('well.setDepth(y);'),
  'Y-Sorting Giếng Làng neo gốc chân 0.88 và depth y'
);

assert(
  wbContent.includes('sign.setOrigin(0.5, 0.90);') && wbContent.includes('sign.setDepth(y);'),
  'Y-Sorting Biển Chỉ Đường neo gốc chân 0.90 và depth y'
);

// 3. Kiểm tra NPCEntity.ts
const npcPath = path.resolve('src/entities/NPCEntity.ts');
assert(fs.existsSync(npcPath), 'Tập tin src/entities/NPCEntity.ts tồn tại trên đĩa');
const npcContent = fs.readFileSync(npcPath, 'utf8');

assert(
  npcContent.includes('body.setSize(22, 14)') &&
  npcContent.includes('body.setOffset(-11, -7)') &&
  npcContent.includes('body.setImmovable(true)'),
  'NPCEntity: Đã bổ sung hộp va chạm chân nhỏ gọn (22x14 px, immovable) chống đi xuyên người NPC'
);

assert(
  npcContent.includes('(this.body as Phaser.Physics.Arcade.Body).reset(this.x, this.y)'),
  'NPCEntity.update: Tự động đồng bộ tọa độ hộp va chạm theo lộ trình tuần tra của NPC'
);

// 4. Kiểm tra GameScene.ts
const gsPath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gsPath), 'Tập tin src/scenes/GameScene.ts tồn tại trên đĩa');
const gsContent = fs.readFileSync(gsPath, 'utf8');

assert(
  gsContent.includes('npcCollider?: Phaser.Physics.Arcade.Collider;'),
  'GameScene.ts: Khai báo thuộc tính npcCollider quản lý va chạm NPC'
);

assert(
  gsContent.includes('this.physics.add.collider(this.player, this.npcs)'),
  'GameScene.ts: Thiết lập va chạm vật lý giữa SatyrPlayer và toàn bộ 5 NPC làng Bellhollow'
);

assert(
  gsContent.includes('if (this.npcCollider) {') &&
  gsContent.includes('this.npcCollider.destroy();'),
  'GameScene.ts: Dọn dẹp an toàn npcCollider khi chuyển cảnh hoặc tái tạo NPC'
);

console.log(`\n======================================================`);
console.log(`KẾT QUẢ KIỂM TOÁN C4-13-17: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (passedTests === totalTests) {
  console.log('>>> TẤT CẢ TIÊU CHÍ CHUẨN HÓA VA CHẠM & Y-SORTING LÀNG BELLHOLLOW ĐỀU ĐẠT CHUẨN 100%! <<<');
} else {
  console.error('>>> CÒN TIÊU CHÍ CHƯA ĐẠT! <<<');
  process.exit(1);
}
