import { PlayerState } from '../state/PlayerState';
import { 
  STAMINA_DRAIN_RATE, 
  STAMINA_RECOVERY_RATE, 
  LANTERN_OIL_DRAIN_RATE,
  COMPOSURE_DRAIN_IN_DARK,
  COMPOSURE_RECOVERY_NEAR_LIGHT
} from '../config/Constants';

export class SurvivalSystem {
  private playerState: PlayerState;
  
  // Vị trí lửa trại ấm áp của làng Bellhollow
  private campfireX: number = 780;
  private campfireY: number = 260;
  private campfireWarmthRadius: number = 90;

  constructor() {
    this.playerState = PlayerState.getInstance();
  }

  public update(dt: number, playerX: number, playerY: number, inDeepFog: boolean): void {
    const stats = this.playerState.stats;

    // 1. Quản lý Thể lực (Stamina)
    if (stats.isSprinting) {
      stats.stamina = Math.max(0, stats.stamina - STAMINA_DRAIN_RATE * dt);
      if (stats.stamina <= 0) {
        stats.isSprinting = false;
      }
    } else {
      stats.stamina = Math.min(stats.maxStamina, stats.stamina + STAMINA_RECOVERY_RATE * dt);
    }

    // 2. Quản lý Dầu đèn lồng (Lantern Oil)
    if (stats.isLanternOn) {
      stats.lanternOil = Math.max(0, stats.lanternOil - LANTERN_OIL_DRAIN_RATE * dt);
      if (stats.lanternOil <= 0) {
        stats.isLanternOn = false;
      }
    }

    // 3. Quản lý Bình tâm (Composure) & Máu (Health) theo vùng an toàn
    const distToCampfire = Math.hypot(playerX - this.campfireX, playerY - this.campfireY);
    const nearCampfire = distToCampfire <= this.campfireWarmthRadius;

    if (nearCampfire) {
      // Hồi máu nhẹ và hồi phục mạnh mẽ tinh thần khi nghỉ bên lửa trại làng
      stats.health = Math.min(stats.maxHealth, stats.health + 4 * dt);
      stats.composure = Math.min(stats.maxComposure, stats.composure + 8 * dt);
    } else {
      if (!stats.isLanternOn) {
        // Trong bóng tối: Composure sụt giảm
        const drain = inDeepFog ? COMPOSURE_DRAIN_IN_DARK * 2.2 : COMPOSURE_DRAIN_IN_DARK;
        stats.composure = Math.max(0, stats.composure - drain * dt);
      } else {
        // Có ánh đèn lồng: Composure hồi phục dần
        stats.composure = Math.min(stats.maxComposure, stats.composure + COMPOSURE_RECOVERY_NEAR_LIGHT * dt);
      }
    }

    this.playerState.emit('stats_changed', stats);
  }

  public healFull(): void {
    const stats = this.playerState.stats;
    stats.health = stats.maxHealth;
    stats.composure = stats.maxComposure;
    this.playerState.emit('stats_changed', stats);
  }
}

