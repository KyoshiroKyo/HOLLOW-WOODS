/**
 * HOLLOW WOODS V1.2 – CÁC KIỂU DỮ LIỆU TOÀN CỤC (GLOBAL TYPES)
 * Định nghĩa các kiểu dữ liệu cho 3 tầng thế giới (Hybrid Open World), phân khu, nhân vật, va chạm và hệ thống sinh tồn.
 */

// 3 Tầng Thế Giới (World Tiers) — Mô hình C: Hybrid Open World
export type WorldTier = 
  | 'LAYER_1_CORE'      // Tầng 1: Vùng Lõi an toàn & tự do sinh hoạt (Bellhollow, Farm, Outer Woods)
  | 'LAYER_2_FRONTIER'  // Tầng 2: Vùng Biên viễn khám phá & thử thách (The Crooked Path, Deep Forest)
  | 'LAYER_3_FORBIDDEN'; // Tầng 3: Vùng Cấm mở khóa theo cốt truyện (Silent Mire, Rune Puzzle, Broken Bell Shrine)

export type ZoneId = 
  // Layer 1 - Core World (Mở từ đầu)
  | 'fog_crossing' 
  | 'bellhollow' 
  | 'sanctuary_farm'
  | 'outer_woods'
  // Layer 2 - Frontier (Mở dần theo nhiệm vụ)
  | 'crooked_path' 
  | 'deep_forest'
  // Layer 3 - Forbidden Regions (Khóa theo cốt truyện)
  | 'silent_mire' 
  | 'ancient_rune_puzzle'
  | 'broken_bell_shrine';

export type GatingConditionType = 
  | 'always_unlocked' 
  | 'quest_required' 
  | 'item_required' 
  | 'flag_required' 
  | 'custom_eval';

export interface ZoneAccessRule {
  zoneId: ZoneId;
  tier: WorldTier;
  conditionType: GatingConditionType;
  requiredQuestId?: string;
  requiredTaskId?: string;
  requiredItem?: string;
  requiredFlag?: string;
  lockedReasonVietnamese: string;
  hintVietnamese: string;
}

export interface ZoneSpawnPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  facingDirection?: 'down' | 'up' | 'left' | 'right';
}

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

// Trạng thái khả dụng của kết nối phân khu
export type ConnectionStatus = 'active' | 'pending_construction';

// Kiểu rào chắn / hình thức ranh giới chuyển vùng
export type ConnectionBarrierType = 
  | 'open'               // Lối đi tự do, không có vật cản
  | 'gate'               // Cánh cổng cơ học (như Cổng Đông làng Bellhollow)
  | 'barrier_scaffold'   // Rào chắn gỗ / giàn giáo thợ dựng tạm
  | 'dense_thorns'       // Bụi gai rừng rậm ngột ngạt
  | 'rune_ward';         // Phong ấn cổ ngữ ma thuật

export interface ZoneNeighborInfo {
  zoneId: ZoneId;
  direction: 'north' | 'south' | 'east' | 'west' | 'inward';
  connectionId: string;
  status: ConnectionStatus;
  displayLabel: string;
}

export interface ZoneNodeMetadata {
  id: ZoneId;
  displayName: string;
  titleVietnamese: string;
  tier: WorldTier;
  tierName: string;
  bounds: BoundsRect;
  defaultSpawn: Point2D;
  neighbors: ZoneNeighborInfo[];
  status: ConnectionStatus;
}

export interface ZoneConnectionDescriptor {
  id: string;
  fromZone: ZoneId;
  toZone: ZoneId;
  status: ConnectionStatus;
  barrierType: ConnectionBarrierType;
  displayLabel: string;
  triggerRect: BoundsRect;
  entryPoint: { x: number; y: number; direction?: FacingDirection };
  returnPoint: { x: number; y: number; direction?: FacingDirection };
  gatingCondition?: string;
  pendingNotice?: string;
  description: string;
}

export interface TransitionZone {
  id: string;
  fromZone: ZoneId;
  toZone: ZoneId;
  triggerRect: BoundsRect;
  targetSpawn: Point2D;
  description: string;
  status?: ConnectionStatus;
  barrierType?: ConnectionBarrierType;
  returnPoint?: Point2D;
  displayLabel?: string;
  pendingNotice?: string;
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
  tier?: WorldTier;
  tierName?: string;
  bounds: BoundsRect;
  defaultSpawn: Point2D;
  atmosphere: ZoneAtmosphere;
  colliders: ColliderSpec[];
  interactables: InteractableSpec[];
  transitions: TransitionZone[];
  accessRule?: ZoneAccessRule;
  spawnPoints?: ZoneSpawnPoint[];
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

// C4-12-16: Kiểu dữ liệu nông trại canh tác thảo dược tại Sanctuary Farm
export type HerbPlotStage = 'empty' | 'planted' | 'growing' | 'harvest_ready';

export interface HerbPlotData {
  id: string;
  x: number;
  y: number;
  stage: HerbPlotStage;
  plantedAt: number;
}


