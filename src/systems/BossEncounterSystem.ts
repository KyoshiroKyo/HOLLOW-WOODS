import * as Phaser from 'phaser';
import { BossMireWarden } from '../entities/BossMireWarden';
import { PlayerState } from '../state/PlayerState';

export interface FirePillarState {
  id: string;
  x: number;
  y: number;
  isLit: boolean;
  isExtinguished: boolean;
  graphics?: Phaser.GameObjects.Graphics;
}

export type BossPhase = 'PHASE_1_SOUND_HUNTING' | 'PHASE_2_NIGHT_MIST' | 'DEFEATED';

/**
 * HOLLOW WOODS V1.4 — HỆ THỐNG TRẬN CHIẾN ĐẤU TRÙM GIẢI ĐỐ (TACTICAL PUZZLE BOSS ENCOUNTER SYSTEM)
 * File: src/systems/BossEncounterSystem.ts
 *
 * Điều phối trận chiến chống lại Kẻ Nuốt Tiếng Chuông (The Mire Warden):
 * 1. Đấu trường: Sân Đá Cổ hình tròn có 3 Trụ Lửa Cổ Ngữ (Runed Fire Pillars) ở 3 góc.
 * 2. Pha 1 (100% ➔ 50%): Săn Mồi Bằng Tiếng Động
 *    - Boss mù, lao thẳng về nguồn phát âm thanh [Q] hoặc bước chạy.
 *    - Dẫn dụ Boss húc vào Trụ Lửa -> Trụ bùng cháy, Boss Stun 3.5s, nứt giáp sương mù.
 *    - Tấn công điểm yếu bằng Giáo Gỗ hoặc Gậy Gỗ để tăng nấc phong ấn.
 * 3. Pha 2 (< 50%): Cơn Ác Mộng Sương Đêm
 *    - Boss gầm dập tắt 2 trụ lửa, gọi sương mù đặc quánh và 2 ảo ảnh Echo.
 *    - Thắp sáng lại trụ bằng Đèn Lồng [F] hoặc Đuốc Nhựa Thông, né đòn quét và thanh tẩy kết thúc.
 * 4. Phần thưởng: Di vật Trái Tim Mạch Rễ Cổ, danh hiệu Người Thanh Tẩy Màn Sương và cổ thư ký ức.
 */
export class BossEncounterSystem {
  private static instance: BossEncounterSystem;
  private scene?: Phaser.Scene;
  private boss?: BossMireWarden;

  public currentPhase: BossPhase = 'PHASE_1_SOUND_HUNTING';
  public sealProgress: number = 0;
  public readonly maxSealProgress: number = 3;

  // 3 Trụ Lửa Cổ Ngữ (Runed Fire Pillars) ở 3 góc đấu trường
  public pillars: FirePillarState[] = [
    { id: 'pillar_nw', x: 4350, y: 180, isLit: true, isExtinguished: false },
    { id: 'pillar_ne', x: 4650, y: 180, isLit: false, isExtinguished: false },
    { id: 'pillar_s', x: 4500, y: 390, isLit: false, isExtinguished: false }
  ];

  public isEncounterActive: boolean = false;

  public static getInstance(): BossEncounterSystem {
    if (!BossEncounterSystem.instance) {
      BossEncounterSystem.instance = new BossEncounterSystem();
    }
    return BossEncounterSystem.instance;
  }

  public getScene(): Phaser.Scene | undefined {
    return this.scene;
  }

  public getBoss(): BossMireWarden | undefined {
    return this.boss;
  }

  /**
   * Khởi tạo đấu trường Sân Đá Cổ và nạp tham chiếu Scene / Boss
   */
  public initArena(scene: Phaser.Scene, boss: BossMireWarden): void {
    this.scene = scene;
    this.boss = boss;
    this.currentPhase = 'PHASE_1_SOUND_HUNTING';
    this.sealProgress = 0;
    this.isEncounterActive = true;

    this.pillars = [
      { id: 'pillar_nw', x: 4350, y: 180, isLit: true, isExtinguished: false },
      { id: 'pillar_ne', x: 4650, y: 180, isLit: false, isExtinguished: false },
      { id: 'pillar_s', x: 4500, y: 390, isLit: false, isExtinguished: false }
    ];
  }

  /**
   * Tiếp nhận âm thanh từ Mồi Tiếng Động [Q] hoặc bước chạy của người chơi
   * Boss lao cực nhanh theo đường thẳng hướng về tiếng động
   */
  public onNoiseEmitted(noiseX: number, noiseY: number, isLureBomb: boolean = false): void {
    if (!this.isEncounterActive || !this.boss) return;
    this.boss.hearSound(noiseX, noiseY, isLureBomb);
  }

  /**
   * Kiểm tra va chạm giữa cú lao húc của Boss với 3 Trụ Lửa Cổ Ngữ
   * Trả về true nếu Boss húc trúng trụ đang cháy -> kích hoạt Stun 3.5s và nứt giáp
   */
  public checkPillarCollision(bossX: number, bossY: number): FirePillarState | null {
    if (!this.isEncounterActive || !this.boss) return null;
    if (this.boss.currentState !== 'CHARGING') return null;

    for (const pillar of this.pillars) {
      if (pillar.isLit && !pillar.isExtinguished) {
        const dist = Math.hypot(bossX - pillar.x, bossY - pillar.y);
        if (dist <= 65) {
          pillar.isLit = false;
          pillar.isExtinguished = true;
          this.boss.crackMistArmor();
          return pillar;
        }
      }
    }
    return null;
  }

  /**
   * Đòn tấn công điểm yếu khi Boss đang bị choáng (Stun 3.5s)
   * Tăng nấc phong ấn và chuyển sang Pha 2 khi đạt 50% (nấc 2)
   */
  public strikeWeakPoint(): { newProgress: number; phaseChanged: boolean } {
    if (!this.boss || !this.boss.isStaggered) {
      return { newProgress: this.sealProgress, phaseChanged: false };
    }

    this.sealProgress = Math.min(this.maxSealProgress, this.sealProgress + 1);
    this.boss.applySeal();

    let phaseChanged = false;
    if (this.sealProgress === 1) {
      // Mở khóa trụ lửa thứ 2 (Đông Bắc)
      const pNe = this.pillars.find(p => p.id === 'pillar_ne');
      if (pNe) {
        pNe.isLit = true;
      }
    } else if (this.sealProgress === 2) {
      // Đạt 50% phong ấn -> Chuyển sang Pha 2: Cơn Ác Mộng Sương Đêm
      this.currentPhase = 'PHASE_2_NIGHT_MIST';
      phaseChanged = true;
      this.triggerPhase2NightMist();
    } else if (this.sealProgress >= 3) {
      // Đạt 100% phong ấn -> Kết thúc trận đấu
      this.currentPhase = 'DEFEATED';
      this.completeEncounter();
    }

    return { newProgress: this.sealProgress, phaseChanged };
  }

  /**
   * Kích hoạt Pha 2: Cơn Ác Mộng Sương Đêm
   * Boss dập tắt 2 trụ lửa và sương mù dày đặc bao phủ sân đấu
   */
  public triggerPhase2NightMist(): void {
    if (!this.boss) return;
    this.boss.enterPhase2();

    // Dập tắt các trụ lửa để người chơi phải thắp sáng lại bằng Đèn Lồng hoặc Đuốc
    for (const pillar of this.pillars) {
      pillar.isLit = false;
      pillar.isExtinguished = true;
    }
  }

  /**
   * Thắp sáng lại Trụ Lửa Cổ Ngữ bằng Đèn Lồng [F] hoặc Đuốc Nhựa Thông
   */
  public relightPillar(pillarId: string, isLanternLit: boolean): boolean {
    if (!isLanternLit) return false;
    const pillar = this.pillars.find(p => p.id === pillarId);
    if (!pillar || pillar.isLit) return false;

    pillar.isLit = true;
    pillar.isExtinguished = false;
    return true;
  }

  /**
   * Kiểm tra xem cả 3 Trụ Lửa Cổ Ngữ đã được thắp sáng lại chưa
   */
  public areAllPillarsLit(): boolean {
    return this.pillars.every(p => p.isLit);
  }

  /**
   * Kết thúc nghi thức phong ấn: Trao di vật, mở khóa danh hiệu và mảnh ký ức cốt truyện
   */
  public completeEncounter(): void {
    this.isEncounterActive = false;
    if (this.boss) {
      this.boss.defeat();
    }

    const state = PlayerState.getInstance();
    if (!state.hasFlag('boss_mire_warden_defeated') && state.getItemCount('relic_heart_of_roots') === 0) {
      state.addItem('relic_heart_of_roots', 1);
    }
    state.setFlag('boss_mire_warden_defeated');
    state.setFlag('root_seal_restored');
    state.setFlag('title_purifier_of_mist');
    state.unlockLore('lore_mire_warden_memory');
  }

  /**
   * Dọn dẹp hệ thống khi rời khỏi phân khu
   */
  public reset(): void {
    this.isEncounterActive = false;
    this.currentPhase = 'PHASE_1_SOUND_HUNTING';
    this.sealProgress = 0;
    this.pillars = [];
    this.boss = undefined;
    this.scene = undefined;
  }
}
