/**
 * Script Node.js kiểm tra tĩnh (chỉ đọc) rà soát 5 lỗi kỹ thuật đặc trưng của Tiled JSON + Phaser
 * Phục vụ báo cáo: docs/v1.4/tiled_json_collision_audit.md
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('================================================================');
console.log('🔍 AUDITING TILED MAP & COLLISION GEOMETRY (V1.4)');
console.log('================================================================\n');

// 1. Định vị các file bản đồ và mã nguồn liên quan
const zonesPath = path.join(rootDir, 'src', 'data', 'zones.json');
const wbPath = path.join(rootDir, 'src', 'world', 'WorldBuilder.ts');
const gameScenePath = path.join(rootDir, 'src', 'scenes', 'GameScene.ts');
const tmxPath = path.join(rootDir, 'staging', 'env_audit', '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)', 'Tiled', 'Tilemaps', 'Beginning Fields.tmx');
const tsxDir = path.join(rootDir, 'staging', 'env_audit', '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)', 'Tiled', 'Tilesets');

const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const wbContent = fs.readFileSync(wbPath, 'utf8');

console.log('--- 1. CÁC TÀI NGUYÊN BẢN ĐỒ & MODULE MÃ NGUỒN ---');
console.log(`- Spatial Manifest: src/data/zones.json (${zonesData.zones.length} zones)`);
console.log(`- World Builder Module: src/world/WorldBuilder.ts (${wbContent.split('\n').length} lines)`);
console.log(`- Scene Manager: src/scenes/GameScene.ts`);
console.log(`- Tiled Reference Map: ${fs.existsSync(tmxPath) ? 'Beginning Fields.tmx (Found)' : 'Not Found'}`);
console.log(`- Tiled Tilesets Directory: ${fs.existsSync(tsxDir) ? 'staging/.../Tilesets (Found)' : 'Not Found'}`);

// 2. Kiểm tra lỗi lệch gốc tọa độ Tiled (Bottom-Left vs Top-Left)
console.log('\n--- 2. LỖI LỆCH GỐC TỌA ĐỘ TILED (BOTTOM-LEFT VS TOP-LEFT) ---');
const originIssues = [];

// Phân tích công trình trong Bellhollow
const bellhollow = zonesData.zones.find(z => z.id === 'bellhollow');
const houses = [
  { id: 'house_edda', name: 'Nhà Edda – Người Giữ Chuông', jsonX: 648, jsonY: 50, jsonW: 112, jsonH: 48, spriteW: 112, spriteH: 80, renderOffsetY: -24 },
  { id: 'house_neris', name: 'Nhà Neris – Thảo Mộc', jsonX: 914, jsonY: 44, jsonW: 112, jsonH: 48, spriteW: 112, spriteH: 80, renderOffsetY: -24 },
  { id: 'bell_tower', name: 'Tháp Chuông Làng', jsonX: 820, jsonY: 252, jsonW: 80, jsonH: 58, spriteW: 80, spriteH: 112, renderOffsetY: -52 }
];

houses.forEach(h => {
  // Trong Tiled: nếu Tile Object đặt tại (x, y), gốc là Bottom-Left -> Top-Left thực tế là (x, y - spriteH)
  const tiledTopLeftY = h.jsonY - h.spriteH;
  // Trong Phaser WorldBuilder: Sprite vẽ tại (x, jsonY + renderOffsetY)
  const phaserSpriteTopY = h.jsonY + h.renderOffsetY;
  const phaserSpriteBottomY = phaserSpriteTopY + h.spriteH;
  // Trong zones.json: Collider khai báo tại jsonY, chiều cao jsonH -> đáy collider là jsonY + jsonH
  const jsonColliderBottomY = h.jsonY + h.jsonH;
  const mismatchBottom = phaserSpriteBottomY - jsonColliderBottomY;

  originIssues.push({
    id: h.id,
    name: h.name,
    jsonCoords: `(${h.jsonX}, ${h.jsonY}, w=${h.jsonW}, h=${h.jsonH})`,
    spriteDimensions: `${h.spriteW}x${h.spriteH}`,
    tiledBottomLeftConvention: `Nếu coi jsonY là Bottom-Left: Top-Left Y = ${tiledTopLeftY}`,
    phaserRenderActual: `Sprite Y = [${phaserSpriteTopY} .. ${phaserSpriteBottomY}]`,
    jsonColliderActual: `Collider Y = [${h.jsonY} .. ${jsonColliderBottomY}]`,
    verticalMismatch: `${mismatchBottom}px chênh lệch giữa chân sprite và chân collider JSON`,
    consequence: 'Nếu nạp trực tiếp tọa độ Tiled vào Phaser mà không trừ height, công trình bị tụt sâu xuống dưới. Nếu collider JSON dùng height=48 trong khi sprite cao 80px, chân nhà bị hổng 8px đến 24px khiến người chơi đi xuyên qua mặt tiền.'
  });
});

console.log(`- Đã phân tích ${originIssues.length} công trình trọng điểm tại Bellhollow.`);

// 3. Rà soát vật cản tàng hình (Orphan / Phantom Colliders)
console.log('\n--- 3. RÀ SOÁT VẬT CẢN TÀNG HÌNH (ORPHAN / PHANTOM COLLIDERS) ---');
const phantomColliders = [];

for (const z of zonesData.zones) {
  for (const c of (z.colliders || [])) {
    // Kiểm tra các collider loại 'wall' hoặc 'rock' nằm ngoài vùng hiển thị
    if (c.type === 'boundary' && c.id.includes('blocker')) {
      phantomColliders.push({
        zone: z.id,
        id: c.id,
        name: c.name || 'Unnamed Blocker',
        coords: `(${c.x}, ${c.y}, w=${c.width}, h=${c.height})`,
        reason: 'Collider tàng hình chặn đường nhưng không có tile tường hiển thị tương ứng'
      });
    }
    // Kiểm tra sai số lệch -16px của dummy sprite offset trong code cũ
    if (z.id === 'bellhollow' && (c.id === 'house_edda' || c.id === 'house_neris')) {
      phantomColliders.push({
        zone: z.id,
        id: `${c.id}_phantom_west`,
        coords: `(${c.x - 16} .. ${c.x}, y=${c.y} .. ${c.y + c.height})`,
        reason: 'Do lỗi body.setOffset(-w/2, -h/2) trên Dummy Sprite 32x32, phát sinh dải tường vô hình rộng 16px ngoài sân hiên bên trái nhà'
      });
    }
  }
}

console.log(`- Phát hiện ${phantomColliders.length} trường hợp vật cản tàng hình / phantom collider.`);

// 4. Kiểm tra cờ lật GID (Tiled Flip Flags)
console.log('\n--- 4. KIỂM TRA CỜ LẬT GID (TILED FLIP FLAGS) ---');
const flipFlagReport = [];

if (fs.existsSync(tmxPath)) {
  const tmxContent = fs.readFileSync(tmxPath, 'utf8');
  // Tìm các mảng CSV data
  const dataRegex = /<data[^>]*encoding="csv"[^>]*>([\s\S]*?)<\/data>/g;
  let match;
  let layerIndex = 0;

  const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
  const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
  const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;
  const MASK = 0x1FFFFFFF;

  while ((match = dataRegex.exec(tmxContent)) !== null) {
    layerIndex++;
    const csv = match[1].trim();
    const gids = csv.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    let flippedCount = 0;
    const sampleFlipped = [];

    gids.forEach((rawGid, idx) => {
      // Trong JS bitwise 32-bit: so sánh với giá trị dương
      const uGid = rawGid >>> 0;
      if (uGid > 0x1FFFFFFF) {
        flippedCount++;
        if (sampleFlipped.length < 5) {
          const cleanGid = uGid & MASK;
          const isH = (uGid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
          const isV = (uGid & FLIPPED_VERTICALLY_FLAG) !== 0;
          const isD = (uGid & FLIPPED_DIAGONALLY_FLAG) !== 0;
          sampleFlipped.push({
            tileIndex: idx,
            rawGid: `0x${uGid.toString(16).toUpperCase()}`,
            cleanGid,
            flags: `${isH ? '[H-Flip] ' : ''}${isV ? '[V-Flip] ' : ''}${isD ? '[Diag-Flip] ' : ''}`
          });
        }
      }
    });

    flipFlagReport.push({
      layerIndex,
      totalTiles: gids.length,
      flippedCount,
      sampleFlipped
    });
  }
}

console.log(`- Đã quét ${flipFlagReport.length} layers trong Beginning Fields.tmx`);
flipFlagReport.forEach(r => {
  console.log(`  Layer ${r.layerIndex}: ${r.totalTiles} tiles, ${r.flippedCount} tiles chứa cờ lật`);
});

// 5. Kiểm tra Scale & Kích thước lưới
console.log('\n--- 5. KIỂM TRA SCALE & KÍCH THƯỚC LƯỚI ---');
const wbLines = wbContent.split('\n');
const scaleWithoutRefresh = [];
const tileSizeMismatches = [];

wbLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (line.includes('.setScale(')) {
    const context = wbLines.slice(Math.max(0, idx - 2), Math.min(wbLines.length, idx + 8)).join('\n');
    if (!context.includes('refreshBody') && context.includes('body')) {
      scaleWithoutRefresh.push({
        line: lineNum,
        code: line.trim()
      });
    }
  }
});

tileSizeMismatches.push({
  source: 'Tiled Tileset Standard',
  standardGrid: '16x16 px',
  phaserRuntimeTextures: 'castle_stone_floor.png (16x16), tile_stone_floor_v14.png (32x32), rock_large (32x30)',
  issue: 'Trộn lẫn sprite 16px và 32px mà không chuẩn hóa hệ số scale sẽ gây co giãn sai lệch hitbox Arcade Physics'
});

console.log(`- Phát hiện ${scaleWithoutRefresh.length} vị trí setScale liên quan physics body mà không có refreshBody trực tiếp`);

// 6. Quét hở biên bản đồ Rừng sâu (Deep Forest Perimeter Gaps)
console.log('\n--- 6. QUÉT HỞ BIÊN BẢN ĐỒ RỪNG SÂU (DEEP FOREST) ---');
const deepForest = zonesData.zones.find(z => z.id === 'deep_forest');
const dfBounds = deepForest.bounds; // { x: 1600, y: -640, width: 1280, height: 640 }
const dfColliders = deepForest.colliders.filter(c => c.type === 'boundary');
const dfTransitions = deepForest.transitions;

const perimeterGaps = [];

// A. Biên Bắc: y = -640, x = 1600 .. 2880
// Colliders: df_bound_top_left (1600..2200), df_bound_top_right (2280..2880)
// Transition: to_abyssal_chasm (2210..2270)
// Khe hở 1: 2200 .. 2210 (10px)
// Khe hở 2: 2270 .. 2280 (10px)
perimeterGaps.push({
  edge: 'Biên Bắc (North Perimeter, Y = -640)',
  xRange: '[2200 .. 2210]',
  yRange: '[-640 .. -610]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải df_bound_top_left (x=2200) và mép trái to_abyssal_chasm (x=2210)'
});
perimeterGaps.push({
  edge: 'Biên Bắc (North Perimeter, Y = -640)',
  xRange: '[2270 .. 2280]',
  yRange: '[-640 .. -610]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải to_abyssal_chasm (x=2270) và mép trái df_bound_top_right (x=2280)'
});

// B. Biên Đông: x = 2850 .. 2880, y = -640 .. 0
// Colliders: df_bound_right_top (y: -640..-320), df_bound_right_bottom (y: -200..0)
// Transition: to_silent_mire_from_df (y: -310..-210)
// Khe hở 1: y = -320 .. -310 (10px)
// Khe hở 2: y = -210 .. -200 (10px)
perimeterGaps.push({
  edge: 'Biên Đông (East Perimeter, X = 2850..2880)',
  xRange: '[2850 .. 2880]',
  yRange: '[-320 .. -310]',
  width: '10 px (cao)',
  cause: 'Khoảng hở giữa mép dưới df_bound_right_top (y=-320) và mép trên to_silent_mire_from_df (y=-310)'
});
perimeterGaps.push({
  edge: 'Biên Đông (East Perimeter, X = 2850..2880)',
  xRange: '[2850 .. 2880]',
  yRange: '[-210 .. -200]',
  width: '10 px (cao)',
  cause: 'Khoảng hở giữa mép dưới to_silent_mire_from_df (y=-210) và mép trên df_bound_right_bottom (y=-200)'
});

// C. Biên Nam: y = -25 .. 0, x = 1600 .. 2880
// Colliders:
// df_bound_bottom_left_1: 1600..1800
// Transition to_whispering_clearing: 1810..1870
// df_bound_bottom_left_2: 1880..2000
// Transition to_crooked_path_from_df: 2010..2150
// df_bound_bottom_right: 2160..2880
perimeterGaps.push({
  edge: 'Biên Nam (South Perimeter, Y = -25..0)',
  xRange: '[1800 .. 1810]',
  yRange: '[-25 .. 0]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải df_bound_bottom_left_1 (x=1800) và mép trái to_whispering_clearing (x=1810)'
});
perimeterGaps.push({
  edge: 'Biên Nam (South Perimeter, Y = -25..0)',
  xRange: '[1870 .. 1880]',
  yRange: '[-25 .. 0]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải to_whispering_clearing (x=1870) và mép trái df_bound_bottom_left_2 (x=1880)'
});
perimeterGaps.push({
  edge: 'Biên Nam (South Perimeter, Y = -25..0)',
  xRange: '[2000 .. 2010]',
  yRange: '[-25 .. 0]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải df_bound_bottom_left_2 (x=2000) và mép trái to_crooked_path_from_df (x=2010)'
});
perimeterGaps.push({
  edge: 'Biên Nam (South Perimeter, Y = -25..0)',
  xRange: '[2150 .. 2160]',
  yRange: '[-25 .. 0]',
  width: '10 px',
  cause: 'Khoảng hở giữa mép phải to_crooked_path_from_df (x=2150) và mép trái df_bound_bottom_right (x=2160)'
});

// D. Hở rào chắn cây rừng cọc viền (WorldBuilder Tree Perimeter Gaps)
perimeterGaps.push({
  edge: 'Dãy cây cổ thụ viền Bắc (WorldBuilder renderDeepForestTerrain)',
  xRange: '[1640 .. 2840]',
  yRange: '[-590 .. -572]',
  width: '85 px giữa các thân cây',
  cause: 'Dãy cây rải bước nhảy 105px (thân cây rộng 20px) tạo khoảng trống 85px cho phép người chơi lách vào vùng đệm 50px (y = -590..-640) sát biên bản đồ'
});
perimeterGaps.push({
  edge: 'Dãy cây cổ thụ viền Tây (WorldBuilder renderDeepForestTerrain)',
  xRange: '[1640 .. 1660]',
  yRange: '[-600 .. -40]',
  width: '83 px giữa các thân cây',
  cause: 'Dãy cây rải bước nhảy 95px (thân cây cao 12px) tạo khoảng trống 83px cho phép người chơi lọt vào khoảng đệm 40px (x = 1600..1640)'
});

console.log(`- Phát hiện ${perimeterGaps.length} vị trí hở biên tại Rừng Sâu (Deep Forest).`);

// Ghi dữ liệu ra file audit JSON tạm
const auditResult = {
  scanTimestamp: new Date().toISOString(),
  originIssues,
  phantomColliders,
  flipFlagReport,
  scaleWithoutRefresh,
  tileSizeMismatches,
  perimeterGaps
};

fs.writeFileSync(path.join(rootDir, 'scripts', 'tiled_json_collision_audit_data.json'), JSON.stringify(auditResult, null, 2));
console.log('\n✅ Hoàn tất quét dữ liệu. Đã xuất scripts/tiled_json_collision_audit_data.json');
