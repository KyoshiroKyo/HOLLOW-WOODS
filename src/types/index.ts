/**
 * HOLLOW WOODS V3.0 – CÁC KIỂU DỮ LIỆU TOÀN CỤC (GLOBAL TYPES)
 * Định nghĩa các kiểu dữ liệu cho phân khu, nhân vật, va chạm và hệ thống sinh tồn.
 */

export type ZoneId = 
  | 'fog_crossing' 
  | 'bellhollow' 
  | 'crooked_path' 
  | 'silent_mire' 
  | 'broken_bell_shrine';

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundsRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ColliderType = 
  | 'tree_trunk' 
  | 'wall' 
  | 'water' 
  | 'fence' 
  | 'rock' 
  | 'boundary'
  | 'shrine_pedestal';

export interface ColliderSpec {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ColliderType;
  isSolid: boolean;
}

export type InteractableType = 
  | 'npc' 
  | 'hiding_spot' 
  | 'clue' 
  | 'gate' 
  | 'chest' 
  | 'runestone' 
  | 'bell_shrine' 
  | 'lantern_refill';

export interface InteractableSpec {
  id: string;
  name: string;
  type: InteractableType;
  x: number;
  y: number;
  width: number;
  height: number;
  promptText: string;
  actionId: string;
  requiresItem?: string;
}

export interface TransitionZone {
  id: string;
  fromZone: ZoneId;
  toZone: ZoneId;
  triggerRect: BoundsRect;
  targetSpawn: Point2D;
  description: string;
}

export interface ZoneAtmosphere {
  fogColor: number;
  fogAlpha: number;
  ambientLight: number;
  ambientColor: number;
  titleVietnamese: string;
  subTitleVietnamese: string;
}

export interface ZoneData {
  id: ZoneId;
  name: string;
  titleVietnamese: string;
  bounds: BoundsRect;
  defaultSpawn: Point2D;
  atmosphere: ZoneAtmosphere;
  colliders: ColliderSpec[];
  interactables: InteractableSpec[];
  transitions: TransitionZone[];
}

export type SatyrAnimState = 
  | 'idle_down' 
  | 'walk_down' 
  | 'idle_up' 
  | 'walk_up' 
  | 'idle_left' 
  | 'walk_left' 
  | 'idle_right' 
  | 'walk_right' 
  | 'run_down' 
  | 'run_up' 
  | 'run_left' 
  | 'run_right' 
  | 'hurt' 
  | 'dash' 
  | 'attack' 
  | 'death';

export type FacingDirection = 'down' | 'left' | 'right' | 'up';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  lanternOil: number;
  maxLanternOil: number;
  composure: number;
  maxComposure: number;
  isLanternOn: boolean;
  isSprinting: boolean;
  isHiding: boolean;
}

export interface AnimationDefinition {
  key: string;
  frames: number[];
  frameRate: number;
  repeat: number;
}

