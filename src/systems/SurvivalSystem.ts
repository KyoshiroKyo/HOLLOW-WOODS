import { DeveloperModeManager } from '../debug/DeveloperModeManager';
import { PlayerState } from '../state/PlayerState';
import { EquipmentSystem } from './EquipmentSystem';
import { CampSanctuarySystem } from './CampSanctuarySystem';
import { 
  STAMINA_DRAIN_RATE, 
  STAMINA_RECOVERY_RATE, 
  COMPOSURE_DRAIN_IN_DARK,
  COMPOSURE_RECOVERY_NEAR_LIGHT
} from '../config/Constants';
import { TimePhase, TIME_CONFIG } from '../config/TimeConfig';
import { AudioManager } from '../audio/AudioManager';

export class SurvivalSystem {
  private playerState: PlayerState;
  
  // C4-132-02: Danh sách các điểm nguồn nhiệt/lửa trại hợp lệ để hồi phục Sinh Lực và Bình Tâm (bán kính 110px)
  private warmSources: Array<{ x: number; y: number; radius: number; name: string }> = [
    { x: 1320, y: 720, radius: 110, name: 'Lửa Trại Thợ Săn' },
    { x: 1220, y: 370, radius: 110, name: 'Lò Rèn Xưởng Chế Tạo' },
    { x: 860, y: 310, radius: 110, name: 'Lửa Trại Làng Bellhollow' },
    { x: 1470, y: 710, radius: 180, name: 'Trạm Lửa Rừng Tĩnh Lặng' }
  ];

  // Giữ tọa độ và bán kính tương thích cho làng Bellhollow (V15-13)
  public campfireX: number = 860;
  public campfireY: number = 310;
  public campfireWarmthRadius: number = 110;

  // Bộ nhớ đệm kiểm tra thay đổi (Dirty Checking Cache)
  private lastHealth: number = -1;
  private lastStamina: number = -1;
  private lastOil: number = -1;
  private lastComposure: number = -1;
  private lastComposureSource = '—';
  private lastLanternState: boolean | null = null;
  private lastSprinting: boolean | null = null;
  private lastMoisture: number = -1;
  private lastTemperature: number = -1;

  // C4-13-18: Thời gian hoãn hồi phục thể lực sau khi chạy nhanh (1.0 giây)
  private sprintCooldownTimer: number = 0;

  // V15-47: Cờ trạng thái trận đấu trùm Miếu Chuông Phế Tích
  public isBossFightActive: boolean = false;

  // V15-58A: Quản lý hiện tượng Ảo Giác Tinh Thần khi Tinh Thần < 55 ngoài Làng Bellhollow
  private nextHallucinationTimer: number = 18.0; // Khoảng cách ngẫu nhiên 14–22s
  private hallucinationCooldown: number = 0; // Cooldown chống dồn dập (10–14s)
  private pendingFalseFootsteps: boolean = false;
  private wasPlayerMoving: boolean = false;
  private falseFootstepDelayTimer: number = 0;

  public setBossFightActive(active: boolean): void {
    this.isBossFightActive = active;
  }

  public getLastComposureSource(): string {
    return this.lastComposureSource;
  }

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
    zoneId?: string,
    isPlayerMoving?: boolean
  ): void {
    // V15-38: Cập nhật thời gian hiệu lực của Lời Chúc Bên Đốm Lửa
    CampSanctuarySystem.getInstance().update(dt);

    const stats = this.playerState.stats;
    const dev = DeveloperModeManager.getInstance();
    const infiniteStamina = dev.isEnabled && dev.isInfiniteStamina;
    const infiniteComposure = dev.isEnabled && dev.isInfiniteComposure;
    const healthBeforeUpdate = stats.health;
    const composureBeforeUpdate = stats.composure;
    let composureSource = '—';
    let coldDrain = false;
    if (infiniteComposure) stats.composure = stats.maxComposure;


    // 1. Quản lý Thể lực (Stamina) - C4-132-01: Tụt mượt mà về đúng 0/100, hoãn hồi phục 1.0s sau khi dừng chạy
    const equipSys = EquipmentSystem.getInstance();
    if (infiniteStamina) {
      stats.stamina = stats.maxStamina;
    } else if (stats.isSprinting) {
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
        let recoveryRate = isSoaked ? STAMINA_RECOVERY_RATE * 0.75 : STAMINA_RECOVERY_RATE;

        // V1.5 (BƯỚC V15-05): Ngưỡng Bất An (Tinh Thần từ 25 đến 40/100) và các ngưỡng thấp hơn:
        // Tốc độ hồi Thể Lực giảm 15% do áp lực tâm lý
        if (stats.composure <= 40) {
          recoveryRate *= 0.85;
        }

        stats.stamina = Math.min(stats.maxStamina, stats.stamina + recoveryRate * dt);
      }
    }

    // 2. V15-54: Vòng sáng ấm dịu [F] tiêu hao nhẹ 1.2 Thể Lực / giây trong lúc duy trì sáng
    if (stats.isLanternOn && !infiniteStamina) {
      stats.stamina = Math.max(0, stats.stamina - 1.2 * dt);
      if (stats.stamina < 5) {
        stats.isLanternOn = false;
        this.playerState.emit('lantern_exhausted');
        this.playerState.emit('stats_changed', stats);
      }
    }

    // 3. Quản lý Tinh Thần (Composure) & Máu (Health) theo vùng nguồn nhiệt ấm áp (C4-132-02)
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
    if (!nearCampfire) {
      const campSanctuary = CampSanctuarySystem.getInstance();
      if (campSanctuary.isPlayerInSanctuary(playerX, playerY, zoneId)) {
        nearCampfire = true;
      }
    }

    const isBossArena = (zoneId === 'broken_bell_shrine') && this.isBossFightActive;
    const isBellhollowSafe = zoneId === 'bellhollow';
    const isDaytime = timePhase === 'DAY';
    const isProtected = !isBossArena && (isDaytime || isBellhollowSafe);

    if (nearCampfire) {
      const campSanctuary = CampSanctuarySystem.getInstance();
      const inSanctuary = campSanctuary.isPlayerInSanctuary(playerX, playerY, zoneId);
      const composureMult = inSanctuary ? campSanctuary.getComposureRecoveryMultiplier() : 1.0;
      // V1.5 (BƯỚC V15-05): Hồi máu nhẹ (+4 HP/s) và hồi phục Tinh Thần (+4.0/s) khi đứng cạnh nguồn nhiệt / lửa trại đang cháy
      stats.health = Math.min(stats.maxHealth, stats.health + 4 * dt);
      stats.composure = Math.min(stats.maxComposure, stats.composure + (4.0 * composureMult) * dt);
      composureSource = inSanctuary ? 'trại an toàn' : 'nguồn nhiệt';
    } else if (isProtected) {
      // V1.5 (BƯỚC V15-05): Khi là BAN NGÀY (DAY) hoặc đứng trong vùng an toàn Làng Bellhollow:
      // Tinh Thần không tự tụt mà được hồi phục chậm tự nhiên (+1.5 mỗi giây)
      stats.composure = Math.min(stats.maxComposure, stats.composure + 1.5 * dt);
      composureSource = isBellhollowSafe ? 'vùng an toàn Bellhollow' : 'ban ngày';
    } else {
      if (!stats.isLanternOn) {
        // Ngoài vùng an toàn, vào ban đêm/hoàng hôn & trong bóng tối: Tinh Thần sụt giảm dựa trên chu kỳ ngày/đêm V1.4
        let drain: number;
        if (timePhase && TIME_CONFIG.phases[timePhase]) {
          const phaseCfg = TIME_CONFIG.phases[timePhase];
          drain = inDeepFog ? phaseCfg.composureDrainDeepFog : phaseCfg.composureDrainNormal;
        } else {
          drain = inDeepFog ? COMPOSURE_DRAIN_IN_DARK * 2.2 : COMPOSURE_DRAIN_IN_DARK;
        }

        const blessingDrainMod = CampSanctuarySystem.getInstance().getBlessingDrainMultiplier();
        const composureDrainMod = equipSys.getComposureDrainMultiplier() * blessingDrainMod;
        stats.composure = Math.max(0, stats.composure - drain * composureDrainMod * dt);
        composureSource = inDeepFog ? 'sương sâu' : 'bóng tối';
      } else if (!isBossArena) {
        // Có ánh sáng vòng hộ tâm: Tinh Thần hồi phục dần theo pha
        let recoveryRate = COMPOSURE_RECOVERY_NEAR_LIGHT;
        if (timePhase && TIME_CONFIG.phases[timePhase]) {
          recoveryRate = TIME_CONFIG.phases[timePhase].composureRecoveryLit;
        }
        stats.composure = Math.min(stats.maxComposure, stats.composure + recoveryRate * dt);
        composureSource = 'Vòng Sáng';
      }
    }

    if (stats.composure === composureBeforeUpdate) composureSource = '—';

    // V15-47: Thiết lập cơ chế rút Sinh Lực (HP) mạnh dần khi Tinh thần suy sụp
    if (isBossArena) {
      if (stats.composure < 50) {
        // V15-47: Trong phòng Boss Miếu Chuông, khi Tinh Thần < 50/100, tốc độ tụt Sinh Lực do hoảng loạn tăng nhanh:
        // Rút 3.5 HP mỗi 1.5 giây (~2.333 HP/s) để tạo áp lực sinh tồn buộc người chơi phải phá 3 Trụ Phong Ấn hoặc dùng Trà An Thần
        const drainHp = (3.5 / 1.5) * dt;
        stats.health = Math.max(0, stats.health - drainHp);
      }
    } else if (!nearCampfire && !isProtected && !stats.isLanternOn) {
      if (stats.composure < 10) {
        // Ngưỡng Hoảng Loạn Cực Độ (dưới 10/100 và chạm 0/100): Rút Sinh Lực -3.5 HP mỗi 1.5 giây (-2.333 HP/s)
        const drainHp = (3.5 / 1.5) * dt;
        stats.health = Math.max(0, stats.health - drainHp);
      } else if (stats.composure < 25) {
        // Ngưỡng Sợ Hãi (10 đến 24/100): Bắt đầu rút Sinh Lực ở mức -1.5 HP mỗi 2 giây (-0.75 HP/s)
        const drainHp = (1.5 / 2.0) * dt;
        stats.health = Math.max(0, stats.health - drainHp);
      }
      // Ngưỡng Bất An (25 đến 40/100): Chưa mất máu!
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
        coldDrain = stats.composure > 0;
        stats.composure = Math.max(0, stats.composure - 0.4 * dt);
      }
    }

    if (infiniteComposure) stats.composure = stats.maxComposure;
    if (dev.isEnabled && stats.composure !== composureBeforeUpdate) {
      if (infiniteComposure) {
        this.lastComposureSource = 'QA vô hạn';
      } else if (coldDrain) {
        this.lastComposureSource = composureSource === '—' ? 'lạnh cóng' : `${composureSource} + lạnh cóng`;
      } else {
        this.lastComposureSource = composureSource;
      }
    }
    if (dev.isEnabled && dev.isGodMode) stats.health = Math.max(healthBeforeUpdate, stats.health);

    // C4-13-03: Báo động tức thời khi sinh lực chạm đáy (health <= 0)
    if (stats.health <= 0) {
      stats.health = 0;
      this.playerState.emit('player_health_depleted');
    }

    // Chỉ phát sự kiện 'stats_changed' khi các giá trị có sự thay đổi thực sự (V152-06A: ngưỡng stamina 0.01 cho UI mượt)
    const isDirty =
      Math.abs(stats.health - this.lastHealth) > 0.05 ||
      Math.abs(stats.stamina - this.lastStamina) > 0.01 ||
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

    // 5. V15-58A: Tầng Ảo Giác Thính Giác & Bóng Lướt Rìa Tầm Nhìn
    // Khi Tinh Thần (Sanity) giảm xuống dưới 55/100 ở ngoài Làng Bellhollow:
    const isBellhollow = zoneId === 'bellhollow';
    if (stats.composure < 55 && !isBellhollow) {
      if (this.hallucinationCooldown > 0) {
        this.hallucinationCooldown -= dt;
      }

      // Xử lý sự kiện bước chân giả sau lưng: kích hoạt mỗi khi người chơi vừa dừng bước
      if (this.pendingFalseFootsteps) {
        const justStopped = this.wasPlayerMoving && !isPlayerMoving;
        if (justStopped) {
          this.falseFootstepDelayTimer = 0.25; // Trễ nhẹ 250ms sau khi đứng yên
        }

        if (this.falseFootstepDelayTimer > 0) {
          this.falseFootstepDelayTimer -= dt;
          if (this.falseFootstepDelayTimer <= 0) {
            AudioManager.getInstance().playFalseFootsteps();
            this.pendingFalseFootsteps = false;
            this.hallucinationCooldown = 12.0;
            this.playerState.emit('hallucination_false_footsteps');
          }
        }
      }

      this.nextHallucinationTimer -= dt;
      if (this.nextHallucinationTimer <= 0 && this.hallucinationCooldown <= 0) {
        // Bộ đếm ngẫu nhiên: mỗi 14–22 giây kích hoạt 1 hiện tượng
        this.nextHallucinationTimer = 14 + Math.random() * 8;
        this.hallucinationCooldown = 10.0; // Cooldown chống dồn dập

        const roll = Math.floor(Math.random() * 3);
        if (roll === 0) {
          // Hiện tượng 1: Tiếng bước chân giả vang lên ngay phía sau lưng nhân vật khi vừa dừng bước
          this.pendingFalseFootsteps = true;
          if (!isPlayerMoving) {
            this.falseFootstepDelayTimer = 0.35;
          }
        } else if (roll === 1) {
          // Hiện tượng 2: Phát tiếng chuông đồng méo mó hoặc tiếng thì thầm trầm đục vọng lại từ hướng rừng sâu
          const subRoll = Math.random();
          if (subRoll < 0.5) {
            AudioManager.getInstance().playCrackedBellToll();
          } else {
            AudioManager.getInstance().playSampled('ghost_whisper', 0.65, 0.85, true, 2);
          }
          this.playerState.emit('hallucination_audio', { type: subRoll < 0.5 ? 'cracked_bell' : 'deep_whisper' });
        } else {
          // Hiện tượng 3: Sinh các vệt bóng đen lướt nhanh qua rìa màn sương (peripheral shadow flicker) trong 0.6 giây
          this.playerState.emit('hallucination_shadow_flicker', { playerX, playerY });
        }
      }
    } else {
      // Khi Tinh Thần >= 55 hoặc đứng an toàn trong Làng Bellhollow: Reset bộ đếm và hủy bước chân giả
      this.pendingFalseFootsteps = false;
      this.falseFootstepDelayTimer = 0;
      this.nextHallucinationTimer = 16.0;
    }

    this.wasPlayerMoving = Boolean(isPlayerMoving);
  }

  public getNextHallucinationTimer(): number {
    return this.nextHallucinationTimer;
  }

  public getHallucinationCooldown(): number {
    return this.hallucinationCooldown;
  }

  public getPendingFalseFootsteps(): boolean {
    return this.pendingFalseFootsteps;
  }

  public triggerHallucinationTest(type: number, playerX: number, playerY: number, isPlayerMoving: boolean): void {
    if (type === 0) {
      this.pendingFalseFootsteps = true;
      if (!isPlayerMoving) {
        this.falseFootstepDelayTimer = 0.05;
      }
    } else if (type === 1) {
      AudioManager.getInstance().playCrackedBellToll();
      this.playerState.emit('hallucination_audio', { type: 'cracked_bell' });
    } else {
      this.playerState.emit('hallucination_shadow_flicker', { playerX, playerY });
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
  public isNearWarmth(playerX: number, playerY: number, zoneId?: string): boolean {
    return this.warmSources.some(s => Math.hypot(playerX - s.x, playerY - s.y) <= s.radius) ||
      Math.hypot(playerX - this.campfireX, playerY - this.campfireY) <= this.campfireWarmthRadius ||
      CampSanctuarySystem.getInstance().isPlayerInSanctuary(playerX, playerY, zoneId);
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

  // V15-58C: Kiểm tra trạng thái bất an / hoảng loạn của Tinh Thần
  public isSanityPanic(): boolean {
    return (this.playerState.stats.composure ?? 100) < 45;
  }

  public isSanityCritical(): boolean {
    return (this.playerState.stats.composure ?? 100) < 15;
  }
}

