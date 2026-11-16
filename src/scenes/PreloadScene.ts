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
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_OAK_2,
  SPRITE_TREE_OAK_3,
  SPRITE_BUSH_DENSE_1,
  SPRITE_BUSH_DENSE_2,
  SPRITE_HOLLOW_TREE,
  SPRITE_TREE_DEAD,
  SPRITE_HOUSE_EDDA,
  SPRITE_HOUSE_NERIS,
  SPRITE_BELL_TOWER,
  SPRITE_BROKEN_SHRINE,
  SPRITE_PILLAR_MOON,
  SPRITE_PILLAR_ROOT,
  SPRITE_PILLAR_EYE,
  SPRITE_VILLAGE_WELL,
  SPRITE_CRAFTING_BENCH,
  SPRITE_STONE_ALTAR,
  SPRITE_ROCK_LARGE,
  SPRITE_ROCK_MEDIUM,
  SPRITE_WOODEN_FENCE,
  SPRITE_SIGNPOST,
  TILE_FOREST_GRASS,
  TILE_DIRT_TRAIL,
  TILE_SWAMP_MUD,
  TILE_COBBLE_ROAD,
  TILE_STONE_FLOOR,
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
  SPRITE_THE_LISTENER,
  SPRITE_THE_ECHO,
  SPRITE_FOG_SMOOTH,
  SPRITE_RES_DRY_WOOD,
  SPRITE_RES_TREE_RESIN,
  SPRITE_RES_FLINT,
  SPRITE_RES_HERBS
} from '../config/Constants';

import { HUDIconGenerator } from '../utils/HUDIconGenerator';

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

    // 5. Nạp các sprite cây cối & môi trường pixel art (PASS T04)
    this.load.image(SPRITE_TREE_OAK_1, 'assets/environment/sprites/tree_oak_1.png');
    this.load.image(SPRITE_TREE_OAK_2, 'assets/environment/sprites/tree_oak_2.png');
    this.load.image(SPRITE_TREE_OAK_3, 'assets/environment/sprites/tree_oak_3.png');
    this.load.image(SPRITE_BUSH_DENSE_1, 'assets/environment/sprites/bush_dense_1.png');
    this.load.image(SPRITE_BUSH_DENSE_2, 'assets/environment/sprites/bush_dense_2.png');
    this.load.image(SPRITE_HOLLOW_TREE, 'assets/environment/sprites/hollow_tree.png');
    this.load.image(SPRITE_TREE_DEAD, 'assets/environment/sprites/tree_dead.png');

    // 6. Nạp các công trình kiến trúc pixel art (PASS T05)
    this.load.image(SPRITE_HOUSE_EDDA, 'assets/environment/sprites/house_edda.png');
    this.load.image(SPRITE_HOUSE_NERIS, 'assets/environment/sprites/house_neris.png');
    this.load.image(SPRITE_BELL_TOWER, 'assets/environment/sprites/bell_tower.png');
    this.load.image(SPRITE_BROKEN_SHRINE, 'assets/environment/sprites/broken_shrine.png');

    // 7. Nạp các vật thể & cột đá cổ ngữ pixel art (PASS T06)
    this.load.image(SPRITE_PILLAR_MOON, 'assets/environment/sprites/pillar_moon.png');
    this.load.image(SPRITE_PILLAR_ROOT, 'assets/environment/sprites/pillar_root.png');
    this.load.image(SPRITE_PILLAR_EYE, 'assets/environment/sprites/pillar_eye.png');
    this.load.image(SPRITE_VILLAGE_WELL, 'assets/environment/sprites/village_well.png');
    this.load.image(SPRITE_CRAFTING_BENCH, 'assets/environment/sprites/crafting_bench.png');
    this.load.image(SPRITE_STONE_ALTAR, 'assets/environment/sprites/stone_altar.png');
    this.load.image(SPRITE_ROCK_LARGE, 'assets/environment/sprites/rock_large.png');
    this.load.image(SPRITE_ROCK_MEDIUM, 'assets/environment/sprites/rock_medium.png');
    this.load.image(SPRITE_WOODEN_FENCE, 'assets/environment/sprites/wooden_fence.png');
    this.load.image(SPRITE_SIGNPOST, 'assets/environment/sprites/signpost.png');

    // 8. Nạp các tile địa hình mặt đất (PASS T07)
    this.load.image(TILE_FOREST_GRASS, 'assets/environment/tiles/tile_forest_grass.png');
    this.load.image(TILE_DIRT_TRAIL, 'assets/environment/tiles/tile_dirt_trail.png');
    this.load.image(TILE_SWAMP_MUD, 'assets/environment/tiles/tile_swamp_mud.png');
    this.load.image(TILE_COBBLE_ROAD, 'assets/environment/tiles/tile_cobble_road.png');
    this.load.image(TILE_STONE_FLOOR, 'assets/environment/tiles/tile_stone_floor.png');

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
    this.load.image(SPRITE_FOG_SMOOTH, 'assets/environment/sprites/fog_smooth.png');

    // 11. Nạp các sprite tài nguyên thu thập thế giới 16×16 px (C4-02A)
    this.load.image(SPRITE_RES_DRY_WOOD, 'assets/environment/sprites/res_dry_wood.png');
    this.load.image(SPRITE_RES_TREE_RESIN, 'assets/environment/sprites/res_tree_resin.png');
    this.load.image(SPRITE_RES_FLINT, 'assets/environment/sprites/res_flint.png');
    this.load.image(SPRITE_RES_HERBS, 'assets/environment/sprites/res_herbs.png');
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

    this.scene.start(SCENE_MAIN_MENU);
  }
}

