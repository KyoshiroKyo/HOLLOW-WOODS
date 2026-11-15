import fs from 'fs';

const zonesPath = 'src/data/zones.json';
const raw = fs.readFileSync(zonesPath, 'utf-8');
const data = JSON.parse(raw);

// Bản đồ phân tầng cho các zone hiện hữu
const existingTiers = {
  fog_crossing: { tier: 'LAYER_1_CORE', tierName: 'Tầng 1 — Core World' },
  bellhollow: { tier: 'LAYER_1_CORE', tierName: 'Tầng 1 — Core World' },
  crooked_path: { tier: 'LAYER_2_FRONTIER', tierName: 'Tầng 2 — Frontier' },
  silent_mire: { tier: 'LAYER_3_FORBIDDEN', tierName: 'Tầng 3 — Forbidden' },
  broken_bell_shrine: { tier: 'LAYER_3_FORBIDDEN', tierName: 'Tầng 3 — Forbidden' }
};

// Cập nhật tier cho các zone hiện hữu
for (const z of data.zones) {
  if (existingTiers[z.id]) {
    z.tier = existingTiers[z.id].tier;
    z.tierName = existingTiers[z.id].tierName;
  }
}

// 4 Zone mới theo mô hình C — Hybrid Open World (V1.2)
const newZones = [
  // 1. Sanctuary Farm (Tầng 1 — Core World)
  {
    id: 'sanctuary_farm',
    name: 'Sanctuary Farm',
    titleVietnamese: 'Nông Trại Trú Ẩn',
    tier: 'LAYER_1_CORE',
    tierName: 'Tầng 1 — Core World',
    bounds: { x: 480, y: 560, width: 640, height: 480 },
    defaultSpawn: { x: 640, y: 620 },
    atmosphere: {
      fogColor: 2236962,
      fogAlpha: 0.20,
      ambientLight: 0.85,
      ambientColor: 1315860,
      titleVietnamese: 'NÔNG TRẠI TRÚ ẨN',
      subTitleVietnamese: 'Mảnh đất bình yên hiếm hoi để canh tác thảo dược và tích trữ lương thảo.'
    },
    colliders: [
      { id: 'farm_bound_bottom', x: 480, y: 1020, width: 640, height: 20, type: 'boundary', isSolid: true },
      { id: 'farm_bound_left', x: 480, y: 560, width: 20, height: 480, type: 'boundary', isSolid: true },
      { id: 'farm_bound_right', x: 1100, y: 560, width: 20, height: 480, type: 'boundary', isSolid: true }
    ],
    interactables: [
      {
        id: 'farm_storage_chest',
        name: 'Rương Trú Ẩn Nông Trại',
        type: 'chest',
        x: 680,
        y: 640,
        width: 32,
        height: 24,
        promptText: '[E] Mở Rương Trú Ẩn',
        actionId: 'open_storage'
      }
    ],
    transitions: [
      {
        id: 'to_bellhollow_from_farm',
        fromZone: 'sanctuary_farm',
        toZone: 'bellhollow',
        triggerRect: { x: 580, y: 560, width: 140, height: 20 },
        targetSpawn: { x: 600, y: 520 },
        description: 'Trở về trung tâm làng Bellhollow'
      }
    ]
  },

  // 2. Outer Woods (Tầng 1 — Core World)
  {
    id: 'outer_woods',
    name: 'Outer Woods',
    titleVietnamese: 'Rừng Ngoại Vi',
    tier: 'LAYER_1_CORE',
    tierName: 'Tầng 1 — Core World',
    bounds: { x: 1120, y: 560, width: 480, height: 480 },
    defaultSpawn: { x: 1200, y: 620 },
    atmosphere: {
      fogColor: 1644830,
      fogAlpha: 0.40,
      ambientLight: 0.65,
      ambientColor: 986895,
      titleVietnamese: 'RỪNG NGOẠI VI',
      subTitleVietnamese: 'Rìa rừng ven làng Bellhollow, nơi có thể tự do thu lượm tài nguyên cơ bản.'
    },
    colliders: [
      { id: 'ow_bound_bottom', x: 1120, y: 1020, width: 480, height: 20, type: 'boundary', isSolid: true },
      { id: 'ow_bound_right', x: 1580, y: 560, width: 20, height: 480, type: 'boundary', isSolid: true }
    ],
    interactables: [
      {
        id: 'ow_signpost',
        name: 'Biển Chỉ Dẫn Rừng Ven',
        type: 'clue',
        x: 1220,
        y: 640,
        width: 24,
        height: 24,
        promptText: '[E] Đọc Biển Chỉ Dẫn Rừng Ven',
        actionId: 'read_ow_sign'
      }
    ],
    transitions: [
      {
        id: 'to_bellhollow_from_ow',
        fromZone: 'outer_woods',
        toZone: 'bellhollow',
        triggerRect: { x: 1120, y: 560, width: 200, height: 20 },
        targetSpawn: { x: 1120, y: 510 },
        description: 'Quay lại làng Bellhollow'
      }
    ]
  },

  // 3. Deep Forest (Tầng 2 — Frontier)
  {
    id: 'deep_forest',
    name: 'Deep Forest',
    titleVietnamese: 'Rừng Sâu',
    tier: 'LAYER_2_FRONTIER',
    tierName: 'Tầng 2 — Frontier',
    bounds: { x: 1600, y: -640, width: 1280, height: 640 },
    defaultSpawn: { x: 2100, y: -100 },
    atmosphere: {
      fogColor: 789516,
      fogAlpha: 0.80,
      ambientLight: 0.25,
      ambientColor: 526344,
      titleVietnamese: 'RỪNG SÂU',
      subTitleVietnamese: 'Khu rừng rậm rạp ngột ngạt, bóng ma Kẻ Lắng Nghe lởn vởn khắp nơi...'
    },
    colliders: [
      { id: 'df_bound_top', x: 1600, y: -640, width: 1280, height: 30, type: 'boundary', isSolid: true },
      { id: 'df_bound_left', x: 1600, y: -640, width: 30, height: 640, type: 'boundary', isSolid: true },
      { id: 'df_bound_right', x: 2850, y: -640, width: 30, height: 640, type: 'boundary', isSolid: true }
    ],
    interactables: [
      {
        id: 'df_hiding_tree',
        name: 'Cổ Thụ Thân Rỗng Rừng Sâu',
        type: 'hiding_spot',
        x: 2150,
        y: -120,
        width: 48,
        height: 32,
        promptText: '[E] Ẩn nấp trong hốc cây cổ thụ',
        actionId: 'hide_player'
      }
    ],
    transitions: [
      {
        id: 'to_crooked_path_from_df',
        fromZone: 'deep_forest',
        toZone: 'crooked_path',
        triggerRect: { x: 2000, y: -20, width: 200, height: 20 },
        targetSpawn: { x: 2100, y: 40 },
        description: 'Quay lại Đường Mòn Quanh Co'
      }
    ]
  },

  // 4. Ancient Rune Puzzle (Tầng 3 — Forbidden Regions)
  {
    id: 'ancient_rune_puzzle',
    name: 'Ancient Rune Puzzle',
    titleVietnamese: 'Khu Vực Câu Đố Cổ Ngữ',
    tier: 'LAYER_3_FORBIDDEN',
    tierName: 'Tầng 3 — Forbidden',
    bounds: { x: 3350, y: 150, width: 350, height: 280 },
    defaultSpawn: { x: 3380, y: 260 },
    atmosphere: {
      fogColor: 1119504,
      fogAlpha: 0.70,
      ambientLight: 0.38,
      ambientColor: 789516,
      titleVietnamese: 'CÂU ĐỐ CỔ NGỮ',
      subTitleVietnamese: 'Trận địa ba cột đá cổ ngữ ẩn giấu chìa khóa mở đường tới Miếu Chuông.'
    },
    colliders: [
      { id: 'rune_arena_bound', x: 3350, y: 150, width: 350, height: 20, type: 'boundary', isSolid: true }
    ],
    interactables: [
      {
        id: 'rune_pedestal_center',
        name: 'Bệ Thờ Trung Tâm Trận Địa',
        type: 'runestone',
        x: 3520,
        y: 280,
        width: 32,
        height: 32,
        promptText: '[E] Kích hoạt Trận Địa Cổ Ngữ',
        actionId: 'activate_rune_puzzle'
      }
    ],
    transitions: [
      {
        id: 'to_silent_mire_from_puzzle',
        fromZone: 'ancient_rune_puzzle',
        toZone: 'silent_mire',
        triggerRect: { x: 3350, y: 250, width: 20, height: 60 },
        targetSpawn: { x: 3300, y: 260 },
        description: 'Rời khu câu đố ra đầm lầy'
      }
    ]
  }
];

// Thêm các zone mới vào danh sách nếu chưa có
for (const nz of newZones) {
  const existingIdx = data.zones.findIndex(z => z.id === nz.id);
  if (existingIdx >= 0) {
    data.zones[existingIdx] = nz;
  } else {
    data.zones.push(nz);
  }
}

fs.writeFileSync(zonesPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`✅ Cập nhật thành công ${data.zones.length} zones trong ${zonesPath}`);
