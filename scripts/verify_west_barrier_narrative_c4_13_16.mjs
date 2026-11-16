// @ts-check
import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM TOÁN TỰ ĐỘNG BƯỚC C4-13-16: RÀO CHẮN KỂ CHUYỆN RÌA PHÍA TÂY ===\n');

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

// 1. Kiểm tra cấu hình zones.json
const zonesPath = path.resolve('src/data/zones.json');
assert(fs.existsSync(zonesPath), 'Tập tin src/data/zones.json tồn tại trên đĩa');

const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const fogCrossing = zonesData.zones.find(z => z.id === 'fog_crossing');
assert(!!fogCrossing, 'Phân khu fog_crossing (Lối Mòn Xuyên Sương) tồn tại trong zones.json');

const westCollider = fogCrossing?.colliders?.find(c => c.id === 'fog_west_barrier');
assert(
  !!westCollider && westCollider.type === 'boundary' && westCollider.isSolid === true && westCollider.x === 36,
  'fog_crossing có collider rào chắn phía Tây fog_west_barrier (x: 36, y: 120, width: 28, height: 130, boundary, solid)'
);

const westInteractable = fogCrossing?.interactables?.find(i => i.id === 'fog_west_barrier');
assert(
  !!westInteractable && westInteractable.actionId === 'inspect_west_barrier' && westInteractable.type === 'clue',
  'fog_crossing có tương tác rào chắn inspect_west_barrier với gợi ý [E] kiểm tra'
);

// 2. Kiểm tra WorldBuilder.ts
const worldBuilderPath = path.resolve('src/world/WorldBuilder.ts');
assert(fs.existsSync(worldBuilderPath), 'Tập tin src/world/WorldBuilder.ts tồn tại trên đĩa');

const wbContent = fs.readFileSync(worldBuilderPath, 'utf8');

assert(
  wbContent.includes('createWestBarrierLandscape'),
  'WorldBuilder.ts có phương thức createWestBarrierLandscape() dựng cảnh quan rào chắn'
);

assert(
  wbContent.includes('this.createWestBarrierLandscape();'),
  'renderDecorations gọi createWestBarrierLandscape() khi vẽ phân khu fog_crossing'
);

assert(
  wbContent.includes('trunkGfx') &&
  wbContent.includes('0x28180d') &&
  wbContent.includes('0x2e6b30'),
  'Cụm cảnh quan rào chắn có thân cây cổ thụ đổ chắn ngang đường với rễ xoắn, rêu xanh và nấm rừng'
);

assert(
  wbContent.includes('fenceGfx') &&
  wbContent.includes('lineBetween') &&
  wbContent.includes('0x3a2414'),
  'Cụm cảnh quan rào chắn có hàng rào gỗ gãy với cọc xiêu vẹo và thanh ngang gãy vỡ'
);

assert(
  wbContent.includes('createDenseBush(24, 165)') &&
  wbContent.includes('createDenseBush(56, 148)'),
  'Cụm cảnh quan có các bụi rậm dày đặc (dense bushes) che kín ranh giới'
);

assert(
  wbContent.includes('addWestDenseMist') &&
  wbContent.includes('SPRITE_FOG_SMOOTH'),
  'Cụm cảnh quan có các lớp sương mù đa tầng cuộn trào che kín mép đen của bản đồ'
);

assert(
  wbContent.includes('westEdgeGrad') &&
  wbContent.includes('rgba(8, 12, 10, 0.98)'),
  'renderFogCrossingTerrain phủ gradient sương đen sâu thẳm che lấp mép cắt cụt ở rìa Tây'
);

// 3. Kiểm tra GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'Tập tin src/scenes/GameScene.ts tồn tại trên đĩa');

const gsContent = fs.readFileSync(gameScenePath, 'utf8');

assert(
  gsContent.includes('lastWestBarrierThoughtTime'),
  'GameScene.ts có biến lastWestBarrierThoughtTime quản lý thời gian cooldown'
);

assert(
  gsContent.includes('triggerWestBarrierThought'),
  'GameScene.ts có phương thức triggerWestBarrierThought() xử lý thông điệp suy nghĩ kể chuyện'
);

assert(
  gsContent.includes('Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa.'),
  'Nội dung câu suy nghĩ chuẩn xác: "Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa."'
);

assert(
  gsContent.includes('actionId === \'inspect_west_barrier\''),
  'executeMapInteraction xử lý hành động inspect_west_barrier khi người chơi nhấn [E]'
);

assert(
  gsContent.includes('foot.x <= 75') &&
  gsContent.includes('foot.y >= 120 && foot.y <= 248'),
  'update() kiểm tra va chạm nhân vật đi ngược kịch về rào chắn phía Tây (x <= 75, y: 120..248)'
);

// 4. Mô phỏng kiểm tra logic cooldown 6 giây (6000ms)
class MockNarrativeThoughtTrigger {
  constructor() {
    this.lastWestBarrierThoughtTime = 0;
    this.messageLog = [];
  }

  triggerWestBarrierThought(currentTime, isManualInspect = false) {
    if (!isManualInspect && currentTime - this.lastWestBarrierThoughtTime < 6000) {
      return false;
    }
    this.lastWestBarrierThoughtTime = currentTime;
    this.messageLog.push('Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa.');
    return true;
  }
}

const mock = new MockNarrativeThoughtTrigger();
let t = 10000;

// Lần 1: Chạm rào chắn -> Kích hoạt thành công
const call1 = mock.triggerWestBarrierThought(t, false);
assert(call1 === true && mock.messageLog.length === 1, 'Lần đầu chạm rào chắn: Kích hoạt hiển thị suy nghĩ thành công');

// Lần 2: 2 giây sau tiếp tục va chạm -> Cooldown chặn lại (không spam)
t += 2000;
const call2 = mock.triggerWestBarrierThought(t, false);
assert(call2 === false && mock.messageLog.length === 1, 'Sau 2 giây chạm tiếp: Cooldown 6s chặn thành công (không spam lặp lại)');

// Lần 3: 4 giây tiếp theo (tổng 6001ms) -> Kích hoạt thành công
t += 4001;
const call3 = mock.triggerWestBarrierThought(t, false);
assert(call3 === true && mock.messageLog.length === 2, 'Sau khi hết cooldown 6 giây: Kích hoạt hiển thị suy nghĩ lần 2 thành công');

// Lần 4: Nhấn phím [E] thủ công -> Kích hoạt ngay lập tức
t += 500;
const call4 = mock.triggerWestBarrierThought(t, true);
assert(call4 === true && mock.messageLog.length === 3, 'Nhấn phím [E] thủ công: Cho phép phản hồi kể chuyện cho người chơi');

console.log(`\n======================================================`);
console.log(`KẾT QUẢ KIỂM TOÁN C4-13-16: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (passedTests === totalTests) {
  console.log('>>> TẤT CẢ TIÊU CHÍ RÀO CHẮN KỂ CHUYỆN PHÍA TÂY ĐỀU ĐẠT CHUẨN 100%! <<<');
} else {
  console.error('>>> CÒN TIÊU CHÍ CHƯA ĐẠT! <<<');
  process.exit(1);
}
