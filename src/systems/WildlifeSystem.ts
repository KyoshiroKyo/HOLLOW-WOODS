import * as Phaser from 'phaser';
import { WildlifeSpec } from '../types';
import { WildlifeEntity } from '../entities/WildlifeEntity';
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
  private currentZoneId: string = '';

  // Giới hạn số lượng (Spawn Cap) để tối ưu WebGL 60 FPS
  public static readonly MAX_CROWS_PER_ZONE = 6;
  public static readonly MAX_MOTHS_PER_ZONE = 8;
  public static readonly MAX_GLOBAL_ENTITIES = 24;
  public static readonly CULLING_DISTANCE = 560; // Bán kính ngủ đông (pixels)

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
      { id: 'crow_cp_02', species: 'crow', x: 680, y: 130, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'branch' },
      { id: 'crow_cp_03', species: 'crow', x: 920, y: 280, zoneId: 'crooked_path', contentId: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow', perchType: 'fence' },
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

  public clearEntities(): void {
    for (const ent of this.entities) {
      ent.destroy();
    }
    this.entities = [];
  }

  public destroy(): void {
    this.clearEntities();
    WildlifeSystem.instance = null;
  }
}
