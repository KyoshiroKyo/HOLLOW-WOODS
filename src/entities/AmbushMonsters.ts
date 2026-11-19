/**
 * HOLLOW WOODS V1.4 — BƯỚC 13 QA AUDIT
 * THỰC THỂ PHỤC KÍCH N3XUS & TRINH SÁT GOBLIN SCOUT (AMBUSH & SCOUT ENTITIES)
 * 
 * 1. MistBatAmbushEntity: Dơi sương mù phục kích chớp nhoáng (Hoàng hôn/Đêm sương, -8 HP, -15 Composure, bay thoát)
 * 2. WanderingShadeEntity: Hồn ma phiêu bạt (Đêm sương, hạ Bình Tâm & sốc nhiệt, tan biến trước Đèn lồng/Lửa trại)
 * 3. GoblinScoutEntity: Kẻ rình mập vô diện (Dao găm bóng tối, báo động quái cấp cao, tàng hình rút lui)
 */

import * as Phaser from 'phaser';
import {
  SPRITE_MIST_BAT,
  SPRITE_WANDERING_SHADE,
  SPRITE_GOBLIN_SCOUT
} from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';
import { SettingsManager } from '../systems/SettingsManager';

export interface AmbushContext {
  playerX: number;
  playerY: number;
  isLanternLit: boolean;
  isPlayerInSafeZone: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
  isSprinting?: boolean;
  listenerMonster?: { hearSound: (x: number, y: number, vol: number, srcX?: number, srcY?: number) => void };
}

// =========================================================================
// 1. DƠI SƯƠNG MÙ PHỤC KÍCH (MIST BAT AMBUSH)
// =========================================================================
export class MistBatAmbushEntity extends Phaser.Physics.Arcade.Sprite {
  public isFinished: boolean = false;
  public batPhase: 'telegraph' | 'swoop' | 'retreat' = 'telegraph';
  private hasHit: boolean = false;
  private timer: number = 0;

  constructor(scene: Phaser.Scene, startX: number, startY: number, _targetX: number, _targetY: number) {
    super(scene, startX, startY, SPRITE_MIST_BAT);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(startY));
    this.setScale(1.0);
    this.setTint(0xff5555); // Ánh mắt đỏ le lói trong tán cây lúc báo hiệu

    this.initAnims();
    this.play('mist_bat_fly_down', true);

    // Phát âm thanh jumpscare dơi kèm audio ducking
    AudioManager.getInstance().triggerJumpscare('bat', 0.90);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('mist_bat_fly_down')) {
      anims.create({
        key: 'mist_bat_fly_down',
        frames: anims.generateFrameNumbers(SPRITE_MIST_BAT, { start: 24, end: 29 }),
        frameRate: 12,
        repeat: -1
      });
    }
    if (!anims.exists('mist_bat_retreat_up')) {
      anims.create({
        key: 'mist_bat_retreat_up',
        frames: anims.generateFrameNumbers(SPRITE_MIST_BAT, { start: 42, end: 47 }),
        frameRate: 14,
        repeat: -1
      });
    }
  }

  public takeDamage(_amount: number = 1): void {
    if (this.isFinished || this.batPhase === 'retreat') return;
    this.batPhase = 'retreat';
    this.setTint(0xff8888);
    this.play('mist_bat_retreat_up', true);
    this.setVelocity(Phaser.Math.Between(-40, 40), -240);
    AudioManager.getInstance().playSampled('sfx_bat_screech', 0.85);
  }

  public updateAI(delta: number, ctx: AmbushContext): void {
    if (this.isFinished) return;
    this.timer += delta;

    // C4-14-B03: Dynamic Depth Sorting (bay vút lên sương mù khi rút lui)
    const targetDepth = this.batPhase === 'retreat' ? Math.floor(this.y) + 80 : Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    if (this.batPhase === 'telegraph') {
      // 0.8 giây báo hiệu: lơ lửng trong tán cây với mắt đỏ
      this.setVelocity(0, 0);
      if (this.timer >= 800) {
        this.batPhase = 'swoop';
        this.setTint(0xbbddff);
      }
    } else if (this.batPhase === 'swoop') {
      // Lao thẳng vào người chơi
      const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      const speed = 250;
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      const dist = Math.hypot(this.x - ctx.playerX, this.y - ctx.playerY);
      if (dist < 26 && !this.hasHit) {
        this.hasHit = true;
        // Trừ máu & Bình Tâm
        const playerState = PlayerState.getInstance();
        playerState.stats.health = Math.max(0, playerState.stats.health - 8);
        playerState.modifyComposure(-15);
        playerState.emit('stats_changed', playerState.stats);
        if (SettingsManager.getInstance().isScreenShakeEnabled()) {
          this.scene.cameras.main.shake(250, 0.008);
        }

        // Hiệu ứng chao đảo ánh sáng đèn lồng (Flicker 2.5s)
        this.scene.events.emit('lantern_flicker', { duration: 2500 });

        // Chuyển sang trạng thái rút lui bay vút lên sương mù
        this.batPhase = 'retreat';
        this.play('mist_bat_retreat_up', true);
        this.setVelocity(0, -220);
      } else if (this.timer > 2300) {
        // Hết thời gian swoop mà không trúng -> rút lui
        this.batPhase = 'retreat';
        this.play('mist_bat_retreat_up', true);
        this.setVelocity(0, -220);
      }
    } else if (this.batPhase === 'retreat') {
      this.setVelocity(0, -220);
      this.alpha -= (delta / 1000) * 1.5;
      if (this.alpha <= 0.05) {
        this.isFinished = true;
        this.destroy();
      }
    }
  }
}

// =========================================================================
// 2. HỒN MA PHIÊU BẠT (WANDERING SHADE)
// =========================================================================
export class WanderingShadeEntity extends Phaser.Physics.Arcade.Sprite {
  public isFinished: boolean = false;
  private hasHit: boolean = false;
  private lifeTimer: number = 0;
  private isDissolving: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_WANDERING_SHADE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));
    this.setScale(1.0);
    this.setAlpha(0.85);
    this.setTint(0xcceeff);

    this.initAnims();
    this.play('shade_drift', true);

    // Kích hoạt âm thanh jumpscare hồn ma
    AudioManager.getInstance().triggerJumpscare('ghost', 0.90);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('shade_drift')) {
      anims.create({
        key: 'shade_drift',
        frames: anims.generateFrameNumbers(SPRITE_WANDERING_SHADE, { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
  }

  public updateAI(delta: number, ctx: AmbushContext): void {
    if (this.isFinished) return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }
    this.lifeTimer += delta;

    if (this.isDissolving) {
      this.alpha -= (delta / 1000) * 1.2;
      this.setVelocity(0, -30);
      if (this.alpha <= 0.05) {
        this.isFinished = true;
        this.destroy();
      }
      return;
    }

    // Khắc chế: Bật đèn lồng hoặc chạy vào khu vực an toàn -> Hồn ma tan biến
    const distToPlayer = Math.hypot(this.x - ctx.playerX, this.y - ctx.playerY);
    if ((ctx.isLanternLit && distToPlayer < 120) || ctx.isPlayerInSafeZone || this.lifeTimer > 9000) {
      this.dissolve();
      return;
    }

    // Lướt từ từ về phía người chơi xuyên mọi vật cản
    const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
    const speed = 40;
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    if (distToPlayer < 24 && !this.hasHit) {
      this.hasHit = true;
      const playerState = PlayerState.getInstance();
      // Không trừ máu trực tiếp, trừ Bình Tâm nặng & sốc nhiệt
      playerState.modifyComposure(-25);
      const currentTemp = playerState.stats.temperature ?? 80;
      if (currentTemp > 40) {
        playerState.stats.temperature = Math.max(20, currentTemp - 15);
      }
      playerState.emit('stats_changed', playerState.stats);
      AudioManager.getInstance().playSampled('sanity_gasp', 0.85);
      this.scene.cameras.main.flash(400, 60, 20, 80);
      this.dissolve();
    }
  }

  public dissolve(): void {
    if (this.isDissolving) return;
    this.isDissolving = true;
    AudioManager.getInstance().playSampled('ghost_dissipate', 0.80);
  }

  public takeDamage(_amount: number = 1): void {
    this.dissolve();
  }
}

// =========================================================================
// 3. KẺ RÌNH MẬP VÔ DIỆN (GOBLIN SCOUT / VOID DAGGER)
// =========================================================================
export class GoblinScoutEntity extends Phaser.Physics.Arcade.Sprite {
  public isFinished: boolean = false;
  private telegraphTimer: number = 0;
  private isRetreating: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_GOBLIN_SCOUT);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));
    this.setScale(1.0);
    this.setTint(0x775599);

    this.initAnims();
    this.play('scout_dagger_idle', true);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('scout_dagger_idle')) {
      anims.create({
        key: 'scout_dagger_idle',
        frames: anims.generateFrameNumbers(SPRITE_GOBLIN_SCOUT, { start: 37, end: 44 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('scout_dagger_slash')) {
      anims.create({
        key: 'scout_dagger_slash',
        frames: anims.generateFrameNumbers(SPRITE_GOBLIN_SCOUT, { start: 69, end: 76 }),
        frameRate: 12,
        repeat: 0
      });
    }
  }

  private createSmokePuff(): void {
    const smoke = this.scene.add.graphics();
    smoke.setDepth(this.depth + 1);
    smoke.fillStyle(0x221133, 0.75);
    smoke.fillCircle(this.x, this.y, 16);
    smoke.fillStyle(0x442255, 0.55);
    smoke.fillCircle(this.x + 4, this.y - 6, 12);
    this.scene.tweens.add({
      targets: smoke,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 450,
      onComplete: () => smoke.destroy()
    });
  }

  public retreat(escapeAngle?: number): void {
    if (this.isRetreating) return;
    this.isRetreating = true;
    this.createSmokePuff();
    const angle = escapeAngle !== undefined ? escapeAngle : Math.random() * Math.PI * 2;
    this.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
    AudioManager.getInstance().playMonsterTelegraph('dagger_slash', this.x, this.y, this.x, this.y);
  }

  public takeDamage(_amount: number = 1): void {
    if (this.isFinished || this.isRetreating) return;
    this.retreat();
  }

  public updateAI(delta: number, ctx: AmbushContext): void {
    if (this.isFinished) return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    const dist = Math.hypot(this.x - ctx.playerX, this.y - ctx.playerY);

    if (this.isRetreating) {
      this.alpha -= (delta / 1000) * 1.5;
      if (this.alpha <= 0.05) {
        this.isFinished = true;
        this.destroy();
      }
      return;
    }

    // V15-58B: Nghịch lý ánh sáng [F] - Khi bật đèn lồng, khoảng cách bị rọi sáng phát hiện tăng +30% (150 -> 195px)
    const lanternDetectRange = ctx.isLanternLit ? Math.round(150 * 1.3) : 70;
    if (dist < 70 || (ctx.isLanternLit && dist < lanternDetectRange)) {
      const escapeAngle = Phaser.Math.Angle.Between(ctx.playerX, ctx.playerY, this.x, this.y);
      this.retreat(escapeAngle);
      return;
    }

    // Giữ khoảng cách theo dõi an toàn (~130 - 180 px)
    const targetDist = 150;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
    if (dist > targetDist + 20) {
      this.setVelocity(Math.cos(angle) * 70, Math.sin(angle) * 70);
    } else if (dist < targetDist - 20) {
      this.setVelocity(-Math.cos(angle) * 70, -Math.sin(angle) * 70);
    } else {
      this.setVelocity(0, 0);
    }

    // Định kỳ huýt sáo cảnh báo tín hiệu quái vật (kích động Sói Xương & The Listener)
    this.telegraphTimer += delta;
    if (this.telegraphTimer > 6000) {
      this.telegraphTimer = 0;
      AudioManager.getInstance().playMonsterTelegraph('scout_whistle', this.x, this.y, ctx.playerX, ctx.playerY);
      if (ctx.listenerMonster) {
        ctx.listenerMonster.hearSound(this.x, this.y, 0.95, this.x, this.y);
      }
      this.scene.events.emit('scout_whistle', { x: this.x, y: this.y, playerX: ctx.playerX, playerY: ctx.playerY });
    }
  }
}
