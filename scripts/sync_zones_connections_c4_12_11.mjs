import fs from 'fs';
import path from 'path';

const zonesPath = path.resolve('src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

// Định nghĩa đầy đủ danh mục kết nối và metadata bổ sung cho 9 phân khu
const updatedTransitionsByZone = {
  fog_crossing: [
    {
      id: "to_bellhollow",
      fromZone: "fog_crossing",
      toZone: "bellhollow",
      status: "active",
      barrierType: "open",
      triggerRect: { x: 460, y: 100, width: 20, height: 160 },
      targetSpawn: { x: 520, y: 260 },
      returnPoint: { x: 440, y: 180 },
      displayLabel: "Tiến vào cổng làng Bellhollow",
      description: "Tiến vào cổng làng Bellhollow"
    }
  ],
  bellhollow: [
    {
      id: "to_fog_crossing",
      fromZone: "bellhollow",
      toZone: "fog_crossing",
      status: "active",
      barrierType: "open",
      triggerRect: { x: 480, y: 200, width: 20, height: 120 },
      targetSpawn: { x: 440, y: 180 },
      returnPoint: { x: 520, y: 260 },
      displayLabel: "Quay lại Lối Mòn Xuyên Sương",
      description: "Quay lại Lối Mòn Xuyên Sương"
    },
    {
      id: "to_sanctuary_farm",
      fromZone: "bellhollow",
      toZone: "sanctuary_farm",
      status: "pending_construction",
      barrierType: "barrier_scaffold",
      triggerRect: { x: 580, y: 530, width: 140, height: 25 },
      targetSpawn: { x: 640, y: 620 },
      returnPoint: { x: 600, y: 510 },
      displayLabel: "Lối Nam dẫn ra Nông Trại Trú Ẩn",
      pendingNotice: "🚧 Lối vào Nông Trại Trú Ẩn đang được các thợ mộc Bellhollow dựng rào gia cố (Phân khu C4-12-19).",
      description: "Lối Nam dẫn ra Nông Trại Trú Ẩn"
    },
    {
      id: "to_outer_woods",
      fromZone: "bellhollow",
      toZone: "outer_woods",
      status: "pending_construction",
      barrierType: "dense_thorns",
      triggerRect: { x: 1120, y: 530, width: 200, height: 25 },
      targetSpawn: { x: 1200, y: 620 },
      returnPoint: { x: 1120, y: 510 },
      displayLabel: "Lối Đông Nam ra Rừng Ngoại Vi",
      pendingNotice: "🌿 Lối mòn dẫn vào Rừng Ngoại Vi rậm rạp bụi gai, thợ săn đang phát quang lối mòn thu thập tài nguyên (Phân khu C4-12-20).",
      description: "Lối Đông Nam ra Rừng Ngoại Vi"
    },
    {
      id: "to_crooked_path",
      fromZone: "bellhollow",
      toZone: "crooked_path",
      status: "active",
      barrierType: "gate",
      triggerRect: { x: 1580, y: 200, width: 20, height: 160 },
      targetSpawn: { x: 1640, y: 280 },
      returnPoint: { x: 1540, y: 280 },
      displayLabel: "Bước qua Cổng Đông tiến vào Khu Rừng The Hollow Woods",
      description: "Bước qua Cổng Đông tiến vào Khu Rừng The Hollow Woods"
    }
  ],
  sanctuary_farm: [
    {
      id: "to_bellhollow_from_farm",
      fromZone: "sanctuary_farm",
      toZone: "bellhollow",
      status: "pending_construction",
      barrierType: "open",
      triggerRect: { x: 580, y: 560, width: 140, height: 20 },
      targetSpawn: { x: 600, y: 520 },
      returnPoint: { x: 640, y: 620 },
      displayLabel: "Trở về trung tâm làng Bellhollow",
      description: "Trở về trung tâm làng Bellhollow"
    }
  ],
  outer_woods: [
    {
      id: "to_bellhollow_from_ow",
      fromZone: "outer_woods",
      toZone: "bellhollow",
      status: "pending_construction",
      barrierType: "open",
      triggerRect: { x: 1120, y: 560, width: 200, height: 20 },
      targetSpawn: { x: 1120, y: 510 },
      returnPoint: { x: 1200, y: 620 },
      displayLabel: "Quay lại làng Bellhollow",
      description: "Quay lại làng Bellhollow"
    },
    {
      id: "to_crooked_path_from_ow",
      fromZone: "outer_woods",
      toZone: "crooked_path",
      status: "pending_construction",
      barrierType: "dense_thorns",
      triggerRect: { x: 1560, y: 480, width: 40, height: 120 },
      targetSpawn: { x: 1640, y: 480 },
      returnPoint: { x: 1520, y: 480 },
      displayLabel: "Lối mòn phụ Rừng Ven sang Đường Mòn Quanh Co",
      pendingNotice: "🌲 Lối mòn phụ giữa Rừng Ven và Đường Mòn đang bị cây cổ thụ gãy chắn ngang (Phân khu C4-12-20 & C4-12-21).",
      description: "Lối mòn phụ Rừng Ven sang Đường Mòn Quanh Co"
    }
  ],
  crooked_path: [
    {
      id: "to_bellhollow_from_cp",
      fromZone: "crooked_path",
      toZone: "bellhollow",
      status: "active",
      barrierType: "gate",
      triggerRect: { x: 1600, y: 220, width: 20, height: 140 },
      targetSpawn: { x: 1540, y: 280 },
      returnPoint: { x: 1640, y: 280 },
      displayLabel: "Quay về làng Bellhollow",
      description: "Quay về làng Bellhollow"
    },
    {
      id: "to_outer_woods_from_cp",
      fromZone: "crooked_path",
      toZone: "outer_woods",
      status: "pending_construction",
      barrierType: "dense_thorns",
      triggerRect: { x: 1610, y: 480, width: 30, height: 120 },
      targetSpawn: { x: 1520, y: 480 },
      returnPoint: { x: 1640, y: 480 },
      displayLabel: "Lối rẽ từ Đường Mòn về Rừng Ven",
      description: "Lối rẽ từ Đường Mòn về Rừng Ven"
    },
    {
      id: "to_deep_forest",
      fromZone: "crooked_path",
      toZone: "deep_forest",
      status: "pending_construction",
      barrierType: "dense_thorns",
      triggerRect: { x: 2000, y: 10, width: 200, height: 25 },
      targetSpawn: { x: 2100, y: -100 },
      returnPoint: { x: 2100, y: 40 },
      displayLabel: "Lối Bắc rẽ vào Rừng Sâu (Lãnh địa The Listener)",
      pendingNotice: "🐾 Lối vào Rừng Sâu mịt mù gai độc, tiếng gầm gừ của The Listener vọng lại (Phân khu C4-12-22).",
      description: "Lối Bắc rẽ vào Rừng Sâu"
    },
    {
      id: "to_silent_mire",
      fromZone: "crooked_path",
      toZone: "silent_mire",
      status: "active",
      barrierType: "dense_thorns",
      triggerRect: { x: 2860, y: 240, width: 20, height: 160 },
      targetSpawn: { x: 2940, y: 320 },
      returnPoint: { x: 2820, y: 280 },
      displayLabel: "Tiến vào Đầm Lầy Tĩnh Lặng",
      description: "Tiến vào Đầm Lầy Tĩnh Lặng"
    }
  ],
  deep_forest: [
    {
      id: "to_crooked_path_from_df",
      fromZone: "deep_forest",
      toZone: "crooked_path",
      status: "pending_construction",
      barrierType: "open",
      triggerRect: { x: 2000, y: -20, width: 200, height: 20 },
      targetSpawn: { x: 2100, y: 40 },
      returnPoint: { x: 2100, y: -100 },
      displayLabel: "Quay lại Đường Mòn Quanh Co",
      description: "Quay lại Đường Mòn Quanh Co"
    }
  ],
  silent_mire: [
    {
      id: "to_crooked_path_from_sm",
      fromZone: "silent_mire",
      toZone: "crooked_path",
      status: "active",
      barrierType: "open",
      triggerRect: { x: 2880, y: 260, width: 20, height: 140 },
      targetSpawn: { x: 2820, y: 280 },
      returnPoint: { x: 2940, y: 320 },
      displayLabel: "Quay lại Đường Mòn Quanh Co",
      description: "Quay lại Đường Mòn Quanh Co"
    },
    {
      id: "to_rune_puzzle",
      fromZone: "silent_mire",
      toZone: "ancient_rune_puzzle",
      status: "active",
      barrierType: "rune_ward",
      triggerRect: { x: 3350, y: 220, width: 40, height: 120 },
      targetSpawn: { x: 3420, y: 260 },
      returnPoint: { x: 3300, y: 260 },
      displayLabel: "Tiến vào Trận Địa 3 Cột Đá Cổ Ngữ",
      description: "Tiến vào Trận Địa 3 Cột Đá Cổ Ngữ"
    },
    {
      id: "to_shrine",
      fromZone: "silent_mire",
      toZone: "broken_bell_shrine",
      status: "active",
      barrierType: "rune_ward",
      triggerRect: { x: 3980, y: 240, width: 20, height: 160 },
      targetSpawn: { x: 4050, y: 280 },
      returnPoint: { x: 3940, y: 320 },
      displayLabel: "Tiến vào Miếu Chuông Phế Tích",
      description: "Tiến vào Miếu Chuông Phế Tích"
    }
  ],
  ancient_rune_puzzle: [
    {
      id: "to_silent_mire_from_puzzle",
      fromZone: "ancient_rune_puzzle",
      toZone: "silent_mire",
      status: "active",
      barrierType: "open",
      triggerRect: { x: 3350, y: 250, width: 20, height: 60 },
      targetSpawn: { x: 3300, y: 260 },
      returnPoint: { x: 3420, y: 260 },
      displayLabel: "Rời bệ cổ ngữ ra đầm lầy",
      description: "Rời bệ cổ ngữ ra đầm lầy"
    }
  ],
  broken_bell_shrine: [
    {
      id: "to_silent_mire_from_shrine",
      fromZone: "broken_bell_shrine",
      toZone: "silent_mire",
      status: "active",
      barrierType: "open",
      triggerRect: { x: 4000, y: 220, width: 20, height: 140 },
      targetSpawn: { x: 3940, y: 320 },
      returnPoint: { x: 4050, y: 280 },
      displayLabel: "Trở lại Đầm Lầy Tĩnh Lặng",
      description: "Trở lại Đầm Lầy Tĩnh Lặng"
    }
  ]
};

// Cập nhật transitions và thêm interactable signs cho các lối rẽ pending
for (const zone of zonesData.zones) {
  if (updatedTransitionsByZone[zone.id]) {
    zone.transitions = updatedTransitionsByZone[zone.id];
  }

  // Bổ sung các biển hướng dẫn / tương tác an toàn tại các cửa ngõ
  if (zone.id === 'bellhollow') {
    const hasFarmSign = zone.interactables.some(i => i.id === 'bellhollow_farm_gate_sign');
    if (!hasFarmSign) {
      zone.interactables.push({
        id: "bellhollow_farm_gate_sign",
        name: "Biển Chỉ Dẫn Lối Nam (Nông Trại)",
        type: "clue",
        x: 650,
        y: 520,
        width: 32,
        height: 32,
        promptText: "Nhấn [E] xem Biển Lối Nam",
        actionId: "inspect_farm_gate"
      });
    }

    const hasOuterWoodsSign = zone.interactables.some(i => i.id === 'bellhollow_outer_woods_gate_sign');
    if (!hasOuterWoodsSign) {
      zone.interactables.push({
        id: "bellhollow_outer_woods_gate_sign",
        name: "Biển Chỉ Dẫn Rừng Ngoại Vi",
        type: "clue",
        x: 1200,
        y: 510,
        width: 32,
        height: 32,
        promptText: "Nhấn [E] xem Biển Rừng Ngoại Vi",
        actionId: "inspect_outer_woods_gate"
      });
    }
  }

  if (zone.id === 'crooked_path') {
    const hasDeepForestSign = zone.interactables.some(i => i.id === 'crooked_path_deep_forest_sign');
    if (!hasDeepForestSign) {
      zone.interactables.push({
        id: "crooked_path_deep_forest_sign",
        name: "Biển Cảnh Báo Rừng Sâu",
        type: "clue",
        x: 2100,
        y: 35,
        width: 32,
        height: 32,
        promptText: "Nhấn [E] xem Biển Rừng Sâu",
        actionId: "inspect_deep_forest_gate"
      });
    }
  }
}

fs.writeFileSync(zonesPath, JSON.stringify(zonesData, null, 2), 'utf8');
console.log('Synchronized zones.json with 18 zone transitions and boundary guidance signs successfully.');
