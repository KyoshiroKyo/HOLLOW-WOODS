import fs from 'fs';
import assert from 'assert';

console.log('================================================================');
console.log('🌟 KIỂM THỬ TỰ ĐỘNG BƯỚC V15-15: ÁNH SÁNG, SƯƠNG MÙ & Y-SORTING');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// 1. Kiểm tra VeilSystem.ts
const veilCode = fs.readFileSync('src/systems/VeilSystem.ts', 'utf8');
test('VeilSystem.ts: Sương mù rừng sâu chuyển sang sắc xanh xám lạnh (0x6e8a9c)', () => {
  assert(veilCode.includes('isCoolZone'), 'Thiếu biến isCoolZone');
  assert(veilCode.includes('0x6e8a9c'), 'Thiếu sắc tint 0x6e8a9c cho vùng lạnh');
  assert(veilCode.includes('deep_forest') && veilCode.includes('silent_mire') && veilCode.includes('broken_bell_shrine'), 'Thiếu danh sách zone rừng sâu');
});

// 2. Kiểm tra GameScene.ts
const gameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
test('GameScene.ts: updateFogOfWar hòa trộn sương mù lạnh 0x111c24 tại rừng sâu', () => {
  assert(gameSceneCode.includes('0x111c24'), 'Thiếu màu sương mù lạnh 0x111c24');
  assert(gameSceneCode.includes("this.currentZoneId === 'deep_forest'"), 'Thiếu điều kiện zone deep_forest');
});

test('GameScene.ts: setupFireflies hỗ trợ 3 nhóm hạt không khí (ember, spore, firefly)', () => {
  assert(gameSceneCode.includes("type: 'ember'"), 'Thiếu hạt ember (tàn lửa)');
  assert(gameSceneCode.includes("type: 'spore'"), 'Thiếu hạt spore (bào tử sương)');
  assert(gameSceneCode.includes("type: 'firefly'"), 'Thiếu hạt firefly (đom đóm cổ ngữ)');
  assert(gameSceneCode.includes('MAX_FIREFLY_POOL = 65'), 'Thiếu pool 65 hạt');
});

test('GameScene.ts: updateFireflies xử lý vật lý chuyên biệt cho từng loại hạt', () => {
  assert(gameSceneCode.includes("f.type === 'ember'"), 'Thiếu xử lý f.type === ember');
  assert(gameSceneCode.includes("f.type === 'spore'"), 'Thiếu xử lý f.type === spore');
  assert(gameSceneCode.includes('rise'), 'Thiếu cơ chế bay lên của tàn lửa');
});

// 3. Kiểm tra WorldBuilder.ts
const worldBuilderCode = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
test('WorldBuilder.ts: Cửa sổ nhà dân phát quầng sáng ấm hổ phách (windowGlow, depth y - 1)', () => {
  assert(worldBuilderCode.includes('windowGlow'), 'Thiếu windowGlow');
  assert(worldBuilderCode.includes('windowGlow.setDepth(y - 1)'), 'Thiếu windowGlow.setDepth(y - 1)');
});

test('WorldBuilder.ts: Lò rèn Bram phát quầng sáng than hồng rực (forgeGlow, depth y - 1)', () => {
  assert(worldBuilderCode.includes('forgeGlow'), 'Thiếu forgeGlow');
  assert(worldBuilderCode.includes('forgeGlow.setDepth(y - 1)'), 'Thiếu forgeGlow.setDepth(y - 1)');
});

test('WorldBuilder.ts: Trạm gác Garth có đèn lồng ấm (watchGlow, depth y - 1)', () => {
  assert(worldBuilderCode.includes('watchGlow'), 'Thiếu watchGlow');
  assert(worldBuilderCode.includes('watchGlow.setDepth(y - 1)'), 'Thiếu watchGlow.setDepth(y - 1)');
});

test('WorldBuilder.ts: Y-Sorting toàn bộ công trình tuân theo groundBaseY', () => {
  assert(worldBuilderCode.includes('house.setDepth(y)'), 'Thiếu house.setDepth(y)');
  assert(worldBuilderCode.includes('tower.setDepth(y)'), 'Thiếu tower.setDepth(y)');
  assert(worldBuilderCode.includes('smithy.setDepth(y)'), 'Thiếu smithy.setDepth(y)');
  assert(worldBuilderCode.includes('gatehouse.setDepth(y)'), 'Thiếu gatehouse.setDepth(y)');
  assert(worldBuilderCode.includes('tree.setDepth(y)'), 'Thiếu tree.setDepth(y)');
  assert(worldBuilderCode.includes('fence.setDepth(fy)'), 'Thiếu fence.setDepth(fy)');
});

// 4. Kiểm tra SatyrPlayer & NPCEntity Y-Sorting
const playerCode = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');
test('SatyrPlayer.ts: Nhân vật chính tuân theo Y-sorting Math.floor(this.y)', () => {
  assert(playerCode.includes('const targetDepth = Math.floor(this.y)'), 'Thiếu targetDepth Math.floor(this.y)');
  assert(playerCode.includes('this.setDepth(targetDepth)'), 'Thiếu this.setDepth(targetDepth)');
});

const npcCode = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
test('NPCEntity.ts: Toàn bộ NPC tuân theo Y-sorting this.y', () => {
  assert(npcCode.includes('this.setDepth(this.y)'), 'Thiếu this.setDepth(this.y)');
});

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM THỬ V15-15: ${passCount}/${totalCount} BÀI KIỂM TRA ĐẠT (${Math.round((passCount/totalCount)*100)}%)`);
console.log('================================================================\n');

if (passCount !== totalCount) {
  process.exit(1);
}
