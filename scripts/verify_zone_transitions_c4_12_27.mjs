/**
 * HOLLOW WOODS V1.2 - COMMAND C4-12-27 VERIFICATION SUITE
 * Kiểm tra và ổn định toàn bộ các điểm chuyển vùng qua lại giữa các phân khu thế giới
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details}`);
    failCount++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.2 - COMMAND C4-12-27 ZONE TRANSITION VERIFICATION  ');
console.log('   (KIỂM TRA & ỔN ĐỊNH CÁC ĐIỂM CHUYỂN VÙNG THẾ GIỚI HYBRID OPEN WORLD)');
console.log('======================================================================\n');

// 1. Kiểm tra Pre-Backup Integrity
console.log('--- TEST GROUP 1: KIỂM TRA BẢN SAO LƯU AN TOÀN TRƯỚC KHI SỬA ---');
const backupDir = 'Backups/C4-12-27_PRE_BACKUP';
assert(fs.existsSync(backupDir), 'Thư mục backup C4-12-27_PRE_BACKUP tồn tại');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'zones.json đã được sao lưu');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'WorldBuilder.ts đã được sao lưu');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'ZoneConnectionRegistry.ts đã được sao lưu');
assert(fs.existsSync(path.join(backupDir, 'WorldGatingSystem.ts')), 'WorldGatingSystem.ts đã được sao lưu');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'GameScene.ts đã được sao lưu');
assert(fs.existsSync(path.join(backupDir, 'CameraSystem.ts')), 'CameraSystem.ts đã được sao lưu');

// 2. Kiểm tra định nghĩa 22 Transitions trong zones.json
console.log('\n--- TEST GROUP 2: KIỂM TRA ĐỊNH NGHĨA 22 TRANSITIONS TRONG ZONES.JSON ---');
const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
let totalTransitions = 0;
const transitionMap = new Map();

for (const zone of zonesJson.zones) {
  totalTransitions += zone.transitions.length;
  for (const t of zone.transitions) {
    transitionMap.set(t.id, t);
  }
}
assert(totalTransitions === 22, `Đúng 22 transitions được định nghĩa trong zones.json (Thực tế: ${totalTransitions})`);

const expectedTransitions = [
  { id: 'to_bellhollow', from: 'fog_crossing', to: 'bellhollow', facing: 'right' },
  { id: 'to_fog_crossing', from: 'bellhollow', to: 'fog_crossing', facing: 'left' },
  { id: 'to_sanctuary_farm', from: 'bellhollow', to: 'sanctuary_farm', facing: 'down' },
  { id: 'to_bellhollow_from_farm', from: 'sanctuary_farm', to: 'bellhollow', facing: 'up' },
  { id: 'to_outer_woods', from: 'bellhollow', to: 'outer_woods', facing: 'down' },
  { id: 'to_bellhollow_from_ow', from: 'outer_woods', to: 'bellhollow', facing: 'up' },
  { id: 'to_outer_woods_from_farm', from: 'sanctuary_farm', to: 'outer_woods', facing: 'right' },
  { id: 'to_farm_from_ow', from: 'outer_woods', to: 'sanctuary_farm', facing: 'left' },
  { id: 'to_crooked_path', from: 'bellhollow', to: 'crooked_path', facing: 'right' },
  { id: 'to_bellhollow_from_cp', from: 'crooked_path', to: 'bellhollow', facing: 'left' },
  { id: 'to_crooked_path_from_ow', from: 'outer_woods', to: 'crooked_path', facing: 'right' },
  { id: 'to_outer_woods_from_cp', from: 'crooked_path', to: 'outer_woods', facing: 'left' },
  { id: 'to_deep_forest', from: 'crooked_path', to: 'deep_forest', facing: 'up' },
  { id: 'to_crooked_path_from_df', from: 'deep_forest', to: 'crooked_path', facing: 'down' },
  { id: 'to_silent_mire', from: 'crooked_path', to: 'silent_mire', facing: 'right' },
  { id: 'to_crooked_path_from_sm', from: 'silent_mire', to: 'crooked_path', facing: 'left' },
  { id: 'to_silent_mire_from_df', from: 'deep_forest', to: 'silent_mire', facing: 'right' },
  { id: 'to_deep_forest_from_sm', from: 'silent_mire', to: 'deep_forest', facing: 'left' },
  { id: 'to_rune_puzzle', from: 'silent_mire', to: 'ancient_rune_puzzle', facing: 'right' },
  { id: 'to_silent_mire_from_puzzle', from: 'ancient_rune_puzzle', to: 'silent_mire', facing: 'left' },
  { id: 'to_shrine', from: 'silent_mire', to: 'broken_bell_shrine', facing: 'right' },
  { id: 'to_silent_mire_from_shrine', from: 'broken_bell_shrine', to: 'silent_mire', facing: 'left' }
];

for (const exp of expectedTransitions) {
  const t = transitionMap.get(exp.id);
  assert(!!t, `Transition ID [${exp.id}] tồn tại`);
  if (t) {
    assert(t.fromZone === exp.from && t.toZone === exp.to, `[${exp.id}] kết nối đúng [${exp.from} -> ${exp.to}]`);
    assert(t.triggerRect && t.triggerRect.width > 0 && t.triggerRect.height > 0, `[${exp.id}] có triggerRect hợp lệ`);
    assert(t.targetSpawn && typeof t.targetSpawn.x === 'number' && typeof t.targetSpawn.y === 'number', `[${exp.id}] có targetSpawn hợp lệ`);
    assert(t.returnPoint && typeof t.returnPoint.x === 'number' && typeof t.returnPoint.y === 'number', `[${exp.id}] có returnPoint an toàn`);

    // Kiểm tra targetSpawn nằm trọn vẹn trong toZone bounds
    const toZoneData = zonesJson.zones.find(z => z.id === t.toZone);
    if (toZoneData) {
      const b = toZoneData.bounds;
      const inBounds = t.targetSpawn.x >= b.x && t.targetSpawn.x <= b.x + b.width &&
                       t.targetSpawn.y >= b.y && t.targetSpawn.y <= b.y + b.height;
      assert(inBounds, `[${exp.id}] targetSpawn (${t.targetSpawn.x}, ${t.targetSpawn.y}) nằm trong bounds ${t.toZone}`);
    }

    // Kiểm tra returnPoint nằm trọn vẹn trong fromZone bounds
    const fromZoneData = zonesJson.zones.find(z => z.id === t.fromZone);
    if (fromZoneData) {
      const b = fromZoneData.bounds;
      const inBounds = t.returnPoint.x >= b.x && t.returnPoint.x <= b.x + b.width &&
                       t.returnPoint.y >= b.y && t.returnPoint.y <= b.y + b.height;
      assert(inBounds, `[${exp.id}] returnPoint (${t.returnPoint.x}, ${t.returnPoint.y}) nằm an toàn trong bounds ${t.fromZone}`);
    }
  }
}

// 3. Kiểm tra tính Hai Chiều (Two-Way Links) giữa tất cả các phân khu kề cận
console.log('\n--- TEST GROUP 3: TÍNH HAI CHIỀU (TWO-WAY BIDIRECTIONAL LINKS) ---');
const twoWayPairs = [
  ['fog_crossing', 'bellhollow'],
  ['bellhollow', 'sanctuary_farm'],
  ['bellhollow', 'outer_woods'],
  ['sanctuary_farm', 'outer_woods'],
  ['bellhollow', 'crooked_path'],
  ['outer_woods', 'crooked_path'],
  ['crooked_path', 'deep_forest'],
  ['crooked_path', 'silent_mire'],
  ['deep_forest', 'silent_mire'],
  ['silent_mire', 'ancient_rune_puzzle'],
  ['silent_mire', 'broken_bell_shrine']
];

for (const [z1, z2] of twoWayPairs) {
  const forward = Array.from(transitionMap.values()).find(t => t.fromZone === z1 && t.toZone === z2);
  const reverse = Array.from(transitionMap.values()).find(t => t.fromZone === z2 && t.toZone === z1);
  assert(!!forward, `Có tuyến đi từ [${z1}] sang [${z2}] (ID: ${forward?.id})`);
  assert(!!reverse, `Có tuyến về từ [${z2}] sang [${z1}] (ID: ${reverse?.id})`);
}

// 4. Kiểm tra mã nguồn GameScene.ts về cơ chế chuyển vùng & chống lặp (Debounce)
console.log('\n--- TEST GROUP 4: CƠ CHẾ CHỐNG LẶP (DEBOUNCE / COOLDOWN) & HƯỚNG NHÌN TRONG GAMESCENE ---');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(gameSceneContent.includes('transitionCooldown: number = 0'), 'GameScene khai báo transitionCooldown');
assert(gameSceneContent.includes('isTransitioning: boolean = false'), 'GameScene khai báo cờ isTransitioning');
assert(gameSceneContent.includes('checkZoneTransitions(delta)'), 'GameScene gọi checkZoneTransitions trong vòng lặp update');
assert(gameSceneContent.includes('executeTransition(trans)'), 'GameScene cài đặt phương thức executeTransition');
assert(gameSceneContent.includes('resolveTransitionFacing(trans)'), 'GameScene cài đặt phương thức resolveTransitionFacing');
assert(gameSceneContent.includes('applyCameraBoundsForZone'), 'GameScene cài đặt phương thức applyCameraBoundsForZone');
assert(gameSceneContent.includes('this.transitionCooldown = 1500'), 'Đặt cooldown 1.5s chống kích hoạt lặp liên tục');
assert(gameSceneContent.includes('this.player.setFacing(targetFacing)'), 'Đặt hướng nhìn chuẩn xác tại vùng đích');
assert(gameSceneContent.includes('this.player.setPosition(trans.targetSpawn.x, trans.targetSpawn.y)'), 'Đặt tọa độ nhân vật chính xác tại targetSpawn');
assert(gameSceneContent.includes('this.player.setVelocity(0, 0)'), 'Reset vận tốc về 0 khi chuyển vùng tránh trôi');

// 5. Kiểm tra an toàn khi vùng đích bị khóa hoặc chờ hoàn thiện
console.log('\n--- TEST GROUP 5: AN TOÀN KHI VÙNG ĐÍCH BỊ KHÓA HOẶC CHỜ HOÀN THIỆN ---');
assert(gameSceneContent.includes('this.player.setPosition(retPoint.x, retPoint.y)'), 'Đẩy lùi nhân vật về returnPoint an toàn khi bị khóa');
assert(gameSceneContent.includes('this.uiScene.showPopupMessage'), 'Hiển thị thông báo popup lý do phong ấn và gợi ý mở khóa');
assert(gameSceneContent.includes('this.transitionCooldown = 1200'), 'Đặt cooldown 1.2s chống spam thông báo khi chạm rào chắn');
assert(gameSceneContent.includes('this.audioManager.playInteract()'), 'Phát âm thanh phản hồi cảnh báo khi bị chặn');

// 6. Kiểm tra cập nhật Camera Bounds & Physics Bounds
console.log('\n--- TEST GROUP 6: CẬP NHẬT CAMERA BOUNDS & PHYSICS BOUNDS CHUẨN XÁC ---');
assert(gameSceneContent.includes("this.physics.world.setBounds(0, -700, 5000, 1850)"), 'Giới hạn physics bounds mở rộng cho Deep Forest (y: -700)');
assert(gameSceneContent.includes("this.cameraSystem.setWorldBounds({ x: 0, y: -700, width: 5000, height: 1850 })"), 'Camera bounds mở rộng cho Deep Forest');
assert(gameSceneContent.includes("this.physics.world.setBounds(0, -250, 5000, 1400)"), 'Giới hạn physics bounds chuẩn cho các vùng còn lại');
assert(gameSceneContent.includes("this.cameraSystem.setWorldBounds({ x: 0, y: -250, width: 5000, height: 1400 })"), 'Camera bounds chuẩn cho các vùng còn lại');

// 7. Kiểm tra WorldBuilder API mở rộng
console.log('\n--- TEST GROUP 7: WORLDBUILDER TRANSITION API ---');
const worldBuilderContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');
assert(worldBuilderContent.includes('public getTransitions(): TransitionZone[]'), 'WorldBuilder có phương thức getTransitions');
assert(worldBuilderContent.includes('public getTransitionById(id: string): TransitionZone | undefined'), 'WorldBuilder có phương thức getTransitionById');

// 8. Tổng kết kết quả kiểm thử
console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ C4-12-27: ${passCount} / ${passCount + failCount} TIÊU CHÍ ĐẠT (${failCount === 0 ? '100% ĐẠT CHUẨN' : 'CẦN KHẮC PHỤC'})`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
