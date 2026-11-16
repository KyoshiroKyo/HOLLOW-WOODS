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
  
  // C4-132-02: Danh sách các điểm nguồn nhiệt/lửa trại hợp lệ để hồi phục Sinh Lực và Bình Tâm (bán kính 110px)
  private warmSources: Array<{ x: number; y: number; radius: number; name: string }> = [
    { x: 1320, y: 720, radius: 110, name: 'Lửa Trại Thợ Săn' },
    { x: 960, y: 360, radius: 110, name: 'Lò Rèn Xưởng Chế Tạo' },
    { x: 780, y: 260, radius: 110, name: 'Lửa Trại Làng Bellhollow' }
  ];

  // Giữ tọa độ và bán kính tương thích cho làng Bellhollow
  public campfireX: number = 780;
  public campfireY: number = 260;
  public campfireWarmthRadius: number = 110;

  // Bộ nhớ đệm kiểm tra thay đổi (Dirty Checking Cache)
  private lastHealth: number = -1;
  private lastStamina: number = -1;
  private lastOil: number = -1;
  private lastComposure: number = -1;
  private lastLanternState: boolean | null = null;
  private lastSprinting: boolean | null = null;

  // C4-13-18: Thời gian hoãn hồi phục thể lực sau khi chạy nhanh (1.0 giây)
  private sprintCooldownTimer: number = 0;

  constructor() {
    this.playerState = PlayerState.getInstance();
  }

  public update(dt: number, playerX: number, playerY: number, inDeepFog: boolean): void {
    const stats = this.playerState.stats;

    // 1. Quản lý Thể lực (Stamina) - C4-132-01: Tụt mượt mà về đúng 0/100, hoãn hồi phục 1.0s sau khi dừng chạy
    if (stats.isSprinting) {
      this.sprintCooldownTimer = 1.0;
      stats.stamina = Math.max(0, stats.stamina - STAMINA_DRAIN_RATE * dt);
      if (stats.stamina <= 0) {
        stats.stamina = 0;
        stats.isSprinting = false;
        this.playerState.emit('stamina_exhausted');
      }
    } else {
      if (this.sprintCooldownTimer > 0) {
        this.sprintCooldownTimer = Math.max(0, this.sprintCooldownTimer - dt);
      } else {
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + STAMINA_RECOVERY_RATE * dt);
      }
    }

    // 2. Quản lý Dầu đèn lồng (Lantern Oil)
    if (stats.isLanternOn) {
      stats.lanternOil = Math.max(0, stats.lanternOil - LANTERN_OIL_DRAIN_RATE * dt);
      if (stats.lanternOil <= 0) {
        stats.isLanternOn = false;
        this.playerState.emit('lantern_empty');
      }
    }

    // 3. Quản lý Bình tâm (Composure) & Máu (Health) theo vùng nguồn nhiệt ấm áp (C4-132-02)
    let nearCampfire = false;
    for (const source of this.warmSources) {
      if (Math.hypot(playerX - source.x, playerY - source.y) <= source.radius) {
        nearCampfire = true;
        break;
      }
    }
    if (!nearCampfire) {
      nearCampfire = Math.hypot(playerX - this.campfireX, playerY - this.campfireY) <= this.campfireWarmthRadius;
    }

    if (nearCampfire) {
      // Hồi máu nhẹ (+4 HP/s) và hồi phục mạnh mẽ tinh thần (+8 Composure/s) khi nghỉ bên nguồn nhiệt/lửa trại
      stats.health = Math.min(stats.maxHealth, stats.health + 4 * dt);
      stats.composure = Math.min(stats.maxComposure, stats.composure + 8 * dt);
    } else {
      if (!stats.isLanternOn) {
        // Trong bóng tối: Composure sụt giảm
        const drain = inDeepFog ? COMPOSURE_DRAIN_IN_DARK * 2.2 : COMPOSURE_DRAIN_IN_DARK;
        stats.composure = Math.max(0, stats.composure - drain * dt);
        // C4-13-18: Khi bình tâm cạn kiệt (0/100) trong sương tối, khí lạnh gặm mòn sinh lực (-1 HP mỗi 2.5s = -0.4 HP/s)
        if (stats.composure <= 0) {
          stats.health = Math.max(0, stats.health - 0.4 * dt);
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

  // C4-132-02: Kiểm tra người chơi có đang đứng trong bán kính nguồn nhiệt ấm áp hay không
  public isNearWarmth(playerX: number, playerY: number): boolean {
    return this.warmSources.some(s => Math.hypot(playerX - s.x, playerY - s.y) <= s.radius) ||
      Math.hypot(playerX - this.campfireX, playerY - this.campfireY) <= this.campfireWarmthRadius;
  }
}

