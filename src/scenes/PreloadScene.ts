/**
 * HOLLOW WOODS V1.3.2 - C4-132-08
 * AUDITED RESOURCE PRELOADER & ASSET INTEGRITY SYSTEM
 * 100% Relative Asset Paths for P2Game.io iframe compatibility
 */

import * as Phaser from 'phaser';
import { 
  SCENE_PRELOAD, 
  SCENE_MAIN_MENU, 
  SATYR_SHEET_KEY, 
  SATYR_PORTRAIT_KEY, 
  SATYR_FRAME_WIDTH, 
  SATYR_FRAME_HEIGHT,
  WAYFARER_IDLE_KEY,
  WAYFARER_WALK_KEY,
  WAYFARER_RUN_KEY,
  WAYFARER_ATTACK_KEY,
  WAYFARER_HURT_KEY,
  WAYFARER_DEATH_KEY,
  WAYFARER_INTERACT_KEY,
  WAYFARER_GATHER_KEY,
  WAYFARER_USE_ITEM_KEY,
  WAYFARER_PORTRAIT_KEY,
  WAYFARER_FRAME_WIDTH,
  WAYFARER_FRAME_HEIGHT,
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  TILE_FOREST_GRASS,
  TILE_DIRT_TRAIL,
  TILE_SWAMP_MUD,
  TILE_COBBLE_ROAD,
  TILE_STONE_FLOOR,
  CONFIG_USE_V14_PILOT_ENVIRONMENT,
  CONFIG_USE_V14_ENVIRONMENT,
  TILE_FOREST_GRASS_V14_A,
  TILE_FOREST_GRASS_V14_B,
  TILE_FOREST_GRASS_V14_C,
  TILE_DIRT_TRAIL_V14_A,
  TILE_DIRT_TRAIL_V14_B,
  TILE_COBBLE_ROAD_V14,
  TILE_STONE_FLOOR_V14,
  TILE_SWAMP_MUD_V14_A,
  TILE_SWAMP_MUD_V14_B,
  TILE_ABYSSAL_SOIL_V14_A,
  TILE_ABYSSAL_SOIL_V14_B,
  TILE_TILLED_SOIL_V14,
  TILE_WOOD_PLANK_WEATHERED_V14,
  SPRITE_NPC_GARTH,
  PORTRAIT_GARTH,
  SPRITE_NPC_EDDA,
  PORTRAIT_EDDA,
  SPRITE_NPC_NERIS,
  PORTRAIT_NERIS,
  SPRITE_NPC_BRAM,
  PORTRAIT_BRAM,
  SPRITE_NPC_FINN,
  PORTRAIT_FINN,
  SPRITE_BLACKSMITH_SHEET,
  SPRITE_NPC_BLACKSMITH,
  PORTRAIT_BLACKSMITH,
  SPRITE_GARTH_IDLE,
  SPRITE_GARTH_WALK,
  SPRITE_EDDA_IDLE,
  SPRITE_EDDA_WALK,
  SPRITE_NERIS_IDLE,
  SPRITE_NERIS_WALK,
  SPRITE_EDDA_IDLE_SHEET,
  SPRITE_NERIS_IDLE_SHEET,
  SPRITE_GARTH_WALK_SHEET,
  SPRITE_POTTER_WALK_SHEET,
  SPRITE_ERRAND_BOY_WALK_SHEET,
  SPRITE_CAMPFIRE_KNIGHT_PRAY,
  SPRITE_CAMPFIRE_KNIGHT_IDLE,
  PORTRAIT_CAMPFIRE_KNIGHT,
  SPRITE_THE_LISTENER,
  SPRITE_THE_ECHO,
  SPRITE_SKULL_WOLF,
  PORTRAIT_SKULL_WOLF,
  SPRITE_SHADOW_CROW,
  SPRITE_SHADOW_EYES,
  SPRITE_SHADOW_BIG_BOSS,
  PORTRAIT_SHADOW_BIG_BOSS,
  SPRITE_FALLEN_KNIGHT,
  PORTRAIT_FALLEN_KNIGHT,
  SPRITE_DREAD_HORSEMAN,
  PORTRAIT_DREAD_HORSEMAN,
  SPRITE_HOODED_KNIGHT,
  PORTRAIT_HOODED_KNIGHT,
  SPRITE_MIST_BAT,
  SPRITE_WANDERING_SHADE,
  SPRITE_GOBLIN_SCOUT,
  SPRITE_FOG_SMOOTH,
  SPRITE_HOUSE_ELDER_EDDA_V15,
  SPRITE_HOUSE_HERBALIST_NERIS_V15,
  SPRITE_SMITHY_WORKSHOP_BRAM_V15,
  SPRITE_GATEHOUSE_GARTH_V15,
  SPRITE_BELL_TOWER_GRAND_V15,
  SPRITE_VILLAGE_WELL_DETAILED_V15
} from '../config/Constants';

import { HUDIconGenerator } from '../utils/HUDIconGenerator';
import { AudioManager } from '../audio/AudioManager';
import {
  AtlasTextureResolver,
  ATLAS_PROPS_KEY,
  ATLAS_PROPS_PNG,
  ATLAS_PROPS_JSON
} from '../utils/AtlasTextureResolver';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_PRELOAD });
  }

  public preload(): void {
    // C4-13-11: Tạo texture trong suốt 1x1 sớm nhất có thể chống ô vuông lỗi texture
    if (!this.textures.exists('dummy_transparent')) {
      const dummyGfx = this.make.graphics({ x: 0, y: 0 });
      dummyGfx.generateTexture('dummy_transparent', 1, 1);
      dummyGfx.destroy();
    }

    // 1. Dựng thanh tiến trình tải (Loading Bar) & tiêu đề khởi động
    this.cameras.main.setBackgroundColor('#0b0c10');
    const titleText = this.add.text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 46, 'HOLLOW WOODS', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1c23, 0.8);
    progressBox.fillRect(VIRTUAL_WIDTH / 2 - 100, VIRTUAL_HEIGHT / 2 - 8, 200, 16);

    const loadingText = this.add.text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 24, 'Đang xuyên qua Màn Sương...', {
      fontFamily: 'serif',
      fontSize: '11px',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    const percentText = this.add.text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, '0%', {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      color: '#ecf0f1'
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x78281f, 1);
      progressBar.fillRect(VIRTUAL_WIDTH / 2 - 98, VIRTUAL_HEIGHT / 2 - 6, 196 * value, 12);
    });

    this.load.on('complete', () => {
      titleText.destroy();
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 2. Nạp sprite sheet chính của Satyr (64×64 px - tương thích ngược)
    this.load.spritesheet(SATYR_SHEET_KEY, 'assets/characters/satyr/satyr_sheet.png', {
      frameWidth: SATYR_FRAME_WIDTH,
      frameHeight: SATYR_FRAME_HEIGHT
    });

    // 2b. Nạp 9 sprite sheets gốc của nhân vật chính The Mossbound Wayfarer (64×64 px)
    this.load.spritesheet(WAYFARER_IDLE_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_idle.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_WALK_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_walk.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_RUN_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_run.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_ATTACK_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_attack.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_HURT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_hurt.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_DEATH_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_death.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_INTERACT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_interact.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_GATHER_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_gather.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });
    this.load.spritesheet(WAYFARER_USE_ITEM_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_use_item.png', {
      frameWidth: WAYFARER_FRAME_WIDTH,
      frameHeight: WAYFARER_FRAME_HEIGHT
    });

    // 3. Nạp chân dung hội thoại Satyr & The Mossbound Wayfarer (64×64 px)
    this.load.image(SATYR_PORTRAIT_KEY, 'assets/characters/satyr/satyr_portrait.png');
    this.load.image(WAYFARER_PORTRAIT_KEY, 'assets/characters/mossbound_wayfarer/wayfarer_portrait.png');

    // 4. Nạp các tileset môi trường đã trích xuất
    this.load.image('tx_grass', 'assets/environment/tilesets/TX Tileset Grass.png');
    this.load.image('tx_stone', 'assets/environment/tilesets/TX Tileset Stone Ground.png');
    this.load.image('tx_wall', 'assets/environment/tilesets/TX Tileset Wall.png');

    // 5. Nạp Texture Atlas gộp toàn bộ Props, Cây cối, Nhà cửa, Đèn lồng & Vật phẩm (HW-V14-ATLAS)
    // Toàn bộ 51 sprite vật thể đơn lẻ được gộp vào 1 Texture Atlas duy nhất (1024x512 <= 2048x2048)
    // với padding 2px và extrude 1px chống lem pixel viền. Mọi truy xuất key cũ được AtlasTextureResolver tự động điều phối.
    AtlasTextureResolver.install();
    this.load.atlas(ATLAS_PROPS_KEY, ATLAS_PROPS_PNG, ATLAS_PROPS_JSON);

    // 8. Nạp các tile địa hình mặt đất (PASS T07)
    this.load.image(TILE_FOREST_GRASS, 'assets/environment/tiles/tile_forest_grass.png');
    this.load.image(TILE_DIRT_TRAIL, 'assets/environment/tiles/tile_dirt_trail.png');
    this.load.image(TILE_SWAMP_MUD, 'assets/environment/tiles/tile_swamp_mud.png');
    this.load.image(TILE_COBBLE_ROAD, 'assets/environment/tiles/tile_cobble_road.png');
    this.load.image(TILE_STONE_FLOOR, 'assets/environment/tiles/tile_stone_floor.png');

    // V15-10: Nạp bộ Sprite Kiến Trúc Làng Bellhollow Pixel Art Chuẩn Hóa V1.5
    this.load.image(SPRITE_HOUSE_ELDER_EDDA_V15, 'assets/buildings/house_elder_edda.png');
    this.load.image(SPRITE_HOUSE_HERBALIST_NERIS_V15, 'assets/buildings/house_herbalist_neris.png');
    this.load.image(SPRITE_SMITHY_WORKSHOP_BRAM_V15, 'assets/buildings/smithy_workshop_bram.png');
    this.load.image(SPRITE_GATEHOUSE_GARTH_V15, 'assets/buildings/gatehouse_garth.png');
    this.load.image(SPRITE_BELL_TOWER_GRAND_V15, 'assets/buildings/bell_tower_grand.png');
    this.load.image(SPRITE_VILLAGE_WELL_DETAILED_V15, 'assets/buildings/village_well_detailed.png');

    // 8.1 Nạp các tài nguyên môi trường V1.4 Mẫu & Mở Rộng Toàn Hệ Thống (HW-V14-EXP)
    if (CONFIG_USE_V14_PILOT_ENVIRONMENT || CONFIG_USE_V14_ENVIRONMENT) {
      this.load.image(TILE_FOREST_GRASS_V14_A, 'assets/environment/v14/tiles/tile_forest_grass_v14_a.png');
      this.load.image(TILE_FOREST_GRASS_V14_B, 'assets/environment/v14/tiles/tile_forest_grass_v14_b.png');
      this.load.image(TILE_FOREST_GRASS_V14_C, 'assets/environment/v14/tiles/tile_forest_grass_v14_c.png');
      this.load.image(TILE_DIRT_TRAIL_V14_A, 'assets/environment/v14/tiles/tile_dirt_trail_v14_a.png');
      this.load.image(TILE_DIRT_TRAIL_V14_B, 'assets/environment/v14/tiles/tile_dirt_trail_v14_b.png');
      this.load.image(TILE_COBBLE_ROAD_V14, 'assets/environment/v14/tiles/tile_cobble_road_v14.png');
      this.load.image(TILE_STONE_FLOOR_V14, 'assets/environment/v14/tiles/tile_stone_floor_v14.png');
      this.load.image(TILE_SWAMP_MUD_V14_A, 'assets/environment/v14/tiles/tile_swamp_mud_v14_a.png');
      this.load.image(TILE_SWAMP_MUD_V14_B, 'assets/environment/v14/tiles/tile_swamp_mud_v14_b.png');
      this.load.image(TILE_ABYSSAL_SOIL_V14_A, 'assets/environment/v14/tiles/tile_abyssal_soil_v14_a.png');
      this.load.image(TILE_ABYSSAL_SOIL_V14_B, 'assets/environment/v14/tiles/tile_abyssal_soil_v14_b.png');
      this.load.image(TILE_TILLED_SOIL_V14, 'assets/environment/v14/tiles/tile_tilled_soil_v14.png');
      this.load.image(TILE_WOOD_PLANK_WEATHERED_V14, 'assets/environment/v14/tiles/tile_wood_plank_weathered_v14.png');
    }

    // 9. Nạp các sprite NPC & Chân dung hội thoại pixel art C4-12-08 / C4-13-21 / C4-132-06 (Garth, Edda, Neris, Bram, Finn, Blacksmith)
    this.load.image(PORTRAIT_GARTH, 'assets/characters/villagers/portrait_garth.png');
    this.load.image(PORTRAIT_EDDA, 'assets/characters/villagers/portrait_edda.png');
    this.load.image(PORTRAIT_NERIS, 'assets/characters/villagers/portrait_neris.png');
    this.load.image(PORTRAIT_BRAM, 'assets/characters/villagers/portrait_blacksmith.png');
    this.load.image(PORTRAIT_BLACKSMITH, 'assets/characters/villagers/portrait_blacksmith.png');
    this.load.image(PORTRAIT_FINN, 'assets/characters/villagers/portrait_finn.png');

    // Nạp các Spritesheet 64x64 px mới từ C4-12-08 và NPC Thợ Rèn Bram C4-13-21
    this.load.spritesheet(SPRITE_EDDA_IDLE_SHEET, 'assets/characters/villagers/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_IDLE_SHEET, 'assets/characters/villagers/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_GARTH_WALK_SHEET, 'assets/characters/villagers/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_POTTER_WALK_SHEET, 'assets/characters/villagers/potter_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_ERRAND_BOY_WALK_SHEET, 'assets/characters/villagers/errand_boy_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_BLACKSMITH_SHEET, 'assets/characters/villagers/blacksmith_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // V14-P8-14A: Nạp sprite NPC Hiệp Sĩ Canh Lửa (Campfire Knight)
    this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_PRAY, 'assets/characters/npcs/campfire_knight_pray_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_IDLE, 'assets/characters/npcs/campfire_knight_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_CAMPFIRE_KNIGHT, 'assets/characters/npcs/portrait_campfire_knight.png');

    // Giữ tương thích các khóa nạp spritesheet cũ (garth_idle, garth_walk, edda_idle, edda_walk, neris_idle, neris_walk)
    this.load.spritesheet(SPRITE_GARTH_IDLE, 'assets/characters/villagers/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_GARTH_WALK, 'assets/characters/villagers/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_EDDA_IDLE, 'assets/characters/villagers/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_EDDA_WALK, 'assets/characters/villagers/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_IDLE, 'assets/characters/villagers/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_WALK, 'assets/characters/villagers/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Giữ tương thích các khóa sprite ảnh tĩnh cũ (npc_garth, npc_edda, npc_neris, npc_bram, npc_finn, npc_blacksmith)
    this.load.image(SPRITE_NPC_GARTH, 'assets/characters/villagers/npc_garth.png');
    this.load.image(SPRITE_NPC_EDDA, 'assets/characters/villagers/npc_edda.png');
    this.load.image(SPRITE_NPC_NERIS, 'assets/characters/villagers/npc_neris.png');
    this.load.image(SPRITE_NPC_BRAM, 'assets/characters/villagers/npc_blacksmith.png');
    this.load.image(SPRITE_NPC_BLACKSMITH, 'assets/characters/villagers/npc_blacksmith.png');
    this.load.image(SPRITE_NPC_FINN, 'assets/characters/villagers/npc_finn.png');

    // 10. Nạp các sprite quái vật bóng đêm & tàn ảnh (PASS T10, GATE 2B)
    this.load.spritesheet(SPRITE_THE_LISTENER, 'assets/monsters/the_listener.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(SPRITE_THE_ECHO, 'assets/monsters/the_echo.png');
    this.load.spritesheet(SPRITE_SKULL_WOLF, 'assets/characters/monsters/skull_wolf_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_SKULL_WOLF, 'assets/characters/monsters/portrait_skull_wolf.png');

    // V1.4 - P8-09: Quái Vật Bóng Tối (Shadow Crow, Shadow Eyes, Abyssal Shade Behemoth)
    this.load.spritesheet(SPRITE_SHADOW_CROW, 'assets/characters/monsters/shadow_crow_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_SHADOW_EYES, 'assets/characters/monsters/shadow_eyes_sheet.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet(SPRITE_SHADOW_BIG_BOSS, 'assets/characters/bosses/shadow_big_boss_sheet.png', {
      frameWidth: 80,
      frameHeight: 80
    });
    this.load.image(PORTRAIT_SHADOW_BIG_BOSS, 'assets/characters/bosses/portrait_shadow_big_boss.png');

    // V1.4 - Bước 13: Sinh vật Phục kích N3XUS & Trinh sát Goblin Scout
    this.load.spritesheet(SPRITE_MIST_BAT, 'assets/characters/monsters/bat_sheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet(SPRITE_WANDERING_SHADE, 'assets/characters/monsters/ghost_sheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet(SPRITE_GOBLIN_SCOUT, 'assets/characters/monsters/goblin_scout_dagger_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // V1.4 - P8-10: Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction)
    this.load.spritesheet(SPRITE_FALLEN_KNIGHT, 'assets/characters/enemies/fallen_knight_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_FALLEN_KNIGHT, 'assets/characters/enemies/portrait_fallen_knight.png');
    this.load.spritesheet(SPRITE_DREAD_HORSEMAN, 'assets/characters/enemies/dread_horseman_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_DREAD_HORSEMAN, 'assets/characters/enemies/portrait_dread_horseman.png');
    this.load.spritesheet(SPRITE_HOODED_KNIGHT, 'assets/characters/bosses/hooded_knight_sheet.png', {
      frameWidth: 160,
      frameHeight: 160
    });
    this.load.image(PORTRAIT_HOODED_KNIGHT, 'assets/characters/bosses/portrait_hooded_knight.png');

    this.load.image(SPRITE_FOG_SMOOTH, 'assets/environment/sprites/fog_smooth.png');

    // 12. Nạp toàn bộ hiệu ứng âm thanh & âm thanh khí quyển mã nguồn mở (C4-133-02)
    // Nhạc nền khí quyển theo vùng (Ambience)
    this.load.audio('ambience_village', 'assets/audio/ambience/ambience_village.mp3');
    this.load.audio('ambience_forest', 'assets/audio/ambience/ambience_forest.mp3');
    this.load.audio('ambience_mire', 'assets/audio/ambience/ambience_mire.mp3');
    this.load.audio('ambience_crossing', 'assets/audio/ambience/ambience_crossing.mp3');

    // SFX Hành động, Sinh tồn & Chiến đấu
    this.load.audio('attack_swing', 'assets/audio/sfx/attack_swing.mp3');
    this.load.audio('bell_low', 'assets/audio/sfx/bell_low.mp3');
    this.load.audio('bush_rustle', 'assets/audio/sfx/bush_rustle.mp3');
    this.load.audio('craft_success', 'assets/audio/sfx/craft_success.wav');
    this.load.audio('footstep_grass', 'assets/audio/sfx/footstep_grass.mp3');
    this.load.audio('herb_gather', 'assets/audio/sfx/herb_gather.wav');
    this.load.audio('hurt', 'assets/audio/sfx/hurt.wav');
    this.load.audio('interact', 'assets/audio/sfx/interact.wav');
    this.load.audio('lantern_toggle', 'assets/audio/sfx/lantern_toggle.mp3');
    this.load.audio('listener_alert', 'assets/audio/sfx/listener_alert.mp3');
    this.load.audio('monster_step', 'assets/audio/sfx/monster_step.mp3');
    this.load.audio('player_death', 'assets/audio/sfx/player_death.wav');
    this.load.audio('quest_update', 'assets/audio/sfx/quest_update.wav');
    this.load.audio('resource_gather', 'assets/audio/sfx/resource_gather.mp3');
    this.load.audio('rune_error', 'assets/audio/sfx/rune_error.mp3');
    this.load.audio('rune_resonance', 'assets/audio/sfx/rune_resonance.mp3');
    this.load.audio('ui_select', 'assets/audio/sfx/ui_select.wav');
    this.load.audio('ui_confirm', 'assets/audio/sfx/ui_confirm.wav');
    this.load.audio('ui_cancel', 'assets/audio/sfx/ui_cancel.wav');
    this.load.audio('heal_poultice', 'assets/audio/sfx/heal_poultice.wav');
    this.load.audio('oil_refill', 'assets/audio/sfx/oil_refill.wav');

    // Giọng thoại mở đầu NPC & Hiệu ứng máy đánh chữ (Super Dialogue & 8-bit Pack)
    this.load.audio('dialogue_garth', 'assets/audio/dialogue/dialogue_garth.wav');
    this.load.audio('dialogue_edda', 'assets/audio/dialogue/dialogue_edda.wav');
    this.load.audio('dialogue_neris', 'assets/audio/dialogue/dialogue_neris.wav');
    this.load.audio('dialogue_bram', 'assets/audio/dialogue/dialogue_bram.wav');
    this.load.audio('dialogue_finn', 'assets/audio/dialogue/dialogue_finn.wav');
    this.load.audio('dialogue_text_blip', 'assets/audio/dialogue/dialogue_text_blip.wav');

    // 13. V1.4 - Nạp toàn bộ tài nguyên âm thanh mở rộng V1.4 (Bề mặt di chuyển, Hù dọa, Quái vật, Boss)
    this.load.audio('footstep_mud_1', 'assets/audio/sfx/v14/footstep_mud_1.wav');
    this.load.audio('footstep_mud_2', 'assets/audio/sfx/v14/footstep_mud_2.wav');
    this.load.audio('footstep_wood_1', 'assets/audio/sfx/v14/footstep_wood_1.wav');
    this.load.audio('footstep_wood_2', 'assets/audio/sfx/v14/footstep_wood_2.wav');
    this.load.audio('footstep_stone_1', 'assets/audio/sfx/v14/footstep_stone_1.wav');
    this.load.audio('footstep_stone_2', 'assets/audio/sfx/v14/footstep_stone_2.wav');
    this.load.audio('footstep_leaves_1', 'assets/audio/sfx/v14/footstep_leaves_1.mp3');
    this.load.audio('bat_flap', 'assets/audio/sfx/v14/bat_flap.wav');
    this.load.audio('bat_screech', 'assets/audio/sfx/v14/bat_screech.wav');
    this.load.audio('bat_bite', 'assets/audio/sfx/v14/bat_bite.wav');
    this.load.audio('ghost_moan', 'assets/audio/sfx/v14/ghost_moan.wav');
    this.load.audio('ghost_whisper', 'assets/audio/sfx/v14/ghost_whisper.wav');
    this.load.audio('ghost_scream', 'assets/audio/sfx/v14/ghost_scream.wav');
    this.load.audio('ghost_dissipate', 'assets/audio/sfx/v14/ghost_dissipate.wav');
    this.load.audio('jumpscare_stinger', 'assets/audio/sfx/v14/jumpscare_stinger.wav');
    this.load.audio('sanity_gasp', 'assets/audio/sfx/v14/sanity_gasp.wav');
    this.load.audio('scout_whistle', 'assets/audio/sfx/v14/scout_whistle.wav');
    this.load.audio('dagger_slash', 'assets/audio/sfx/v14/dagger_slash.wav');
    this.load.audio('skull_wolf_growl', 'assets/audio/sfx/v14/skull_wolf_growl.wav');
    this.load.audio('skull_wolf_snarl', 'assets/audio/sfx/v14/skull_wolf_snarl.wav');
    this.load.audio('behemoth_roar', 'assets/audio/sfx/v14/behemoth_roar.wav');
    this.load.audio('behemoth_thud', 'assets/audio/sfx/v14/behemoth_thud.wav');
    this.load.audio('void_stalker_drone', 'assets/audio/sfx/v14/void_stalker_drone.wav');
    this.load.audio('void_stalker_screech', 'assets/audio/sfx/v14/void_stalker_screech.wav');
    this.load.audio('boss_drone', 'assets/audio/sfx/v14/boss_drone.wav');
    this.load.audio('rune_shift', 'assets/audio/sfx/v14/rune_shift.wav');
    this.load.audio('bell_toll_low', 'assets/audio/sfx/v14/bell_toll_low.wav');
    this.load.audio('chest_creak', 'assets/audio/sfx/v14/chest_creak.wav');
    this.load.audio('journal_page', 'assets/audio/sfx/v14/journal_page.wav');
  }

  public create(): void {
    // Tạo texture trong suốt 1x1 chuẩn cho các collider vô hình, chống fallback sang __DEFAULT (hộp xanh lá X)
    if (!this.textures.exists('dummy_transparent')) {
      const dummyGfx = this.make.graphics({ x: 0, y: 0 });
      dummyGfx.generateTexture('dummy_transparent', 1, 1);
      dummyGfx.destroy();
    }

    // C4-13-15: Nạp 4 Icon Pixel Art (16x16 px) sắc nét cho các thuộc tính sinh tồn HUD
    HUDIconGenerator.generateAllHUDIcons(this);

    // HW-V14-ATLAS: Đồng bộ hóa Texture Atlas & thiết lập NEAREST Filter cho toàn bộ Tilemap & Atlas (chống lem viền pixel)
    AtlasTextureResolver.syncTextures(this);

    // V14-P8-14B: Đăng ký 2 hoạt ảnh chuẩn của Hiệp Sĩ Canh Lửa (anim_campfire_knight_pray và anim_campfire_knight_idle)
    if (this.textures.exists(SPRITE_CAMPFIRE_KNIGHT_PRAY) && !this.anims.exists('anim_campfire_knight_pray')) {
      this.anims.create({
        key: 'anim_campfire_knight_pray',
        frames: this.anims.generateFrameNumbers(SPRITE_CAMPFIRE_KNIGHT_PRAY, { start: 0, end: 11 }),
        frameRate: 4,
        repeat: -1
      });
    }
    if (this.textures.exists(SPRITE_CAMPFIRE_KNIGHT_IDLE) && !this.anims.exists('anim_campfire_knight_idle')) {
      this.anims.create({
        key: 'anim_campfire_knight_idle',
        frames: this.anims.generateFrameNumbers(SPRITE_CAMPFIRE_KNIGHT_IDLE, { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // C4-133-02: Đồng bộ tức thì các AudioBuffer đã được Phaser nạp vào AudioManager
    AudioManager.getInstance().syncWithPhaserCache(this);

    this.scene.start(SCENE_MAIN_MENU);
  }
}

