import * as Phaser from 'phaser';
import { 
  SCENE_PRELOAD, 
  SCENE_MAIN_MENU, 
  SATYR_SHEET_KEY, 
  SATYR_PORTRAIT_KEY, 
  SATYR_FRAME_WIDTH, 
  SATYR_FRAME_HEIGHT,
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
  SPRITE_THE_LISTENER,
  SPRITE_THE_ECHO,
  SPRITE_FOG_SMOOTH
} from '../config/Constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_PRELOAD });
  }

  public preload(): void {
    // 1. Dựng thanh tiến trình tải (Loading Bar)
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
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 2. Nạp sprite sheet chính của Satyr (64×64 px)
    this.load.spritesheet(SATYR_SHEET_KEY, 'assets/characters/satyr/satyr_sheet.png', {
      frameWidth: SATYR_FRAME_WIDTH,
      frameHeight: SATYR_FRAME_HEIGHT
    });

    // 3. Nạp chân dung Satyr
    this.load.image(SATYR_PORTRAIT_KEY, 'assets/characters/satyr/satyr_portrait.png');

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
    this.load.image(SPRITE_WOODEN_FENCE, 'assets/environment/sprites/wooden_fence.png');
    this.load.image(SPRITE_SIGNPOST, 'assets/environment/sprites/signpost.png');

    // 8. Nạp các tile địa hình mặt đất (PASS T07)
    this.load.image(TILE_FOREST_GRASS, 'assets/environment/tiles/tile_forest_grass.png');
    this.load.image(TILE_DIRT_TRAIL, 'assets/environment/tiles/tile_dirt_trail.png');
    this.load.image(TILE_SWAMP_MUD, 'assets/environment/tiles/tile_swamp_mud.png');
    this.load.image(TILE_COBBLE_ROAD, 'assets/environment/tiles/tile_cobble_road.png');
    this.load.image(TILE_STONE_FLOOR, 'assets/environment/tiles/tile_stone_floor.png');

    // 9. Nạp các sprite NPC & Chân dung hội thoại pixel art (PASS T09)
    this.load.image(SPRITE_NPC_GARTH, 'assets/characters/npcs/npc_garth.png');
    this.load.image(PORTRAIT_GARTH, 'assets/characters/npcs/portrait_garth.png');
    this.load.image(SPRITE_NPC_EDDA, 'assets/characters/npcs/npc_edda.png');
    this.load.image(PORTRAIT_EDDA, 'assets/characters/npcs/portrait_edda.png');
    this.load.image(SPRITE_NPC_NERIS, 'assets/characters/npcs/npc_neris.png');
    this.load.image(PORTRAIT_NERIS, 'assets/characters/npcs/portrait_neris.png');

    // 10. Nạp các sprite quái vật bóng đêm & tàn ảnh (PASS T10)
    this.load.image(SPRITE_THE_LISTENER, 'assets/monsters/the_listener.png');
    this.load.image(SPRITE_THE_ECHO, 'assets/monsters/the_echo.png');
    this.load.image(SPRITE_FOG_SMOOTH, 'assets/environment/sprites/fog_smooth.png');
  }

  public create(): void {
    this.scene.start(SCENE_MAIN_MENU);
  }
}

