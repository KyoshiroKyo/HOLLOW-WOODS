/**
 * HOLLOW WOODS V3.0 – HẰNG SỐ TOÀN CỤC (GLOBAL CONSTANTS)
 */

export const VIRTUAL_WIDTH = 640;
export const VIRTUAL_HEIGHT = 360;

export const TILE_SIZE = 16;

// Tốc độ di chuyển của Satyr
export const PLAYER_WALK_SPEED = 85;
export const PLAYER_SPRINT_SPEED = 140;
export const STAMINA_DRAIN_RATE = 22; // tốn thể lực mỗi giây khi chạy
export const STAMINA_RECOVERY_RATE = 15; // hồi thể lực mỗi giây khi đi hoặc đứng

// Dầu đèn lồng (Lantern Oil)
export const LANTERN_OIL_DRAIN_RATE = 0.8; // tiêu hao dầu mỗi giây khi bật
export const LANTERN_RADIUS_NORMAL = 120; // bán kính ánh sáng
export const LANTERN_RADIUS_DIM = 45; // bán kính khi tắt đèn (ánh sáng yếu ớt của bóng tối)

// Tâm lý bình tâm (Composure)
export const COMPOSURE_DRAIN_IN_DARK = 1.2; // giảm bình tâm khi ở trong bóng tối không đèn
export const COMPOSURE_RECOVERY_NEAR_LIGHT = 2.0;

// Satyr Sprite Sheet Specs
export const SATYR_SHEET_KEY = 'satyr_sheet';
export const SATYR_PORTRAIT_KEY = 'satyr_portrait';
export const SATYR_FRAME_WIDTH = 64;
export const SATYR_FRAME_HEIGHT = 64;
export const SATYR_COLS = 22;
export const SATYR_ROWS = 4;

// Điểm neo chân (Foot anchor) và va chạm gót chân
export const SATYR_ORIGIN_X = 0.5;
export const SATYR_ORIGIN_Y = 0.90; // Bàn chân tại y = 58 trong frame 64x64 (58/64 ≈ 0.90)
export const SATYR_BODY_WIDTH = 14;
export const SATYR_BODY_HEIGHT = 8;
export const SATYR_BODY_OFFSET_X = 25;
export const SATYR_BODY_OFFSET_Y = 50;

// Tên Scene
export const SCENE_BOOT = 'BootScene';
export const SCENE_PRELOAD = 'PreloadScene';
export const SCENE_MAIN_MENU = 'MainMenuScene';
export const SCENE_GAME = 'GameScene';
export const SCENE_HUD = 'HUDScene';

// Khóa Texture Môi trường (Environment Sprite Keys)
export const SPRITE_TREE_OAK_1 = 'tree_oak_1';
export const SPRITE_TREE_OAK_2 = 'tree_oak_2';
export const SPRITE_TREE_OAK_3 = 'tree_oak_3';
export const SPRITE_BUSH_DENSE_1 = 'bush_dense_1';
export const SPRITE_BUSH_DENSE_2 = 'bush_dense_2';
export const SPRITE_HOLLOW_TREE = 'hollow_tree';
export const SPRITE_TREE_DEAD = 'tree_dead';

// Khóa Texture Công Trình Kiến Trúc (Architecture Sprite Keys - PASS T05)
export const SPRITE_HOUSE_EDDA = 'house_edda';
export const SPRITE_HOUSE_NERIS = 'house_neris';
export const SPRITE_BELL_TOWER = 'bell_tower';
export const SPRITE_BROKEN_SHRINE = 'broken_shrine';

// Khóa Texture Vật Thể & Đạo Cụ (Props Sprite Keys - PASS T06)
export const SPRITE_PILLAR_MOON = 'pillar_moon';
export const SPRITE_PILLAR_ROOT = 'pillar_root';
export const SPRITE_PILLAR_EYE = 'pillar_eye';
export const SPRITE_VILLAGE_WELL = 'village_well';
export const SPRITE_CRAFTING_BENCH = 'crafting_bench';
export const SPRITE_STONE_ALTAR = 'stone_altar';
export const SPRITE_WOODEN_FENCE = 'wooden_fence';
export const SPRITE_SIGNPOST = 'signpost';

// Khóa Texture Địa Hình Mặt Đất (Terrain Tile Keys - PASS T07)
export const TILE_FOREST_GRASS = 'tile_forest_grass';
export const TILE_DIRT_TRAIL = 'tile_dirt_trail';
export const TILE_SWAMP_MUD = 'tile_swamp_mud';
export const TILE_COBBLE_ROAD = 'tile_cobble_road';
export const TILE_STONE_FLOOR = 'tile_stone_floor';

// Khóa Texture NPC & Chân Dung (NPC Sprite & Portrait Keys - PASS T09)
export const SPRITE_NPC_GARTH = 'npc_garth';
export const PORTRAIT_GARTH = 'portrait_garth';
export const SPRITE_NPC_EDDA = 'npc_edda';
export const PORTRAIT_EDDA = 'portrait_edda';
export const SPRITE_NPC_NERIS = 'npc_neris';
export const PORTRAIT_NERIS = 'portrait_neris';

// Khóa Texture Quái Vật & Bóng Ma (Monster & Echo Sprite Keys - PASS T10)
export const SPRITE_THE_LISTENER = 'the_listener';
export const SPRITE_THE_ECHO = 'the_echo';
export const SPRITE_FOG_SMOOTH = 'fog_smooth';








