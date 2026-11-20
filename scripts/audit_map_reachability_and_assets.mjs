/**
 * HOLLOW WOODS V1.5 - BƯỚC V15-49
 * SCRIPT KIỂM TOÁN TỰ ĐỘNG KHẢ NĂNG DI CHUYỂN TRÊN TOÀN BỘ BẢN ĐỒ (BFS NAVIGATION GRID)
 * VÀ RÀ SOÁT 100% ASSET, KÍCH THƯỚC SPRITE, VỊ TRÍ NPC
 * 
 * File: scripts/audit_map_reachability_and_assets.mjs
 */

import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

console.log('================================================================');
console.log('🛡️ HOLLOW WOODS V1.5 — MASTER AUDIT: MAP REACHABILITY & ASSETS (V15-49)');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// PHẦN 1: KIỂM TRA 100% ASSET SPRITESHEET & THỰC THỂ THẬT
// -------------------------------------------------------------
console.log('--- PHẦN 1: KIỂM TRA 100% ASSET & SPRITESHEET THẬT TRONG PUBLIC/ASSETS ---');

function checkPngFile(relPath, minWidth = 1, minHeight = 1) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    return { ok: false, reason: 'File không tồn tại trên đĩa' };
  }
  const stat = fs.statSync(fullPath);
  if (stat.size < 64) {
    return { ok: false, reason: `Dung lượng quá nhỏ (${stat.size} bytes)` };
  }
  const buf = fs.readFileSync(fullPath);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  if (!isPng) {
    return { ok: false, reason: 'Header file không phải chuẩn PNG' };
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (width < minWidth || height < minHeight) {
    return { ok: false, reason: `Kích thước (${width}x${height}) nhỏ hơn yêu cầu (${minWidth}x${minHeight})` };
  }
  return { ok: true, width, height, size: stat.size };
}

// 1.1. Nhân vật chính: Black Knight 4 hướng (The Mossbound Wayfarer)
const wayfarerAssets = [
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_idle.png', name: 'Wayfarer Idle (4 hướng 4x4)', w: 256, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_walk.png', name: 'Wayfarer Walk (4 hướng 6x4)', w: 384, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_run.png', name: 'Wayfarer Run (4 hướng 6x4)', w: 384, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_attack.png', name: 'Wayfarer Attack (4 hướng 6x4)', w: 384, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_hurt.png', name: 'Wayfarer Hurt (4 hướng 3x4)', w: 192, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_death.png', name: 'Wayfarer Death (4 hướng 6x4)', w: 384, h: 256 },
  { path: 'public/assets/characters/mossbound_wayfarer/wayfarer_portrait.png', name: 'Wayfarer Portrait (64x64)', w: 64, h: 64 }
];

wayfarerAssets.forEach(a => {
  const r = checkPngFile(a.path, a.w, a.h);
  assert(r.ok, `${a.name}: ${a.path} [${r.width || 0}x${r.height || 0} px, ${r.size || 0}B]`);
});

// 1.2. Sir Vaelen — Kỵ Sĩ Trầm Mặc (2D_SL_Knight)
const vaelenAssets = [
  { path: 'public/assets/characters/npcs/campfire_knight_pray_sheet.png', name: 'Sir Vaelen Pray Sheet (12 frames 64x64)', w: 768, h: 64 },
  { path: 'public/assets/characters/npcs/campfire_knight_idle_sheet.png', name: 'Sir Vaelen Idle Sheet (8 frames 64x64)', w: 512, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_campfire_knight.png', name: 'Sir Vaelen Portrait (64x64)', w: 64, h: 64 }
];

vaelenAssets.forEach(a => {
  const r = checkPngFile(a.path, a.w, a.h);
  assert(r.ok, `${a.name}: ${a.path} [${r.width || 0}x${r.height || 0} px]`);
});

// 1.3. Dân làng Bellhollow: Garth, Edda, Neris, Bram, Finn (Hợp nhất tại public/assets/characters/npcs/)
const villagerAssets = [
  { path: 'public/assets/characters/npcs/garth_walk_sheet.png', name: 'Garth Walk Sheet (8x4 frames)', w: 512, h: 256 },
  { path: 'public/assets/characters/npcs/npc_garth.png', name: 'Garth Sprite (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_garth.png', name: 'Garth Portrait (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/edda_idle_sheet.png', name: 'Edda Idle Sheet (9 frames 64x64)', w: 576, h: 64 },
  { path: 'public/assets/characters/npcs/npc_edda.png', name: 'Edda Sprite (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_edda.png', name: 'Edda Portrait (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/neris_idle_sheet.png', name: 'Neris Idle Sheet (6 frames 64x64)', w: 384, h: 64 },
  { path: 'public/assets/characters/npcs/npc_neris.png', name: 'Neris Sprite (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_neris.png', name: 'Neris Portrait (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/blacksmith_sheet.png', name: 'Bram Blacksmith Sheet (6 frames 64x64)', w: 384, h: 64 },
  { path: 'public/assets/characters/npcs/npc_blacksmith.png', name: 'Bram Sprite (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_blacksmith.png', name: 'Bram Portrait (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/errand_boy_walk_sheet.png', name: 'Finn Walk Sheet (8x4 frames)', w: 512, h: 256 },
  { path: 'public/assets/characters/npcs/npc_finn.png', name: 'Finn Sprite (64x64)', w: 64, h: 64 },
  { path: 'public/assets/characters/npcs/portrait_finn.png', name: 'Finn Portrait (64x64)', w: 64, h: 64 }
];

villagerAssets.forEach(a => {
  const r = checkPngFile(a.path, a.w, a.h);
  assert(r.ok, `${a.name}: ${a.path} [${r.width || 0}x${r.height || 0} px]`);
});

// 1.4. Boss Miếu Chuông Phế Tích: Kẻ Nuốt Tiếng Chuông (SHADOW Series)
const bossAssets = [
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_idle.png', name: 'Boss Wetlands Idle Sheet (14 frames)', w: 3000, h: 87 },
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_walk.png', name: 'Boss Wetlands Walk Sheet (14 frames)', w: 3000, h: 87 },
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_attack1.png', name: 'Boss Wetlands Attack 1 Sheet (10 frames)', w: 2000, h: 87 },
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_attack2.png', name: 'Boss Wetlands Attack 2 Sheet (9 frames)', w: 2000, h: 87 },
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_hit.png', name: 'Boss Wetlands Hit Frame', w: 200, h: 87 },
  { path: 'public/assets/characters/bosses/wetlands_boss/boss_wetlands_death.png', name: 'Boss Wetlands Death Sheet (33 frames)', w: 8000, h: 87 }
];

bossAssets.forEach(a => {
  const r = checkPngFile(a.path, a.w, a.h);
  assert(r.ok, `${a.name}: ${a.path} [${r.width || 0}x${r.height || 0} px]`);
});

// 1.5. Xác nhận không còn mã vẽ tạm hình học bằng Graphics cho thân thực thể
const satyrPlayerSrc = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');
const npcEntitySrc = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
const bossSrc = fs.readFileSync('src/entities/MireWardenBoss.ts', 'utf8');

assert(!satyrPlayerSrc.includes('fillRect(0, 0, 32, 48)'), 'SatyrPlayer không vẽ khối tạm thay cho sprite');
assert(!npcEntitySrc.includes('fillRect(0, 0, 32, 48)'), 'NPCEntity không vẽ khối tạm thay cho sprite');
assert(!bossSrc.includes('fillRect(0, 0, 64, 64)'), 'MireWardenBoss dùng sprite SHADOW thật, không vẽ hộp giả lập');


// -------------------------------------------------------------
// PHẦN 2: THU THẬP TẤT CẢ STATIC COLLIDERS VÀ TỐI ƯU HÓA BẢN ĐỒ
// -------------------------------------------------------------
console.log('\n--- PHẦN 2: THU THẬP TOÀN BỘ STATIC COLLIDERS TỪ WORLDBUILDER & ZONES ---');

// Tạo mock_phaser và bundle WorldBuilder với esbuild
fs.writeFileSync('scripts/mock_phaser.cjs', 'const EventEmitter = require("events"); module.exports = { Events: { EventEmitter }, GameObjects: {}, Physics: { Arcade: {} } };');

esbuild.buildSync({
  entryPoints: ['src/world/WorldBuilder.ts'],
  outfile: 'temp_wb_audit_bundle.cjs',
  bundle: true,
  format: 'cjs',
  platform: 'node',
  alias: { 'phaser': './scripts/mock_phaser.cjs' }
});

const { WorldBuilder } = await import('../temp_wb_audit_bundle.cjs');

const worldColliders = [];

function createMockSprite(x = 0, y = 0) {
  const body = {
    x, y, width: 32, height: 32, enable: true,
    checkCollision: { none: false, up: true, down: true, left: true, right: true },
    setSize(w, h) { this.width = w; this.height = h; return this; },
    reset(bx, by) { this.x = bx; this.y = by; return this; }
  };
  const target = {
    x, y, name: '', body, visible: true, alpha: 1, depth: 0, originX: 0, originY: 0,
    setName(n) { this.name = n; return this; },
    add() { return this; }
  };
  const proxy = new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      if (prop === 'then') return undefined;
      return () => proxy;
    }
  });
  return proxy;
}

const mockGroup = {
  children: [],
  getChildren() { return this.children; },
  create(x, y) {
    const s = createMockSprite(x, y);
    this.children.push(s);
    worldColliders.push(s);
    return s;
  },
  refresh() {}
};

function createMockProxy() {
  const p = new Proxy(() => p, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      return () => p;
    }
  });
  return p;
}

const mockScene = {
  physics: {
    add: {
      staticGroup() { return mockGroup; },
      group() { return { ...mockGroup, children: [] }; },
      existing() {}
    }
  },
  add: {
    group() { return { add() {}, getChildren() { return []; } }; },
    image: createMockSprite, sprite: createMockSprite, tileSprite: createMockSprite,
    container: createMockSprite, graphics: createMockProxy, text: createMockProxy, particles: createMockProxy
  },
  textures: { exists() { return true; } },
  tweens: { add() {} }
};

const wb = new WorldBuilder(mockScene);
wb.buildWorld();

// Dọn dẹp bundle tạm
fs.unlinkSync('scripts/mock_phaser.cjs');
fs.unlinkSync('temp_wb_audit_bundle.cjs');

console.log(`  -> Thu thập thành công ${worldColliders.length} Static Colliders từ WorldBuilder.`);
assert(worldColliders.length > 200, `WorldBuilder sinh đủ colliders môi trường (${worldColliders.length} >= 200)`);

// 2.2. Kiểm tra Deduplication: Không có 2 collider nào trùng lặp tọa độ & kích cỡ hoàn toàn
let duplicatesFound = 0;
for (let i = 0; i < worldColliders.length; i++) {
  const b1 = worldColliders[i].body;
  const n1 = worldColliders[i].name;
  for (let j = i + 1; j < worldColliders.length; j++) {
    const b2 = worldColliders[j].body;
    const n2 = worldColliders[j].name;
    if (
      Math.abs(b1.x - b2.x) <= 2 &&
      Math.abs(b1.y - b2.y) <= 2 &&
      Math.abs(b1.width - b2.width) <= 2 &&
      Math.abs(b1.height - b2.height) <= 2
    ) {
      duplicatesFound++;
      console.log(`    ⚠️ Trùng lặp: "${n1}" vs "${n2}" tại [x: ${b1.x}, y: ${b1.y}, w: ${b1.width}, h: ${b1.height}]`);
    }
  }
}
assert(duplicatesFound === 0, `Không có collider trùng lặp tọa độ hoặc kích thước (Tìm thấy: ${duplicatesFound})`);

// 2.3. Kiểm tra loại bỏ tường chu vi tự động cho các phân khu mở
const autoPerimeterWallsSrc = fs.readFileSync('src/world/modules/AutoPerimeterWallsModule.ts', 'utf8');
assert(autoPerimeterWallsSrc.includes("zoneId === 'bellhollow'"), 'AutoPerimeterWallsModule bỏ qua bellhollow để giải phóng lối Outer Woods');
assert(autoPerimeterWallsSrc.includes("zoneId === 'ancient_rune_puzzle'"), 'AutoPerimeterWallsModule bỏ qua ancient_rune_puzzle');
assert(autoPerimeterWallsSrc.includes("zoneId === 'deep_forest'"), 'AutoPerimeterWallsModule bỏ qua deep_forest');
assert(autoPerimeterWallsSrc.includes("zoneId === 'crooked_path'"), 'AutoPerimeterWallsModule bỏ qua crooked_path');


// -------------------------------------------------------------
// PHẦN 3: KIỂM TRA VỊ TRÍ ĐỨNG VÀ KHOẢNG TRỐNG TƯƠNG TÁC [E] CỦA NPC
// -------------------------------------------------------------
console.log('\n--- PHẦN 3: KIỂM TRA TỌA ĐỘ ĐỨNG & KHOẢNG TRỐNG MẶT TRƯỚC (>= 48PX) CỦA TOÀN BỘ NPC ---');

const npcsToAudit = [
  { id: 'npc_garth', name: 'Garth — Người Canh Cổng', x: 490, y: 210, facing: 'down' },
  { id: 'npc_edda', name: 'Bà Lão Edda — Người Giữ Chuông', x: 1160, y: 160, facing: 'down' },
  { id: 'npc_neris', name: 'Neris — Thầy Thuốc Thảo Mộc', x: 570, y: 460, facing: 'down' },
  { id: 'npc_bram', name: 'Bram — Thợ Rèn Làng', x: 1230, y: 405, facing: 'down' },
  { id: 'npc_finn', name: 'Finn — Cậu Bé Đưa Tin', x: 660, y: 280, facing: 'down' },
  { id: 'npc_campfire_knight', name: 'Sir Vaelen — Kỵ Sĩ Trầm Mặc', x: 1435, y: 705, facing: 'down' }
];

function isPointBlockedByCollider(px, py) {
  for (const c of worldColliders) {
    const b = c.body;
    if (!b) continue;
    if (px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height) {
      return { blocked: true, name: c.name };
    }
  }
  return { blocked: false };
}

npcsToAudit.forEach(npc => {
  const atPos = isPointBlockedByCollider(npc.x, npc.y);
  assert(!atPos.blocked, `${npc.name} tại (${npc.x}, ${npc.y}) không bị đè lên bất kỳ collider cứng nào`);

  // Kiểm tra khoảng trống đứng trước mặt >= 48px (tại khoảng cách 16px, 32px, 48px)
  const f16 = isPointBlockedByCollider(npc.x, npc.y + 16);
  const f32 = isPointBlockedByCollider(npc.x, npc.y + 32);
  const f48 = isPointBlockedByCollider(npc.x, npc.y + 48);
  const isFrontClear = !f16.blocked && !f32.blocked && !f48.blocked;
  assert(isFrontClear, `${npc.name} có khoảng trống trước mặt >= 48px để người chơi tiếp cận bấm [E]`);
});

// Kiểm tra loại bỏ triệt để offset âm của NPC trong NPCEntity và GameScene
assert(!npcEntitySrc.includes('setOffset(-'), 'NPCEntity không chứa bất kỳ lệnh setOffset âm nào');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(!gameSceneSrc.includes('bramBody.setOffset(-'), 'GameScene không override offset âm cho Bram');


// -------------------------------------------------------------
// PHẦN 4: DỰNG NAVIGATION GRID 16x16 PX & THUẬT TOÁN TÌM ĐƯỜNG BFS
// -------------------------------------------------------------
console.log('\n--- PHẦN 4: NAVIGATION GRID 16x16 PX & THUẬT TOÁN BFS TOÀN BỘ BẢN ĐỒ ---');

const CELL_SIZE = 16;
const WORLD_MIN_X = 0;
const WORLD_MIN_Y = -1280;
const WORLD_MAX_X = 5000;
const WORLD_MAX_Y = 1600;

const COLS = Math.ceil((WORLD_MAX_X - WORLD_MIN_X) / CELL_SIZE);
const ROWS = Math.ceil((WORLD_MAX_Y - WORLD_MIN_Y) / CELL_SIZE);

console.log(`  -> Kích thước Navigation Grid: ${COLS} cột x ${ROWS} dòng (${COLS * ROWS} ô 16x16 px)`);

const navGrid = new Uint8Array(COLS * ROWS); // 0: walkable, 1: blocked

function toGridCoords(wx, wy) {
  return {
    gx: Math.floor((wx - WORLD_MIN_X) / CELL_SIZE),
    gy: Math.floor((wy - WORLD_MIN_Y) / CELL_SIZE)
  };
}

// Đánh dấu các collider tĩnh lên lưới đi bộ
// (Bỏ qua các rào chắn nhiệm vụ có cơ chế mở khóa khi qua ải)
const questGatesToUnlock = ['Cổng Đông', 'Phong Ấn Miếu', 'Bụi Gai U Minh', 'Phong Ấn Cổng Hư Không'];

let totalObstacleCells = 0;
worldColliders.forEach(c => {
  if (c.name && questGatesToUnlock.includes(c.name)) {
    return; // Cổng mở khóa khi thực hiện nhiệm vụ, không tính là tường chặn vĩnh viễn
  }
  const b = c.body;
  if (!b) return;

  const minGx = Math.max(0, Math.floor((b.x - WORLD_MIN_X) / CELL_SIZE));
  const maxGx = Math.min(COLS - 1, Math.floor((b.x + b.width - 1 - WORLD_MIN_X) / CELL_SIZE));
  const minGy = Math.max(0, Math.floor((b.y - WORLD_MIN_Y) / CELL_SIZE));
  const maxGy = Math.min(ROWS - 1, Math.floor((b.y + b.height - 1 - WORLD_MIN_Y) / CELL_SIZE));

  for (let gy = minGy; gy <= maxGy; gy++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const idx = gy * COLS + gx;
      if (navGrid[idx] === 0) {
        navGrid[idx] = 1;
        totalObstacleCells++;
      }
    }
  }
});

console.log(`  -> Số ô vật cản: ${totalObstacleCells} | Số ô tự do (Walkable): ${COLS * ROWS - totalObstacleCells}`);

// Chạy thuật toán BFS từ điểm xuất phát trung tâm Làng Bellhollow (750, 260)
const startCoords = toGridCoords(750, 260);
const startIdx = startCoords.gy * COLS + startCoords.gx;
assert(navGrid[startIdx] === 0, `Điểm xuất phát Làng Bellhollow (750, 260) nằm trên đường đi tự do`);

const visited = new Uint8Array(COLS * ROWS);
const queue = [startCoords];
visited[startIdx] = 1;

let head = 0;
while (head < queue.length) {
  const { gx, gy } = queue[head++];
  const neighbors = [
    { gx: gx + 1, gy },
    { gx: gx - 1, gy },
    { gx, gy: gy + 1 },
    { gx, gy: gy - 1 }
  ];

  for (const n of neighbors) {
    if (n.gx >= 0 && n.gx < COLS && n.gy >= 0 && n.gy < ROWS) {
      const idx = n.gy * COLS + n.gx;
      if (navGrid[idx] === 0 && visited[idx] === 0) {
        visited[idx] = 1;
        queue.push(n);
      }
    }
  }
}

console.log(`  -> BFS quét thành công ${queue.length} ô liên thông từ Làng Bellhollow.`);

// 4.1. Kiểm tra Khả Năng Di Chuyển Thông Suốt tới 100% Phân Khu và Mốc Cốt Truyện
const reachabilityTargets = [
  // 1. Phân khu Làng Bellhollow & các vị trí NPC
  { zone: 'Bellhollow', name: 'Cổng Tây (Garth)', x: 490, y: 210 },
  { zone: 'Bellhollow', name: 'Hiên Nhà Edda', x: 1160, y: 160 },
  { zone: 'Bellhollow', name: 'Hiên Nhà Neris', x: 570, y: 460 },
  { zone: 'Bellhollow', name: 'Xưởng Rèn Bram', x: 1230, y: 405 },
  { zone: 'Bellhollow', name: 'Ngã Ba Finn', x: 660, y: 280 },
  { zone: 'Bellhollow', name: 'Sân Trước Tháp Chuông', x: 900, y: 165 },

  // 2. Phân khu Nông Trại Trú Ẩn (Sanctuary Farm)
  { zone: 'Sanctuary Farm', name: 'Lửa Trại Nông Trại Trú Ẩn', x: 800, y: 750 },

  // 3. Phân khu Rừng Ngoại Vi (Outer Woods) & Trạm Lửa Sir Vaelen
  { zone: 'Outer Woods', name: 'Đường Mòn Rừng Ngoại Vi', x: 1300, y: 650 },
  { zone: 'Trạm Lửa Rừng Tĩnh Lặng', name: 'Sir Vaelen & Bếp Lửa Hồng', x: 1435, y: 705 },

  // 4. Phân khu Đường Mòn Quanh Co (Crooked Path)
  { zone: 'Crooked Path', name: 'Đoạn Rừng Uốn Lượn Crooked Path', x: 2140, y: 150 },
  { zone: 'Crooked Path', name: 'Cầu Gỗ Phụ Xuyên Sương', x: 2740, y: 390 },

  // 5. Phân khu Rừng Sâu (Deep Forest)
  { zone: 'Deep Forest', name: 'Ngõ Nối Nam Rừng Sâu (giải phóng hốc kẹt)', x: 2080, y: -80 },
  { zone: 'Deep Forest', name: 'Vùng Mở Rộng Bắc Rừng Sâu', x: 2240, y: -300 },

  // 6. Phân khu Đầm Lầy Tĩnh Lặng (Silent Mire)
  { zone: 'Silent Mire', name: 'Lối Vào Đầm Lầy Tĩnh Lặng', x: 2880, y: 380 },
  { zone: 'Silent Mire', name: 'Cầu Ván Gỗ & Bãi Đầm Lầy Trung Tâm', x: 3100, y: 380 },

  // 7. Phân khu Miếu Chuông Phế Tích (Ancient Rune Puzzle & Broken Bell Shrine)
  { zone: 'Miếu Chuông Phế Tích', name: 'Quảng Trường Cổ Ngữ (Ancient Rune Plaza)', x: 3450, y: 280 },
  { zone: 'Miếu Chuông Phế Tích', name: 'Đường Dẫn Sang Điện Thờ Miếu Chuông', x: 3800, y: 270 },
  { zone: 'Miếu Chuông Phế Tích', name: 'Phòng Boss Kẻ Nuốt Tiếng Chuông (Broken Bell Shrine)', x: 4400, y: 300 }
];

reachabilityTargets.forEach(tgt => {
  const { gx, gy } = toGridCoords(tgt.x, tgt.y);
  const idx = gy * COLS + gx;
  const isBlocked = navGrid[idx] === 1;
  const isReachable = visited[idx] === 1;

  assert(
    !isBlocked && isReachable,
    `[${tgt.zone}] ${tgt.name} (${tgt.x}, ${tgt.y}) -> THÔNG SUỐT (BFS Reachable = true, Blocked = false)`
  );
});

// -------------------------------------------------------------
// TỔNG KẾT BÁO CÁO KIỂM TOÁN V15-49
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TOÁN BẢN ĐỒ VÀ ASSET (V15-49): ${passedTests}/${totalTests} BÀI KIỂM TRA ĐẠT (${Math.round(passedTests/totalTests*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 100% PHÂN KHU THÔNG SUỐT, 100% ASSET CHUẨN XÁC, KHÔNG CÓ ĐIỂM NGHẼN!');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`⚠️ CÒN ${failedTests} ĐIỂM NGHẼN / LỖI CẦN XỬ LÝ!`);
  console.log('================================================================\n');
  process.exit(1);
}
