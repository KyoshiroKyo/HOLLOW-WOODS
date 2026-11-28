import * as Phaser from 'phaser';
import { SPRITE_BOSS_WETLANDS_IDLE } from '../config/Constants';

export type MireWardenState =
  | 'DORMANT'
  | 'AWAKENING'
  | 'STALK'
  | 'INVESTIGATING'
  | 'CHARGING'
  | 'STAGGERED'
  | 'PHASE_TRANSITION'
  | 'ENSHROUDED'
  | 'DEFEATED';

export interface RunePillarTarget {
  id: string;
  name: string; // Tên trụ: 'Rãnh Vang Cổ' | 'Đá Mạch Rễ' | 'Bảo Hộ Chuông'
  x: number;
  y: number;
  radius: number;
  isLit: boolean;
  isShattered: boolean;
  hp: number;
  maxHp: number;
  graphics?: Phaser.GameObjects.Graphics;
  lightObj?: Phaser.GameObjects.Arc;
  glowGfx?: Phaser.GameObjects.Graphics;
  pillarSprite?: Phaser.GameObjects.Image;
}

export interface BrazierTarget {
  id: string;
  x: number;
  y: number;
  isLit: boolean;
  graphics?: Phaser.GameObjects.Graphics;
}

export class MireWardenBoss extends Phaser.GameObjects.Container {
  public currentState: MireWardenState = 'DORMANT';
  public phase: 1 | 2 = 1;
  public sealProgress: number = 0;
  public readonly maxSealProgress: number = 3;

  // Thuộc tính tốc độ và di chuyển
  public stalkSpeed: number = 75;
  public chargeSpeed: number = 240;
  public currentSpeed: number = 75;
  private targetX: number = 4500;
  private targetY: number = 250;
  private chargeDirection: { x: number; y: number } = { x: 0, y: 0 };
  private chargeDurationTimer: number = 0;

  // Cơ chế làm choáng (Stagger) chuẩn 3.5 giây (3500ms)
  public isStaggered: boolean = false;
  public staggerTimer: number = 0;
  public readonly STAGGER_DURATION_MS: number = 3500;

  // V15-42: Sprite thực thể Boss bóng tối SHADOW Series (The Shadowed Wetlands Boss)
  public bossSprite: Phaser.GameObjects.Sprite;
  private shadowGfx: Phaser.GameObjects.Graphics;
  private auraGfx: Phaser.GameObjects.Graphics;
  private staggerIndicatorContainer: Phaser.GameObjects.Container;
  private staggerPromptText: Phaser.GameObjects.Text;

  // V15-45: Thông báo Bất Khả Xâm Phạm & Đòn gầm sóng âm
  private invulnerableContainer?: Phaser.GameObjects.Container;
  private lastInvulnerableTime: number = 0;
  public sonicAttackTimer: number = 6000;
  public isRoaring: boolean = false;
  private sonicRoarWaveTimer?: Phaser.Time.TimerEvent;
  private sonicRoarHitTimer?: Phaser.Time.TimerEvent;
  private sonicRoarEndTimer?: Phaser.Time.TimerEvent;
  private sonicShockGfx?: Phaser.GameObjects.Graphics;

  // V15-46: Lớp khiên phong ấn và Sinh Lực thực chiến của Boss
  public isShieldBroken: boolean = false;
  public bossHp: number = 500;
  public readonly maxBossHp: number = 500;

  // V15-47: Bán kính vùng cộng hưởng bóng tối (Dark Resonance Aura)
  public darkResonanceRadius: number = 110;


  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Kích hoạt Arcade Physics cho Container
    scene.physics.world.enable(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // V15-42: Hitbox ôm vừa khít phần chân và thân quái thú bóng tối (scale 1.8x)
      body.setSize(84, 44);
      body.setOffset(-42, -42);
      body.setCollideWorldBounds(false);
    }

    // 1. Bóng đổ dưới chân Boss
    this.shadowGfx = scene.add.graphics();
    this.add(this.shadowGfx);
    this.drawShadow();

    // 2. Hào quang ma thuật rễ đầm lầy
    this.auraGfx = scene.add.graphics();
    this.add(this.auraGfx);

    // 3. V15-42: Thực thể Boss bóng tối thật từ gói SHADOW Series (The Shadowed Wetlands Boss)
    this.bossSprite = scene.add.sprite(0, 0, SPRITE_BOSS_WETLANDS_IDLE);
    this.bossSprite.setOrigin(0.336, 0.988); // Tâm thân tại X=83 (0.336), chân chạm đất tại Y=86 (0.988)
    this.bossSprite.setScale(1.8);
    if (this.bossSprite.texture) {
      this.bossSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.add(this.bossSprite);

    // 4. Huy hiệu cảnh báo khi bị choáng [E] KÍCH HOẠT ẤN PHONG ẤN
    this.staggerIndicatorContainer = scene.add.container(0, -110);
    const promptBg = scene.add.graphics();
    promptBg.fillStyle(0x0e131b, 0.92);
    promptBg.fillRoundedRect(-120, -16, 240, 32, 6);
    promptBg.lineStyle(1.5, 0x00d2d3, 0.95);
    promptBg.strokeRoundedRect(-120, -16, 240, 32, 6);

    this.staggerPromptText = scene.add.text(0, 0, '[E] KÍCH HOẠT ẤN PHONG ẤN!', {
      fontFamily: 'serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00d2d3',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    this.staggerIndicatorContainer.add([promptBg, this.staggerPromptText]);
    this.staggerIndicatorContainer.setVisible(false);
    this.add(this.staggerIndicatorContainer);

    this.drawBossBody();
    this.setVisible(false);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
  }

  private isEntityAndSceneActive(): boolean {
    return !!(this.active && this.scene && this.scene.sys?.isActive?.());
  }

  private onSceneShutdown(): void {
    this.cleanupSonicRoar();
  }

  private clearTimerEvent(timer?: Phaser.Time.TimerEvent): undefined {
    if (!timer) return undefined;
    if (this.scene?.time) {
      this.scene.time.removeEvent(timer);
    }
    timer.remove(false);
    return undefined;
  }

  private cleanupSonicRoar(): void {
    this.sonicRoarWaveTimer = this.clearTimerEvent(this.sonicRoarWaveTimer);
    this.sonicRoarHitTimer = this.clearTimerEvent(this.sonicRoarHitTimer);
    this.sonicRoarEndTimer = this.clearTimerEvent(this.sonicRoarEndTimer);
    if (this.sonicShockGfx) {
      if (this.sonicShockGfx.scene) {
        this.sonicShockGfx.destroy();
      }
      this.sonicShockGfx = undefined;
    }
    this.isRoaring = false;
  }

  /**
   * Vẽ bóng đổ lớn dưới chân Boss
   */
  private drawShadow(): void {
    this.shadowGfx.clear();
    this.shadowGfx.fillStyle(0x000000, 0.55);
    this.shadowGfx.fillEllipse(0, 2, 96, 26);
  }

  /**
   * Cập nhật diện mạo Boss theo từng pha
   */
  public drawBossBody(): void {
    if (!this.bossSprite) return;

    if (this.phase === 2) {
      this.bossSprite.setTint(0xddbbee); // Ánh tím ma mị trong Pha 2
    } else {
      this.bossSprite.clearTint();
    }
  }

  /**
   * Kích hoạt trận chiến đấu trùm
   */
  public startBossFight(): void {
    this.setVisible(true);
    this.currentState = 'AWAKENING';
    this.phase = 1;
    this.sealProgress = 0;
    this.isStaggered = false;
    this.staggerTimer = 0;

    // Hiệu ứng bùng nổ khi thức tỉnh
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 0.2, to: 1 },
      scaleY: { from: 0.2, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1200,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!this.isEntityAndSceneActive() || this.currentState === 'DEFEATED') return;
        this.currentState = 'STALK';
        this.drawBossBody();
      }
    });
  }

  /**
   * Tiếp nhận âm thanh đánh động (Mồi ném [Q], chạy nhanh hoặc gõ chuông)
   */
  public hearSound(x: number, y: number, isLureBomb: boolean = false): void {
    if (this.isStaggered || this.currentState === 'DEFEATED' || this.currentState === 'AWAKENING') {
      return;
    }

    this.targetX = x;
    this.targetY = y;

    if (isLureBomb) {
      // Mồi ném [Q] tạo kích động cực mạnh -> Boss lập tức CHARGE vào điểm ném!
      this.triggerCharge(x, y);
    } else if (this.currentState !== 'CHARGING') {
      this.currentState = 'INVESTIGATING';
    }
  }

  /**
   * Kích hoạt cú lao húc (Charge) cuồng bạo
   */
  public triggerCharge(targetX: number, targetY: number): void {
    if (this.isStaggered || this.currentState === 'DEFEATED') return;

    this.currentState = 'CHARGING';
    this.chargeDurationTimer = 2600; // Tối đa lao trong 2.6 giây
    this.targetX = targetX;
    this.targetY = targetY;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.001) {
      this.chargeDirection = { x: dx / dist, y: dy / dist };
    } else {
      this.chargeDirection = { x: 1, y: 0 };
    }

    if (this.chargeDirection.x < -0.1) {
      this.bossSprite.setFlipX(true);
    } else if (this.chargeDirection.x > 0.1) {
      this.bossSprite.setFlipX(false);
    }

    this.bossSprite.play('anim_boss_wetlands_attack1', true);
  }

  /**
   * Boss đâm trúng Trụ Cổ Ngữ đang phát sáng -> Rơi vào trạng thái CHOÁNG (STAGGERED) trong 3.5s
   */
  public stagger(): void {
    this.isStaggered = true;
    this.currentState = 'STAGGERED';
    this.staggerTimer = this.STAGGER_DURATION_MS; // 3500ms

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }

    this.staggerIndicatorContainer.setVisible(true);
    this.bossSprite.play('anim_boss_wetlands_hit', true);
    this.bossSprite.setTint(0xffffff);
    this.scene.time.delayedCall(150, () => {
      if (this.bossSprite && this.active) {
        this.drawBossBody();
      }
    });

    // Rung lắc thân thể choáng váng
    this.scene.tweens.add({
      targets: this,
      angle: { from: -4, to: 4 },
      duration: 100,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.angle = 0;
      }
    });
  }

  /**
   * V15-45: Hiển thị chỉ dẫn "Bất khả xâm phạm!" trên đầu Boss khi người chơi đánh trúng lúc phong ấn chưa vỡ
   */
  public showInvulnerableWarning(): void {
    const now = performance.now();
    if (now - this.lastInvulnerableTime < 1400) return;
    this.lastInvulnerableTime = now;

    if (!this.invulnerableContainer) {
      this.invulnerableContainer = this.scene.add.container(0, -130);
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x1a0606, 0.94);
      bg.fillRoundedRect(-165, -20, 330, 42, 6);
      bg.lineStyle(1.8, 0xff3838, 0.95);
      bg.strokeRoundedRect(-165, -20, 330, 42, 6);

      const title = this.scene.add.text(0, -8, '🛡️ BẤT KHẢ XÂM PHẠM!', {
        fontFamily: 'serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ff6b6b',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);

      const desc = this.scene.add.text(0, 9, 'Hãy phá hủy 3 Trụ Phong Ấn ở góc quảng trường trước.', {
        fontFamily: 'serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffd166',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);

      this.invulnerableContainer.add([bg, title, desc]);
      this.add(this.invulnerableContainer);
    }

    this.invulnerableContainer.setVisible(true);
    this.invulnerableContainer.setAlpha(1);
    this.invulnerableContainer.y = -130;

    // Tween nổi nhẹ và mờ dần
    this.scene.tweens.killTweensOf(this.invulnerableContainer);
    this.scene.tweens.add({
      targets: this.invulnerableContainer,
      y: -150,
      alpha: 0,
      duration: 1800,
      ease: 'Power1',
      onComplete: () => {
        if (this.invulnerableContainer) {
          this.invulnerableContainer.setVisible(false);
        }
      }
    });

    // Rung lắc nhẹ Boss nảy đòn
    this.bossSprite.setTint(0xff6666);
    this.scene.time.delayedCall(160, () => {
      if (this.bossSprite && this.active) {
        this.drawBossBody();
      }
    });
  }

  /**
   * V15-46: Phá vỡ hoàn toàn khiên bảo hộ quanh Boss khi 3 Trụ bị phá hủy
   */
  public breakShield(): void {
    this.isShieldBroken = true;
    this.stagger();
    this.bossSprite.setTint(0x00d2d3);
    this.scene.time.delayedCall(400, () => {
      if (this.bossSprite && this.active) {
        this.drawBossBody();
      }
    });
  }

  /**
   * V15-46: Tiếp nhận sát thương từ đòn đánh của người chơi khi khiên đã vỡ
   */
  public takeDamage(amount: number, fromX?: number, _fromY?: number): boolean {
    if (this.currentState === 'DEFEATED') return false;

    if (!this.isShieldBroken) {
      this.showInvulnerableWarning();
      return false;
    }

    this.bossHp = Math.max(0, this.bossHp - amount);
    this.bossSprite.play('anim_boss_wetlands_hit', true);
    this.bossSprite.setTint(0xff5555);
    this.scene.time.delayedCall(150, () => {
      if (this.bossSprite && this.active) {
        this.drawBossBody();
      }
    });

    // Rung giật nhẹ khi trúng đòn
    this.scene.tweens.add({
      targets: this,
      x: this.x + (fromX !== undefined ? (this.x > fromX ? 6 : -6) : 0),
      duration: 60,
      yoyo: true
    });

    if (this.bossHp <= 0) {
      this.defeat();
    }
    return true;
  }

  /**
   * V15-45: Kích hoạt đòn gầm sóng âm (Sonic Shockwave) lan tỏa
   */
  public triggerSonicRoar(onHitPlayerCallback?: () => void): void {
    if (
      this.isStaggered ||
      this.currentState === 'DEFEATED' ||
      this.isRoaring ||
      !this.isEntityAndSceneActive()
    ) {
      return;
    }

    this.cleanupSonicRoar();
    this.isRoaring = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Chạy hoạt ảnh đòn gầm tấn công 2 (anim_boss_wetlands_attack2)
    if (this.bossSprite?.scene) {
      this.bossSprite.play('anim_boss_wetlands_attack2', true);
    }

    // Vẽ sóng âm lan tỏa
    const shockGfx = this.scene.add.graphics();
    shockGfx.setDepth(this.y + 15);
    this.sonicShockGfx = shockGfx;
    const originX = this.x;
    const originY = this.y - 10;

    let currentRadius = 15;
    const maxRadius = 150;

    this.sonicRoarWaveTimer = this.scene.time.addEvent({
      delay: 20,
      repeat: 25,
      callback: () => {
        if (!this.isEntityAndSceneActive() || this.currentState === 'DEFEATED' || !this.isRoaring || !shockGfx.scene) {
          this.cleanupSonicRoar();
          return;
        }
        currentRadius += (maxRadius - 15) / 25;
        shockGfx.clear();
        const alpha = Math.max(0, 1 - (currentRadius / maxRadius));
        shockGfx.lineStyle(3, 0x9b59b6, alpha);
        shockGfx.strokeCircle(originX, originY, currentRadius);
        shockGfx.lineStyle(1.5, 0x00d2d3, alpha * 0.8);
        shockGfx.strokeCircle(originX, originY, Math.max(0, currentRadius - 12));
      }
    });

    this.sonicRoarHitTimer = this.scene.time.delayedCall(500, () => {
      this.sonicRoarHitTimer = undefined;
      if (!this.isEntityAndSceneActive() || this.currentState === 'DEFEATED' || !this.isRoaring) {
        return;
      }
      if (typeof onHitPlayerCallback === 'function') {
        onHitPlayerCallback();
      }
    });

    this.sonicRoarEndTimer = this.scene.time.delayedCall(900, () => {
      this.sonicRoarEndTimer = undefined;
      this.sonicRoarWaveTimer = this.clearTimerEvent(this.sonicRoarWaveTimer);
      if (this.sonicShockGfx) {
        if (this.sonicShockGfx.scene) {
          this.sonicShockGfx.destroy();
        }
        this.sonicShockGfx = undefined;
      }
      this.isRoaring = false;
      if (!this.isEntityAndSceneActive()) {
        return;
      }
      this.sonicAttackTimer = 7500 + Math.random() * 2000;
      if (!this.isStaggered && this.currentState !== 'DEFEATED' && this.bossSprite?.scene) {
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
        this.bossSprite.play('anim_boss_wetlands_idle', true);
      }
    });
  }

  /**
   * V15-47: Tạo xung chấn cộng hưởng bóng tối khi người chơi đứng quá lâu trong vùng
   */
  public triggerDarkResonancePulse(): void {
    if (!this.auraGfx) return;
    this.auraGfx.clear();
    this.auraGfx.fillStyle(0x5b1e7a, 0.45);
    this.auraGfx.fillCircle(0, 0, this.darkResonanceRadius + 18);
    this.scene.tweens.add({
      targets: this.auraGfx,
      alpha: 0,
      duration: 350,
      onComplete: () => {
        if (this.auraGfx) {
          this.auraGfx.clear();
          this.auraGfx.alpha = 1;
        }
      }
    });
  }

  /**
   * Người chơi nhấn [E] hoặc dùng Giáo Gỗ phong ấn khi Boss đang bị choáng
   */
  public applySeal(): number {
    if (!this.isStaggered || this.currentState === 'DEFEATED') {
      return this.sealProgress;
    }

    this.sealProgress++;
    this.isStaggered = false;
    this.staggerTimer = 0;
    this.staggerIndicatorContainer.setVisible(false);

    // Hiệu ứng sóng ma thuật bung tỏa từ phong ấn
    this.auraGfx.clear();
    this.auraGfx.fillStyle(0x00d2d3, 0.45);
    this.auraGfx.fillCircle(0, 0, 80);
    this.scene.tweens.add({
      targets: this.auraGfx,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        if (this.auraGfx && this.auraGfx.scene) {
          this.auraGfx.clear();
          this.auraGfx.alpha = 1;
        }
      }
    });

    if (this.sealProgress >= 3) {
      this.defeat();
    } else if (this.sealProgress === 2) {
      this.enterPhase2();
    } else {
      // Hồi phục sau cú đánh nấc 1
      this.currentState = 'STALK';
      this.drawBossBody();
    }

    return this.sealProgress;
  }

  /**
   * Chuyển sang Pha 2 — Bóng Tối & Thắp Sáng Lại
   */
  public enterPhase2(): void {
    this.phase = 2;
    this.currentState = 'PHASE_TRANSITION';

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Hoạt ảnh gầm thét cuồng nộ giải phóng sương mù tím
    this.drawBossBody();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 800,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (!this.isEntityAndSceneActive() || this.currentState === 'DEFEATED') return;
        this.currentState = 'ENSHROUDED';
        this.drawBossBody();
      }
    });
  }

  /**
   * Boss bị phong ấn vĩnh viễn
   */
  public defeat(): void {
    this.currentState = 'DEFEATED';
    this.cleanupSonicRoar();
    this.isStaggered = false;
    if (this.staggerIndicatorContainer?.scene) {
      this.staggerIndicatorContainer.setVisible(false);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // V15-42: Chạy trọn vẹn hoạt ảnh tử trận (Death animation 33 frames) của SHADOW Series
    if (this.bossSprite?.scene) {
      this.bossSprite.play('anim_boss_wetlands_death', true);
    }

    if (this.isEntityAndSceneActive()) {
      this.scene.tweens.add({
        targets: this,
        alpha: 0.8,
        duration: 3200,
        ease: 'Power2'
      });
    }
  }

  public destroy(fromScene?: boolean): void {
    this.cleanupSonicRoar();
    if (this.scene) {
      this.scene.events?.off(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
      this.scene.tweens?.killTweensOf(this);
      if (this.auraGfx) {
        this.scene.tweens?.killTweensOf(this.auraGfx);
      }
      if (this.invulnerableContainer) {
        this.scene.tweens?.killTweensOf(this.invulnerableContainer);
      }
    }
    this.removeAllListeners();
    super.destroy(fromScene);
  }

  /**
   * Cập nhật vòng lặp logic theo delta thời gian
   */
  public update(_time: number, delta: number): void {
    if (this.currentState === 'DORMANT' || this.currentState === 'DEFEATED') {
      return;
    }

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y + 20);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // V15-42: Tự động lật hướng sprite (flipX) mượt mà theo chuyển động hoặc mục tiêu
    if (body.velocity.x < -8) {
      this.bossSprite.setFlipX(true);
    } else if (body.velocity.x > 8) {
      this.bossSprite.setFlipX(false);
    } else if (this.targetX !== this.x && Math.abs(this.targetX - this.x) > 20) {
      this.bossSprite.setFlipX(this.targetX < this.x);
    }

    // V15-47: Cập nhật vùng cộng hưởng bóng tối quanh Boss (Dark Resonance Aura)
    if (this.auraGfx && this.active) {
      if (!this.isStaggered) {
        const pulse = 0.12 + 0.05 * Math.sin(_time * 0.005);
        this.auraGfx.clear();
        this.auraGfx.fillStyle(0x3a0d45, pulse);
        this.auraGfx.fillCircle(0, 0, this.darkResonanceRadius);
        this.auraGfx.lineStyle(1.5, 0x8e44ad, pulse * 1.5);
        this.auraGfx.strokeCircle(0, 0, this.darkResonanceRadius);
      } else {
        this.auraGfx.clear();
      }
    }

    if (this.isRoaring) {
      body.setVelocity(0, 0);
      return;
    }

    // Xử lý bộ đếm Choáng (Stagger)
    if (this.isStaggered) {
      this.staggerTimer -= delta;
      if (this.staggerTimer <= 0) {
        // Hết thời gian choáng mà người chơi chưa kịp phong ấn -> Boss hồi phục!
        this.isStaggered = false;
        this.staggerIndicatorContainer.setVisible(false);
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
        this.drawBossBody();
      }
      body.setVelocity(0, 0);
      return;
    }

    // Xử lý chuyển động & animation theo từng trạng thái
    if (this.currentState === 'CHARGING') {
      this.chargeDurationTimer -= delta;
      body.setVelocity(
        this.chargeDirection.x * this.chargeSpeed,
        this.chargeDirection.y * this.chargeSpeed
      );

      if (this.chargeDurationTimer <= 0) {
        // Hết đà lao mà không va chạm trụ -> hồi lại STALK
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
        this.drawBossBody();
      }
    } else if (this.currentState === 'INVESTIGATING') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 30) {
        body.setVelocity((dx / dist) * 115, (dy / dist) * 115);
        this.bossSprite.play('anim_boss_wetlands_walk', true);
      } else {
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
      }
    } else if (this.currentState === 'STALK' || this.currentState === 'ENSHROUDED') {
      // V15-45: Đếm lùi thời gian kích hoạt đòn gầm sóng âm (Sonic Shockwave)
      this.sonicAttackTimer -= delta;
      if (this.sonicAttackTimer <= 0) {
        this.emit('boss_request_sonic_roar');
        return;
      }

      // Đi tuần chậm rãi quanh khu vực Miếu Chuông
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40) {
        // Đứng quan sát / chờ đợi
        body.setVelocity(0, 0);
        this.bossSprite.play('anim_boss_wetlands_idle', true);
        // Chọn điểm rình mò ngẫu nhiên mới trong đấu trường (4250..4750, 180..380)
        this.targetX = 4250 + Math.random() * 500;
        this.targetY = 180 + Math.random() * 200;
      } else {
        body.setVelocity((dx / dist) * this.stalkSpeed, (dy / dist) * this.stalkSpeed);
        this.bossSprite.play('anim_boss_wetlands_walk', true);
      }
    }
  }
}
