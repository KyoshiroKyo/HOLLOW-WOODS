/**
 * HOLLOW WOODS V1.4 - ATLAS TEXTURE RESOLVER
 * Tự động ánh xạ các sprite đơn lẻ về Texture Atlas hollow_props_atlas
 * Giảm thiểu WebGL Draw Calls mà không phá vỡ mã nguồn hiện có.
 */
import * as Phaser from 'phaser';

export const ATLAS_PROPS_KEY = 'hollow_props_atlas';
export const ATLAS_PROPS_PNG = 'assets/atlases/hollow_props_atlas.png';
export const ATLAS_PROPS_JSON = 'assets/atlases/hollow_props_atlas.json';

// Danh sách tĩnh toàn bộ 51 frame đã đóng gói trong hollow_props_atlas
export const HOLLOW_PROPS_FRAME_KEYS = new Set<string>([
  'bell_tower',
  'broken_shrine',
  'building_house_edda_v14',
  'building_house_neris_v14',
  'building_village_well_v14',
  'bush_dense_1',
  'bush_dense_2',
  'cliff_face_western_v14',
  'crafting_bench',
  'fog_smooth',
  'hollow_tree',
  'house_edda',
  'house_neris',
  'pillar_eye',
  'pillar_moon',
  'pillar_root',
  'prop_ancient_monolith_v14',
  'prop_barrel_aged_v14',
  'prop_chopped_wood_v14',
  'prop_crate_weathered_v14',
  'prop_fallen_log_mossy_v14',
  'prop_fern_cluster_v14',
  'prop_mushroom_cluster_v14',
  'prop_shroom_glow_teal_v14',
  'prop_stump_mossy_large_v14',
  'prop_swamp_cattails_v14',
  'prop_tangled_roots_v14',
  'res_dry_wood',
  'res_flint',
  'res_herbs',
  'res_tree_resin',
  'rock_large',
  'rock_large_mossy_v14',
  'rock_medium',
  'rock_mossy_forest_01_v14',
  'rock_mossy_forest_02_v14',
  'signpost',
  'stone_altar',
  'structure_abyssal_gate_v14',
  'tree_birch_amber_v14',
  'tree_dead',
  'tree_dead_withered_v14',
  'tree_hollow_ancient_v14',
  'tree_maple_crimson_v14',
  'tree_oak_1',
  'tree_oak_2',
  'tree_oak_3',
  'tree_oak_ancient_titan_v14',
  'tree_oak_mossy_v14',
  'village_well',
  'wooden_fence'
]);

export class AtlasTextureResolver {
  private static installed = false;
  private static registeredFrames = new Set<string>(HOLLOW_PROPS_FRAME_KEYS);

  /**
   * Kiểm tra key có phải là frame nằm trong props atlas hay không
   */
  public static hasFrame(key: string): boolean {
    return AtlasTextureResolver.registeredFrames.has(key);
  }

  /**
   * Đăng ký thêm frame mới vào registry nếu có
   */
  public static registerFrame(key: string): void {
    AtlasTextureResolver.registeredFrames.add(key);
  }

  /**
   * Phân giải (resolve) cặp texture/frame: nếu key nằm trong props atlas và không có frame riêng,
   * tự động chuyển sang ('hollow_props_atlas', key)
   */
  public static resolve(
    texture: string | Phaser.Textures.Texture,
    frame?: string | number
  ): { texture: string | Phaser.Textures.Texture; frame?: string | number } {
    if (typeof texture === 'string') {
      if ((frame === undefined || frame === null) && AtlasTextureResolver.hasFrame(texture)) {
        return { texture: ATLAS_PROPS_KEY, frame: texture };
      }
    }
    return { texture, frame };
  }

  /**
   * Cài đặt hook vào Phaser Factories, Components.Texture và TextureManager
   */
  public static install(): void {
    if (AtlasTextureResolver.installed) return;
    AtlasTextureResolver.installed = true;

    // 1. Hook GameObjectFactory.image
    const origImage = Phaser.GameObjects.GameObjectFactory.prototype.image;
    Phaser.GameObjects.GameObjectFactory.prototype.image = function (
      x: number,
      y: number,
      texture: string | Phaser.Textures.Texture,
      frame?: string | number
    ) {
      const res = AtlasTextureResolver.resolve(texture, frame);
      return origImage.call(this, x, y, res.texture as any, res.frame as any);
    };

    // 2. Hook GameObjectFactory.sprite
    const origSprite = Phaser.GameObjects.GameObjectFactory.prototype.sprite;
    Phaser.GameObjects.GameObjectFactory.prototype.sprite = function (
      x: number,
      y: number,
      texture: string | Phaser.Textures.Texture,
      frame?: string | number
    ) {
      const res = AtlasTextureResolver.resolve(texture, frame);
      return origSprite.call(this, x, y, res.texture as any, res.frame as any);
    };

    // 3. Hook GameObjectCreator.image
    const origMakeImage = Phaser.GameObjects.GameObjectCreator.prototype.image;
    Phaser.GameObjects.GameObjectCreator.prototype.image = function (config: any, addToScene?: boolean) {
      if (config && typeof config.key === 'string' && (config.frame === undefined || config.frame === null)) {
        if (AtlasTextureResolver.hasFrame(config.key)) {
          config.frame = config.key;
          config.key = ATLAS_PROPS_KEY;
        }
      }
      return origMakeImage.call(this, config, addToScene);
    };

    // 4. Hook GameObjectCreator.sprite
    const origMakeSprite = Phaser.GameObjects.GameObjectCreator.prototype.sprite;
    Phaser.GameObjects.GameObjectCreator.prototype.sprite = function (config: any, addToScene?: boolean) {
      if (config && typeof config.key === 'string' && (config.frame === undefined || config.frame === null)) {
        if (AtlasTextureResolver.hasFrame(config.key)) {
          config.frame = config.key;
          config.key = ATLAS_PROPS_KEY;
        }
      }
      return origMakeSprite.call(this, config, addToScene);
    };

    // 5. Hook Image & Sprite setTexture
    const origImgSetTexture = Phaser.GameObjects.Image.prototype.setTexture;
    Phaser.GameObjects.Image.prototype.setTexture = function (
      key: any,
      frame?: any,
      updateSize?: boolean,
      updateOrigin?: boolean
    ) {
      const res = AtlasTextureResolver.resolve(key, frame);
      return (origImgSetTexture as any).call(this, res.texture, res.frame, updateSize, updateOrigin);
    };

    const origSprSetTexture = Phaser.GameObjects.Sprite.prototype.setTexture;
    Phaser.GameObjects.Sprite.prototype.setTexture = function (
      key: any,
      frame?: any,
      updateSize?: boolean,
      updateOrigin?: boolean
    ) {
      const res = AtlasTextureResolver.resolve(key, frame);
      return (origSprSetTexture as any).call(this, res.texture, res.frame, updateSize, updateOrigin);
    };

    // 6. Hook Arcade Physics Factory nếu có
    if (Phaser.Physics && (Phaser.Physics as any).Arcade && (Phaser.Physics as any).Arcade.Factory) {
      const arcadeFactory = (Phaser.Physics as any).Arcade.Factory.prototype;
      if (arcadeFactory.image) {
        const origArcadeImg = arcadeFactory.image;
        arcadeFactory.image = function (x: number, y: number, key: string, frame?: string | number) {
          const res = AtlasTextureResolver.resolve(key, frame);
          return origArcadeImg.call(this, x, y, res.texture, res.frame);
        };
      }
      if (arcadeFactory.staticImage) {
        const origArcadeStaticImg = arcadeFactory.staticImage;
        arcadeFactory.staticImage = function (x: number, y: number, key: string, frame?: string | number) {
          const res = AtlasTextureResolver.resolve(key, frame);
          return origArcadeStaticImg.call(this, x, y, res.texture, res.frame);
        };
      }
      if (arcadeFactory.sprite) {
        const origArcadeSprite = arcadeFactory.sprite;
        arcadeFactory.sprite = function (x: number, y: number, key: string, frame?: string | number) {
          const res = AtlasTextureResolver.resolve(key, frame);
          return origArcadeSprite.call(this, x, y, res.texture, res.frame);
        };
      }
      if (arcadeFactory.staticSprite) {
        const origArcadeStaticSprite = arcadeFactory.staticSprite;
        arcadeFactory.staticSprite = function (x: number, y: number, key: string, frame?: string | number) {
          const res = AtlasTextureResolver.resolve(key, frame);
          return origArcadeStaticSprite.call(this, x, y, res.texture, res.frame);
        };
      }
    }

    // 7. Hook TextureManager.exists
    const origExists = Phaser.Textures.TextureManager.prototype.exists;
    Phaser.Textures.TextureManager.prototype.exists = function (key: string) {
      if (origExists.call(this, key)) return true;
      if (AtlasTextureResolver.hasFrame(key)) {
        return origExists.call(this, ATLAS_PROPS_KEY);
      }
      return false;
    };

    // 8. Hook TextureManager.getFrame
    const origGetFrame = Phaser.Textures.TextureManager.prototype.getFrame;
    Phaser.Textures.TextureManager.prototype.getFrame = function (key: string, frame?: string | number) {
      if (origExists.call(this, key)) {
        return origGetFrame.call(this, key, frame);
      }
      if (AtlasTextureResolver.hasFrame(key)) {
        return origGetFrame.call(this, ATLAS_PROPS_KEY, key);
      }
      return origGetFrame.call(this, key, frame);
    };

    // 9. Hook TextureManager.get
    const origGet = Phaser.Textures.TextureManager.prototype.get;
    Phaser.Textures.TextureManager.prototype.get = function (key: any) {
      if (typeof key === 'string') {
        const dict = (this as any).list as Record<string, any>;
        if (dict && dict[key]) {
          return dict[key];
        }
        if (AtlasTextureResolver.hasFrame(key) && dict && dict[ATLAS_PROPS_KEY]) {
          return dict[ATLAS_PROPS_KEY];
        }
      }
      return origGet.call(this, key);
    };

    console.log('[AtlasTextureResolver] Đã cài đặt thành công bộ phân giải Texture Atlas cho toàn bộ Factories và TextureManager.');
  }

  /**
   * Đồng bộ hóa texture sau khi Atlas đã nạp:
   * 1. Cập nhật danh sách frame từ Texture nếu có frame mới
   * 2. Thiết lập NEAREST filter chống mờ pixel
   * 3. Đồng bộ hóa toàn bộ texture tilemap sang NEAREST
   */
  public static syncTextures(scene: Phaser.Scene): void {
    AtlasTextureResolver.install();

    if (scene.textures && scene.textures.exists(ATLAS_PROPS_KEY)) {
      const atlas = scene.textures.get(ATLAS_PROPS_KEY);
      atlas.setFilter(Phaser.Textures.FilterMode.NEAREST);

      // Đồng bộ toàn bộ frame names
      const frameNames = atlas.getFrameNames();
      for (const name of frameNames) {
        AtlasTextureResolver.registerFrame(name);
      }
      console.log(`[AtlasTextureResolver] Đồng bộ ${frameNames.length} frames từ ${ATLAS_PROPS_KEY} với NEAREST filter.`);
    }

    // Đảm bảo toàn bộ textures trong cache đều dùng NEAREST
    scene.textures.each((tex: Phaser.Textures.Texture) => {
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }, scene);
  }
}
