import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'G:/HOLLOW WOODS';
const zonesJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/zones.json'), 'utf8'));
const worldBuilderSrc = fs.readFileSync(path.join(ROOT, 'src/world/WorldBuilder.ts'), 'utf8');
const gameSceneSrc = fs.readFileSync(path.join(ROOT, 'src/scenes/GameScene.ts'), 'utf8');
const inventorySrc = fs.readFileSync(path.join(ROOT, 'src/systems/InventorySystem.ts'), 'utf8');

const bellhollowZone = zonesJson.zones.find((z) => z.id === 'bellhollow');
const fogCrossingZone = zonesJson.zones.find((z) => z.id === 'fog_crossing');

// 1. Tập hợp toàn bộ hộp va chạm vật lý (Arcade Physics static bodies) trong làng Bellhollow (x: 480..1600, y: 0..564)
const colliders = [
  // Biên giới Bắc - Nam từ zones.json (type === 'boundary')
  { id: 'fence_top', x: 480, y: 10, w: 1120, h: 24 },
  { id: 'fence_bottom', x: 480, y: 540, w: 1120, h: 24 },

  // Nhà cửa & Công trình chính trong WorldBuilder.ts
  { id: 'house_edda', x: 648 + 4, y: 50 + 48 - 22, w: 104, h: 22 },
  { id: 'house_neris', x: 914 + 4, y: 44 + 48 - 22, w: 104, h: 22 },
  { id: 'bell_tower', x: 820 + 5, y: 252 + 58 - 24, w: 70, h: 24 },
  { id: 'village_well', x: 726 - 13, y: 374 - 9, w: 26, h: 18 },
  { id: 'crafting_pavilion_backwall', x: 936 + 42 - 41, y: 318 + 30 - 8, w: 82, h: 16 },
  { id: 'crafting_bench', x: 960 + 18 - 24, y: 360 + 7 - 9, w: 48, h: 18 },
  { id: 'west_watchpost', x: 504 + 32 - 28, y: 136 + 36 - 9, w: 56, h: 18 },
  { id: 'sw_cottage', x: 516 + 51 - 47, y: 376 + 38 - 10, w: 94, h: 20 },

  // Hàng rào gỗ có collider (withCollider = true)
  { id: 'fence_west_1', x: 510 + 23 - 21, y: 290 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_west_2', x: 556 + 23 - 21, y: 290 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_north_mid_1', x: 778 + 23 - 21, y: 92 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_north_mid_2', x: 826 + 23 - 21, y: 92 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_garden_south_1', x: 1030 + 23 - 21, y: 482 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_garden_south_2', x: 1078 + 23 - 21, y: 482 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_east_lane_1', x: 1060 + 23 - 21, y: 236 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_east_lane_2', x: 1108 + 23 - 21, y: 236 - 4 - 5, w: 42, h: 10 },
  { id: 'fence_east_lane_3', x: 1156 + 23 - 21, y: 236 - 4 - 5, w: 42, h: 10 },

  // 2 Trụ Cổng Rừng Phía Đông (Outer Woods Gate Pillars)
  { id: 'east_gate_north_pillar', x: 1485 - 9, y: 240 - 4 - 7, w: 18, h: 14 },
  { id: 'east_gate_south_pillar', x: 1485 - 9, y: 322 - 4 - 7, w: 18, h: 14 }
];

// Bổ sung collider gốc cây (withCollider = true)
const treeColliders = [
  { x: 504, y: 64, v: 'oak2' },
  { x: 604, y: 68, v: 'oak3' },
  { x: 794, y: 54, v: 'oak1' },
  { x: 886, y: 64, v: 'oak2' },
  { x: 1068, y: 58, v: 'oak2' },
  { x: 1184, y: 72, v: 'oak3' },
  { x: 1308, y: 74, v: 'dead' },
  { x: 1424, y: 76, v: 'oak3' },
  { x: 594, y: 144, v: 'oak3' },
  { x: 782, y: 162, v: 'oak2' },
  { x: 1106, y: 148, v: 'oak1' },
  { x: 1172, y: 186, v: 'oak3' },
  { x: 1244, y: 152, v: 'hollow' },
  { x: 1322, y: 192, v: 'oak2' },
  { x: 1388, y: 168, v: 'oak1' },
  { x: 1442, y: 204, v: 'dead' },
  { x: 1538, y: 206, v: 'oak3' },
  { x: 498, y: 342, v: 'oak3' },
  { x: 668, y: 472, v: 'oak2' },
  { x: 842, y: 468, v: 'oak3' },
  { x: 1184, y: 438, v: 'oak1' },
  { x: 1252, y: 382, v: 'oak3' },
  { x: 1326, y: 424, v: 'oak2' },
  { x: 1392, y: 368, v: 'dead' },
  { x: 1448, y: 406, v: 'hollow' },
  { x: 1534, y: 374, v: 'oak1' }
];
for (const tc of treeColliders) {
  const bw = tc.v === 'hollow' ? 24 : 18;
  const bh = 12;
  colliders.push({
    id: `tree_${tc.x}_${tc.y}`,
    x: tc.x - bw / 2,
    y: tc.y - 2 - bh / 2,
    w: bw,
    h: bh
  });
}

// Hộp va chạm chân nhân vật chính (14×10 px quanh tâm bước chân)
function isFootBlocked(wx, wy, pad = 6) {
  const px1 = wx - pad;
  const py1 = wy - pad;
  const px2 = wx + pad;
  const py2 = wy + pad;
  for (const c of colliders) {
    if (px2 > c.x && px1 < c.x + c.w && py2 > c.y && py1 < c.y + c.h) {
      return c.id;
    }
  }
  return null;
}

// 2. Danh sách các tọa độ trọng yếu cần kiểm tra không chồng lấn & đi tới được
const keyPoints = [
  { id: 'spawn_west_transition', label: 'Điểm vào từ Cổng Tây (targetSpawn)', x: 520, y: 260, interactRadius: 0 },
  { id: 'spawn_bellhollow_default', label: 'Điểm xuất phát mặc định Bellhollow', x: 560, y: 260, interactRadius: 0 },
  { id: 'square_center', label: 'Tâm Quảng Trường Trung Tâm', x: 810, y: 322, interactRadius: 0 },
  { id: 'npc_garth', label: 'NPC Garth (Dân Làng Cảnh Giác)', x: 530, y: 220, interactRadius: 38 },
  { id: 'npc_edda', label: 'NPC Bà Lão Edda (Người Giữ Chuông)', x: 790, y: 330, interactRadius: 38 },
  { id: 'npc_neris', label: 'NPC Neris (Người Chữa Thảo Mộc)', x: 970, y: 130, interactRadius: 38 },
  { id: 'interact_crafting_bench', label: 'Bàn Chế Tạo Sinh Tồn [E]', x: 978, y: 369, interactRadius: 34 },
  { id: 'interact_bell_altar', label: 'Bệ Tháp Chuông Câm [E]', x: 860, y: 324, interactRadius: 34 },
  { id: 'node_wood_bellhollow_1', label: 'Mỏ Gỗ Khô Tây-Bắc', x: 680, y: 220, interactRadius: 32 },
  { id: 'node_resin_bellhollow_2', label: 'Mỏ Nhựa Cây Tây-Bắc', x: 640, y: 185, interactRadius: 32 },
  { id: 'node_flint_1', label: 'Mỏ Đá Lửa Tây-Nam', x: 620, y: 350, interactRadius: 32 },
  { id: 'node_resin_1', label: 'Mỏ Nhựa Cây Bắc Quảng Trường', x: 880, y: 200, interactRadius: 32 },
  { id: 'node_herb_1', label: 'Mỏ Thảo Mộc Đông-Bắc', x: 1040, y: 180, interactRadius: 32 },
  { id: 'node_herb_2', label: 'Mỏ Thảo Mộc Nam Quảng Trường', x: 740, y: 440, interactRadius: 32 },
  { id: 'node_wood_3', label: 'Mỏ Gỗ Khô Đông-Nam', x: 1120, y: 380, interactRadius: 32 },
  { id: 'east_forest_gate_underpass', label: 'Cổng Đông — Rừng Ngoại Vi →', x: 1485, y: 280, interactRadius: 0 },
  { id: 'transition_to_crooked_path', label: 'Vạch chuyển vùng Outer Woods / Crooked Path', x: 1585, y: 280, interactRadius: 0 }
];

// 3. Giải thuật BFS trên lưới 4px×4px trong toàn bộ vùng làng Bellhollow (x: 484..1596, y: 40..530)
const STEP = 4;
const minX = 484;
const maxX = 1596;
const minY = 40;
const maxY = 530;
const cols = Math.floor((maxX - minX) / STEP) + 1;
const rows = Math.floor((maxY - minY) / STEP) + 1;

const visited = new Uint8Array(cols * rows);
const toGrid = (wx, wy) => ({
  gx: Math.round((wx - minX) / STEP),
  gy: Math.round((wy - minY) / STEP)
});
const toWorld = (gx, gy) => ({
  wx: minX + gx * STEP,
  wy: minY + gy * STEP
});

const startGrid = toGrid(520, 260);
const queue = [startGrid.gy * cols + startGrid.gx];
visited[startGrid.gy * cols + startGrid.gx] = 1;

const dirs = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

let reachableCells = 0;
while (queue.length > 0) {
  const idx = queue.shift();
  reachableCells++;
  const gx = idx % cols;
  const gy = Math.floor(idx / cols);
  for (const [dx, dy] of dirs) {
    const nx = gx + dx;
    const ny = gy + dy;
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
    const nIdx = ny * cols + nx;
    if (visited[nIdx]) continue;
    const { wx, wy } = toWorld(nx, ny);
    if (!isFootBlocked(wx, wy, 6)) {
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }
}

const pointResults = keyPoints.map((pt) => {
  const directBlock = isFootBlocked(pt.x, pt.y, 4);
  // Kiểm tra có ô đứng hợp lệ nào trong bán kính tương tác (hoặc đúng tại điểm đó nếu interactRadius === 0) đã được BFS đi tới
  let reachable = false;
  let closestDist = Infinity;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!visited[gy * cols + gx]) continue;
      const { wx, wy } = toWorld(gx, gy);
      const d = Math.hypot(wx - pt.x, wy - pt.y);
      if (d < closestDist) closestDist = d;
      if (d <= Math.max(6, pt.interactRadius)) {
        reachable = true;
      }
    }
  }
  return {
    id: pt.id,
    label: pt.label,
    x: pt.x,
    y: pt.y,
    directColliderOverlap: directBlock,
    reachableFromWestSpawn: reachable,
    closestWalkableDistancePx: Number(closestDist.toFixed(1))
  };
});

// 4. Kiểm tra tách biệt NPC với công trình & tách biệt vùng nhắc phím [E] giữa Edda và Bệ Tháp Chuông
const npcClearance = {
  garthToWatchpostPx: 220 - (136 + 36 + 9), // y=220 vs collider bottom y=181 => 39px
  nerisToHouseWallPx: 130 - (44 + 48),       // y=130 vs house bottom y=92 => 38px
  eddaToBellTowerBottomPx: 330 - (252 + 58), // y=330 vs tower bottom y=310 => 20px
  eddaToBellTowerLeftPx: 820 - 790,          // tower left x=820 vs Edda x=790 => 30px
  eddaToBellAltarPromptDistPx: Number(Math.hypot(790 - 860, 330 - 324).toFixed(1)) // > 42px
};

// 5. Kiểm tra hiệu năng & cấu trúc code trong WorldBuilder.ts
const staticChecks = {
  hasSingleBakedGroundBellhollow: worldBuilderSrc.includes("const texKey = 'bellhollow_ground_baked_v12'"),
  hasSingleBakedGroundFogCrossing: worldBuilderSrc.includes("const texKey = 'fog_crossing_ground_baked_v12'"),
  hasEastForestEntranceGate: worldBuilderSrc.includes('createEastForestEntrance(1485, 280)'),
  hasOuterWoodsSignText: worldBuilderSrc.includes("'Rừng Ngoại Vi →'"),
  hasBellhollowVegetation: worldBuilderSrc.includes('createBellhollowVegetation()'),
  hasBoundaryFogReusingFogSmooth: worldBuilderSrc.includes('createBellhollowBoundaryFog()') && worldBuilderSrc.includes('SPRITE_FOG_SMOOTH'),
  noUpdateLoopInWorldBuilder: !worldBuilderSrc.includes('update('),
  bellhollowFogAlphaReduced: bellhollowZone.atmosphere.fogAlpha === 0.28,
  toCrookedPathTransitionPreserved:
    bellhollowZone.transitions.some((t) => t.id === 'to_crooked_path' && t.triggerRect.x === 1580),
  npcCoordinatesUnchangedInGameScene:
    gameSceneSrc.includes('x: 530,\n      y: 220') ||
    (gameSceneSrc.includes('x: 530') && gameSceneSrc.includes('x: 790') && gameSceneSrc.includes('x: 970')),
  bellhollowResourceNodesCount: (inventorySrc.match(/bellhollow|node_flint_1|node_resin_1|node_herb_1|node_herb_2|node_wood_3/g) || []).length
};

const allReachable = pointResults.every((r) => r.reachableFromWestSpawn);
const summary = {
  timestamp: new Date().toISOString(),
  totalCollidersChecked: colliders.length,
  bfsReachableGridCells: reachableCells,
  all17KeyLocationsReachable: allReachable,
  npcClearance,
  staticChecks,
  pointResults
};

fs.mkdirSync(path.join(ROOT, 'Read/V1.2/QA'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'Read/V1.2/QA/c4_12_18a_qa_results.json'),
  JSON.stringify(summary, null, 2),
  'utf8'
);

console.log(JSON.stringify(summary, null, 2));
if (!allReachable) {
  process.exit(1);
}
