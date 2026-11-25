import { DeveloperModeManager } from '../debug/DeveloperModeManager';
import * as Phaser from 'phaser';
import { WildlifeSpec } from '../types';
import { WildlifeEntity } from '../entities/WildlifeEntity';
import { SkullWolfEntity } from '../entities/SkullWolfEntity';
import { ShadowCrowEntity, ShadowEyesEntity, ShadowBehemothBoss, ShadowContext } from '../entities/ShadowMonsters';
import { FallenKnightEntity, DreadHorsemanEntity, HoodedKnightBoss, KnightContext } from '../entities/EvilKnights';
import { MistBatAmbushEntity, WanderingShadeEntity, GoblinScoutEntity } from '../entities/AmbushMonsters';
import { PlayerState } from '../state/PlayerState';

export interface WildlifeUpdateContext {
  playerX: number;
  playerY: number;
  isPlayerSprinting: boolean;
  isPlayerAttacking: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
  listenerX?: number;
  listenerY?: number;
  isListenerActive?: boolean;
  playerLightPos?: { x: number; y: number; active: boolean };
  campfirePos?: { x: number; y: number; active: boolean };
  camera?: Phaser.Cameras.Scene2D.Camera;
}

export class WildlifeSystem {
  private static instance: WildlifeSystem | null = null;
  private scene: Phaser.Scene;
  private entities: WildlifeEntity[] = [];
  private skullWolves: SkullWolfEntity[] = [];
  private shadowCrows: ShadowCrowEntity[] = [];
  private shadowEyes: ShadowEyesEntity[] = [];
  private shadowBehemoth: ShadowBehemothBoss | null = null;
  private fallenKnights: FallenKnightEntity[] = [];
  private dreadHorsemen: DreadHorsemanEntity[] = [];
  private hoodedKnight: HoodedKnightBoss | null = null;
  private mistBats: MistBatAmbushEntity[] = [];
  private wanderingShades: WanderingShadeEntity[] = [];
  private goblinScouts: GoblinScoutEntity[] = [];
  private lastBatAmbushTime: number = 0;
  private lastShadeAmbushTime: number = 0;
  private lastScoutSpawnTime: number = 0;
  private lastAmbushHitTime: number = 0;
  private currentZoneId: string = '';
  private readonly onScoutWhistleHandler: (data: { x: number; y: number; playerX: number; playerY: number }) => void;
  private readonly onPlayerAmbushHitHandler: () => void;
  private readonly onShadowCrowAlarmHandler: (data: { x: number; y: number; isNight?: boolean; soundRadius?: number }) => void;

  // Giới hạn số lượng (Spawn Cap) để tối ưu WebGL 60 FPS
  public static readonly MAX_CROWS_PER_ZONE = 8;
  public static readonly MAX_MOTHS_PER_ZONE = 8;
  public static readonly MAX_SKULL_WOLVES_PER_ZONE = 2;
  public static readonly MAX_GLOBAL_ENTITIES = 28;
  public static readonly CULLING_DISTANCE = 560; // Bán kính ngủ đông (pixels)

  // Danh mục tọa độ sinh cảnh chuẩn cho Sói Xương (Skull Wolf) - V1.4 P8-08 & Bước 9
  private static readonly SKULL_WOLF_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    crooked_path: [{ x: 820, y: 310 }, { x: 1350, y: 260 }],
    deep_forest: [{ x: 650, y: 290 }, { x: 1180, y: 240 }],
    silent_mire: [{ x: 500, y: 280 }, { x: 850, y: 290 }],
    outer_woods: [{ x: 920, y: 280 }]
  };

  // V1.4 - P8-09: Tọa độ sinh cảnh Quái Vật Bóng Tối (Shadow Crow, Shadow Eyes, Shadow Behemoth)
  private static readonly SHADOW_CROW_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    outer_woods: [{ x: 1350, y: 220 }],
    crooked_path: [{ x: 1450, y: 240 }],
    deep_forest: [{ x: 880, y: 200 }]
  };

  private static readonly SHADOW_EYES_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    crooked_path: [{ x: 1100, y: 260 }, { x: 1680, y: 290 }],
    fog_crossing: [{ x: 380, y: 220 }],
    deep_forest: [{ x: 740, y: 280 }, { x: 1120, y: 310 }],
    silent_mire: [{ x: 450, y: 310 }, { x: 850, y: 330 }],
    sub_root_cellar: [{ x: 320, y: 240 }]
  };

  private static readonly SHADOW_BEHEMOTH_HABITATS: Record<string, { x: number; y: number }> = {
    silent_mire: { x: 780, y: 280 },
    broken_bell_shrine: { x: 920, y: 300 }
  };

  // V1.4 - P8-10: Tọa độ sinh cảnh Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction)
  private static readonly FALLEN_KNIGHT_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    crooked_path: [{ x: 980, y: 320 }],
    deep_forest: [{ x: 1020, y: 270 }]
  };

  private static readonly DREAD_HORSEMAN_HABITATS: Record<string, Array<{ x: number; y: number; patrolRange: number }>> = {
    crooked_path: [{ x: 1200, y: 300, patrolRange: 220 }],
    outer_woods: [{ x: 1100, y: 290, patrolRange: 180 }]
  };

  private static readonly HOODED_KNIGHT_HABITATS: Record<string, { x: number; y: number }> = {
    deep_forest: { x: 1300, y: 260 },
    ancient_rune_puzzle: { x: 860, y: 290 }
  };

  // Danh mục tọa độ sinh cảnh chuẩn cho từng phân khu
  private static readonly ZONE_HABITATS: Record<string, WildlifeSpec[]> = {
    outer_woods: [
      { id: 'crow_ow_01', species: 'crow', x: 260, y: 175, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'crow_ow_02', species: 'crow', x: 580, y: 140, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_ow_03', species: 'crow', x: 840, y: 290, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'crow_ow_04', species: 'crow', x: 1120, y: 180, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'moth_ow_01', species: 'lantern_moth', x: 380, y: 220, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_ow_02', species: 'lantern_moth', x: 640, y: 260, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_ow_03', species: 'lantern_moth', x: 780, y: 160, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_ow_04', species: 'lantern_moth', x: 980, y: 240, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_ow_05', species: 'lantern_moth', x: 1180, y: 210, zoneId: 'outer_woods', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    crooked_path: [
      { id: 'crow_cp_01', species: 'crow', x: 320, y: 160, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'crow_bridge_collapsed', species: 'crow', x: 1750, y: 260, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'crow_cp_02', species: 'crow', x: 680, y: 130, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_cp_03', species: 'crow', x: 920, y: 280, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'crow_detour_bridge', species: 'crow', x: 2710, y: 370, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'crow_cp_04', species: 'crow', x: 1240, y: 170, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_cp_05', species: 'crow', x: 1560, y: 240, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'moth_cp_01', species: 'lantern_moth', x: 450, y: 210, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_cp_02', species: 'lantern_moth', x: 740, y: 230, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_cp_03', species: 'lantern_moth', x: 1040, y: 190, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_cp_04', species: 'lantern_moth', x: 1360, y: 220, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    sanctuary_farm: [
      { id: 'crow_farm_01', species: 'crow', x: 420, y: 150, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'crow_farm_02', species: 'crow', x: 880, y: 140, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'moth_farm_01', species: 'lantern_moth', x: 680, y: 280, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_farm_02', species: 'lantern_moth', x: 730, y: 320, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_farm_03', species: 'lantern_moth', x: 780, y: 290, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_farm_04', species: 'lantern_moth', x: 920, y: 250, zoneId: 'sanctuary_farm', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    bellhollow: [
      { id: 'crow_bell_01', species: 'crow', x: 380, y: 160, zoneId: 'bellhollow', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'crow_bell_02', species: 'crow', x: 1480, y: 180, zoneId: 'bellhollow', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'moth_bell_01', species: 'lantern_moth', x: 940, y: 160, zoneId: 'bellhollow', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_bell_02', species: 'lantern_moth', x: 1060, y: 470, zoneId: 'bellhollow', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_bell_03', species: 'lantern_moth', x: 1110, y: 500, zoneId: 'bellhollow', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    deep_forest: [
      { id: 'crow_df_01', species: 'crow', x: 420, y: 180, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_df_02', species: 'crow', x: 780, y: 140, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_df_03', species: 'crow', x: 1140, y: 220, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'moth_df_01', species: 'lantern_moth', x: 520, y: 260, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_df_02', species: 'lantern_moth', x: 860, y: 220, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_df_03', species: 'lantern_moth', x: 1020, y: 280, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_df_04', species: 'lantern_moth', x: 1260, y: 210, zoneId: 'deep_forest', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    fog_crossing: [
      { id: 'crow_fc_01', species: 'crow', x: 380, y: 160, zoneId: 'fog_crossing', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'moth_fc_01', species: 'lantern_moth', x: 260, y: 220, zoneId: 'fog_crossing', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_fc_02', species: 'lantern_moth', x: 490, y: 240, zoneId: 'fog_crossing', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    silent_mire: [
      { id: 'crow_sm_01', species: 'crow', x: 340, y: 170, zoneId: 'silent_mire', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_sm_02', species: 'crow', x: 960, y: 210, zoneId: 'silent_mire', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'moth_sm_01', species: 'lantern_moth', x: 420, y: 260, zoneId: 'silent_mire', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_sm_02', species: 'lantern_moth', x: 780, y: 290, zoneId: 'silent_mire', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_sm_03', species: 'lantern_moth', x: 1120, y: 250, zoneId: 'silent_mire', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    broken_bell_shrine: [
      { id: 'crow_bbs_01', species: 'crow', x: 450, y: 160, zoneId: 'broken_bell_shrine', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'rock' },
      { id: 'crow_bbs_02', species: 'crow', x: 880, y: 180, zoneId: 'broken_bell_shrine', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
      { id: 'moth_bbs_01', species: 'lantern_moth', x: 520, y: 280, zoneId: 'broken_bell_shrine', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_bbs_02', species: 'lantern_moth', x: 790, y: 260, zoneId: 'broken_bell_shrine', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    sub_root_cellar: [
      { id: 'moth_rc_01', species: 'lantern_moth', x: 280, y: 220, zoneId: 'sub_root_cellar', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_rc_02', species: 'lantern_moth', x: 480, y: 250, zoneId: 'sub_root_cellar', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ],
    sub_bell_workshop: [
      { id: 'moth_bw_01', species: 'lantern_moth', x: 320, y: 230, zoneId: 'sub_bell_workshop', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
      { id: 'moth_bw_02', species: 'lantern_moth', x: 560, y: 270, zoneId: 'sub_bell_workshop', contentId: 'HW-ANI-AMBIENT-000002', runtimeKey: 'ani_lantern_moth', perchType: 'herb_bush' },
    ]
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    WildlifeSystem.instance = this;

    // Lắng nghe tín hiệu tiếng huýt sáo của Goblin Scout để kích động đàn Sói Xương
    this.onScoutWhistleHandler = (data: { x: number; y: number; playerX: number; playerY: number }) => {
      for (const wolf of this.skullWolves) {
        if (wolf.active && !wolf.isDefeated) {
          const moveX = data.playerX > wolf.x ? 95 : -95;
          const moveY = data.playerY > wolf.y ? 35 : -35;
          wolf.setVelocity(moveX, moveY);
        }
      }
    };
    this.scene.events.on('scout_whistle', this.onScoutWhistleHandler);

    // Lắng nghe va chạm phục kích để kích hoạt Grace Period 45s
    this.onPlayerAmbushHitHandler = () => {
      this.lastAmbushHitTime = this.scene.time.now;
    };
    this.scene.events.on('player_ambush_hit', this.onPlayerAmbushHitHandler);

    // V1.5 - BƯỚC V15-08: Lắng nghe tiếng quạ bóng tối báo động để kích động đàn Sói Xương gần đó kéo tới
    this.onShadowCrowAlarmHandler = (data: { x: number; y: number; isNight?: boolean; soundRadius?: number }) => {
      const radius = data.soundRadius ?? (data.isNight ? 360 : 240);
      for (const wolf of this.skullWolves) {
        if (wolf.active && !wolf.isDefeated) {
          const dist = Phaser.Math.Distance.Between(wolf.x, wolf.y, data.x, data.y);
          if (dist <= radius) {
            const angle = Phaser.Math.Angle.Between(wolf.x, wolf.y, data.x, data.y);
            const speed = data.isNight ? 110 : 85;
            wolf.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
          }
        }
      }
    };
    this.scene.events.on('shadow_crow_alarm', this.onShadowCrowAlarmHandler);
  }

  public static getInstance(scene?: Phaser.Scene): WildlifeSystem {
    if (!WildlifeSystem.instance && scene) {
      WildlifeSystem.instance = new WildlifeSystem(scene);
    }
    return WildlifeSystem.instance!;
  }

  /**
   * Khởi tạo hoặc chuyển phân khu sinh thái (Zone Lifecycle)
   */
  public switchZone(zoneId: string): void {
    if (this.currentZoneId === zoneId && this.entities.length > 0) {
      return;
    }

    this.currentZoneId = zoneId;
    this.clearEntities();

    const specs = WildlifeSystem.ZONE_HABITATS[zoneId] || [];
    let crowCount = 0;
    let mothCount = 0;

    specs.forEach((spec, index) => {
      // Tuân thủ nghiêm ngặt Spawn Cap
      if (spec.species === 'crow' && crowCount >= WildlifeSystem.MAX_CROWS_PER_ZONE) return;
      if (spec.species === 'lantern_moth' && mothCount >= WildlifeSystem.MAX_MOTHS_PER_ZONE) return;
      if (this.entities.length >= WildlifeSystem.MAX_GLOBAL_ENTITIES) return;

      const entity = new WildlifeEntity(this.scene, spec, index);
      this.entities.push(entity);

      if (spec.species === 'crow') crowCount++;
      else mothCount++;
    });
  }

  /**
   * Vòng lặp cập nhật hàng frame kèm cơ chế culling kiểm soát hiệu năng WebGL
   */
  public update(time: number, delta: number, ctx: WildlifeUpdateContext): void {
    const px = ctx.playerX;
    const py = ctx.playerY;

    if (this.entities.length > 0) {
      for (let i = 0; i < this.entities.length; i++) {
        const ent = this.entities[i];
        const dist = Math.hypot(ent.x - px, ent.y - py);

        // Culling & Hibernation: Nếu ở ngoài tầm nhìn (> 560px), ngủ đông để giải phóng CPU/GPU
        if (dist > WildlifeSystem.CULLING_DISTANCE) {
          if (!ent.isHibernating) {
            ent.setHibernating(true);
          }
        } else {
          if (ent.isHibernating) {
            ent.setHibernating(false);
          }

          // Cơ chế mở khóa tự nhiên Sổ Tay Sinh Vật (Bestiary): Quan sát trong phạm vi nhìn thấy (<= 260px)
          if (dist <= 260) {
            if (ent.species === 'crow') {
              PlayerState.getInstance().observeCreature('crow');
            } else if (ent.species === 'lantern_moth') {
              PlayerState.getInstance().observeCreature('lantern_moth');
            }
          }

          ent.update(time, delta, ctx);
        }
      }

      // 5.1: Chuỗi phản ứng phân cấp sinh thái (Ecological Forewarning)
      const highTierMonsters: Array<{ x: number; y: number }> = [];
      for (const w of this.skullWolves) if (w.active && !w.isDefeated) highTierMonsters.push({ x: w.x, y: w.y });
      for (const fk of this.fallenKnights) if (fk.active && !fk.isDefeated) highTierMonsters.push({ x: fk.x, y: fk.y });
      for (const dh of this.dreadHorsemen) if (dh.active && !dh.isDefeated) highTierMonsters.push({ x: dh.x, y: dh.y });
      if (this.hoodedKnight && this.hoodedKnight.active && !this.hoodedKnight.isDefeated) highTierMonsters.push({ x: this.hoodedKnight.x, y: this.hoodedKnight.y });
      if (this.shadowBehemoth && this.shadowBehemoth.active && !this.shadowBehemoth.isDefeated) highTierMonsters.push({ x: this.shadowBehemoth.x, y: this.shadowBehemoth.y });
      if (ctx.isListenerActive && ctx.listenerX !== undefined && ctx.listenerY !== undefined) {
        highTierMonsters.push({ x: ctx.listenerX, y: ctx.listenerY });
      }

      const shadowAuras: Array<{ x: number; y: number }> = [];
      for (const sh of this.wanderingShades) if (sh.active && !sh.isFinished) shadowAuras.push({ x: sh.x, y: sh.y });
      for (const ey of this.shadowEyes) if (ey.active && !ey.isDissolving) shadowAuras.push({ x: ey.x, y: ey.y });

      for (const ent of this.entities) {
        if (ent.isHibernating) continue;
        if (ent.species === 'crow' && ent.state !== 'spooked') {
          for (const mon of highTierMonsters) {
            if (Math.hypot(ent.x - mon.x, ent.y - mon.y) <= 250) {
              ent.spook('listener_near');
              break;
            }
          }
        } else if (ent.species === 'lantern_moth') {
          for (const aura of shadowAuras) {
            if (Math.hypot(ent.x - aura.x, ent.y - aura.y) <= 180) {
              ent.alpha = Math.max(0, ent.alpha - (delta / 1000) * 2.5);
              break;
            }
          }
        }
      }
    }

    // --- V1.4 - P8-08 & V1.5-08: Ranh giới Vùng An Toàn & Bảo Hộ Lửa Trại ---
    const isCampfireProtected = Boolean(
      ctx.campfirePos &&
      ctx.campfirePos.active &&
      Phaser.Math.Distance.Between(px, py, ctx.campfirePos.x, ctx.campfirePos.y) <= 180
    );

    const isSafeZone = (this.currentZoneId === 'bellhollow' && ctx.playerX <= 1620) ||
                       this.currentZoneId === 'sanctuary_farm' ||
                       this.currentZoneId === 'fog_crossing' ||
                       isCampfireProtected;

    // --- V1.4 - P8-08: Quản lý & Cập nhật AI Sói Xương (Skull Wolf) ---
    const isNocturnal = ctx.timePhase === 'DUSK' || ctx.timePhase === 'NIGHT';
    const wolfHabitats = WildlifeSystem.SKULL_WOLF_HABITATS[this.currentZoneId];

    // Chỉ xuất hiện tại The Crooked Path, Deep Forest và rìa Silent Mire vào ban đêm/hoàng hôn ngoài Safe Zone
    if (isNocturnal && !isSafeZone && wolfHabitats && wolfHabitats.length > 0 && this.skullWolves.length === 0) {
      const spawnCount = Math.min(wolfHabitats.length, WildlifeSystem.MAX_SKULL_WOLVES_PER_ZONE);
      for (let i = 0; i < spawnCount; i++) {
        const h = wolfHabitats[i];
        const wolf = new SkullWolfEntity(this.scene, h.x, h.y, this.currentZoneId);
        this.skullWolves.push(wolf);
      }
    }

    if (this.skullWolves.length > 0) {
      const activeCrows = this.entities
        .filter(e => e.species === 'crow')
        .map(c => ({
          x: c.x,
          y: c.y,
          spook: (cause: any) => c.spook(cause),
          isSpooked: c.state === 'spooked'
        }));

      const lightActive = Boolean(ctx.playerLightPos && ctx.playerLightPos.active);
      const lightX = ctx.playerLightPos ? ctx.playerLightPos.x : ctx.playerX;
      const lightY = ctx.playerLightPos ? ctx.playerLightPos.y : ctx.playerY;
      const lightRadius = lightActive ? 140 : 0;

      for (let w = this.skullWolves.length - 1; w >= 0; w--) {
        const wolf = this.skullWolves[w];
        if (!wolf.active || wolf.isDefeated) {
          if (!wolf.active) this.skullWolves.splice(w, 1);
          continue;
        }

        // V1.5 - BƯỚC V15-07: Săn theo cặp 2 con phối hợp bọc sườn (Flanking) & Kiểm tra Bình Tâm
        const packFlankOffset = w === 0 ? -0.61 : 0.61;
        const playerComposure = PlayerState.getInstance().stats.composure;

        wolf.updateAI(time, delta, {
          playerX: px,
          playerY: py,
          isLanternLit: lightActive,
          lightX,
          lightY,
          lightRadius,
          isPlayerInSafeZone: isSafeZone,
          timePhase: ctx.timePhase,
          playerComposure,
          packFlankOffset,
          crows: activeCrows
        });

        // Tự nhiên ghi nhận vào Sổ Tay Bestiary khi người chơi nhìn thấy Sói Xương trong tầm 260px
        const distToPlayer = Math.hypot(wolf.x - px, wolf.y - py);
        if (distToPlayer <= 260) {
          PlayerState.getInstance().observeCreature('skull_wolf');
        }
      }
    }

    // --- V1.4 - P8-09: Quản lý & Cập nhật AI Quái Vật Bóng Tối (Shadow Monsters) ---

    const lightActive = Boolean(ctx.playerLightPos && ctx.playerLightPos.active);
    const lightRadius = lightActive ? 140 : 0;

    const shadowCtx: ShadowContext = {
      playerX: px,
      playerY: py,
      isLanternLit: lightActive,
      lightRadius,
      isPlayerInSafeZone: isSafeZone,
      timePhase: ctx.timePhase,
      listenerMonster: (this.scene as any).listenerMonster
    };

    // 1. Quạ Bóng Tối (Shadow Crow)
    if (isNocturnal && !isSafeZone && this.shadowCrows.length === 0) {
      const crowSpots = WildlifeSystem.SHADOW_CROW_HABITATS[this.currentZoneId];
      if (crowSpots) {
        for (const spot of crowSpots) {
          this.shadowCrows.push(new ShadowCrowEntity(this.scene, spot.x, spot.y));
        }
      }
    }

    // 2. Bóng Mắt Sương Mù (Shadow Eyes)
    if (isNocturnal && !isSafeZone && this.shadowEyes.length === 0) {
      const eyeSpots = WildlifeSystem.SHADOW_EYES_HABITATS[this.currentZoneId];
      if (eyeSpots) {
        for (const spot of eyeSpots) {
          this.shadowEyes.push(new ShadowEyesEntity(this.scene, spot.x, spot.y));
        }
      }
    }

    // 3. Trùm Bóng Tối Khổng Lồ (Shadow Behemoth Boss)
    if (!isSafeZone && !this.shadowBehemoth) {
      const bossSpot = WildlifeSystem.SHADOW_BEHEMOTH_HABITATS[this.currentZoneId];
      if (bossSpot) {
        this.shadowBehemoth = new ShadowBehemothBoss(this.scene, bossSpot.x, bossSpot.y);
      }
    }

    // Cập nhật AI Quạ Bóng Tối
    for (let c = this.shadowCrows.length - 1; c >= 0; c--) {
      const crow = this.shadowCrows[c];
      if (!crow.active) {
        this.shadowCrows.splice(c, 1);
        continue;
      }
      crow.updateAI(time, delta, shadowCtx);
    }

    // Cập nhật AI Bóng Mắt Sương Mù
    for (let e = this.shadowEyes.length - 1; e >= 0; e--) {
      const eyes = this.shadowEyes[e];
      if (!eyes.active) {
        this.shadowEyes.splice(e, 1);
        continue;
      }
      eyes.updateAI(time, delta, shadowCtx);
    }

    // Cập nhật AI Trùm Bóng Tối Khổng Lồ
    if (this.shadowBehemoth && this.shadowBehemoth.active) {
      this.shadowBehemoth.updateAI(time, delta, shadowCtx);
      if (!this.shadowBehemoth.active) {
        this.shadowBehemoth = null;
      }
    }

    // --- V1.4 - P8-10: Quản lý & Cập nhật AI Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction) ---
    const knightCtx: KnightContext = {
      playerX: px,
      playerY: py,
      isLanternLit: lightActive,
      lightRadius,
      isPlayerInSafeZone: isSafeZone,
      timePhase: ctx.timePhase,
      isPlayerHiding: (this.scene as any).player?.stats?.isHiding
    };

    // 1. Hiệp Sĩ Sa Ngã (Fallen Knight)
    if (!isSafeZone && this.fallenKnights.length === 0) {
      const fallenSpots = WildlifeSystem.FALLEN_KNIGHT_HABITATS[this.currentZoneId];
      if (fallenSpots) {
        for (const spot of fallenSpots) {
          this.fallenKnights.push(new FallenKnightEntity(this.scene, spot.x, spot.y));
        }
      }
    }

    // 2. Kỵ Binh Hắc Ám (Dread Horseman)
    if (!isSafeZone && this.dreadHorsemen.length === 0) {
      const horseSpots = WildlifeSystem.DREAD_HORSEMAN_HABITATS[this.currentZoneId];
      if (horseSpots) {
        for (const spot of horseSpots) {
          this.dreadHorsemen.push(new DreadHorsemanEntity(this.scene, spot.x, spot.y, spot.patrolRange));
        }
      }
    }

    // 3. Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss)
    if (!isSafeZone && !this.hoodedKnight) {
      const bossSpot = WildlifeSystem.HOODED_KNIGHT_HABITATS[this.currentZoneId];
      if (bossSpot) {
        this.hoodedKnight = new HoodedKnightBoss(this.scene, bossSpot.x, bossSpot.y);
      }
    }

    // Cập nhật AI Hiệp Sĩ Sa Ngã
    for (let f = this.fallenKnights.length - 1; f >= 0; f--) {
      const fk = this.fallenKnights[f];
      if (!fk.active) {
        this.fallenKnights.splice(f, 1);
        continue;
      }
      fk.updateAI(time, delta, knightCtx);
    }

    // Cập nhật AI Kỵ Binh Hắc Ám
    for (let h = this.dreadHorsemen.length - 1; h >= 0; h--) {
      const dh = this.dreadHorsemen[h];
      if (!dh.active) {
        this.dreadHorsemen.splice(h, 1);
        continue;
      }
      dh.updateAI(time, delta, knightCtx);
    }

    // Cập nhật AI Chỉ Huy Hiệp Sĩ Trùm Mũ & Đội hình Hộ Vệ Tháp Tùng
    if (this.hoodedKnight && this.hoodedKnight.active) {
      this.hoodedKnight.updateAI(time, delta, knightCtx);
      if (!this.hoodedKnight.active) {
        this.hoodedKnight = null;
      } else {
        // Đội hình Hộ Vệ: Luôn có 2 Fallen Knight tháp tùng cách trùm ~110px
        if (this.currentZoneId === 'deep_forest' && this.fallenKnights.length < 2) {
          this.fallenKnights.push(new FallenKnightEntity(this.scene, this.hoodedKnight.x - 110, this.hoodedKnight.y + 15));
          this.fallenKnights.push(new FallenKnightEntity(this.scene, this.hoodedKnight.x + 110, this.hoodedKnight.y + 15));
        }
      }
    }

    // --- V1.4 - Bước 9: Sinh vật Phục Kích (Mist Bat, Wandering Shade) & Goblin Scout ---
    const ambushCtx = {
      playerX: px,
      playerY: py,
      isLanternLit: lightActive,
      isPlayerInSafeZone: isSafeZone,
      timePhase: ctx.timePhase,
      isSprinting: ctx.isPlayerSprinting,
      listenerMonster: (this.scene as any).listenerMonster
    };

    // Đội hình Quái Hộ Vệ Đầm Lầy: Mire Warden / Behemoth kéo theo 3 Dơi Sương Mù
    const isBehemothOrWardenActive = (this.shadowBehemoth && this.shadowBehemoth.active && !this.shadowBehemoth.isDefeated && this.shadowBehemoth.bossState !== 'idle') ||
      Boolean((this.scene as any).isBossFightActive);
    if (isBehemothOrWardenActive && this.mistBats.length < 3 && (time - this.lastBatAmbushTime > 15000)) {
      this.lastBatAmbushTime = time;
      this.mistBats.push(new MistBatAmbushEntity(this.scene, px - 60, py - 90, px, py));
      this.mistBats.push(new MistBatAmbushEntity(this.scene, px + 60, py - 90, px, py));
      this.mistBats.push(new MistBatAmbushEntity(this.scene, px, py - 110, px, py));
    }

    // Ngưỡng an toàn sau phục kích (Grace Period 45s)
    const isUnderGracePeriod = (time - this.lastAmbushHitTime < 45000);

    // 1. Phục kích Dơi Sương Mù (Mist Bat) theo Ma Trận 5 Chiều
    const batZones = ['fog_crossing', 'outer_woods', 'crooked_path', 'deep_forest', 'silent_mire', 'sub_bell_workshop'];
    const batCooldown = this.currentZoneId === 'deep_forest' ? 30000 : (this.currentZoneId === 'silent_mire' ? 40000 : (this.currentZoneId === 'crooked_path' ? 45000 : 60000));
    const maxBats = this.currentZoneId === 'deep_forest' ? 3 : (this.currentZoneId === 'crooked_path' ? 1 : 2);

    if (isNocturnal && !isSafeZone && batZones.includes(this.currentZoneId) && !isUnderGracePeriod) {
      if (this.mistBats.length < maxBats && (time - this.lastBatAmbushTime > batCooldown)) {
        if (ctx.isPlayerSprinting || !lightActive) {
          this.lastBatAmbushTime = time;
          const startX = px + Phaser.Math.Between(-35, 35);
          const startY = py - 70;
          this.mistBats.push(new MistBatAmbushEntity(this.scene, startX, startY, px, py));
        }
      }
    }

    for (let b = this.mistBats.length - 1; b >= 0; b--) {
      const bat = this.mistBats[b];
      if (!bat.active || bat.isFinished) {
        this.mistBats.splice(b, 1);
        continue;
      }
      bat.updateAI(delta, ambushCtx);
    }

    // 2. Phục kích Hồn Ma Phiêu Bạt (Wandering Shade) theo Ma Trận 5 Chiều
    const shadeZones = ['crooked_path', 'sub_root_cellar', 'silent_mire', 'sub_bell_workshop', 'deep_forest', 'broken_bell_shrine', 'ancient_rune_puzzle', 'sunken_crypt_ruins'];
    const isUnderground = this.currentZoneId.startsWith('sub_') || this.currentZoneId === 'broken_bell_shrine';
    const shadeCooldown = (this.currentZoneId === 'deep_forest' || this.currentZoneId === 'broken_bell_shrine') ? 30000 : (this.currentZoneId === 'sub_root_cellar' ? 75000 : 45000);
    const maxShades = this.currentZoneId === 'broken_bell_shrine' ? 3 : (this.currentZoneId === 'crooked_path' || this.currentZoneId === 'silent_mire' ? 1 : 2);

    if ((ctx.timePhase === 'NIGHT' || isUnderground) && !isSafeZone && shadeZones.includes(this.currentZoneId) && !isUnderGracePeriod) {
      const playerComposure = PlayerState.getInstance().stats.composure;
      if (this.wanderingShades.length < maxShades && (time - this.lastShadeAmbushTime > shadeCooldown)) {
        if (playerComposure < 50 || isUnderground) {
          this.lastShadeAmbushTime = time;
          const angle = Math.random() * Math.PI * 2;
          const spawnX = px + Math.cos(angle) * 110;
          const spawnY = py + Math.sin(angle) * 110;
          this.wanderingShades.push(new WanderingShadeEntity(this.scene, spawnX, spawnY));
        }
      }
    }

    for (let s = this.wanderingShades.length - 1; s >= 0; s--) {
      const shade = this.wanderingShades[s];
      if (!shade.active || shade.isFinished) {
        this.wanderingShades.splice(s, 1);
        continue;
      }
      shade.updateAI(delta, ambushCtx);
    }

    // 3. Goblin Scout (Kẻ Rình Mập Vô Diện / The Unseen Stalker)
    const scoutZones = ['crooked_path', 'deep_forest', 'abyssal_chasm'];
    if (!isSafeZone && scoutZones.includes(this.currentZoneId)) {
      if (this.goblinScouts.length === 0 && (time - this.lastScoutSpawnTime > 60000)) {
        this.lastScoutSpawnTime = time;
        const spawnX = px + (Math.random() < 0.5 ? -140 : 140);
        const spawnY = py + Phaser.Math.Between(-40, 40);
        this.goblinScouts.push(new GoblinScoutEntity(this.scene, spawnX, spawnY));
      }
    }

    for (let g = this.goblinScouts.length - 1; g >= 0; g--) {
      const scout = this.goblinScouts[g];
      if (!scout.active || scout.isFinished) {
        this.goblinScouts.splice(g, 1);
        continue;
      }
      scout.updateAI(delta, ambushCtx);
    }
  }

  /**
   * Kích hoạt giật mình cho đàn quạ khi người chơi vung vũ khí hoặc nổ đuốc
   */
  public spookCrowsNear(x: number, y: number, radius: number, cause: 'player_attack' | 'flare_ignite'): number {
    let spookedCount = 0;
    for (const ent of this.entities) {
      if (ent.species === 'crow' && !ent.isHibernating && ent.state !== 'spooked') {
        const dist = Math.hypot(ent.x - x, ent.y - y);
        if (dist <= radius) {
          ent.spook(cause);
          spookedCount++;
        }
      }
    }
    return spookedCount;
  }

  public getCrowCount(): number {
    return this.entities.filter(e => e.species === 'crow').length;
  }

  public getMothCount(): number {
    return this.entities.filter(e => e.species === 'lantern_moth').length;
  }

  public getActiveEntityCount(): number {
    return this.entities.filter(e => !e.isHibernating).length;
  }

  public getEntities(): WildlifeEntity[] {
    return this.entities;
  }

  public spawnDebugCreature(type: 'skull_wolf' | 'fallen_knight', x: number, y: number): void {
    const dev = DeveloperModeManager.getInstance();
    if (!dev.isEnabled || !dev.markDevUsed()) return;
    if (type === 'skull_wolf') this.skullWolves.push(new SkullWolfEntity(this.scene, x, y, this.currentZoneId));
    else if (type === 'fallen_knight') this.fallenKnights.push(new FallenKnightEntity(this.scene, x, y));
  }

  public stopDebugMotion(): void {
    const bodies = [...this.getSkullWolves(), ...this.getFallenKnights(), ...this.getDreadHorsemen(),
      ...this.getShadowCrows(), ...this.getShadowEyes(), this.getShadowBehemoth(), this.getHoodedKnight()];
    for (const entity of bodies) entity?.setVelocity(0, 0);
  }

  public getSkullWolves(): SkullWolfEntity[] {
    return this.skullWolves.filter(w => w.active && !w.isDefeated);
  }

  public getShadowCrows(): ShadowCrowEntity[] {
    return this.shadowCrows.filter(c => c.active && !c.isDefeated);
  }

  public getShadowEyes(): ShadowEyesEntity[] {
    return this.shadowEyes.filter(e => e.active && !e.isDissolving);
  }

  public getShadowBehemoth(): ShadowBehemothBoss | null {
    return (this.shadowBehemoth && this.shadowBehemoth.active && !this.shadowBehemoth.isDefeated) ? this.shadowBehemoth : null;
  }

  public getFallenKnights(): FallenKnightEntity[] {
    return this.fallenKnights.filter(k => k.active && !k.isDefeated);
  }

  public getDreadHorsemen(): DreadHorsemanEntity[] {
    return this.dreadHorsemen.filter(h => h.active && !h.isDefeated);
  }

  public getHoodedKnight(): HoodedKnightBoss | null {
    return (this.hoodedKnight && this.hoodedKnight.active && !this.hoodedKnight.isDefeated) ? this.hoodedKnight : null;
  }

  public getMistBats(): MistBatAmbushEntity[] {
    return this.mistBats.filter(b => b.active && !b.isFinished);
  }

  public getWanderingShades(): WanderingShadeEntity[] {
    return this.wanderingShades.filter(s => s.active && !s.isFinished);
  }

  public getGoblinScouts(): GoblinScoutEntity[] {
    return this.goblinScouts.filter(g => g.active && !g.isFinished);
  }

  public isBossAwakened(): boolean {
    if (this.shadowBehemoth && this.shadowBehemoth.active && !this.shadowBehemoth.isDefeated && this.shadowBehemoth.bossState !== 'idle') {
      return true;
    }
    if (this.hoodedKnight && this.hoodedKnight.active && !this.hoodedKnight.isDefeated && this.hoodedKnight.bossState !== 'idle') {
      return true;
    }
    if ((this.scene as any).isBossFightActive) {
      return true;
    }
    return false;
  }

  public clearEntities(): void {
    for (const ent of this.entities) {
      ent.destroy();
    }
    this.entities = [];

    for (const wolf of this.skullWolves) {
      wolf.destroy();
    }
    this.skullWolves = [];

    for (const crow of this.shadowCrows) {
      crow.destroy();
    }
    this.shadowCrows = [];

    for (const eyes of this.shadowEyes) {
      eyes.destroy();
    }
    this.shadowEyes = [];

    if (this.shadowBehemoth) {
      this.shadowBehemoth.destroy();
      this.shadowBehemoth = null;
    }

    for (const fk of this.fallenKnights) {
      fk.destroy();
    }
    this.fallenKnights = [];

    for (const dh of this.dreadHorsemen) {
      dh.destroy();
    }
    this.dreadHorsemen = [];

    if (this.hoodedKnight) {
      this.hoodedKnight.destroy();
      this.hoodedKnight = null;
    }

    for (const bat of this.mistBats) {
      bat.destroy();
    }
    this.mistBats = [];

    for (const shade of this.wanderingShades) {
      shade.destroy();
    }
    this.wanderingShades = [];

    for (const scout of this.goblinScouts) {
      scout.destroy();
    }
    this.goblinScouts = [];
  }

  public isMonsterNear(x: number, y: number, radius: number = 220): boolean {
    for (const w of this.skullWolves) {
      if (w.active && !w.isDefeated && Math.hypot(w.x - x, w.y - y) <= radius) return true;
    }
    for (const fk of this.fallenKnights) {
      if (fk.active && !fk.isDefeated && Math.hypot(fk.x - x, fk.y - y) <= radius) return true;
    }
    for (const dh of this.dreadHorsemen) {
      if (dh.active && !dh.isDefeated && Math.hypot(dh.x - x, dh.y - y) <= radius) return true;
    }
    if (this.hoodedKnight && this.hoodedKnight.active && !this.hoodedKnight.isDefeated && Math.hypot(this.hoodedKnight.x - x, this.hoodedKnight.y - y) <= radius) {
      return true;
    }
    if (this.shadowBehemoth && this.shadowBehemoth.active && !this.shadowBehemoth.isDefeated && Math.hypot(this.shadowBehemoth.x - x, this.shadowBehemoth.y - y) <= radius) {
      return true;
    }
    return false;
  }

  public destroy(): void {
    if (this.scene?.events) {
      this.scene.events.off('scout_whistle', this.onScoutWhistleHandler);
      this.scene.events.off('player_ambush_hit', this.onPlayerAmbushHitHandler);
      this.scene.events.off('shadow_crow_alarm', this.onShadowCrowAlarmHandler);
    }
    this.clearEntities();
    WildlifeSystem.instance = null;
  }
}
