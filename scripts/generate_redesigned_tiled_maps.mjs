/**
 * Script Node.js tự động tạo và xuất bản đồ Tiled Map JSON chuẩn v1.10
 * Dựa trên Blueprint: docs/v1.4/world_map_redesign_blueprint.md
 * và Spatial Manifest: src/data/zones.json
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const zonesPath = path.join(rootDir, 'src', 'data', 'zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

const outDirs = [
  path.join(rootDir, 'src', 'data', 'maps'),
  path.join(rootDir, 'public', 'assets', 'maps')
];

for (const dir of outDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Bảng ánh xạ GID tileset chuẩn cho Tiled
const TILESET_GROUND_FIRSTGID = 1;
const TILESET_PROPS_FIRSTGID = 256;
const TILESET_BUILDINGS_FIRSTGID = 512;

const TILE_GRASS = 1;
const TILE_DIRT = 2;
const TILE_STONE_COBBLE = 3;
const TILE_SWAMP_MUD = 4;
const TILE_WATER = 5;
const TILE_DECAL_LEAF = 258;
const TILE_DECAL_PEBBLE = 259;
const TILE_DECAL_MUSHROOM = 260;
const TILE_DECAL_PUDDLE = 261;

/**
 * Tạo mảng lưới 2D dữ liệu ô gạch (Tile Layer Data)
 */
function generateTileGrid(cols, rows, zoneId) {
  const ground = new Array(cols * rows).fill(TILE_GRASS);
  const decals = new Array(cols * rows).fill(0);
  const foliage = new Array(cols * rows).fill(0);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;

      // 1. Phân loại theo Biome của Zone
      if (zoneId === 'silent_mire' || zoneId === 'drowned_mire_depths') {
        ground[idx] = TILE_SWAMP_MUD;
        // Các vũng nước lầy
        if ((c * 7 + r * 13) % 23 === 0 && c > 5 && c < cols - 5) {
          decals[idx] = TILE_DECAL_PUDDLE;
        }
      } else if (zoneId === 'bellhollow') {
        // Quảng trường đá và đường mòn
        const centerX = Math.floor(cols * 0.45);
        const centerY = Math.floor(rows * 0.45);
        const distFromCenter = Math.hypot(c - centerX, r - centerY);
        if (distFromCenter < 12) {
          ground[idx] = TILE_STONE_COBBLE;
        } else if (Math.abs(r - centerY) <= 2) {
          // Trục đường chính Đông - Tây
          ground[idx] = TILE_DIRT;
        }
      } else if (zoneId === 'crooked_path' || zoneId === 'outer_woods') {
        // Đường mòn đất nện uốn lượn hình chữ S
        const midR = Math.floor(rows * 0.5 + Math.sin(c * 0.25) * 5);
        if (Math.abs(r - midR) <= 2) {
          ground[idx] = TILE_DIRT;
        } else if (Math.abs(r - midR) === 3) {
          // Viền chuyển tiếp rêu & đá dăm
          decals[idx] = (c % 2 === 0) ? TILE_DECAL_PEBBLE : TILE_DECAL_LEAF;
        }
      } else if (zoneId === 'deep_forest') {
        ground[idx] = TILE_GRASS;
        // Bụi rậm và nấm phát quang dày đặc
        if ((c * 11 + r * 17) % 19 === 0) {
          foliage[idx] = TILE_DECAL_MUSHROOM;
        }
      }

      // Thảm lá rụng ngẫu nhiên ven rừng
      if (ground[idx] === TILE_GRASS && (c + r * 3) % 17 === 0) {
        decals[idx] = TILE_DECAL_LEAF;
      }
    }
  }

  return { ground, decals, foliage };
}

/**
 * Xây dựng danh sách Objects va chạm chuẩn chân đế (Foot-level Hitbox: 25% - 35%)
 */
function buildCollisionObjects(zone, startObjId) {
  let curId = startObjId;
  const objects = [];

  const colliders = zone.colliders || [];
  for (const c of colliders) {
    const isBuilding = c.type === 'building' || c.id?.includes('house') || c.id?.includes('tower');
    const isBoundary = c.type === 'boundary';
    const isAlreadyFootLevel = c.height <= 36;
    
    // Tỷ lệ chân đế 25% - 35% cho vật thể cao, 100% cho ranh giới biên (perimeter wall) hoặc đã chuẩn hóa chân đế
    const footRatio = (isBoundary || isAlreadyFootLevel) ? 1.0 : (isBuilding ? 0.32 : 0.35);
    const boxH = (isBoundary || isAlreadyFootLevel) ? c.height : Math.max(12, Math.round(c.height * footRatio));
    const boxY = (isBoundary || isAlreadyFootLevel) ? c.y : (c.y + c.height - boxH);

    objects.push({
      id: curId++,
      name: c.id || `col_${curId}`,
      type: c.type || 'collision',
      x: c.x,
      y: boxY,
      width: c.width,
      height: boxH,
      visible: true,
      properties: [
        { name: 'isSolid', type: 'bool', value: true },
        { name: 'footLevelRatio', type: 'float', value: footRatio },
        { name: 'originalHeight', type: 'int', value: c.height }
      ]
    });
  }

  return { objects, nextId: curId };
}

/**
 * Xây dựng danh sách Objects tương tác & sự kiện (15-Tile Rule Landmarks)
 */
function buildInteractableObjects(zone, startObjId) {
  let curId = startObjId;
  const objects = [];

  const interactables = zone.interactables || [];
  for (const item of interactables) {
    // Phân loại Hook Archetype theo Blueprint
    let hookArchetype = 'Environmental Trail';
    if (item.type === 'clue' || item.id.includes('sign') || item.id.includes('board') || item.id.includes('journal')) {
      hookArchetype = 'Archaeological Clue';
    } else if (item.type === 'storage' || item.type === 'shelter' || item.id.includes('chest')) {
      hookArchetype = 'Survival Cache';
    } else if (item.type === 'lantern_refill' || item.type === 'campfire' || item.id.includes('lantern')) {
      hookArchetype = 'Visual Beacon';
    } else if (item.type === 'cauldron' || item.type === 'bell_shrine' || item.id.includes('shrine') || item.id.includes('bench')) {
      hookArchetype = 'Interactive Micro-Event';
    }

    objects.push({
      id: curId++,
      name: item.id,
      type: item.type || 'interactable',
      x: item.x,
      y: item.y,
      width: item.width || 28,
      height: item.height || 24,
      visible: true,
      properties: [
        { name: 'displayName', type: 'string', value: item.name || item.id },
        { name: 'promptText', type: 'string', value: item.promptText || item.prompt || '[E] Tương tác' },
        { name: 'actionId', type: 'string', value: item.actionId || item.id },
        { name: 'hookArchetype', type: 'string', value: hookArchetype }
      ]
    });
  }

  // Danh sách NPC (nếu có)
  const npcs = zone.npcs || [];
  for (const npc of npcs) {
    objects.push({
      id: curId++,
      name: npc.id,
      type: 'npc',
      x: npc.x,
      y: npc.y,
      width: 24,
      height: 34,
      visible: true,
      properties: [
        { name: 'npcName', type: 'string', value: npc.name },
        { name: 'npcTitle', type: 'string', value: npc.title || '' },
        { name: 'dialogueKey', type: 'string', value: npc.dialogueKey || '' },
        { name: 'patrolMinX', type: 'int', value: npc.patrolMinX || npc.x },
        { name: 'patrolMaxX', type: 'int', value: npc.patrolMaxX || npc.x }
      ]
    });
  }

  return { objects, nextId: curId };
}

/**
 * Xây dựng danh sách Objects cổng chuyển vùng (Portals & Shortcuts)
 */
function buildPortalObjects(zone, startObjId) {
  let curId = startObjId;
  const objects = [];

  const transitions = zone.transitions || [];
  for (const t of transitions) {
    const rect = t.triggerRect || { x: zone.bounds.x, y: zone.bounds.y, width: 32, height: 32 };
    objects.push({
      id: curId++,
      name: t.id,
      type: 'transition_portal',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      visible: true,
      properties: [
        { name: 'portalId', type: 'string', value: t.id },
        { name: 'fromZone', type: 'string', value: t.fromZone },
        { name: 'toZone', type: 'string', value: t.toZone },
        { name: 'barrierType', type: 'string', value: t.barrierType || 'open' },
        { name: 'status', type: 'string', value: t.status || 'active' },
        { name: 'targetSpawnX', type: 'int', value: t.targetSpawn?.x || 0 },
        { name: 'targetSpawnY', type: 'int', value: t.targetSpawn?.y || 0 },
        { name: 'displayLabel', type: 'string', value: t.displayLabel || '' }
      ]
    });
  }

  return { objects, nextId: curId };
}

/**
 * Tạo một file Tiled Map JSON hoàn chỉnh theo chuẩn Tiled v1.10
 */
function createTiledMapJson(zone) {
  const tileWidth = 16;
  const tileHeight = 16;
  const cols = Math.max(20, Math.ceil(zone.bounds.width / tileWidth));
  const rows = Math.max(15, Math.ceil(zone.bounds.height / tileHeight));

  const { ground, decals, foliage } = generateTileGrid(cols, rows, zone.id);

  let nextObjId = 1;
  const colRes = buildCollisionObjects(zone, nextObjId);
  nextObjId = colRes.nextId;

  const intRes = buildInteractableObjects(zone, nextObjId);
  nextObjId = intRes.nextId;

  const portRes = buildPortalObjects(zone, nextObjId);
  nextObjId = portRes.nextId;

  const tiledMap = {
    compressionlevel: -1,
    height: rows,
    width: cols,
    infinite: false,
    layers: [
      {
        data: ground,
        height: rows,
        id: 1,
        name: 'Ground',
        opacity: 1,
        type: 'tilelayer',
        visible: true,
        width: cols,
        x: 0,
        y: 0
      },
      {
        data: decals,
        height: rows,
        id: 2,
        name: 'Paths_Decals',
        opacity: 1,
        type: 'tilelayer',
        visible: true,
        width: cols,
        x: 0,
        y: 0
      },
      {
        data: foliage,
        height: rows,
        id: 3,
        name: 'Foliage_Details',
        opacity: 1,
        type: 'tilelayer',
        visible: true,
        width: cols,
        x: 0,
        y: 0
      },
      {
        draworder: 'topdown',
        id: 4,
        name: 'Objects_Collision',
        objects: colRes.objects,
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0
      },
      {
        draworder: 'topdown',
        id: 5,
        name: 'Objects_Interactables',
        objects: intRes.objects,
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0
      },
      {
        draworder: 'topdown',
        id: 6,
        name: 'Objects_Portals',
        objects: portRes.objects,
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0
      }
    ],
    nextlayerid: 7,
    nextobjectid: nextObjId,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: tileHeight,
    tilewidth: tileWidth,
    tilesets: [
      {
        firstgid: TILESET_GROUND_FIRSTGID,
        source: 'tilesets/Tileset_Ground.tsx'
      },
      {
        firstgid: TILESET_PROPS_FIRSTGID,
        source: 'tilesets/Objects_Props.tsx'
      },
      {
        firstgid: TILESET_BUILDINGS_FIRSTGID,
        source: 'tilesets/Objects_Buildings.tsx'
      }
    ],
    type: 'map',
    version: '1.10',
    properties: [
      { name: 'zoneId', type: 'string', value: zone.id },
      { name: 'zoneName', type: 'string', value: zone.name },
      { name: 'worldX', type: 'int', value: zone.bounds.x },
      { name: 'worldY', type: 'int', value: zone.bounds.y },
      { name: 'worldWidth', type: 'int', value: zone.bounds.width },
      { name: 'worldHeight', type: 'int', value: zone.bounds.height },
      { name: 'tier', type: 'string', value: zone.tier || 'LAYER_1_SANCTUARY' }
    ]
  };

  return tiledMap;
}

console.log('================================================================');
console.log('🚀 GENERATING REDESIGNED TILED MAP JSON FILES (V1.4)');
console.log('================================================================\n');

const generatedFiles = [];

for (const zone of zonesData.zones) {
  const mapJson = createTiledMapJson(zone);
  const fileName = `${zone.id}.json`;

  for (const dir of outDirs) {
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(mapJson, null, 2), 'utf8');
    generatedFiles.push(filePath);
  }

  console.log(`✓ Đã xuất Tiled Map JSON cho phân khu [${zone.id}] (${mapJson.width}x${mapJson.height} tiles, ${mapJson.layers[3].objects.length} colliders, ${mapJson.layers[4].objects.length} interactables, ${mapJson.layers[5].objects.length} portals)`);
}

console.log(`\n🎉 Tổng số file Tiled Map JSON đã xuất: ${generatedFiles.length} files vào src/data/maps/ và public/assets/maps/`);
