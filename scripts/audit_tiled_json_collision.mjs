/**
 * Script Node.js kiểm tra tĩnh rà soát 5 lỗi kỹ thuật đặc trưng của Tiled JSON + Phaser
 * Kiểm tra tính nhất quán giữa Spatial Manifest (zones.json), Tiled JSON maps và WorldBuilder.ts
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('================================================================');
console.log('🔍 AUDITING TILED MAP & COLLISION GEOMETRY (V1.4 - BƯỚC 2)');
console.log('================================================================\n');

// 1. Định vị các file bản đồ và mã nguồn liên quan
const zonesPath = path.join(rootDir, 'src', 'data', 'zones.json');
const wbPath = path.join(rootDir, 'src', 'world', 'WorldBuilder.ts');
const mapsDir = path.join(rootDir, 'src', 'data', 'maps');
const tmxPath = path.join(rootDir, 'staging', 'env_audit', '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)', 'Tiled', 'Tilemaps', 'Beginning Fields.tmx');
const tsxDir = path.join(rootDir, 'staging', 'env_audit', '05_the_fantasy_tileset', 'The Fan-tasy Tileset (Free)', 'Tiled', 'Tilesets');

const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const wbContent = fs.readFileSync(wbPath, 'utf8');

console.log('--- 1. CÁC TÀI NGUYÊN BẢN ĐỒ & MODULE MÃ NGUỒN ---');
console.log(`- Spatial Manifest: src/data/zones.json (${zonesData.zones.length} zones)`);
console.log(`- World Builder Module: src/world/WorldBuilder.ts (${wbContent.split('\n').length} lines)`);
console.log(`- Tiled Reference Map: ${fs.existsSync(tmxPath) ? 'Beginning Fields.tmx (Found)' : 'Not Found'}`);
console.log(`- Tiled Tilesets Directory: ${fs.existsSync(tsxDir) ? 'staging/.../Tilesets (Found)' : 'Not Found'}`);

// 2. Kiểm tra lỗi lệch gốc tọa độ Tiled (Bottom-Left vs Top-Left)
console.log('\n--- 2. LỖI LỆCH GỐC TỌA ĐỘ TILED (BOTTOM-LEFT VS TOP-LEFT) ---');
const originIssues = [];

const bellhollow = zonesData.zones.find(z => z.id === 'bellhollow');
const buildingsToCheck = [
  { id: 'house_edda', name: 'Nhà Edda – Người Giữ Chuông', expectedSpriteBottomY: 130 },
  { id: 'house_neris', name: 'Nhà Neris – Thảo Mộc', expectedSpriteBottomY: 430 },
  { id: 'bell_tower', name: 'Tháp Chuông Làng', expectedSpriteBottomY: 130 }
];

buildingsToCheck.forEach(b => {
  const c = bellhollow.colliders.find(col => col.id === b.id);
  if (!c) {
    originIssues.push({
      id: b.id,
      name: b.name,
      issue: 'Không tìm thấy collider trong zones.json'
    });
    return;
  }

  const colliderBottomY = c.y + c.height;
  const mismatchBottom = Math.abs(b.expectedSpriteBottomY - colliderBottomY);

  if (mismatchBottom > 1) {
    originIssues.push({
      id: b.id,
      name: b.name,
      jsonCoords: `(${c.x}, ${c.y}, w=${c.width}, h=${c.height})`,
      colliderBottomY,
      expectedSpriteBottomY: b.expectedSpriteBottomY,
      verticalMismatch: `${mismatchBottom}px chênh lệch giữa chân sprite và chân collider JSON`,
      consequence: 'Chân công trình bị lệch khiến người chơi đi xuyên qua mặt tiền hoặc bị cản sai vị trí.'
    });
  }
});

console.log(`- Phân tích ${buildingsToCheck.length} công trình trọng điểm tại Bellhollow: ${originIssues.length === 0 ? '✓ 100% khớp chân đế (0 lỗi)' : `❌ Phát hiện ${originIssues.length} lỗi lệch gốc`}`);

// 3. Rà soát vật cản tàng hình (Orphan / Phantom Colliders)
console.log('\n--- 3. RÀ SOÁT VẬT CẢN TÀNG HÌNH (ORPHAN / PHANTOM COLLIDERS) ---');
const phantomColliders = [];

for (const z of zonesData.zones) {
  for (const c of (z.colliders || [])) {
    // Kiểm tra các collider loại 'boundary' chứa 'blocker' mà không được chuẩn hóa thành vật cản vật lý
    if (c.type === 'boundary' && c.id.includes('blocker')) {
      phantomColliders.push({
        zone: z.id,
        id: c.id,
        name: c.name || 'Unnamed Blocker',
        coords: `(${c.x}, ${c.y}, w=${c.width}, h=${c.height})`,
        reason: 'Collider tàng hình loại boundary chặn đường nhưng không có tile tường hiển thị tương ứng'
      });
    }
  }
}

// Kiểm tra lỗi offset -16px của dummy sprite trong WorldBuilder.ts
if (wbContent.includes('setOffset(-w/2') || wbContent.includes('setOffset(-') || wbContent.includes('dummy_phantom')) {
  phantomColliders.push({
    zone: 'bellhollow',
    id: 'dummy_sprite_offset_phantom',
    reason: 'Phát hiện mã nguồn còn chứa setOffset âm trên dummy sprite gây lệch 16px ngoài hiên nhà'
  });
}

console.log(`- Quét vật cản tàng hình: ${phantomColliders.length === 0 ? '✓ Không phát hiện phantom collider nào (0 lỗi)' : `❌ Phát hiện ${phantomColliders.length} phantom colliders`}`);

// 4. Kiểm tra cờ lật GID (Tiled Flip Flags)
console.log('\n--- 4. KIỂM TRA CỜ LẬT GID (TILED FLIP FLAGS) ---');
const flipFlagReport = [];

if (fs.existsSync(tmxPath)) {
  const tmxContent = fs.readFileSync(tmxPath, 'utf8');
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
console.log(`- Kiểm tra bộ nạp Phaser: ${wbContent.includes('getCleanTiledGid') && wbContent.includes('0x1FFFFFFF') ? '✓ Đã tích hợp hàm getCleanTiledGid với bitmask 0x1FFFFFFF (0 lỗi)' : '❌ Thiếu hàm giải mã cờ lật GID'}`);

// 5. Kiểm tra Scale & Kích thước lưới
console.log('\n--- 5. KIỂM TRA SCALE & KÍCH THƯỚC LƯỚI ---');
const wbLines = wbContent.split('\n');
const scaleWithoutRefresh = [];

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

console.log(`- Kiểm tra setScale & refreshBody: ${scaleWithoutRefresh.length === 0 ? '✓ Toàn bộ static physics bodies đều được refreshBody sau setScale (0 lỗi)' : `❌ Phát hiện ${scaleWithoutRefresh.length} vị trí setScale thiếu refreshBody`}`);

// 6. Quét hở biên bản đồ Rừng sâu (Deep Forest Perimeter Gaps)
console.log('\n--- 6. QUÉT HỞ BIÊN BẢN ĐỒ RỪNG SÂU (DEEP FOREST) ---');
const deepForest = zonesData.zones.find(z => z.id === 'deep_forest');
const dfColliders = deepForest.colliders.filter(c => c.type === 'boundary');
const dfTransitions = deepForest.transitions;

const perimeterGaps = [];

// A. Biên Bắc: y = -640, x = 1600 .. 2880
const bTopLeft = dfColliders.find(c => c.id === 'df_bound_top_left');
const pAbyss = dfTransitions.find(t => t.id === 'to_abyssal_chasm');
const bTopRight = dfColliders.find(c => c.id === 'df_bound_top_right');

if (bTopLeft && pAbyss && pAbyss.triggerRect.x > (bTopLeft.x + bTopLeft.width)) {
  perimeterGaps.push({
    edge: 'Biên Bắc (North Perimeter, Y = -640)',
    xRange: `[${bTopLeft.x + bTopLeft.width} .. ${pAbyss.triggerRect.x}]`,
    width: `${pAbyss.triggerRect.x - (bTopLeft.x + bTopLeft.width)} px`,
    cause: 'Khoảng hở giữa mép phải df_bound_top_left và mép trái to_abyssal_chasm'
  });
}

if (bTopRight && pAbyss && bTopRight.x > (pAbyss.triggerRect.x + pAbyss.triggerRect.width)) {
  perimeterGaps.push({
    edge: 'Biên Bắc (North Perimeter, Y = -640)',
    xRange: `[${pAbyss.triggerRect.x + pAbyss.triggerRect.width} .. ${bTopRight.x}]`,
    width: `${bTopRight.x - (pAbyss.triggerRect.x + pAbyss.triggerRect.width)} px`,
    cause: 'Khoảng hở giữa mép phải to_abyssal_chasm và mép trái df_bound_top_right'
  });
}

// B. Biên Đông: x = 2850 .. 2880, y = -640 .. 0
const bRightTop = dfColliders.find(c => c.id === 'df_bound_right_top');
const pMire = dfTransitions.find(t => t.id === 'to_silent_mire_from_df');
const bRightBottom = dfColliders.find(c => c.id === 'df_bound_right_bottom');

if (bRightTop && pMire && pMire.triggerRect.y > (bRightTop.y + bRightTop.height)) {
  perimeterGaps.push({
    edge: 'Biên Đông (East Perimeter, X = 2850..2880)',
    yRange: `[${bRightTop.y + bRightTop.height} .. ${pMire.triggerRect.y}]`,
    width: `${pMire.triggerRect.y - (bRightTop.y + bRightTop.height)} px (cao)`,
    cause: 'Khoảng hở giữa mép dưới df_bound_right_top và mép trên to_silent_mire_from_df'
  });
}

if (bRightBottom && pMire && bRightBottom.y > (pMire.triggerRect.y + pMire.triggerRect.height)) {
  perimeterGaps.push({
    edge: 'Biên Đông (East Perimeter, X = 2850..2880)',
    yRange: `[${pMire.triggerRect.y + pMire.triggerRect.height} .. ${bRightBottom.y}]`,
    width: `${bRightBottom.y - (pMire.triggerRect.y + pMire.triggerRect.height)} px (cao)`,
    cause: 'Khoảng hở giữa mép dưới to_silent_mire_from_df và mép trên df_bound_right_bottom'
  });
}

// C. Biên Nam: y = -25 .. 0, x = 1600 .. 2880
const bBot1 = dfColliders.find(c => c.id === 'df_bound_bottom_left_1');
const pWc = dfTransitions.find(t => t.id === 'to_whispering_clearing');
const bBot2 = dfColliders.find(c => c.id === 'df_bound_bottom_left_2');
const pCp = dfTransitions.find(t => t.id === 'to_crooked_path_from_df');
const bBot3 = dfColliders.find(c => c.id === 'df_bound_bottom_right');

if (bBot1 && pWc && pWc.triggerRect.x > (bBot1.x + bBot1.width)) {
  perimeterGaps.push({
    edge: 'Biên Nam (South Perimeter, Y = -25..0)',
    xRange: `[${bBot1.x + bBot1.width} .. ${pWc.triggerRect.x}]`,
    width: `${pWc.triggerRect.x - (bBot1.x + bBot1.width)} px`,
    cause: 'Khoảng hở giữa mép phải df_bound_bottom_left_1 và mép trái to_whispering_clearing'
  });
}

if (bBot2 && pWc && bBot2.x > (pWc.triggerRect.x + pWc.triggerRect.width)) {
  perimeterGaps.push({
    edge: 'Biên Nam (South Perimeter, Y = -25..0)',
    xRange: `[${pWc.triggerRect.x + pWc.triggerRect.width} .. ${bBot2.x}]`,
    width: `${bBot2.x - (pWc.triggerRect.x + pWc.triggerRect.width)} px`,
    cause: 'Khoảng hở giữa mép phải to_whispering_clearing và mép trái df_bound_bottom_left_2'
  });
}

if (bBot2 && pCp && pCp.triggerRect.x > (bBot2.x + bBot2.width)) {
  perimeterGaps.push({
    edge: 'Biên Nam (South Perimeter, Y = -25..0)',
    xRange: `[${bBot2.x + bBot2.width} .. ${pCp.triggerRect.x}]`,
    width: `${pCp.triggerRect.x - (bBot2.x + bBot2.width)} px`,
    cause: 'Khoảng hở giữa mép phải df_bound_bottom_left_2 và mép trái to_crooked_path_from_df'
  });
}

if (bBot3 && pCp && bBot3.x > (pCp.triggerRect.x + pCp.triggerRect.width)) {
  perimeterGaps.push({
    edge: 'Biên Nam (South Perimeter, Y = -25..0)',
    xRange: `[${pCp.triggerRect.x + pCp.triggerRect.width} .. ${bBot3.x}]`,
    width: `${bBot3.x - (pCp.triggerRect.x + pCp.triggerRect.width)} px`,
    cause: 'Khoảng hở giữa mép phải to_crooked_path_from_df và mép trái df_bound_bottom_right'
  });
}

// D. Hở rào chắn cây rừng cọc viền (WorldBuilder Tree Perimeter Gaps)
const deepForestDecMatch = wbContent.match(/renderDeepForestDecorations\s*\([^)]*\)\s*:\s*void\s*\{([\s\S]*?)(?=\n\s*(?:private|public)\s+)/);
const deepForestDecCode = deepForestDecMatch ? deepForestDecMatch[1] : '';

const hasTreeGapNorth = deepForestDecCode.includes('x += 105') || (deepForestDecCode.includes('x +=') && /x \+=\s*([7-9]\d|\d{3,})/.test(deepForestDecCode));
const hasTreeGapWest = deepForestDecCode.includes('y += 95') || (deepForestDecCode.includes('y +=') && /y \+=\s*([7-9]\d|\d{3,})/.test(deepForestDecCode));

if (hasTreeGapNorth) {
  perimeterGaps.push({
    edge: 'Dãy cây cổ thụ viền Bắc (WorldBuilder renderDeepForestDecorations)',
    width: '> 60px',
    cause: 'Dãy cây rải bước nhảy > 60px tạo khoảng trống lọt người chơi'
  });
}
if (hasTreeGapWest) {
  perimeterGaps.push({
    edge: 'Dãy cây cổ thụ viền Tây (WorldBuilder renderDeepForestDecorations)',
    width: '> 60px',
    cause: 'Dãy cây rải bước nhảy > 60px tạo khoảng trống lọt người chơi'
  });
}

console.log(`- Quét hở biên Rừng Sâu: ${perimeterGaps.length === 0 ? '✓ Đã bịt kín 100% khe hở ranh giới (0 lỗi)' : `❌ Phát hiện ${perimeterGaps.length} vị trí hở biên`}`);

// Ghi dữ liệu ra file audit JSON
const auditResult = {
  scanTimestamp: new Date().toISOString(),
  originIssues,
  phantomColliders,
  flipFlagReport,
  scaleWithoutRefresh,
  perimeterGaps
};

fs.writeFileSync(path.join(rootDir, 'scripts', 'tiled_json_collision_audit_data.json'), JSON.stringify(auditResult, null, 2));

const totalErrors = originIssues.length + phantomColliders.length + scaleWithoutRefresh.length + perimeterGaps.length;

console.log('\n================================================================');
if (totalErrors === 0) {
  console.log('🎉 TẤT CẢ 5 HẠNG MỤC COLLISION ĐỀU ĐẠT CHUẨN! SỐ LỖI CÒN LẠI = 0');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`❌ PHÁT HIỆN TỔNG CỘNG ${totalErrors} LỖI COLLISION!`);
  console.log('================================================================\n');
  process.exit(1);
}
