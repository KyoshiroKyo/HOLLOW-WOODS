import * as Phaser from 'phaser';
import { 
  BLACK_KNIGHT_ARMED_IDLE_KEY,
  WAYFARER_USE_PURE_ARTIST_SPRITES,
  WAYFARER_IDLE_KEY,
  WAYFARER_WALK_KEY,
  WAYFARER_RUN_KEY,
  WAYFARER_ATTACK_KEY,
  WAYFARER_HURT_KEY,
  WAYFARER_DEATH_KEY,
  WAYFARER_INTERACT_KEY,
  WAYFARER_GATHER_KEY,
  WAYFARER_USE_ITEM_KEY,
  WAYFARER_UNARMED_IDLE_KEY,
  WAYFARER_UNARMED_RUN_KEY,
  WAYFARER_HEAVY_ATTACK_KEY,
  WAYFARER_WEAPON_ART_KEY,
  WAYFARER_PARRY_KEY,
  WAYFARER_ROLL_KEY,
  WAYFARER_UNARMED_ROLL_KEY,
  WAYFARER_BUFF_KEY,
  WAYFARER_WEAPON_TOGGLE_KEY
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
  // 9 animations chiến đấu & động tác mới V1.5.2
  { action: 'unarmed_idle', sheetKey: WAYFARER_UNARMED_IDLE_KEY, fps: 6, repeat: -1, framesPerDir: 4 },
  { action: 'unarmed_run', sheetKey: WAYFARER_UNARMED_RUN_KEY, fps: 14, repeat: -1, framesPerDir: 6 },
  { action: 'heavy_attack', sheetKey: WAYFARER_HEAVY_ATTACK_KEY, fps: 10, repeat: 0, framesPerDir: 6 },
  { action: 'weapon_art', sheetKey: WAYFARER_WEAPON_ART_KEY, fps: 12, repeat: 0, framesPerDir: 6 },
  { action: 'parry', sheetKey: WAYFARER_PARRY_KEY, fps: 12, repeat: 0, framesPerDir: 6 },
  { action: 'roll', sheetKey: WAYFARER_ROLL_KEY, fps: 14, repeat: 0, framesPerDir: 6 },
  { action: 'unarmed_roll', sheetKey: WAYFARER_UNARMED_ROLL_KEY, fps: 14, repeat: 0, framesPerDir: 6 },
  { action: 'buff', sheetKey: WAYFARER_BUFF_KEY, fps: 8, repeat: 0, framesPerDir: 6 },
  { action: 'weapon_toggle', sheetKey: WAYFARER_WEAPON_TOGGLE_KEY, fps: 10, repeat: 0, framesPerDir: 6 },
];

const DIRECTIONS = ['down', 'up', 'left', 'right'] as const;
const ARMED_IDLE_FRAMES_PER_DIRECTION = 6;
const ARMED_IDLE_FRAME_MS = 70;

/** Register the directional Wayfarer clips and their supported Satyr animation aliases. */
export function registerWayfarerAnimations(anims: Phaser.Animations.AnimationManager): void {
  const artistIdle = WAYFARER_USE_PURE_ARTIST_SPRITES
    ? DIRECTIONS.map(dir => anims.generateFrameNames(BLACK_KNIGHT_ARMED_IDLE_KEY, {
      prefix: `armed_idle_${dir}_`,
      end: ARMED_IDLE_FRAMES_PER_DIRECTION - 1
    }))
    : [];
  const hasCompleteArtistIdle = artistIdle.length === DIRECTIONS.length &&
    artistIdle.every(frames => frames.length === ARMED_IDLE_FRAMES_PER_DIRECTION);

  for (const cfg of WAYFARER_CONFIGS) {
    const useArtistIdle = cfg.action === 'idle' && hasCompleteArtistIdle;
    const frameRate = useArtistIdle ? 1000 / ARMED_IDLE_FRAME_MS : cfg.fps;
    const hasBaseAlias = cfg.action !== 'idle' && cfg.action !== 'walk' && cfg.action !== 'run';

    for (const [row, dir] of DIRECTIONS.entries()) {
      const start = row * cfg.framesPerDir;
      const frames = useArtistIdle ? artistIdle[row] : anims.generateFrameNumbers(cfg.sheetKey, {
        start,
        end: start + cfg.framesPerDir - 1
      });
      const expectedCount = useArtistIdle ? ARMED_IDLE_FRAMES_PER_DIRECTION : cfg.framesPerDir;
      if (frames.length !== expectedCount) continue;

      for (const prefix of ['wayfarer', 'satyr']) {
        const baseKey = `${prefix}_${cfg.action}`;
        const keys = row === 0 && hasBaseAlias ? [`${baseKey}_${dir}`, baseKey] : [`${baseKey}_${dir}`];
        for (const key of keys) {
          if (anims.exists(key)) anims.remove(key);
          anims.create({ key, frames, frameRate, repeat: cfg.repeat });
        }
      }
    }
  }
}

// satyr_sheet is a 16-frame texture alias for Wayfarer Idle. The historical
// 50-frame table cannot be registered on it, and every legacy animation key
// already resolves to the directional clips registered above.
export const registerBlackKnightAnimations = registerWayfarerAnimations;
