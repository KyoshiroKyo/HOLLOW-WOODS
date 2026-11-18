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

// Tọa độ tương đối của Đèn Lồng Hổ Phách trên cây gậy gỗ (gốc neo chân 32, 58 trong ô 64x64 - C4-13-04)
export const LANTERN_OFFSET_DOWN = { x: -5, y: -16 };
export const LANTERN_OFFSET_UP = { x: 13, y: -19 };
export const LANTERN_OFFSET_LEFT = { x: -9, y: -16 };
export const LANTERN_OFFSET_RIGHT = { x: 9, y: -16 };

// Tâm lý bình tâm (Composure)
export const COMPOSURE_DRAIN_IN_DARK = 1.2; // giảm bình tâm khi ở trong bóng tối không đèn
export const COMPOSURE_RECOVERY_NEAR_LIGHT = 2.0;

// Satyr / The Mossbound Wayfarer Sprite Sheet Specs
export const SATYR_SHEET_KEY = 'satyr_sheet';
export const SATYR_PORTRAIT_KEY = 'satyr_portrait';
export const SATYR_FRAME_WIDTH = 64;
export const SATYR_FRAME_HEIGHT = 64;
export const SATYR_COLS = 22;
export const SATYR_ROWS = 4;

// The Mossbound Wayfarer (Protagonist V1.2) Sprite Sheet & Portrait Keys
export const WAYFARER_IDLE_KEY = 'wayfarer_idle';
export const WAYFARER_WALK_KEY = 'wayfarer_walk';
export const WAYFARER_RUN_KEY = 'wayfarer_run';
export const WAYFARER_ATTACK_KEY = 'wayfarer_attack';
export const WAYFARER_HURT_KEY = 'wayfarer_hurt';
export const WAYFARER_DEATH_KEY = 'wayfarer_death';
export const WAYFARER_INTERACT_KEY = 'wayfarer_interact';
export const WAYFARER_GATHER_KEY = 'wayfarer_gather';
export const WAYFARER_USE_ITEM_KEY = 'wayfarer_use_item';
export const WAYFARER_PORTRAIT_KEY = 'wayfarer_portrait';

export const WAYFARER_FRAME_WIDTH = 64;
export const WAYFARER_FRAME_HEIGHT = 64;
export const WAYFARER_ORIGIN_X = 0.5;
export const WAYFARER_ORIGIN_Y = 0.90625; // Bàn chân tại y = 58 trong frame 64x64 (58/64)
export const WAYFARER_BODY_WIDTH = 14;
export const WAYFARER_BODY_HEIGHT = 8;
export const WAYFARER_BODY_OFFSET_X = 25;
export const WAYFARER_BODY_OFFSET_Y = 50;

// Điểm neo chân (Foot anchor) và va chạm gót chân (Tương thích ngược)
export const SATYR_ORIGIN_X = 0.5;
export const SATYR_ORIGIN_Y = 0.90625;
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
export const SPRITE_ROCK_LARGE = 'rock_large';
export const SPRITE_ROCK_MEDIUM = 'rock_medium';
export const SPRITE_WOODEN_FENCE = 'wooden_fence';
export const SPRITE_SIGNPOST = 'signpost';

// Khóa Texture Địa Hình Mặt Đất (Terrain Tile Keys - PASS T07)
export const TILE_FOREST_GRASS = 'tile_forest_grass';
export const TILE_DIRT_TRAIL = 'tile_dirt_trail';
export const TILE_SWAMP_MUD = 'tile_swamp_mud';
export const TILE_COBBLE_ROAD = 'tile_cobble_road';
export const TILE_STONE_FLOOR = 'tile_stone_floor';

// Khóa Texture NPC & Chân Dung (NPC Sprite & Portrait Keys - PASS T09 / C4-12-08 / C4-13-21)
export const SPRITE_NPC_GARTH = 'npc_garth';
export const PORTRAIT_GARTH = 'portrait_garth';
export const SPRITE_NPC_EDDA = 'npc_edda';
export const PORTRAIT_EDDA = 'portrait_edda';
export const SPRITE_NPC_NERIS = 'npc_neris';
export const PORTRAIT_NERIS = 'portrait_neris';
export const SPRITE_NPC_BRAM = 'npc_bram';
export const PORTRAIT_BRAM = 'portrait_bram';
export const SPRITE_NPC_FINN = 'npc_finn';
export const PORTRAIT_FINN = 'portrait_finn';
export const SPRITE_BLACKSMITH_SHEET = 'blacksmith_sheet';
export const SPRITE_NPC_BLACKSMITH = 'npc_blacksmith';
export const PORTRAIT_BLACKSMITH = 'portrait_blacksmith';

// Khóa Texture Hoạt Ảnh NPC Chuẩn Hóa (C4-12-08 / C4-12-09)
export const SPRITE_GARTH_IDLE = 'garth_idle';
export const SPRITE_GARTH_WALK = 'garth_walk';
export const SPRITE_EDDA_IDLE = 'edda_idle';
export const SPRITE_EDDA_WALK = 'edda_walk';
export const SPRITE_NERIS_IDLE = 'neris_idle';
export const SPRITE_NERIS_WALK = 'neris_walk';
export const SPRITE_EDDA_IDLE_SHEET = 'edda_idle_sheet';
export const SPRITE_NERIS_IDLE_SHEET = 'neris_idle_sheet';
export const SPRITE_GARTH_WALK_SHEET = 'garth_walk_sheet';
export const SPRITE_POTTER_WALK_SHEET = 'potter_walk_sheet';
export const SPRITE_ERRAND_BOY_WALK_SHEET = 'errand_boy_walk_sheet';

// Khóa Texture NPC Hiệp Sĩ Canh Lửa (Campfire Knight — V14-P8-14A)
export const SPRITE_CAMPFIRE_KNIGHT_PRAY = 'campfire_knight_pray_sheet';
export const SPRITE_CAMPFIRE_KNIGHT_IDLE = 'campfire_knight_idle_sheet';
export const PORTRAIT_CAMPFIRE_KNIGHT = 'portrait_campfire_knight';

// Khóa Texture Quái Vật & Bóng Ma (Monster & Echo Sprite Keys - PASS T10)
export const SPRITE_THE_LISTENER = 'the_listener';
export const SPRITE_THE_ECHO = 'the_echo';
export const SPRITE_SKULL_WOLF = 'skull_wolf_sheet';
export const PORTRAIT_SKULL_WOLF = 'portrait_skull_wolf';
export const SPRITE_SHADOW_CROW = 'shadow_crow_sheet';
export const SPRITE_SHADOW_EYES = 'shadow_eyes_sheet';
export const SPRITE_SHADOW_BIG_BOSS = 'shadow_big_boss_sheet';
export const PORTRAIT_SHADOW_BIG_BOSS = 'portrait_shadow_big_boss';
export const SPRITE_FALLEN_KNIGHT = 'fallen_knight_sheet';
export const PORTRAIT_FALLEN_KNIGHT = 'portrait_fallen_knight';
export const SPRITE_DREAD_HORSEMAN = 'dread_horseman_sheet';
export const PORTRAIT_DREAD_HORSEMAN = 'portrait_dread_horseman';
export const SPRITE_HOODED_KNIGHT = 'hooded_knight_sheet';
export const PORTRAIT_HOODED_KNIGHT = 'portrait_hooded_knight';
export const SPRITE_FOG_SMOOTH = 'fog_smooth';

// Khóa Texture Tài Nguyên Thu Thập (World Resource Sprite Keys - C4-02A)
export const SPRITE_RES_DRY_WOOD = 'res_dry_wood';
export const SPRITE_RES_TREE_RESIN = 'res_tree_resin';
export const SPRITE_RES_FLINT = 'res_flint';
export const SPRITE_RES_HERBS = 'res_herbs';

// Layer Depths (Chuẩn phân tầng độ sâu đồ họa 2D - Đảm bảo phân khu có tọa độ Y âm như Rừng Sâu không bị che khuất)
export const DEPTH_GROUND_BASE = -10000;      // Nền đất baked cơ sở (Fog Crossing, Bellhollow, Deep Forest...)
export const DEPTH_GROUND_FOOTING = -9500;   // Chân móng công trình, bờ đá
export const DEPTH_GROUND_TURF = -9200;      // Đốm cỏ rêu, mảng đất phủ
export const DEPTH_GROUND_STONES = -9100;    // Sỏi đá cuội trên mặt đất
export const DEPTH_GROUND_FLORA = -9000;     // Hoa cỏ sát mặt sàn
export const DEPTH_GROUND_WATER = -8900;     // Vũng nước, dòng suối sát đất
export const DEPTH_GROUND_DECALS = -8500;    // Quầng sáng đèn sàn, nấm dạ quang sát sàn, hào quang bệ thờ
export const DEPTH_GROUND_MIST = -8000;      // Sương mù ranh giới mặt đất (WorldBuilder boundary mist)
export const DEPTH_VEIL_GROUND_FOG = -7000;  // Sương mù mặt đất của VeilSystem (dưới chân nhân vật)
export const DEPTH_VEIL_PINK_DAWN = -6900;   // Sương mù bình minh hồng của VeilSystem



