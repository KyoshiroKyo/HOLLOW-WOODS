import { PlayerState } from '../state/PlayerState';
import { EquipmentSystem } from './EquipmentSystem';
import { CampSanctuarySystem } from './CampSanctuarySystem';
import { 
  STAMINA_DRAIN_RATE, 
  STAMINA_RECOVERY_RATE, 
  LANTERN_OIL_DRAIN_RATE,
  COMPOSURE_DRAIN_IN_DARK,
  COMPOSURE_RECOVERY_NEAR_LIGHT
} from '../config/Constants';
import { TimePhase, TIME_CONFIG } from '../config/TimeConfig';

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
  private lastMoisture: number = -1;
  private lastTemperature: number = -1;

  // C4-13-18: Thời gian hoãn hồi phục thể lực sau khi chạy nhanh (1.0 giây)
  private sprintCooldownTimer: number = 0;

  constructor() {
    this.playerState = PlayerState.getInstance();
  }

  public update(
    dt: number, 
    playerX: number, 
    playerY: number, 
    inDeepFog: boolean, 
    timePhase?: TimePhase,
    isRaining?: boolean,
    zoneId?: string
  ): void {
    const stats = this.playerState.stats;

    // 1. Quản lý Thể lực (Stamina) - C4-132-01: Tụt mượt mà về đúng 0/100, hoãn hồi phục 1.0s sau khi dừng chạy
    const equipSys = EquipmentSystem.getInstance();
    if (stats.isSprinting) {
      this.sprintCooldownTimer = 1.0;
      const staminaDrainMod = equipSys.getStaminaDrainMultiplier();
      if (staminaDrainMod === 1.0) {
        stats.stamina = Math.max(0, stats.stamina - STAMINA_DRAIN_RATE * dt);
      } else {
        stats.stamina = Math.max(0, stats.stamina - (STAMINA_DRAIN_RATE * dt) * staminaDrainMod);
      }
      if (stats.stamina <= 0) {
        stats.stamina = 0;
        stats.isSprinting = false;
        this.playerState.emit('stamina_exhausted');
      }
    } else {
      if (this.sprintCooldownTimer > 0) {
        this.sprintCooldownTimer = Math.max(0, this.sprintCooldownTimer - dt);
      } else {
        // V1.4: Khi bị ướt sũng (SOAKED >= 70%), tốc độ hồi phục thể lực giảm nhẹ 25%
        const isSoaked = stats.moisture !== undefined && stats.moisture >= 70;
        const recoveryRate = isSoaked ? STAMINA_RECOVERY_RATE * 0.75 : STAMINA_RECOVERY_RATE;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + recoveryRate * dt);
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
      const campSanctuary = CampSanctuarySystem.getInstance();
      const inSanctuary = campSanctuary.isPlayerInSanctuary(playerX, playerY, zoneId);
      const composureMult = inSanctuary ? campSanctuary.getComposureRecoveryMultiplier() : 1.0;
      // Hồi máu nhẹ (+4 HP/s) và hồi phục mạnh mẽ tinh thần (+8 Composure/s) khi nghỉ bên nguồn nhiệt/lửa trại
      stats.health = Math.min(stats.maxHealth, stats.health + 4 * dt);
      stats.composure = Math.min(stats.maxComposure, stats.composure + (8 * composureMult) * dt);
    } else {
      if (!stats.isLanternOn) {
        // Trong bóng tối: Composure sụt giảm dựa trên chu kỳ ngày/đêm V1.4 (hoặc fallback V1.3)
        let drain: number;
        if (timePhase && TIME_CONFIG.phases[timePhase]) {
          const phaseCfg = TIME_CONFIG.phases[timePhase];
          drain = inDeepFog ? phaseCfg.composureDrainDeepFog : phaseCfg.composureDrainNormal;
        } else {
          drain = inDeepFog ? COMPOSURE_DRAIN_IN_DARK * 2.2 : COMPOSURE_DRAIN_IN_DARK;
        }

        const composureDrainMod = equipSys.getComposureDrainMultiplier();
        stats.composure = Math.max(0, stats.composure - drain * composureDrainMod * dt);

        // Khi bình tâm cạn kiệt (0/100) trong sương tối/đêm lạnh, khí lạnh gặm mòn sinh lực
        if (stats.composure <= 0) {
          stats.health = Math.max(0, stats.health - 0.4 * dt);
        }
      } else {
        // Có ánh đèn lồng: Composure hồi phục dần theo pha
        let recoveryRate = COMPOSURE_RECOVERY_NEAR_LIGHT;
        if (timePhase && TIME_CONFIG.phases[timePhase]) {
          recoveryRate = TIME_CONFIG.phases[timePhase].composureRecoveryLit;
        }
        stats.composure = Math.min(stats.maxComposure, stats.composure + recoveryRate * dt);
      }
    }

    // 4. V1.4: Quản lý Độ Ẩm (Moisture) & Thân Nhiệt (Temperature)
    if (stats.moisture === undefined) stats.moisture = 0;
    if (stats.temperature === undefined) stats.temperature = 80;

    if (nearCampfire) {
      // Đứng gần lửa trại / lò rèn: sưởi ấm và hong khô rất nhanh (gia tốc 20% khi trong Sanctuary)
      const campSanctuary = CampSanctuarySystem.getInstance();
      const inSanctuary = campSanctuary.isPlayerInSanctuary(playerX, playerY, zoneId);
      const dryingMult = inSanctuary ? campSanctuary.getMoistureDryingMultiplier() : 1.0;
      stats.moisture = Math.max(0, stats.moisture - 10.0 * dryingMult * dt);
      stats.temperature = Math.min(100, stats.temperature + 7.5 * dt);
    } else {
      // Độ ẩm: tăng khi đi dưới mưa sương hoặc lội đầm lầy (Áo Choàng Rêu giảm 40%)
      const moistMod = equipSys.getMoistureGainMultiplier();
      if (isRaining) {
        stats.moisture = Math.min(100, stats.moisture + 3.2 * moistMod * dt);
      } else if (zoneId === 'silent_mire') {
        stats.moisture = Math.min(100, stats.moisture + 4.0 * moistMod * dt);
      } else {
        // Hong khô tự nhiên
        const dryRate = (timePhase === 'DAY') ? 1.2 : 0.3;
        stats.moisture = Math.max(0, stats.moisture - dryRate * dt);
      }

      // Thân nhiệt: giảm vào ban đêm, khi mưa sương hoặc bị ướt sũng (Áo Choàng Rêu giữ ấm 40%)
      let tempChange = 0;
      if (timePhase === 'DAY' && !isRaining) {
        tempChange += 1.2;
      } else if (timePhase === 'DUSK') {
        tempChange -= 0.4;
      } else if (timePhase === 'NIGHT') {
        tempChange -= 1.0;
      }

      if (isRaining) tempChange -= 0.6;
      if (stats.moisture >= 70) tempChange -= 0.6;

      const coldMod = equipSys.getColdGainMultiplier();
      if (tempChange < 0) {
        tempChange *= coldMod;
      }

      stats.temperature = Math.max(0, Math.min(100, stats.temperature + tempChange * dt));

      // Khi bị cóng lạnh (FREEZING <= 34%): gây áp lực nhẹ lên Bình Tâm (-0.4/s)
      if (stats.temperature <= 34) {
        stats.composure = Math.max(0, stats.composure - 0.4 * dt);
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
      stats.isSprinting !== this.lastSprinting ||
      Math.abs((stats.moisture || 0) - this.lastMoisture) > 0.5 ||
      Math.abs((stats.temperature || 80) - this.lastTemperature) > 0.5;

    if (isDirty) {
      this.lastHealth = stats.health;
      this.lastStamina = stats.stamina;
      this.lastOil = stats.lanternOil;
      this.lastComposure = stats.composure;
      this.lastLanternState = stats.isLanternOn;
      this.lastSprinting = stats.isSprinting;
      this.lastMoisture = stats.moisture || 0;
      this.lastTemperature = stats.temperature || 80;
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

  // V1.4: Phân cấp Độ Ẩm (DRY: 0-29%, DAMP: 30-69%, SOAKED: 70-100%)
  public getMoistureTier(): 'DRY' | 'DAMP' | 'SOAKED' {
    const m = this.playerState.stats.moisture ?? 0;
    if (m >= 70) return 'SOAKED';
    if (m >= 30) return 'DAMP';
    return 'DRY';
  }

  // V1.4: Phân cấp Thân Nhiệt (FREEZING: <=34, CHILLY: 35-69, WARM: 70-100)
  public getTemperatureTier(): 'WARM' | 'CHILLY' | 'FREEZING' {
    const t = this.playerState.stats.temperature ?? 80;
    if (t <= 34) return 'FREEZING';
    if (t < 70) return 'CHILLY';
    return 'WARM';
  }
}

