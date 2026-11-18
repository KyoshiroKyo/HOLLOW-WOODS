import fs from 'fs';
import path from 'path';

const zonesFilePath = path.resolve('src/data/zones.json');
const rawData = fs.readFileSync(zonesFilePath, 'utf8');
const zonesJson = JSON.parse(rawData);

// 1. Add Transitions to existing parent zones
// 1.1 In deep_forest -> transition to abyssal_chasm (x: 2200, y: -640)
const deepForest = zonesJson.zones.find(z => z.id === 'deep_forest');
if (deepForest) {
  deepForest.transitions = deepForest.transitions || [];
  if (!deepForest.transitions.some(t => t.toZone === 'abyssal_chasm')) {
    deepForest.transitions.push({
      id: "to_abyssal_chasm",
      fromZone: "deep_forest",
      toZone: "abyssal_chasm",
      status: "active",
      barrierType: "open",
      triggerRect: {
        x: 2200,
        y: -640,
        width: 80,
        height: 24
      },
      targetSpawn: {
        x: 2240,
        y: -700
      },
      returnPoint: {
        x: 2240,
        y: -600
      },
      displayLabel: "Tiến vào Vực Sâu Bóng Tối",
      description: "Cổng Cổ Ngữ Hư Không mở ra vực sâu đen thẳm"
    });
  }
}

// 1.2 In silent_mire -> transition to drowned_mire_depths (x: 3340, y: 720)
const silentMire = zonesJson.zones.find(z => z.id === 'silent_mire');
if (silentMire) {
  silentMire.transitions = silentMire.transitions || [];
  if (!silentMire.transitions.some(t => t.toZone === 'drowned_mire_depths')) {
    silentMire.transitions.push({
      id: "to_drowned_mire_depths",
      fromZone: "silent_mire",
      toZone: "drowned_mire_depths",
      status: "active",
      barrierType: "open",
      triggerRect: {
        x: 3340,
        y: 720,
        width: 80,
        height: 24
      },
      targetSpawn: {
        x: 3380,
        y: 800
      },
      returnPoint: {
        x: 3380,
        y: 700
      },
      displayLabel: "Tiến vào Đầm Lầy Chìm",
      description: "Lối cầu ván gỗ dẫn xuống vực nước sâu tử khí"
    });
  }
}

// 1.3 In sub_whispering_clearing -> transition to whispering_grove_sanctum (x: 1800, y: -360)
const whisperingClearing = zonesJson.zones.find(z => z.id === 'sub_whispering_clearing');
if (whisperingClearing) {
  whisperingClearing.transitions = whisperingClearing.transitions || [];
  if (!whisperingClearing.transitions.some(t => t.toZone === 'whispering_grove_sanctum')) {
    whisperingClearing.transitions.push({
      id: "to_whispering_grove_sanctum",
      fromZone: "sub_whispering_clearing",
      toZone: "whispering_grove_sanctum",
      status: "active",
      barrierType: "open",
      triggerRect: {
        x: 1800,
        y: -360,
        width: 80,
        height: 24
      },
      targetSpawn: {
        x: 1600,
        y: -420
      },
      returnPoint: {
        x: 1840,
        y: -340
      },
      displayLabel: "Bước vào Thánh Địa Cây Đại Ngàn",
      description: "Vòm rễ cổ thụ hé mở ánh nắng hổ phách linh thiêng"
    });
  }
}

// 1.4 In ancient_rune_puzzle -> transition to sunken_crypt_ruins (x: 3520, y: 160)
const runePuzzle = zonesJson.zones.find(z => z.id === 'ancient_rune_puzzle');
if (runePuzzle) {
  runePuzzle.transitions = runePuzzle.transitions || [];
  if (!runePuzzle.transitions.some(t => t.toZone === 'sunken_crypt_ruins')) {
    runePuzzle.transitions.push({
      id: "to_sunken_crypt_ruins",
      fromZone: "ancient_rune_puzzle",
      toZone: "sunken_crypt_ruins",
      status: "active",
      barrierType: "open",
      triggerRect: {
        x: 3500,
        y: 150,
        width: 60,
        height: 24
      },
      targetSpawn: {
        x: 3600,
        y: -100
      },
      returnPoint: {
        x: 3520,
        y: 180
      },
      displayLabel: "Bước xuống Hầm Mộ Cổ Ngữ",
      description: "Cầu thang đá ngầm dẫn xuống đền thờ ngàn năm dưới lòng đất"
    });
  }
}

// 1.5 In sub_root_cellar -> transition to veil_origin_cavern (x: 800, y: 1420)
const rootCellar = zonesJson.zones.find(z => z.id === 'sub_root_cellar');
if (rootCellar) {
  rootCellar.transitions = rootCellar.transitions || [];
  if (!rootCellar.transitions.some(t => t.toZone === 'veil_origin_cavern')) {
    rootCellar.transitions.push({
      id: "to_veil_origin_cavern",
      fromZone: "sub_root_cellar",
      toZone: "veil_origin_cavern",
      status: "active",
      barrierType: "open",
      triggerRect: {
        x: 760,
        y: 1420,
        width: 80,
        height: 24
      },
      targetSpawn: {
        x: 800,
        y: 1500
      },
      returnPoint: {
        x: 800,
        y: 1400
      },
      displayLabel: "Tiến vào Hang Cội Rễ Hư Vô",
      description: "Khe nứt đá ngầm dẫn tới cội nguồn sương mù The Veil"
    });
  }
}

// 2. Add the 5 new zones (Without monsters, only environment, bounds, colliders, transitions, resources & lore)
const newZones = [
  // ---------------------------------------------------------------------------
  // Zone 1: Abyssal Chasm (Vực Sâu Bóng Tối - Tier 5)
  // ---------------------------------------------------------------------------
  {
    id: "abyssal_chasm",
    name: "The Abyssal Chasm",
    titleVietnamese: "Vực Sâu Bóng Tối",
    tier: "LAYER_3_FORBIDDEN",
    tierName: "Cấm địa Tầng 5 — Vực Sâu Hư Không",
    status: "active",
    bounds: {
      x: 1600,
      y: -1280,
      width: 1280,
      height: 640
    },
    defaultSpawn: {
      x: 2240,
      y: -700
    },
    atmosphere: {
      fogColor: 1312796, // 0x14081c
      fogAlpha: 0.85,
      ambientLight: 0.15,
      ambientColor: 1312796,
      titleVietnamese: "VỰC SÂU BÓNG TỐI",
      subTitleVietnamese: "Nơi bóng tối nguyên thủy thức giấc bên khe nứt vĩnh hằng..."
    },
    colliders: [
      { id: "ac_bound_top", x: 1600, y: -1280, width: 1280, height: 30, type: "boundary", isSolid: true },
      { id: "ac_bound_bottom", x: 1600, y: -670, width: 1280, height: 30, type: "boundary", isSolid: true },
      { id: "ac_bound_left", x: 1600, y: -1280, width: 30, height: 640, type: "boundary", isSolid: true },
      { id: "ac_bound_right", x: 2850, y: -1280, width: 30, height: 640, type: "boundary", isSolid: true },
      // Central chasm obstacle
      { id: "ac_chasm_void", x: 2000, y: -1050, width: 480, height: 160, type: "hazard", isSolid: true }
    ],
    transitions: [
      {
        id: "to_deep_forest_from_ac",
        fromZone: "abyssal_chasm",
        toZone: "deep_forest",
        status: "active",
        barrierType: "open",
        triggerRect: { x: 2200, y: -680, width: 80, height: 30 },
        targetSpawn: { x: 2240, y: -600 },
        returnPoint: { x: 2240, y: -700 },
        displayLabel: "Trở về Rừng Sâu",
        description: "Lối ra Cổng Cổ Ngữ Rừng Sâu"
      }
    ],
    interactables: [
      {
        id: "monolith_abyssal_warning",
        type: "lore",
        x: 2240,
        y: -740,
        prompt: "Đọc bia đá khắc cổ ngữ",
        loreId: "lore_abyssal_warning",
        title: "Bia Đá Cổ Ngữ Hiệp Sĩ",
        content: "Chớ nhìn quá lâu vào Khe Nứt Cội Nguồn... Nơi đây từng là nơi ngài Chỉ Huy dẫn quân tinh nhuệ chặn đứng đợt sương đầu tiên."
      },
      {
        id: "knight_corpse_cache",
        type: "chest",
        x: 1980,
        y: -900,
        prompt: "Lục soát bộ giáp hiệp sĩ gãy nát",
        lootTable: "abyssal_knight_loot"
      }
    ],
    spawns: {
      npcs: [],
      monsters: [],
      resources: [
        { type: "dry_wood", x: 1850, y: -800 },
        { type: "flint", x: 2120, y: -880 },
        { type: "flint", x: 2540, y: -920 },
        { type: "tree_resin", x: 2700, y: -820 }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // Zone 2: Drowned Mire Depths (Đầm Lầy Chìm - Tier 4)
  // ---------------------------------------------------------------------------
  {
    id: "drowned_mire_depths",
    name: "The Drowned Mire Depths",
    titleVietnamese: "Đầm Lầy Chìm",
    tier: "LAYER_3_FORBIDDEN",
    tierName: "Vùng nguy hiểm Tầng 4 — Vực Nước Tử Khí",
    status: "active",
    bounds: {
      x: 2880,
      y: 740,
      width: 1120,
      height: 640
    },
    defaultSpawn: {
      x: 3380,
      y: 800
    },
    atmosphere: {
      fogColor: 1582107, // 0x18241b
      fogAlpha: 0.80,
      ambientLight: 0.22,
      ambientColor: 1582107,
      titleVietnamese: "ĐẦM LẦY CHÌM",
      subTitleVietnamese: "Vực nước than bùn sâu thẳm, tiếng sủi bọt ngột ngạt..."
    },
    colliders: [
      { id: "dmd_bound_top", x: 2880, y: 740, width: 1120, height: 30, type: "boundary", isSolid: true },
      { id: "dmd_bound_bottom", x: 2880, y: 1350, width: 1120, height: 30, type: "boundary", isSolid: true },
      { id: "dmd_bound_left", x: 2880, y: 740, width: 30, height: 640, type: "boundary", isSolid: true },
      { id: "dmd_bound_right", x: 3970, y: 740, width: 30, height: 640, type: "boundary", isSolid: true }
    ],
    transitions: [
      {
        id: "to_silent_mire_from_dmd",
        fromZone: "drowned_mire_depths",
        toZone: "silent_mire",
        status: "active",
        barrierType: "open",
        triggerRect: { x: 3340, y: 740, width: 80, height: 30 },
        targetSpawn: { x: 3380, y: 700 },
        returnPoint: { x: 3380, y: 780 },
        displayLabel: "Trở về Đầm Lầy Tĩnh Lặng",
        description: "Lối cầu ván gỗ dẫn lên phía Bắc"
      }
    ],
    interactables: [
      {
        id: "lore_fisherman_diary",
        type: "lore",
        x: 3200,
        y: 920,
        prompt: "Đọc mảnh giấy dầu trong hốc cây",
        loreId: "lore_fisherman_note",
        title: "Nhật Ký Của Ngư Phủ Vô Danh",
        content: "Màn sương không chỉ ăn mòn ký ức, nó làm biến dạng cả những sinh vật đầm lầy... Đừng dại dột bơi qua vùng nước sâu khi không có đuốc sáng."
      },
      {
        id: "chest_drowned_mire",
        type: "chest",
        x: 3480,
        y: 1020,
        prompt: "Mở rương sắt chìm dưới nước",
        lootTable: "drowned_mire_loot"
      }
    ],
    spawns: {
      npcs: [],
      monsters: [],
      resources: [
        { type: "herbs", x: 3120, y: 880 },
        { type: "herbs", x: 3620, y: 940 },
        { type: "dry_wood", x: 3300, y: 1100 },
        { type: "flint", x: 3750, y: 1050 }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // Zone 3: Whispering Grove Sanctum (Thánh Địa Cây Đại Ngàn - Tier 2)
  // ---------------------------------------------------------------------------
  {
    id: "whispering_grove_sanctum",
    name: "Sanctum of the Elder Grove",
    titleVietnamese: "Thánh Địa Cây Đại Ngàn",
    tier: "LAYER_2_FRONTIER",
    tierName: "Thánh địa Tầng 2 — Vùng Đất Thanh Tẩy",
    status: "active",
    bounds: {
      x: 1120,
      y: -800,
      width: 960,
      height: 440
    },
    defaultSpawn: {
      x: 1600,
      y: -420
    },
    atmosphere: {
      fogColor: 3030308, // 0x2e3d24
      fogAlpha: 0.35,
      ambientLight: 0.55,
      ambientColor: 5597999, // 0x556b2f
      titleVietnamese: "THÁNH ĐỊA CÂY ĐẠI NGÀN",
      subTitleVietnamese: "Ánh nắng vàng hổ phách dịu dàng rọi qua mái vòm đại thụ..."
    },
    colliders: [
      { id: "wgs_bound_top", x: 1120, y: -800, width: 960, height: 30, type: "boundary", isSolid: true },
      { id: "wgs_bound_bottom", x: 1120, y: -390, width: 960, height: 30, type: "boundary", isSolid: true },
      { id: "wgs_bound_left", x: 1120, y: -800, width: 30, height: 440, type: "boundary", isSolid: true },
      { id: "wgs_bound_right", x: 2050, y: -800, width: 30, height: 440, type: "boundary", isSolid: true }
    ],
    transitions: [
      {
        id: "to_whispering_clearing_from_wgs",
        fromZone: "whispering_grove_sanctum",
        toZone: "sub_whispering_clearing",
        status: "active",
        barrierType: "open",
        triggerRect: { x: 1560, y: -400, width: 80, height: 30 },
        targetSpawn: { x: 1840, y: -340 },
        returnPoint: { x: 1600, y: -420 },
        displayLabel: "Về Khoảng Rừng Thì Thầm",
        description: "Lối vòm rễ dẫn về phía Nam"
      }
    ],
    interactables: [
      {
        id: "elder_grove_altar",
        type: "interactable",
        x: 1600,
        y: -580,
        prompt: "Cầu nguyện trước Bàn Tế Đại Thụ",
        loreId: "lore_elder_grove_blessing",
        title: "Bàn Tế Đại Thụ Rêu Hoa",
        content: "Hào quang cổ thụ ấm áp vỗ về tâm hồn, xua tan mọi nỗi sợ hãi và băng giá của màn sương."
      },
      {
        id: "elder_tree_sap_node",
        type: "harvest",
        x: 1680,
        y: -620,
        prompt: "Thu thập Nhựa Cây Thần",
        resourceType: "resin"
      }
    ],
    spawns: {
      npcs: [],
      monsters: [],
      resources: [
        { type: "herbs", x: 1420, y: -600 },
        { type: "herbs", x: 1780, y: -540 },
        { type: "tree_resin", x: 1680, y: -620 },
        { type: "dry_wood", x: 1520, y: -480 }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // Zone 4: Sunken Crypt Ruins (Hầm Mộ Cổ Ngữ - Tier 4)
  // ---------------------------------------------------------------------------
  {
    id: "sunken_crypt_ruins",
    name: "The Sunken Crypt of Runes",
    titleVietnamese: "Hầm Mộ Cổ Ngữ",
    tier: "LAYER_3_FORBIDDEN",
    tierName: "Điện thờ ngầm Tầng 4 — Hầm Mộ Hiệp Sĩ",
    status: "active",
    bounds: {
      x: 3350,
      y: -640,
      width: 1130,
      height: 640
    },
    defaultSpawn: {
      x: 3600,
      y: -100
    },
    atmosphere: {
      fogColor: 1711140, // 0x1a1c24
      fogAlpha: 0.70,
      ambientLight: 0.18,
      ambientColor: 1711140,
      titleVietnamese: "HẦM MỘ CỔ NGỮ",
      subTitleVietnamese: "Điện thờ ngàn năm dưới lòng đất, tro bụi phủ bóng giáp hiệp sĩ..."
    },
    colliders: [
      { id: "scr_bound_top", x: 3350, y: -640, width: 1130, height: 30, type: "boundary", isSolid: true },
      { id: "scr_bound_bottom", x: 3350, y: -30, width: 1130, height: 30, type: "boundary", isSolid: true },
      { id: "scr_bound_left", x: 3350, y: -640, width: 30, height: 640, type: "boundary", isSolid: true },
      { id: "scr_bound_right", x: 4450, y: -640, width: 30, height: 640, type: "boundary", isSolid: true }
    ],
    transitions: [
      {
        id: "to_rune_puzzle_from_scr",
        fromZone: "sunken_crypt_ruins",
        toZone: "ancient_rune_puzzle",
        status: "active",
        barrierType: "open",
        triggerRect: { x: 3560, y: -60, width: 80, height: 30 },
        targetSpawn: { x: 3520, y: 180 },
        returnPoint: { x: 3600, y: -100 },
        displayLabel: "Lên Trận Địa Cổ Ngữ",
        description: "Bậc thang đá dẫn lên mặt đất"
      }
    ],
    interactables: [
      {
        id: "monolith_crypt_memorial",
        type: "lore",
        x: 3900,
        y: -340,
        prompt: "Đọc bia văn cổ ngữ hiệp sĩ",
        loreId: "lore_crypt_memorial",
        title: "Bia Tưởng Niệm Hiệp Sĩ Canh Chuông",
        content: "Nơi an nghỉ của những hiệp sĩ đã hiến trọn thân xác và ý chí để giữ vững quả Chuông Đồng đầu tiên bảo vệ con người."
      },
      {
        id: "sarcophagus_black_knight",
        type: "chest",
        x: 3920,
        y: -450,
        prompt: "Mở nắp quan tài đá cổ",
        lootTable: "crypt_knight_loot"
      }
    ],
    spawns: {
      npcs: [],
      monsters: [],
      resources: [
        { type: "flint", x: 3680, y: -240 },
        { type: "flint", x: 4120, y: -320 },
        { type: "dry_wood", x: 3820, y: -180 }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // Zone 5: Veil Origin Cavern (Hang Cội Rễ Hư Vô - Tier 5)
  // ---------------------------------------------------------------------------
  {
    id: "veil_origin_cavern",
    name: "The Veil's Heart Cavern",
    titleVietnamese: "Hang Cội Rễ Hư Vô",
    tier: "LAYER_3_FORBIDDEN",
    tierName: "Lõi sương mù Tầng 5 — Trái Tim The Veil",
    status: "active",
    bounds: {
      x: 480,
      y: 1440,
      width: 1120,
      height: 640
    },
    defaultSpawn: {
      x: 800,
      y: 1500
    },
    atmosphere: {
      fogColor: 986132, // 0x0f0c14
      fogAlpha: 0.90,
      ambientLight: 0.12,
      ambientColor: 986132,
      titleVietnamese: "HANG CỘI RỄ HƯ VÔ",
      subTitleVietnamese: "Nơi hơi thở đen tối của The Veil khởi sinh từ lòng đất lạnh..."
    },
    colliders: [
      { id: "voc_bound_top", x: 480, y: 1440, width: 1120, height: 30, type: "boundary", isSolid: true },
      { id: "voc_bound_bottom", x: 480, y: 2050, width: 1120, height: 30, type: "boundary", isSolid: true },
      { id: "voc_bound_left", x: 480, y: 1440, width: 30, height: 640, type: "boundary", isSolid: true },
      { id: "voc_bound_right", x: 1570, y: 1440, width: 30, height: 640, type: "boundary", isSolid: true }
    ],
    transitions: [
      {
        id: "to_root_cellar_from_voc",
        fromZone: "veil_origin_cavern",
        toZone: "sub_root_cellar",
        status: "active",
        barrierType: "open",
        triggerRect: { x: 760, y: 1460, width: 80, height: 30 },
        targetSpawn: { x: 800, y: 1400 },
        returnPoint: { x: 800, y: 1500 },
        displayLabel: "Trở về Hầm Rễ Cổ",
        description: "Khe nứt đá dẫn ngược lên Hầm Rễ Cổ"
      }
    ],
    interactables: [
      {
        id: "veil_commander_epistle",
        type: "lore",
        x: 1040,
        y: 1760,
        prompt: "Đọc bức huyết thư phong ấn",
        loreId: "lore_veil_commander_epistle",
        title: "Huyết Thư Của Chỉ Huy Hiệp Sĩ Đen",
        content: "Ta — Chỉ Huy Hiệp Sĩ Đen — xin tự phong ấn ký ức và bản ngã của mình vào chiếc chuông cổ, để linh hồn ta mãi mãi làm mồi nhử giam cầm The Veil dưới lòng đất..."
      },
      {
        id: "veil_heart_altar",
        type: "interactable",
        x: 1040,
        y: 1860,
        prompt: "Chạm vào Trái Tim Màn Sương",
        loreId: "lore_veil_heart_core",
        title: "Bệ Thờ Trái Tim Màn Sương",
        content: "Khối tinh thể hắc ngọc đập từng nhịp lạnh giá, tỏa ra hơi sương cội nguồn bao trùm lấy thế giới."
      }
    ],
    spawns: {
      npcs: [],
      monsters: [],
      resources: [
        { type: "flint", x: 860, y: 1680 },
        { type: "flint", x: 1220, y: 1740 },
        { type: "tree_resin", x: 960, y: 1820 }
      ]
    }
  }
];

// Append new zones
for (const nz of newZones) {
  const existingIdx = zonesJson.zones.findIndex(z => z.id === nz.id);
  if (existingIdx >= 0) {
    zonesJson.zones[existingIdx] = nz;
    console.log(`Updated zone: ${nz.id}`);
  } else {
    zonesJson.zones.push(nz);
    console.log(`Added new zone: ${nz.id}`);
  }
}

fs.writeFileSync(zonesFilePath, JSON.stringify(zonesJson, null, 2), 'utf8');
console.log(`Updated ${zonesFilePath} successfully! Total zones now: ${zonesJson.zones.length}`);
