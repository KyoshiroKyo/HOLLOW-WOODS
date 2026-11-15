import * as Phaser from 'phaser';
import satyrAnimsData from '../data/satyr_animations.json';
import { 
  SATYR_SHEET_KEY,
  WAYFARER_IDLE_KEY,
  WAYFARER_WALK_KEY,
  WAYFARER_RUN_KEY,
  WAYFARER_ATTACK_KEY,
  WAYFARER_HURT_KEY,
  WAYFARER_DEATH_KEY,
  WAYFARER_INTERACT_KEY,
  WAYFARER_GATHER_KEY,
  WAYFARER_USE_ITEM_KEY
} from '../config/Constants';

interface WayfarerSheetConfig {
  action: string;
  sheetKey: string;
  fps: number;
  repeat: number;
  framesPerDir: number;
}

const WAYFARER_CONFIGS: WayfarerSheetConfig[] = [
  { action: 'idle', sheetKey: WAYFARER_IDLE_KEY, fps: 6, repeat: -1, framesPerDir: 4 },
  { action: 'walk', sheetKey: WAYFARER_WALK_KEY, fps: 10, repeat: -1, framesPerDir: 6 },
  { action: 'run', sheetKey: WAYFARER_RUN_KEY, fps: 14, repeat: -1, framesPerDir: 6 },
  { action: 'attack', sheetKey: WAYFARER_ATTACK_KEY, fps: 12, repeat: 0, framesPerDir: 6 },
  { action: 'hurt', sheetKey: WAYFARER_HURT_KEY, fps: 8, repeat: 0, framesPerDir: 3 },
  { action: 'death', sheetKey: WAYFARER_DEATH_KEY, fps: 8, repeat: 0, framesPerDir: 6 },
  { action: 'interact', sheetKey: WAYFARER_INTERACT_KEY, fps: 8, repeat: 0, framesPerDir: 4 },
  { action: 'gather', sheetKey: WAYFARER_GATHER_KEY, fps: 8, repeat: 0, framesPerDir: 4 },
  { action: 'use_item', sheetKey: WAYFARER_USE_ITEM_KEY, fps: 8, repeat: 0, framesPerDir: 4 },
];

const DIRECTIONS = ['down', 'up', 'left', 'right'] as const;

/**
 * Đăng ký hoạt ảnh The Mossbound Wayfarer (V1.2) cho cả 9 sprite sheets và 4 hướng.
 * Tự động tạo cả khóa wayfarer_* và bí danh satyr_* tương thích ngược hoàn toàn.
 */
export function registerWayfarerAnimations(anims: Phaser.Animations.AnimationManager): void {
  for (const cfg of WAYFARER_CONFIGS) {
    // Kiểm tra xem texture sprite sheet đã được nạp vào cache chưa
    const anyAnims = anims as any;
    const textureExists = anyAnims.textureManager 
      ? anyAnims.textureManager.exists(cfg.sheetKey) 
      : (anyAnims.game?.textures ? anyAnims.game.textures.exists(cfg.sheetKey) : true);
    if (!textureExists) {
      console.warn(`[WayfarerAnimations] Texture sheet ${cfg.sheetKey} not loaded yet. Skipping animation creation.`);
      continue;
    }

    for (let row = 0; row < DIRECTIONS.length; row++) {
      const dir = DIRECTIONS[row];
      const startFrame = row * cfg.framesPerDir;
      const frameIndices: number[] = [];
      for (let f = 0; f < cfg.framesPerDir; f++) {
        frameIndices.push(startFrame + f);
      }

      let generatedFrames = anims.generateFrameNumbers(cfg.sheetKey, {
        frames: frameIndices
      });

      if (!generatedFrames || generatedFrames.length === 0) {
        generatedFrames = [{ key: cfg.sheetKey, frame: startFrame }];
      }

      // 1. Đăng ký khóa chính wayfarer_<action>_<dir>
      const wayfarerKey = `wayfarer_${cfg.action}_${dir}`;
      if (anims.exists(wayfarerKey)) {
        anims.remove(wayfarerKey);
      }
      anims.create({
        key: wayfarerKey,
        frames: generatedFrames,
        frameRate: cfg.fps,
        repeat: cfg.repeat
      });

      // 2. Đăng ký alias tương thích ngược satyr_<action>_<dir>
      const satyrKey = `satyr_${cfg.action}_${dir}`;
      if (anims.exists(satyrKey)) {
        anims.remove(satyrKey);
      }
      anims.create({
        key: satyrKey,
        frames: generatedFrames,
        frameRate: cfg.fps,
        repeat: cfg.repeat
      });

      // 3. Với các hành động không chỉ định hướng (attack, hurt, death, interact, gather, use_item), tạo fallback alias từ hướng DOWN (row 0)
      if (row === 0 && cfg.action !== 'idle' && cfg.action !== 'walk' && cfg.action !== 'run') {
        const wayfarerBaseKey = `wayfarer_${cfg.action}`;
        if (anims.exists(wayfarerBaseKey)) anims.remove(wayfarerBaseKey);
        anims.create({
          key: wayfarerBaseKey,
          frames: generatedFrames,
          frameRate: cfg.fps,
          repeat: cfg.repeat
        });

        const satyrBaseKey = `satyr_${cfg.action}`;
        if (anims.exists(satyrBaseKey)) anims.remove(satyrBaseKey);
        anims.create({
          key: satyrBaseKey,
          frames: generatedFrames,
          frameRate: cfg.fps,
          repeat: cfg.repeat
        });
      }
    }
  }
}

/**
 * Đăng ký toàn bộ hoạt ảnh của Satyr / The Mossbound Wayfarer vào AnimationManager của Phaser.
 * Kèm chốt chặn an toàn: không bao giờ cho phép tạo animation rỗng (0 frame)
 * gây lỗi TypeError tại Animation.getFirstTick khi nhấn W / ArrowUp.
 */
export function registerSatyrAnimations(anims: Phaser.Animations.AnimationManager): void {
  // 1. Đăng ký fallback legacy Satyr nếu có
  const anyAnims = anims as any;
  const satyrSheetExists = anyAnims.textureManager 
    ? anyAnims.textureManager.exists(SATYR_SHEET_KEY)
    : (anyAnims.game?.textures ? anyAnims.game.textures.exists(SATYR_SHEET_KEY) : true);

  if (satyrSheetExists) {
    for (const def of satyrAnimsData.animations) {
      if (anims.exists(def.key)) {
        continue;
      }

      let generatedFrames = anims.generateFrameNumbers(SATYR_SHEET_KEY, {
        frames: def.frames
      });

      if (!generatedFrames || generatedFrames.length === 0) {
        generatedFrames = [{ key: SATYR_SHEET_KEY, frame: 0 }];
      }

      anims.create({
        key: def.key,
        frames: generatedFrames,
        frameRate: def.frameRate,
        repeat: def.repeat
      });
    }
  }

  // 2. Đăng ký bộ hoạt ảnh The Mossbound Wayfarer chất lượng cao (ưu tiên ghi đè satyr_* sang sprite mới)
  registerWayfarerAnimations(anims);
}
