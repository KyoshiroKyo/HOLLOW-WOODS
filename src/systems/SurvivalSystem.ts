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

  // Bộ nhớ đệm kiểm tra thay đổi (Dirty Checking Cache)
  private lastHealth: number = -1;
  private lastStamina: number = -1;
  private lastOil: number = -1;
  private lastComposure: number = -1;
  private lastLanternState: boolean | null = null;
  private lastSprinting: boolean | null = null;

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
        this.playerState.emit('lantern_empty');
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
        // C4-13-03: Khi bình tâm cạn kiệt trong sương tối, khí lạnh gặm mòn sinh lực
        if (stats.composure <= 0) {
          stats.health = Math.max(0, stats.health - 2.5 * dt);
        }
      } else {
        // Có ánh đèn lồng: Composure hồi phục dần
        stats.composure = Math.min(stats.maxComposure, stats.composure + COMPOSURE_RECOVERY_NEAR_LIGHT * dt);
      }
    }

    // C4-13-03: Báo động tức thời khi sinh lực chạm đáy (health <= 0)
    if (stats.health <= 0) {
      stats.health = 0;
      this.playerState.emit('player_health_depleted');
    }

    // Chỉ phát sự kiện 'stats_changed' khi các giá trị có sự thay đổi thực sự
    const isDirty =
      Math.abs(stats.health - this.lastHealth) > 0.05 ||
      Math.abs(stats.stamina - this.lastStamina) > 0.05 ||
      Math.abs(stats.lanternOil - this.lastOil) > 0.05 ||
      Math.abs(stats.composure - this.lastComposure) > 0.05 ||
      stats.isLanternOn !== this.lastLanternState ||
      stats.isSprinting !== this.lastSprinting;

    if (isDirty) {
      this.lastHealth = stats.health;
      this.lastStamina = stats.stamina;
      this.lastOil = stats.lanternOil;
      this.lastComposure = stats.composure;
      this.lastLanternState = stats.isLanternOn;
      this.lastSprinting = stats.isSprinting;
      this.playerState.emit('stats_changed', stats);
    }
  }

  public healFull(): void {
    const stats = this.playerState.stats;
    stats.health = stats.maxHealth;
    stats.composure = stats.maxComposure;
    this.lastHealth = stats.health;
    this.lastComposure = stats.composure;
    this.playerState.emit('stats_changed', stats);
  }
}

