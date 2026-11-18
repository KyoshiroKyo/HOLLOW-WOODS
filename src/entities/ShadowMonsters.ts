/**
 * HOLLOW WOODS V1.4 — BƯỚC V14-P8-09
 * THỰC THỂ QUÁI VẬT BÓNG TỐI (SHADOW MONSTERS ENTITIES)
 * 
 * 1. ShadowCrowEntity: Quạ Bóng Tối quấy rối & báo động The Listener
 * 2. ShadowEyesEntity: Bóng Mắt Sương Mù rút cạn Bình Tâm & tan biến trước ánh sáng
 * 3. ShadowBehemothBoss: Trùm Bóng Tối Khổng Lồ trấn giữ vùng cấm
 */

import * as Phaser from 'phaser';
import {
  SPRITE_SHADOW_CROW,
  SPRITE_SHADOW_EYES,
  SPRITE_SHADOW_BIG_BOSS
} from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';

export interface ShadowContext {
  playerX: number;
  playerY: number;
  isLanternLit: boolean;
  lightRadius: number;
  isPlayerInSafeZone: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
  listenerMonster?: { hearSound: (x: number, y: number, vol: number, srcX?: number, srcY?: number) => void };
}

// =========================================================================
// 1. QUẠ BÓNG TỐI (SHADOW CROW)
// =========================================================================
export type ShadowCrowState = 'perch' | 'caw_alarm' | 'dive_attack' | 'hurt' | 'dissolve';

export class ShadowCrowEntity extends Phaser.Physics.Arcade.Sprite {
  public crowState: ShadowCrowState = 'perch';
  public hp: number = 1;
  public isDefeated: boolean = false;

  private perchX: number;
  private perchY: number;
  private stateTimer: number = 0;
  private alarmCooldown: number = 0;
  private darkLingerTimer: number = 0;

  // V1.5 - BƯỚC V15-08: Mắt quạ đỏ rực phát sáng trong bóng đêm
  private eyeGfx: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_SHADOW_CROW);
    this.perchX = x;
    this.perchY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));
    this.setScale(1.0);

    // Mắt đỏ phát sáng ban đêm
    this.eyeGfx = scene.add.graphics();
    this.eyeGfx.fillStyle(0xff2222, 0.95);
    this.eyeGfx.fillCircle(0, 0, 1.8);
    this.eyeGfx.fillStyle(0xff6666, 0.4);
    this.eyeGfx.fillCircle(0, 0, 3.5);
    this.eyeGfx.setVisible(false);

    this.initAnims();
    this.play('shadow_crow_idle', true);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('shadow_crow_idle')) {
      anims.create({
        key: 'shadow_crow_idle',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!anims.exists('shadow_crow_walk')) {
      anims.create({
        key: 'shadow_crow_walk',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 6, end: 9 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('shadow_crow_jump')) {
      anims.create({
        key: 'shadow_crow_jump',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 12, end: 17 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!anims.exists('shadow_crow_attack')) {
      anims.create({
        key: 'shadow_crow_attack',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 18, end: 22 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (!anims.exists('shadow_crow_damage')) {
      anims.create({
        key: 'shadow_crow_damage',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 24, end: 26 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!anims.exists('shadow_crow_death')) {
      anims.create({
        key: 'shadow_crow_death',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_CROW, { start: 30, end: 35 }),
        frameRate: 10,
        repeat: 0
      });
    }
  }

  public updateAI(_time: number, delta: number, ctx: ShadowContext): void {
    if (this.isDefeated || this.crowState === 'dissolve') return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    if (this.alarmCooldown > 0) this.alarmCooldown -= delta;
    if (this.stateTimer > 0) this.stateTimer -= delta;

    if (ctx.isPlayerInSafeZone) {
      this.crowState = 'perch';
      this.setVelocity(0, 0);
      this.setPosition(this.perchX, this.perchY);
      this.play('shadow_crow_idle', true);
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);
    const isNight = ctx.timePhase === 'NIGHT';

    // V1.5 - BƯỚC V15-08: Cập nhật vị trí mắt quạ đỏ rực vào ban đêm
    if (this.eyeGfx) {
      if (isNight && this.visible) {
        const eyeOffsetX = this.flipX ? 4 : -4;
        this.eyeGfx.setPosition(this.x + eyeOffsetX, this.y - 14);
        this.eyeGfx.setDepth(targetDepth + 1);
        this.eyeGfx.setVisible(true);
      } else {
        this.eyeGfx.setVisible(false);
      }
    }

    // Ghi nhận vào Sổ tay khi tiếp cận tầm nhìn (240px)
    if (distToPlayer <= 240) {
      PlayerState.getInstance().observeCreature('shadow_crow');
    }

    // V1.5 - BƯỚC V15-08: Ban đêm tầm phát hiện người chơi tăng 35% (200px -> 270px; dive: 190px -> 256px)
    const alertDetectRadius = isNight ? Math.round(200 * 1.35) : 200;
    const diveDetectRadius = isNight ? Math.round(190 * 1.35) : 190;

    // 1. Kiểm tra báo động The Listener khi người chơi chạy ồn gần quạ
    if (distToPlayer <= alertDetectRadius && this.alarmCooldown <= 0 && this.crowState === 'perch') {
      this.alarmCooldown = 8000;
      this.crowState = 'caw_alarm';
      this.stateTimer = 1200;

      AudioManager.getInstance().playShadowCrowCaw();
      this.play('shadow_crow_jump', true);

      // V1.5 - BƯỚC V15-08: Đánh động The Listener và Sói Xương: Ban đêm truyền sóng âm xa gấp rưỡi (2.2 * 1.5 = 3.3)
      const alarmVol = isNight ? 2.2 * 1.5 : 2.2;
      if (ctx.listenerMonster && typeof ctx.listenerMonster.hearSound === 'function') {
        ctx.listenerMonster.hearSound(this.x, this.y, alarmVol, ctx.playerX, ctx.playerY);
      }
      this.scene.events.emit('shadow_crow_alarm', { x: this.x, y: this.y, isNight, soundRadius: isNight ? 360 : 240 });
    }

    // 2. Tấn công mổ quấy rối (Dive Attack) nếu người chơi ở trong bóng tối quá 2.5 giây
    if (distToPlayer <= diveDetectRadius && !ctx.isLanternLit) {
      this.darkLingerTimer += delta;
      if (this.darkLingerTimer >= 2500 && this.crowState === 'perch') {
        this.darkLingerTimer = 0;
        this.crowState = 'dive_attack';
        this.stateTimer = 900;

        AudioManager.getInstance().playShadowCrowAttack();
        this.play('shadow_crow_attack', true);

        // Lao thẳng tới người chơi
        const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
        this.setFlipX(ctx.playerX < this.x);
        this.setVelocity(Math.cos(angle) * 170, Math.sin(angle) * 170);
      }
    } else {
      this.darkLingerTimer = Math.max(0, this.darkLingerTimer - delta * 0.5);
    }

    // Xử lý hoàn tất trạng thái
    if (this.stateTimer <= 0) {
      if (this.crowState === 'dive_attack' || this.crowState === 'caw_alarm' || this.crowState === 'hurt') {
        this.crowState = 'perch';
        this.setVelocity(0, 0);
        this.scene.tweens.add({
          targets: this,
          x: this.perchX,
          y: this.perchY,
          duration: 500,
          onComplete: () => {
            if (this.active && !this.isDefeated) {
              this.play('shadow_crow_idle', true);
            }
          }
        });
      }
    }
  }

  public takeDamage(amount: number = 1): void {
    if (this.isDefeated || this.crowState === 'dissolve') return;
    this.hp -= amount;

    if (this.hp <= 0) {
      this.isDefeated = true;
      this.crowState = 'dissolve';
      this.setVelocity(0, 0);
      this.play('shadow_crow_death', true);
      PlayerState.getInstance().observeCreature('shadow_crow');
      PlayerState.getInstance().addItem('res_dry_wood', 1);

      this.scene.events.emit('shadow_crow_defeated', { x: this.x, y: this.y });
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 350,
          onComplete: () => this.destroy()
        });
      });
    } else {
      this.crowState = 'hurt';
      this.stateTimer = 400;
      this.play('shadow_crow_damage', true);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.eyeGfx) {
      this.eyeGfx.destroy();
      this.eyeGfx = null;
    }
    super.destroy(fromScene);
  }
}

// =========================================================================
// 2. BÓNG MẮT SƯƠNG MÙ (SHADOW EYES / MIST STALKER)
// =========================================================================
export class ShadowEyesEntity extends Phaser.Physics.Arcade.Sprite {
  public isDissolving: boolean = false;
  private gazeDrainTimer: number = 0;
  private floatOriginY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_SHADOW_EYES);
    this.floatOriginY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));
    this.setScale(1.0);
    this.initAnims();
    this.play('shadow_eyes_idle', true);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('shadow_eyes_idle')) {
      anims.create({
        key: 'shadow_eyes_idle',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_EYES, { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('shadow_eyes_look')) {
      anims.create({
        key: 'shadow_eyes_look',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_EYES, { start: 8, end: 15 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('shadow_eyes_dissolve')) {
      anims.create({
        key: 'shadow_eyes_dissolve',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_EYES, { start: 16, end: 23 }),
        frameRate: 12,
        repeat: 0
      });
    }
  }

  public updateAI(time: number, delta: number, ctx: ShadowContext): void {
    if (this.isDissolving) return;

    // Hiệu ứng nhấp nhô lơ lửng trong sương
    this.y = this.floatOriginY + Math.sin(time * 0.003) * 6;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    if (distToPlayer <= 220) {
      PlayerState.getInstance().observeCreature('shadow_eyes');
    }

    // 1. Phản ứng ánh sáng: Ánh đèn lồng [F] rọi tới -> lập tức tan biến
    if (ctx.isLanternLit && distToPlayer <= ctx.lightRadius + 24) {
      this.dissolveByLight();
      return;
    }

    // 2. Khi ở trong bóng tối và người chơi ở gần: nhìn chằm chằm và rút cạn Bình Tâm
    const isNight = ctx.timePhase === 'NIGHT';
    const gazeDistance = isNight ? 190 : 170;
    if (!ctx.isLanternLit && distToPlayer <= gazeDistance && !ctx.isPlayerInSafeZone) {
      this.gazeDrainTimer += delta;
      // V1.5 - BƯỚC V15-08: Tốc độ rút Bình Tâm tăng thêm 40% vào ban đêm (8 * 1.40 = 11.2)
      if (this.gazeDrainTimer >= 1000) {
        this.gazeDrainTimer = 0;
        AudioManager.getInstance().playShadowEyesGaze();

        // Rút 8 điểm (ban ngày/hoàng hôn) hoặc 11.2 điểm (ban đêm [+40%])
        const drainAmount = isNight ? 11.2 : 8;
        const state = PlayerState.getInstance();
        state.stats.composure = Math.max(5, state.stats.composure - drainAmount);

        this.scene.events.emit('shadow_eyes_drain', { x: this.x, y: this.y, drain: drainAmount, isNight });
      }
    } else {
      this.gazeDrainTimer = 0;
    }
  }

  public dissolveByLight(): void {
    if (this.isDissolving) return;
    this.isDissolving = true;

    AudioManager.getInstance().playShadowEyesDissolve();
    this.play('shadow_eyes_dissolve', true);
    PlayerState.getInstance().observeCreature('shadow_eyes');

    this.scene.events.emit('shadow_eyes_vanished', { x: this.x, y: this.y });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 300,
        onComplete: () => this.destroy()
      });
    });
  }
}

// =========================================================================
// 3. TRÙM BÓNG TỐI KHỔNG LỒ (ABYSSAL SHADE BEHEMOTH)
// =========================================================================
export type BehemothState = 'idle' | 'walk' | 'combo_slam' | 'vulnerable_miss' | 'hurt' | 'death';

export class ShadowBehemothBoss extends Phaser.Physics.Arcade.Sprite {
  public bossState: BehemothState = 'idle';
  public maxHp: number = 8;
  public currentHp: number = 8;
  public isDefeated: boolean = false;
  public isVulnerable: boolean = false;

  private stateTimer: number = 0;
  private attackCooldown: number = 3000;
  private stepTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_SHADOW_BIG_BOSS);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0)
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));
    this.setScale(1.0);
    this.initAnims();
    this.play('behemoth_idle', true);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('behemoth_idle')) {
      anims.create({
        key: 'behemoth_idle',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 0, end: 15 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('behemoth_walk')) {
      anims.create({
        key: 'behemoth_walk',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 16, end: 31 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('behemoth_combo_prep')) {
      anims.create({
        key: 'behemoth_combo_prep',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 32, end: 47 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!anims.exists('behemoth_combo_slam')) {
      anims.create({
        key: 'behemoth_combo_slam',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 48, end: 63 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (!anims.exists('behemoth_combo_fissure')) {
      anims.create({
        key: 'behemoth_combo_fissure',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 64, end: 79 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (!anims.exists('behemoth_miss')) {
      anims.create({
        key: 'behemoth_miss',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 80, end: 95 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('behemoth_hit')) {
      anims.create({
        key: 'behemoth_hit',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 96, end: 111 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (!anims.exists('behemoth_death')) {
      anims.create({
        key: 'behemoth_death',
        frames: anims.generateFrameNumbers(SPRITE_SHADOW_BIG_BOSS, { start: 112, end: 127 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  public updateAI(_time: number, delta: number, ctx: ShadowContext): void {
    if (this.isDefeated || this.bossState === 'death') return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.stateTimer > 0) this.stateTimer -= delta;

    if (ctx.isPlayerInSafeZone) {
      this.bossState = 'idle';
      this.setVelocity(0, 0);
      this.play('behemoth_idle', true);
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    if (distToPlayer <= 320) {
      PlayerState.getInstance().observeCreature('shadow_behemoth');
    }

    // Xử lý theo trạng thái
    if (this.bossState === 'vulnerable_miss') {
      this.setVelocity(0, 0);
      this.setTint(0xbbddff); // Ánh sáng hé lộ điểm yếu
      if (this.stateTimer <= 0) {
        this.clearTint();
        this.isVulnerable = false;
        this.bossState = 'idle';
        this.attackCooldown = 2800;
        this.play('behemoth_idle', true);
      }
      return;
    }

    if (this.bossState === 'combo_slam') {
      if (this.stateTimer <= 0) {
        // Đòn đánh hụt -> chuyển sang trạng thái khựng lộ sơ hở (Vulnerable Miss 2.5s)
        this.bossState = 'vulnerable_miss';
        this.isVulnerable = true;
        this.stateTimer = 2500;
        this.setVelocity(0, 0);
        AudioManager.getInstance().playBehemothMiss();
        this.play('behemoth_miss', true);
      }
      return;
    }

    if (this.bossState === 'hurt') {
      if (this.stateTimer <= 0) {
        this.bossState = 'idle';
        this.play('behemoth_idle', true);
      }
      return;
    }

    // Tiếp cận người chơi
    if (distToPlayer > 130 && distToPlayer < 400) {
      this.bossState = 'walk';
      this.setFlipX(ctx.playerX < this.x);
      const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      this.setVelocity(Math.cos(angle) * 45, Math.sin(angle) * 45);
      this.play('behemoth_walk', true);

      this.stepTimer += delta;
      if (this.stepTimer >= 650) {
        this.stepTimer = 0;
        AudioManager.getInstance().playBehemothStep();
      }
    } else if (distToPlayer <= 130 && this.attackCooldown <= 0) {
      // Tung chuỗi đòn đập địa chấn
      this.bossState = 'combo_slam';
      this.stateTimer = 2200;
      this.setVelocity(0, 0);

      AudioManager.getInstance().playBehemothRoar();
      this.scene.time.delayedCall(400, () => AudioManager.getInstance().playBehemothSlam());
      this.play('behemoth_combo_fissure', true);

      this.scene.events.emit('behemoth_slam_warning', {
        x: this.x,
        y: this.y,
        radius: 120
      });
    } else {
      this.bossState = 'idle';
      this.setVelocity(0, 0);
      this.play('behemoth_idle', true);
    }
  }

  public takeDamage(amount: number = 1): void {
    if (this.isDefeated || this.bossState === 'death') return;

    // Nhận gấp đôi sát thương khi đang ở trạng thái sơ hở (Vulnerable Miss)
    const effectiveDamage = this.isVulnerable ? amount * 2 : amount;
    this.currentHp -= effectiveDamage;

    this.bossState = 'hurt';
    this.stateTimer = 500;
    this.setTint(0xff3333);
    this.scene.time.delayedCall(160, () => {
      if (this.active) this.clearTint();
    });

    this.play('behemoth_hit', true);

    if (this.currentHp <= 0) {
      this.defeatBoss();
    }
  }

  private defeatBoss(): void {
    this.isDefeated = true;
    this.bossState = 'death';
    this.setVelocity(0, 0);
    this.clearTint();

    AudioManager.getInstance().playBehemothDefeat();
    this.play('behemoth_death', true);

    // Ghi chép Bestiary & Rơi Mảnh Tinh Chất Bóng Tối
    PlayerState.getInstance().observeCreature('shadow_behemoth');
    PlayerState.getInstance().addItem('mat_shadow_essence', 1);

    this.scene.events.emit('shadow_behemoth_defeated', {
      x: this.x,
      y: this.y,
      dropItemId: 'mat_shadow_essence',
      dropCount: 1
    });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 800,
        onComplete: () => this.destroy()
      });
    });
  }
}
