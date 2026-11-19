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
export const WAYFARER_ORIGIN_Y = 1.0; // V1.5-09: Chuẩn hóa điểm neo chân 100% tại đáy frame (y = 64/64 = 1.0)
export const WAYFARER_BODY_WIDTH = 18;
export const WAYFARER_BODY_HEIGHT = 12;
export const WAYFARER_BODY_OFFSET_X = 23;
export const WAYFARER_BODY_OFFSET_Y = 46; // V1.5-03: Sát đáy bàn chân: 58 - 12 = 46

// Điểm neo chân (Foot anchor) và va chạm gót chân (Tương thích ngược)
export const SATYR_ORIGIN_X = 0.5;
export const SATYR_ORIGIN_Y = 1.0;
export const SATYR_BODY_WIDTH = 14;
export const SATYR_BODY_HEIGHT = 8;
export const SATYR_BODY_OFFSET_X = 25;
export const SATYR_BODY_OFFSET_Y = 56;

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

// Khóa Texture Công Trình Kiến Trúc Làng Bellhollow Chuẩn Hóa V1.5 (High-Fidelity Medieval Buildings)
export const SPRITE_HOUSE_ELDER_EDDA_V15 = 'house_elder_edda';
export const SPRITE_HOUSE_HERBALIST_NERIS_V15 = 'house_herbalist_neris';
export const SPRITE_SMITHY_WORKSHOP_BRAM_V15 = 'smithy_workshop_bram';
export const SPRITE_GATEHOUSE_GARTH_V15 = 'gatehouse_garth';
export const SPRITE_BELL_TOWER_GRAND_V15 = 'bell_tower_grand';
export const SPRITE_VILLAGE_WELL_DETAILED_V15 = 'village_well_detailed';

// Khóa Texture Thực Vật & Cây Cổ Thụ Rừng Sương V1.5 (High-Fidelity Foliage)
export const SPRITE_TREE_MIST_PINE_V15 = 'tree_mist_pine';
export const SPRITE_TREE_MOSSY_OAK_GRAND_V15 = 'tree_mossy_oak_grand';
export const SPRITE_TREE_WEEPING_WILLOW_V15 = 'tree_weeping_willow';
export const SPRITE_TREE_WITHERED_GNARLED_V15 = 'tree_withered_gnarled';

// Khóa Texture Lớp Phủ Mặt Đất V1.5 (Ground Details / Decals)
export const SPRITE_DECAL_WILD_GRASS_V15 = 'decal_wild_grass';
export const SPRITE_DECAL_FERN_CLUSTER_V15 = 'decal_fern_cluster';
export const SPRITE_DECAL_GLOWING_MUSHROOMS_V15 = 'decal_glowing_mushrooms';
export const SPRITE_DECAL_AUTUMN_LEAVES_V15 = 'decal_autumn_leaves';
export const SPRITE_DECAL_PEBBLES_STONES_V15 = 'decal_pebbles_stones';
export const SPRITE_DECAL_SWAMP_PUDDLE_V15 = 'decal_swamp_puddle';

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
export const SPRITE_MIST_BAT = 'mist_bat_sheet';
export const SPRITE_WANDERING_SHADE = 'wandering_shade_sheet';
export const SPRITE_GOBLIN_SCOUT = 'goblin_scout_dagger_sheet';
export const SPRITE_FOG_SMOOTH = 'fog_smooth';

// Khóa Texture Tài Nguyên Thu Thập (World Resource Sprite Keys - C4-02A & V15-12)
export const SPRITE_RES_DRY_WOOD = 'res_dry_wood';
export const SPRITE_RES_TREE_RESIN = 'res_tree_resin';
export const SPRITE_RES_FLINT = 'res_flint';
export const SPRITE_RES_HERBS = 'res_herbs';
export const SPRITE_RES_RUNED_IRON = 'res_runed_iron';

// Khóa Texture Cụm Sanctuary Camp & Đạo Cụ Làng V1.5 (V15-12)
export const SPRITE_CAMPFIRE_TIER1_V15 = 'campfire_tier1';
export const SPRITE_CAMPFIRE_TIER2_V15 = 'campfire_tier2';
export const SPRITE_CAMPFIRE_TIER3_V15 = 'campfire_tier3';
export const SPRITE_CAMPFIRE_UNLIT_V15 = 'campfire_unlit';
export const SPRITE_PROP_CHEST_BRONZE_V15 = 'prop_chest_bronze';
export const SPRITE_PROP_CAULDRON_TRIPOD_V15 = 'prop_cauldron_tripod';
export const SPRITE_PROP_WAYFARER_TENT_V15 = 'prop_wayfarer_tent';
export const SPRITE_PROP_LANTERN_POST_V15 = 'prop_lantern_post';
export const SPRITE_PROP_SIGNPOST_WOOD_V15 = 'prop_signpost_wood';

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

// =========================================================================
// V1.4 MỞ RỘNG: KHÓA TEXTURE & CỜ THỬ NGHIỆM MÔI TRƯỜNG MẪU (PILOT ZONE)
// =========================================================================
export const CONFIG_USE_V14_PILOT_ENVIRONMENT = true;
export const CONFIG_USE_V14_ENVIRONMENT = true;

// Khóa Cây đại thụ V1.4
export const SPRITE_TREE_OAK_MOSSY_V14 = 'tree_oak_mossy_v14';
export const SPRITE_TREE_BIRCH_AMBER_V14 = 'tree_birch_amber_v14';
export const SPRITE_TREE_MAPLE_CRIMSON_V14 = 'tree_maple_crimson_v14';
export const SPRITE_TREE_HOLLOW_ANCIENT_V14 = 'tree_hollow_ancient_v14';
export const SPRITE_TREE_OAK_ANCIENT_TITAN_V14 = 'tree_oak_ancient_titan_v14';
export const SPRITE_TREE_DEAD_WITHERED_V14 = 'tree_dead_withered_v14';

// Khóa Chướng ngại vật & Đạo cụ V1.4
export const SPRITE_PROP_FALLEN_LOG_MOSSY_V14 = 'prop_fallen_log_mossy_v14';
export const SPRITE_PROP_STUMP_MOSSY_LARGE_V14 = 'prop_stump_mossy_large_v14';
export const SPRITE_ROCK_MOSSY_FOREST_01_V14 = 'rock_mossy_forest_01_v14';
export const SPRITE_ROCK_MOSSY_FOREST_02_V14 = 'rock_mossy_forest_02_v14';
export const SPRITE_ROCK_LARGE_MOSSY_V14 = 'rock_large_mossy_v14';
export const SPRITE_CLIFF_FACE_WESTERN_V14 = 'cliff_face_western_v14';
export const SPRITE_STRUCTURE_ABYSSAL_GATE_V14 = 'structure_abyssal_gate_v14';
export const SPRITE_PROP_TANGLED_ROOTS_V14 = 'prop_tangled_roots_v14';
export const SPRITE_PROP_SHROOM_GLOW_TEAL_V14 = 'prop_shroom_glow_teal_v14';
export const SPRITE_PROP_ANCIENT_MONOLITH_V14 = 'prop_ancient_monolith_v14';
export const SPRITE_PROP_SWAMP_CATTAILS_V14 = 'prop_swamp_cattails_v14';
export const SPRITE_PROP_MUSHROOM_CLUSTER_V14 = 'prop_mushroom_cluster_v14';
export const SPRITE_PROP_FERN_CLUSTER_V14 = 'prop_fern_cluster_v14';
export const SPRITE_PROP_CHOPPED_WOOD_V14 = 'prop_chopped_wood_v14';
export const SPRITE_PROP_BARREL_AGED_V14 = 'prop_barrel_aged_v14';
export const SPRITE_PROP_CRATE_WEATHERED_V14 = 'prop_crate_weathered_v14';

// Khóa Công trình Làng V1.4
export const SPRITE_BUILDING_HOUSE_EDDA_V14 = 'building_house_edda_v14';
export const SPRITE_BUILDING_HOUSE_NERIS_V14 = 'building_house_neris_v14';
export const SPRITE_BUILDING_VILLAGE_WELL_V14 = 'building_village_well_v14';

// Khóa Tile địa hình V1.4
export const TILE_FOREST_GRASS_V14_A = 'tile_forest_grass_v14_a';
export const TILE_FOREST_GRASS_V14_B = 'tile_forest_grass_v14_b';
export const TILE_FOREST_GRASS_V14_C = 'tile_forest_grass_v14_c';
export const TILE_DIRT_TRAIL_V14_A = 'tile_dirt_trail_v14_a';
export const TILE_DIRT_TRAIL_V14_B = 'tile_dirt_trail_v14_b';
export const TILE_COBBLE_ROAD_V14 = 'tile_cobble_road_v14';
export const TILE_STONE_FLOOR_V14 = 'tile_stone_floor_v14';
export const TILE_SWAMP_MUD_V14_A = 'tile_swamp_mud_v14_a';
export const TILE_SWAMP_MUD_V14_B = 'tile_swamp_mud_v14_b';
export const TILE_ABYSSAL_SOIL_V14_A = 'tile_abyssal_soil_v14_a';
export const TILE_ABYSSAL_SOIL_V14_B = 'tile_abyssal_soil_v14_b';
export const TILE_TILLED_SOIL_V14 = 'tile_tilled_soil_v14';
export const TILE_WOOD_PLANK_WEATHERED_V14 = 'tile_wood_plank_weathered_v14';

// Khóa 5 Phân khu Mở rộng Mới (New Expansion Zone IDs - HW-V14-EXP-06)
export const ZONE_ABYSSAL_CHASM = 'abyssal_chasm';
export const ZONE_DROWNED_MIRE_DEPTHS = 'drowned_mire_depths';
export const ZONE_WHISPERING_GROVE_SANCTUM = 'whispering_grove_sanctum';
export const ZONE_SUNKEN_CRYPT_RUINS = 'sunken_crypt_ruins';
export const ZONE_VEIL_ORIGIN_CAVERN = 'veil_origin_cavern';

// V15-42: Bộ Sprite Boss Kẻ Nuốt Tiếng Chuông (SHADOW Series - The Shadowed Wetlands Boss v1.1)
export const SPRITE_BOSS_WETLANDS_IDLE = 'boss_wetlands_idle';
export const SPRITE_BOSS_WETLANDS_WALK = 'boss_wetlands_walk';
export const SPRITE_BOSS_WETLANDS_ATTACK1 = 'boss_wetlands_attack1';
export const SPRITE_BOSS_WETLANDS_ATTACK2 = 'boss_wetlands_attack2';
export const SPRITE_BOSS_WETLANDS_HIT = 'boss_wetlands_hit';
export const SPRITE_BOSS_WETLANDS_DEATH = 'boss_wetlands_death';





