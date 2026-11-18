import * as Phaser from 'phaser';
import { WildlifeSpec } from '../types';
import { WildlifeEntity } from '../entities/WildlifeEntity';
import { SkullWolfEntity } from '../entities/SkullWolfEntity';
import { ShadowCrowEntity, ShadowEyesEntity, ShadowBehemothBoss, ShadowContext } from '../entities/ShadowMonsters';
import { FallenKnightEntity, DreadHorsemanEntity, HoodedKnightBoss, KnightContext } from '../entities/EvilKnights';
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
  private currentZoneId: string = '';

  // Giới hạn số lượng (Spawn Cap) để tối ưu WebGL 60 FPS
  public static readonly MAX_CROWS_PER_ZONE = 8;
  public static readonly MAX_MOTHS_PER_ZONE = 8;
  public static readonly MAX_SKULL_WOLVES_PER_ZONE = 2;
  public static readonly MAX_GLOBAL_ENTITIES = 28;
  public static readonly CULLING_DISTANCE = 560; // Bán kính ngủ đông (pixels)

  // Danh mục tọa độ sinh cảnh chuẩn cho Sói Xương (Skull Wolf) - V1.4 P8-08
  private static readonly SKULL_WOLF_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    crooked_path: [{ x: 820, y: 310 }, { x: 1350, y: 260 }],
    deep_forest: [{ x: 650, y: 290 }, { x: 1180, y: 240 }],
    silent_mire: [{ x: 500, y: 280 }],
    outer_woods: [{ x: 920, y: 280 }]
  };

  // V1.4 - P8-09: Tọa độ sinh cảnh Quái Vật Bóng Tối (Shadow Crow, Shadow Eyes, Shadow Behemoth)
  private static readonly SHADOW_CROW_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    outer_woods: [{ x: 1350, y: 220 }],
    deep_forest: [{ x: 880, y: 200 }]
  };

  private static readonly SHADOW_EYES_HABITATS: Record<string, Array<{ x: number; y: number }>> = {
    deep_forest: [{ x: 740, y: 280 }],
    silent_mire: [{ x: 450, y: 310 }, { x: 850, y: 330 }]
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
    ]
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    WildlifeSystem.instance = this;
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
    if (this.entities.length === 0) return;

    const px = ctx.playerX;
    const py = ctx.playerY;

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

    // --- V1.4 - P8-08: Quản lý & Cập nhật AI Sói Xương (Skull Wolf) ---
    const isNocturnal = ctx.timePhase === 'DUSK' || ctx.timePhase === 'NIGHT';
    const wolfHabitats = WildlifeSystem.SKULL_WOLF_HABITATS[this.currentZoneId];

    // Chỉ xuất hiện tại The Crooked Path, Deep Forest và rìa Silent Mire vào ban đêm/hoàng hôn
    if (isNocturnal && wolfHabitats && wolfHabitats.length > 0 && this.skullWolves.length === 0) {
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

      const isSafe = (this.currentZoneId === 'bellhollow' && ctx.playerX <= 1620) ||
                     this.currentZoneId === 'sanctuary_farm' ||
                     this.currentZoneId === 'fog_crossing';

      for (let w = this.skullWolves.length - 1; w >= 0; w--) {
        const wolf = this.skullWolves[w];
        if (!wolf.active || wolf.isDefeated) {
          if (!wolf.active) this.skullWolves.splice(w, 1);
          continue;
        }

        wolf.updateAI(time, delta, {
          playerX: px,
          playerY: py,
          isLanternLit: lightActive,
          lightX,
          lightY,
          lightRadius,
          isPlayerInSafeZone: isSafe,
          timePhase: ctx.timePhase,
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
    const isSafeZone = (this.currentZoneId === 'bellhollow' && ctx.playerX <= 1620) ||
                       this.currentZoneId === 'sanctuary_farm' ||
                       this.currentZoneId === 'fog_crossing';

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

    // Cập nhật AI Chỉ Huy Hiệp Sĩ Trùm Mũ
    if (this.hoodedKnight && this.hoodedKnight.active) {
      this.hoodedKnight.updateAI(time, delta, knightCtx);
      if (!this.hoodedKnight.active) {
        this.hoodedKnight = null;
      }
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
  }

  public destroy(): void {
    this.clearEntities();
    WildlifeSystem.instance = null;
  }
}
