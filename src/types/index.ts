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
  | 'broken_bell_shrine'
  // V1.4 - Sub-areas (Tiểu khu khám phá)
  | 'sub_bell_workshop'
  | 'sub_root_cellar'
  | 'sub_whispering_clearing';

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
  moisture?: number;
  temperature?: number;
}

export interface AnimationDefinition {
  key: string;
  frames: number[];
  frameRate: number;
  repeat: number;
}

// C4-12-16: Kiểu dữ liệu nông trại canh tác thảo dược tại Sanctuary Farm
export type HerbPlotStage = 'empty' | 'planted' | 'growing' | 'harvest_ready';
export type CropType = 'herbs' | 'roots' | 'mushroom' | 'fiber';

export interface HerbPlotData {
  id: string;
  x: number;
  y: number;
  stage: HerbPlotStage;
  plantedAt: number;
  cropType?: CropType;
  isPrepared?: boolean;
}

// V1.4: Hệ thống 4 Ô Trang Bị Cá Nhân (BODY, FEET, BACK, CHARM)
export type EquipmentSlot = 'body' | 'feet' | 'back' | 'charm';

export interface EquipmentItemDef {
  id: string;
  name: string;
  slot: EquipmentSlot;
  description: string;
  moistureRateMod?: number;      // Hệ số tăng độ ẩm (0.60 = giảm 40%)
  coldRateMod?: number;          // Hệ số nhiễm lạnh (0.60 = giảm 40%)
  sprintSpeedMod?: number;       // Hệ số tốc độ chạy (0.95 = giảm 5%)
  noiseRadiusMod?: number;       // Hệ số tiếng ồn bước chân (0.70 = giảm 30%)
  mireSlowImmunity?: boolean;    // Miễn nhiễm làm chậm khi đi trên đất lầy
  extraInventorySlots?: number;  // Ô chứa đồ mở rộng (+4)
  sprintStaminaDrainMod?: number;// Hệ số tiêu hao thể lực khi chạy (1.15 = +15%)
  composureDrainMod?: number;    // Hệ số tụt bình tâm (0.75 = giảm 25%)
  detectEchoProximity?: boolean; // Rung báo hiệu khi gần Echo
}

// V1.4: Hệ thống Vũ Khí & Tự Vệ Sinh Tồn (Survival Defense)
export type WeaponId = 'wpn_walking_staff' | 'wpn_iron_spear' | 'wpn_hunting_hatchet';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  reach: number;
  radius: number;
  knockback: number;
  knockbackDistance?: number;
  damage: number;
  staggerDuration: number;
  attackCooldown: number;
  staminaCost: number;
  noiseRadius: number;
  attackDuration: number;
  woodcuttingMultiplier?: number;
  canTriggerWeakness?: boolean;
}

// V1.4: Hệ sinh thái Sinh vật hoang dã (Wildlife Ecosystem)
export type WildlifeSpecies = 'crow' | 'lantern_moth';
export type WildlifeState = 'perched' | 'alert' | 'spooked' | 'fluttering' | 'hibernating';

export interface WildlifeSpec {
  id: string;
  species: WildlifeSpecies;
  x: number;
  y: number;
  zoneId: string;
  contentId: string;    // HW-ANI-AMBIENT-000001 (Crow) | HW-ANI-AMBIENT-000002 (Lantern Moth)
  runtimeKey: string;   // ani_crow | ani_lantern_moth
  perchType?: 'branch' | 'fence' | 'rock' | 'ground' | 'herb_bush';
}

export interface WildlifeSpookEvent {
  crowId: string;
  x: number;
  y: number;
  cause: 'player_sprint' | 'player_attack' | 'listener_near' | 'flare_ignite';
  noiseRadius: number;
}

// V1.4: Bộ nhớ âm thanh & Trí nhớ ngắn hạn của The Listener
export interface SoundMemoryEntry {
  x: number;
  y: number;
  timestamp: number;
  repeatCount: number;
  originX?: number;
  originY?: number;
}

// V1.4: Hiện Tượng Ký Ức (The Echo - Memory Phenomenon)
export interface EchoSpec {
  id: string;
  x: number;
  y: number;
  message: string;
  targetClueX?: number;
  targetClueY?: number;
  loreFragmentId?: string;
  composureDrain?: number;
}

// V1.4: 5 Sự kiện môi trường động (World Events)
export type WorldEventType = 
  | 'event_bell_echo'
  | 'event_fog_surge'
  | 'event_crow_alarm'
  | 'event_false_footsteps'
  | 'event_abandoned_camp';

export interface WorldEventDef {
  type: WorldEventType;
  contentId: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  minIntervalSec: number;
}

// V1.4 - P6: Sổ Tay Sinh Vật (Bestiary Ecosystem)
export type BestiarySpecies = 'crow' | 'lantern_moth' | 'echo' | 'listener';

export interface BestiaryEntry {
  species: BestiarySpecies;
  contentId: string;
  runtimeKey: string;
  nameVi: string;
  nameEn: string;
  roleVi: string;
  habitatVi: string;
  behaviorVi: string;
  counterVi: string;
  observed: boolean;
  discoveredAt?: number;
}





