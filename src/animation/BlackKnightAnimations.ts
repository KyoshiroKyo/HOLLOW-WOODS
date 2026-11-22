import * as Phaser from 'phaser';
import {
  BLACK_KNIGHT_ARMED_IDLE_KEY,
  BLACK_KNIGHT_MOVEMENT_KEY,
  BLACK_KNIGHT_CORE_COMBAT_KEY,
  BLACK_KNIGHT_DEFENSE_KEY,
  BLACK_KNIGHT_EXTENDED_SKILLS_KEY,
  BLACK_KNIGHT_CONVERSION_ACTIONS_KEY,
  BLACK_KNIGHT_CONVERSION_AIR_KEY,
  BLACK_KNIGHT_CONVERSION_COMBAT_KEY,
  BLACK_KNIGHT_CONVERSION_STATES_KEY,
  BLACK_KNIGHT_CONVERSION_MOTION_KEY,
} from '../config/Constants';
import conversionClips from './BlackKnightConversion.json';

const DIRECTIONS = ['down', 'up', 'left', 'right'] as const;
const ARMED_IDLE_FRAMES_PER_DIRECTION = 6;
const ARMED_IDLE_FRAME_MS = 70;

export const CORE_COMBAT_FRAMES = 6;
// Atlas indices are zero-based. AnimationFrame.index in Phaser is one-based.
export const CORE_COMBAT_CLIPS = {
  attack: { frameMs: 75, impactFrame: 2, recoveryFrame: 4 },
  heavy_attack: { frameMs: 100, impactFrame: 3, recoveryFrame: 4 },
  attack_combo: { frameMs: 75, impactFrame: 2, recoveryFrame: 4 },
} as const;
export type CoreCombatAction = keyof typeof CORE_COMBAT_CLIPS;

export const DEFENSE_CLIPS = {
  parry: { frameMs: 75 },
  parry_success: { frameMs: 65 },
  roll: { frameMs: 57 },
  unarmed_roll: { frameMs: 57 },
  weapon_on: { frameMs: 65 },
  weapon_off: { frameMs: 65 },
  hurt: { frameMs: 62.5 },
  unarmed_hurt: { frameMs: 62.5 },
  death: { frameMs: 125 },
} as const;
export type DefenseAction = keyof typeof DEFENSE_CLIPS;

// Only Weapon Art has an approved gameplay entry point.
export const EXTENDED_SKILL_CLIPS = {
  armed_buff: { frameMs: 140 },
  unarmed_buff: { frameMs: 140 },
  thrust: { frameMs: 70 },
  ground_slam: { frameMs: 100 },
  flame_stream: { frameMs: 100 },
  fire_wave: { frameMs: 95 },
  aerial_somersault: { frameMs: 100 },
  weapon_art: { frameMs: 1000 / 12, impactFrame: 0, recoveryFrame: 1 },
} as const;

interface Clip {
  frameMs: number;
  frames?: number;
  prefix?: string;
  firstFrame?: number;
}

interface ArtistAction {
  frames: Phaser.Types.Animations.AnimationFrame[][];
  frameMs: number;
  repeat: number;
}

const MOVEMENT_CLIPS: Readonly<Record<string, Clip>> = {
  walk: { prefix: 'armed_walk', frameMs: 170 },
  run: { prefix: 'armed_run', frameMs: 140 },
  unarmed_idle: { frameMs: 70 },
  unarmed_walk: { frameMs: 170 },
  unarmed_run: { frameMs: 140 },
};

const COMPATIBILITY_ACTIONS = {
  buff: 'armed_buff',
  interact: 'unarmed_interact',
  gather: 'unarmed_gather',
  use_item: 'unarmed_use_item',
  weapon_toggle: 'weapon_on',
} as const;

/** Keep historical animation names backed by approved custom frames. */
export function registerWayfarerAnimations(anims: Phaser.Animations.AnimationManager): void {
  const actions = new Map<string, ArtistAction>();
  const collect = (texture: string, config: Readonly<Record<string, Clip>>, repeat = 0) => {
    const available = new Set(anims.generateFrameNames(texture).map(frame => frame.frame));
    for (const [action, spec] of Object.entries(config)) {
      const frames = DIRECTIONS.map(dir => Array.from({ length: spec.frames ?? CORE_COMBAT_FRAMES }, (_, index) => ({
        key: texture,
        frame: `${spec.prefix ?? action}_${dir}_${index + (spec.firstFrame ?? 0)}`,
      })));
      if (frames.every(clip => clip.every(frame => available.has(frame.frame)))) {
        actions.set(action, { frames, frameMs: spec.frameMs, repeat });
      }
    }
  };

  const armedIdle = DIRECTIONS.map(dir => anims.generateFrameNames(
    dir === 'right' ? BLACK_KNIGHT_MOVEMENT_KEY : BLACK_KNIGHT_ARMED_IDLE_KEY,
    { prefix: `armed_idle_${dir}_`, end: ARMED_IDLE_FRAMES_PER_DIRECTION - 1 }
  ));
  if (armedIdle.every(frames => frames.length === ARMED_IDLE_FRAMES_PER_DIRECTION)) {
    actions.set('idle', { frames: armedIdle, frameMs: ARMED_IDLE_FRAME_MS, repeat: -1 });
  }
  collect(BLACK_KNIGHT_MOVEMENT_KEY, MOVEMENT_CLIPS, -1);
  collect(BLACK_KNIGHT_CORE_COMBAT_KEY, CORE_COMBAT_CLIPS);
  collect(BLACK_KNIGHT_DEFENSE_KEY, DEFENSE_CLIPS);
  collect(BLACK_KNIGHT_DEFENSE_KEY, conversionClips.references);
  collect(BLACK_KNIGHT_EXTENDED_SKILLS_KEY, EXTENDED_SKILL_CLIPS);
  collect(BLACK_KNIGHT_CONVERSION_ACTIONS_KEY, conversionClips.actions);
  collect(BLACK_KNIGHT_CONVERSION_AIR_KEY, conversionClips.air);
  collect(BLACK_KNIGHT_CONVERSION_COMBAT_KEY, conversionClips.combat);
  collect(BLACK_KNIGHT_CONVERSION_STATES_KEY, conversionClips.states);
  collect(BLACK_KNIGHT_CONVERSION_MOTION_KEY, conversionClips.motion);
  for (const [action, sequence] of [
    ['run', 'armed_run_sequence'], ['unarmed_run', 'unarmed_run_sequence'],
  ]) {
    const clip = actions.get(sequence);
    // Preserve the 840 ms running cycle while showing all 12 source phases.
    if (clip) actions.set(action, { ...clip, repeat: -1 });
  }
  for (const [alias, action] of Object.entries(COMPATIBILITY_ACTIONS)) {
    const clip = actions.get(action);
    if (clip) actions.set(alias, clip);
  }

  for (const [action, clip] of actions) {
    for (const [row, dir] of DIRECTIONS.entries()) {
      for (const prefix of ['wayfarer', 'satyr']) {
        const base = `${prefix}_${action}`;
        const isMovement = ['idle', 'walk', 'run', 'unarmed_walk', 'unarmed_run'].includes(action);
        const keys = row === 0 && !isMovement ? [base, `${base}_${dir}`] : [`${base}_${dir}`];
        for (const key of keys) {
          if (anims.exists(key)) anims.remove(key);
          anims.create({
            key, frames: clip.frames[row], frameRate: 1000 / clip.frameMs,
            repeat: clip.repeat, skipMissedFrames: clip.repeat === -1,
          });
        }
      }
    }
  }
}

export const registerBlackKnightAnimations = registerWayfarerAnimations;
