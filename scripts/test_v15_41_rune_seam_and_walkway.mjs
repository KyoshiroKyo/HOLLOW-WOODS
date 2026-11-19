import fs from 'fs';

console.log('--- TEST V15-41: KHẮC PHỤC TRIỆT ĐỂ LỖI DỊCH CHUYỂN NGƯỢC & MỞ RỘNG LỐI ĐI TÂY ANCIENT_RUNE_PUZZLE ---');

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

// 1. Kiểm tra Seamless Pairs trong GameScene.ts
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8').replace(/\r\n/g, '\n');
assert(
  gameSceneSrc.includes("'silent_mire:ancient_rune_puzzle'") &&
  gameSceneSrc.includes("'ancient_rune_puzzle:silent_mire'"),
  "GameScene.isSeamlessAdjacentTransition chứa cặp liên kề thông suốt 'ancient_rune_puzzle <-> silent_mire'"
);
assert(
  gameSceneSrc.includes("'ancient_rune_puzzle:broken_bell_shrine'") &&
  gameSceneSrc.includes("'broken_bell_shrine:ancient_rune_puzzle'"),
  "GameScene.isSeamlessAdjacentTransition chứa cặp liên kề thông suốt 'ancient_rune_puzzle <-> broken_bell_shrine'"
);

// 2. Kiểm tra khóa Snapback tự động trong update loop (handleZoneLogic)
assert(
  !gameSceneSrc.includes('this.player.setPosition(safeSpawn.x, safeSpawn.y)'),
  "GameScene.handleZoneLogic ĐÃ KHÓA HOÀN TOÀN lệnh snapback tự động setPosition(safeSpawn) trong vòng lặp di chuyển"
);
assert(
  gameSceneSrc.includes('if (!this.isSeamlessAdjacentTransition(trans.fromZone, trans.toZone))') &&
  gameSceneSrc.includes('const retPoint = trans.returnPoint'),
  "GameScene.executeTransition không snapback vị trí nhân vật khi di chuyển giữa các phân khu liền kề"
);

// 3. Kiểm tra Hysteresis Margin của ancient_rune_puzzle trong WorldBuilder.ts
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8').replace(/\r\n/g, '\n');
assert(
  wbSrc.includes("if (this.activeZoneId === 'ancient_rune_puzzle')") &&
  wbSrc.includes("const margin = 12;"),
  "WorldBuilder.detectCurrentZone đã thu nhỏ margin ranh giới về 12px, không lấn sang cầu ván gỗ phía Tây"
);

// 4. Kiểm tra dữ liệu zones.json
const zData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const zones = Array.isArray(zData) ? zData : zData.zones;
const sm = zones.find(z => z.id === 'silent_mire');
const arp = zones.find(z => z.id === 'ancient_rune_puzzle');

const tsm = arp.transitions.find(t => t.id === 'to_silent_mire_from_puzzle');
assert(
  tsm && tsm.barrierType === 'open' && tsm.triggerRect.x <= 3320,
  "Transition 'to_silent_mire_from_puzzle' mở hoàn toàn (open) và đặt tại X <= 3320"
);

const trp = sm.transitions.find(t => t.id === 'to_rune_puzzle');
assert(
  trp && trp.barrierType === 'open' && trp.triggerRect.x >= 3360,
  "Transition 'to_rune_puzzle' mở hoàn toàn (open) và đặt tại X >= 3360"
);

assert(
  trp.triggerRect.x > (tsm.triggerRect.x + tsm.triggerRect.width),
  "Hai trigger transitions tách biệt, có khoảng đệm chống giằng co lặp trigger"
);

// 5. Kiểm tra chiều rộng lối đi thông thoáng tại X = 3306, Y = 260
const mwn = sm.colliders.find(c => c.id === 'mire_water_north_deep');
const swn = sm.colliders.find(c => c.id === 'sm_water_north');
const mws = sm.colliders.find(c => c.id === 'mire_water_south_deep');

const northWaterBottom = Math.max(mwn.y + mwn.height, swn.y + swn.height);
const southWaterTop = mws.y;
const corridorWidth = southWaterTop - northWaterBottom;

assert(
  northWaterBottom <= 222,
  `Khối nước phía Bắc kết thúc ở Y = ${northWaterBottom} (<= 222px)`
);
assert(
  southWaterTop >= 300,
  `Khối nước phía Nam bắt đầu ở Y = ${southWaterTop} (>= 300px)`
);
assert(
  corridorWidth >= 64,
  `Chiều rộng khe lối đi đạt ${corridorWidth}px (yêu cầu tối thiểu >= 64px)`
);

const walkwayY = 260;
const northMargin = walkwayY - northWaterBottom;
const southMargin = southWaterTop - walkwayY;
assert(
  northMargin >= 30 && southMargin >= 30,
  `Khoảng đệm an toàn chân nhân vật tại Y = 260: Bắc cách ${northMargin}px, Nam cách ${southMargin}px`
);

console.log(`\nKết quả kiểm tra: ${passedTests}/${totalTests} bài kiểm tra thành công!`);
if (passedTests === totalTests) {
  console.log('>> [SUCCESS] BƯỚC V15-41 ĐÃ HOÀN TẤT CHUẨN XÁC 100%!');
}
