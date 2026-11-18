import * as Phaser from 'phaser';
import { SPRITE_SKULL_WOLF } from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';

export type SkullWolfState = 'patrol' | 'stalk' | 'fear_light' | 'lunge' | 'hurt' | 'dissolve' | 'den_rest';

export interface SkullWolfContext {
  playerX: number;
  playerY: number;
  isLanternLit: boolean;
  lightX: number;
  lightY: number;
  lightRadius: number;
  isPlayerInSafeZone: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
  playerComposure?: number;
  packFlankOffset?: number; // V1.5: Góc bọc sườn khi đi săn theo cặp (-0.61 rad bên trái, +0.61 rad bên phải)
  crows?: Array<{ x: number; y: number; spook: (cause: any) => void; isSpooked: boolean }>;
}

export class SkullWolfEntity extends Phaser.Physics.Arcade.Sprite {
  public wolfState: SkullWolfState = 'patrol';
  public maxHp: number = 3;
  public currentHp: number = 3;
  public isDefeated: boolean = false;
  public hasHitPlayerInCurrentLunge: boolean = false;

  private zoneId: string;
  private spawnOriginX: number;
  private spawnOriginY: number;

  // Timers and cooldowns
  private stateTimer: number = 0;
  private lungeCooldown: number = 0;
  private growlCooldown: number = 0;
  private rattleCooldown: number = 0;
  private hurtStunTimer: number = 0;
  private patrolTarget: { x: number; y: number } | null = null;
  private patrolWaitTimer: number = 0;

  // Foot shadow & glowing eye graphics
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private eyesGfx: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, zoneId: string = 'deep_forest') {
    super(scene, x, y, SPRITE_SKULL_WOLF);

    this.zoneId = zoneId;
    this.spawnOriginX = x;
    this.spawnOriginY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Anchor at bottom-center (feet at y=58 in 64x64 frame -> 58/64 = 0.90625)
    this.setOrigin(0.5, 0.90625);
    this.setDepth(Math.floor(y));

    // Collider configuration: compact body for smooth woodland navigation
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(36, 18);
      body.setOffset(14, 40);
      body.setCollideWorldBounds(true);
    }

    // Foot shadow
    this.footShadowGfx = scene.add.graphics();
    this.footShadowGfx.fillStyle(0x000000, 0.25);
    this.footShadowGfx.fillEllipse(0, 0, 36, 10);
    this.footShadowGfx.setDepth(this.depth - 1);

    // V1.5 - BƯỚC V15-07: Hốc mắt đầu lâu rực xanh lân tinh trong bóng tối
    this.eyesGfx = scene.add.graphics();
    this.drawPhosphorusEyes();
    this.eyesGfx.setVisible(false);

    this.initAnimations(scene);
    this.play('skull_wolf_idle');

    this.pickNewPatrolTarget();
  }

  private initAnimations(scene: Phaser.Scene): void {
    const anims = scene.anims;
    if (!anims.exists('skull_wolf_idle')) {
      anims.create({
        key: 'skull_wolf_idle',
        frames: anims.generateFrameNumbers(SPRITE_SKULL_WOLF, { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!anims.exists('skull_wolf_lunge')) {
      anims.create({
        key: 'skull_wolf_lunge',
        frames: anims.generateFrameNumbers(SPRITE_SKULL_WOLF, { start: 7, end: 11 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!anims.exists('skull_wolf_walk')) {
      anims.create({
        key: 'skull_wolf_walk',
        frames: anims.generateFrameNumbers(SPRITE_SKULL_WOLF, { start: 14, end: 17 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!anims.exists('skull_wolf_death')) {
      anims.create({
        key: 'skull_wolf_death',
        frames: anims.generateFrameNumbers(SPRITE_SKULL_WOLF, { start: 21, end: 27 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  /**
   * V1.5 - BƯỚC V15-07: Vẽ hốc mắt đầu lâu rực xanh lân tinh (phosphorus cyan / green)
   */
  private drawPhosphorusEyes(): void {
    if (!this.eyesGfx) return;
    this.eyesGfx.clear();
    // Quầng sáng lân tinh mờ
    this.eyesGfx.fillStyle(0x00ffcc, 0.35);
    this.eyesGfx.fillCircle(-10, -24, 3.5);
    this.eyesGfx.fillCircle(-4, -24, 3.0);
    // Hốc mắt sáng xanh sắc bén
    this.eyesGfx.fillStyle(0xaaffea, 0.95);
    this.eyesGfx.fillCircle(-10, -24, 1.5);
    this.eyesGfx.fillCircle(-4, -24, 1.3);
  }

  public updateAI(_time: number, delta: number, ctx: SkullWolfContext): void {
    if (this.isDefeated) return;

    // Update ground shadow
    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y);
      this.footShadowGfx.setVisible(this.visible && this.wolfState !== 'dissolve');
    }

    // Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
      if (this.footShadowGfx) {
        this.footShadowGfx.setDepth(targetDepth - 1);
      }
    }

    // V1.5 - BƯỚC V15-07: Cập nhật vị trí mắt lân tinh và độ sáng theo thời gian
    if (this.eyesGfx) {
      this.eyesGfx.setPosition(this.x, this.y);
      this.eyesGfx.setScale(this.flipX ? -1 : 1, 1);
      this.eyesGfx.setDepth(targetDepth + 1);

      if (ctx.timePhase === 'NIGHT') {
        this.eyesGfx.setVisible(this.visible && this.wolfState !== 'dissolve');
        this.eyesGfx.setAlpha(0.9);
      } else if (ctx.timePhase === 'DUSK') {
        this.eyesGfx.setVisible(this.visible && this.wolfState !== 'dissolve');
        this.eyesGfx.setAlpha(0.4);
      } else {
        this.eyesGfx.setVisible(false);
      }
    }

    // Update internal cooldown timers
    if (this.lungeCooldown > 0) this.lungeCooldown -= delta;
    if (this.growlCooldown > 0) this.growlCooldown -= delta;
    if (this.rattleCooldown > 0) this.rattleCooldown -= delta;
    if (this.stateTimer > 0) this.stateTimer -= delta;

    // Handle hurt stun state
    if (this.wolfState === 'hurt') {
      this.hurtStunTimer -= delta;
      if (this.hurtStunTimer <= 0) {
        this.clearTint();
        this.wolfState = 'patrol';
        this.play('skull_wolf_idle', true);
      }
      return;
    }

    if (this.wolfState === 'dissolve') {
      return;
    }

    // Connect with crows: if within 130px, startle crow with alert
    if (ctx.crows && ctx.crows.length > 0) {
      for (const crow of ctx.crows) {
        if (!crow.isSpooked) {
          const distCrow = Phaser.Math.Distance.Between(this.x, this.y, crow.x, crow.y);
          if (distCrow < 130) {
            crow.spook('listener_near');
          }
        }
      }
    }

    // Respect village safe zone: turn away if trying to enter village boundary
    if (this.zoneId === 'bellhollow' || (ctx.isPlayerInSafeZone && this.x < 1650)) {
      this.setVelocityX(Math.abs(this.body?.velocity.x ?? 0) > 0 ? 50 : 0);
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    // Natural Bestiary unlock upon observing or getting close
    if (distToPlayer < 240) {
      PlayerState.getInstance().observeCreature('skull_wolf');
    }

    // Periodic bone rattle sound
    if (distToPlayer < 380 && this.rattleCooldown <= 0) {
      this.rattleCooldown = 4000 + Math.random() * 3000;
      AudioManager.getInstance().playBoneRattle();
    }

    // V1.5 - BƯỚC V15-07: Tính toán Hệ Số Hung Hãn Ban Đêm
    const distToLight = Phaser.Math.Distance.Between(this.x, this.y, ctx.lightX, ctx.lightY);
    const isNight = ctx.timePhase === 'NIGHT';
    const isDay = ctx.timePhase === 'DAY';
    const isPlayerLowComposure = ctx.playerComposure !== undefined && ctx.playerComposure < 25;
    const canBreachLight = isNight && isPlayerLowComposure;

    // Ban Đêm quái vật thu hẹp khoảng cách, ép sát ngay rìa quầng sáng đèn (+15px thay vì +45px)
    const perimeterOffset = isNight ? 15 : 45;
    const isInLightPerimeter = ctx.isLanternLit && distToLight <= (ctx.lightRadius + perimeterOffset);

    // AI State Machine
    if (isDay) {
      // Vào Ban Ngày (DAY): Sói Xương rút về hang nghỉ ngơi
      this.handleDenRest();
    } else if (isInLightPerimeter && !canBreachLight) {
      // FEAR_LIGHT: The bone wolf is repelled by sacred/campfire/lantern light
      this.handleFearLight(ctx, distToLight);
    } else if (distToPlayer < (isNight ? 340 : 280) && !ctx.isPlayerInSafeZone) {
      // STALK or LUNGE: Player is in darkness hoặc Bình Tâm < 25% làm sói dám xông vào cắn
      this.handleHunting(ctx, distToPlayer);
    } else {
      // PATROL: Idle roaming in the woods
      this.handlePatrol(delta);
    }
  }

  /**
   * V1.5 - BƯỚC V15-07: Sói Xương rút về hang nghỉ ngơi vào ban ngày
   */
  private handleDenRest(): void {
    this.wolfState = 'den_rest';
    const distToSpawn = Phaser.Math.Distance.Between(this.x, this.y, this.spawnOriginX, this.spawnOriginY);
    if (distToSpawn > 35) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.spawnOriginX, this.spawnOriginY);
      const retreatSpeed = 28;
      this.setVelocity(Math.cos(angle) * retreatSpeed, Math.sin(angle) * retreatSpeed);
      this.setFacing(this.spawnOriginX < this.x ? 'left' : 'right');
      this.play('skull_wolf_walk', true);
      this.setAlpha(0.85);
    } else {
      this.setVelocity(0, 0);
      this.play('skull_wolf_idle', true);
      this.setAlpha(0.65); // Ẩn mình nghỉ ngơi trong bóng râm hang
    }
  }

  private handleFearLight(ctx: SkullWolfContext, distToLight: number): void {
    this.wolfState = 'fear_light';
    this.setAlpha(1.0);

    // Face the light source
    this.setFacing(ctx.lightX < this.x ? 'left' : 'right');

    // Growl menacingly at the edge of the light
    if (this.growlCooldown <= 0) {
      this.growlCooldown = (ctx.timePhase === 'NIGHT' ? 2200 : 3500) + Math.random() * 2000;
      AudioManager.getInstance().playWolfGrowl();
    }

    // V1.5 - BƯỚC V15-07: Ban Đêm quái vật ép sát ngay rìa quầng sáng (+15px thay vì +50px)
    const targetDist = ctx.lightRadius + (ctx.timePhase === 'NIGHT' ? 15 : 50);
    if (distToLight < targetDist) {
      const angle = Phaser.Math.Angle.Between(ctx.lightX, ctx.lightY, this.x, this.y);
      const retreatSpeed = 35;
      this.setVelocity(Math.cos(angle) * retreatSpeed, Math.sin(angle) * retreatSpeed);
      this.play('skull_wolf_walk', true);
    } else {
      // Pacing menacingly at perimeter
      this.setVelocity(0, 0);
      this.play('skull_wolf_idle', true);
    }
  }

  private handleHunting(ctx: SkullWolfContext, distToPlayer: number): void {
    this.setAlpha(1.0);
    // Face player
    this.setFacing(ctx.playerX < this.x ? 'left' : 'right');
    const isNight = ctx.timePhase === 'NIGHT';

    if (distToPlayer <= (isNight ? 180 : 160) && this.lungeCooldown <= 0) {
      // LUNGE attack: sudden leap toward the player
      this.wolfState = 'lunge';
      this.lungeCooldown = isNight ? 3600 : 4500;
      this.stateTimer = 800; // Duration of lunge
      this.hasHitPlayerInCurrentLunge = false;

      AudioManager.getInstance().playWolfLunge();
      this.play('skull_wolf_lunge', true);

      const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      // V1.5 - BƯỚC V15-07: Ban Đêm tăng tốc độ vồ thêm 25% (195 * 1.25 = 243.75 px/s)
      const baseLungeSpeed = 195;
      const lungeSpeed = isNight ? baseLungeSpeed * 1.25 : baseLungeSpeed;
      this.setVelocity(Math.cos(angle) * lungeSpeed, Math.sin(angle) * lungeSpeed);
    } else if (this.wolfState === 'lunge' && this.stateTimer > 0) {
      // Currently executing lunge velocity
      return;
    } else {
      // STALK: Stalking from fog edge toward darkness
      this.wolfState = 'stalk';
      const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      // V1.5 - BƯỚC V15-07: Đi săn theo cặp 2 con phối hợp bọc sườn (Flanking)
      const flankAngle = (isNight && ctx.packFlankOffset !== undefined) ? ctx.packFlankOffset : 0;
      const finalAngle = baseAngle + flankAngle;
      const stalkSpeed = isNight ? 78 : 65;
      this.setVelocity(Math.cos(finalAngle) * stalkSpeed, Math.sin(finalAngle) * stalkSpeed);
      this.play('skull_wolf_walk', true);
    }
  }

  private handlePatrol(delta: number): void {
    this.wolfState = 'patrol';

    if (this.patrolWaitTimer > 0) {
      this.patrolWaitTimer -= delta;
      this.setVelocity(0, 0);
      this.play('skull_wolf_idle', true);
      return;
    }

    if (!this.patrolTarget) {
      this.pickNewPatrolTarget();
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
    if (dist < 15) {
      this.patrolWaitTimer = 2000 + Math.random() * 3000;
      this.pickNewPatrolTarget();
      this.setVelocity(0, 0);
      this.play('skull_wolf_idle', true);
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
      const patrolSpeed = 42;
      this.setVelocity(Math.cos(angle) * patrolSpeed, Math.sin(angle) * patrolSpeed);
      this.setFacing(this.patrolTarget.x < this.x ? 'left' : 'right');
      this.play('skull_wolf_walk', true);
    }
  }

  private pickNewPatrolTarget(): void {
    const range = 180;
    const targetX = this.spawnOriginX + (Math.random() * range * 2 - range);
    const targetY = this.spawnOriginY + (Math.random() * range * 2 - range);
    this.patrolTarget = { x: targetX, y: targetY };
  }

  public takeDamage(amount: number = 1, sourceX?: number, sourceY?: number): void {
    if (this.isDefeated || this.wolfState === 'dissolve') return;

    this.currentHp -= amount;
    this.wolfState = 'hurt';
    this.hurtStunTimer = 550;

    // Visual hurt flash
    this.setTint(0xff4444);

    // Knockback away from damage source
    if (sourceX !== undefined && sourceY !== undefined) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
      this.setVelocity(Math.cos(angle) * 130, Math.sin(angle) * 130);
    } else {
      this.setVelocity(this.flipX ? -70 : 70, -30);
    }

    if (this.currentHp <= 0) {
      this.dissolveAndDrop();
    }
  }

  private dissolveAndDrop(): void {
    this.isDefeated = true;
    this.wolfState = 'dissolve';
    this.setVelocity(0, 0);

    // Sound effect: bone dissolving into ash
    AudioManager.getInstance().playWolfDissolve();

    // Play death dissolution animation (Row 3, 7 frames)
    this.play('skull_wolf_death', true);

    // Record creature into Bestiary
    PlayerState.getInstance().observeCreature('skull_wolf');

    // Drop ancient skull fang (mat_skull_fang) into player inventory or scene drop
    PlayerState.getInstance().addItem('mat_skull_fang', 1);

    // Emit event for GameScene / UI feedback
    this.scene.events.emit('skull_wolf_defeated', {
      x: this.x,
      y: this.y,
      dropItemId: 'mat_skull_fang',
      dropCount: 1
    });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.destroy();
        }
      });
    });
  }

  public onLungeHitPlayer(): void {
    this.wolfState = 'patrol';
    this.stateTimer = 0;
    this.setVelocity(0, 0);
    this.play('skull_wolf_idle', true);
  }

  public setFacing(dir: 'left' | 'right'): void {
    // The source sprite faces left by default
    // If facing right, flipX = true; if facing left, flipX = false
    this.setFlipX(dir === 'right');
  }

  public destroy(fromScene?: boolean): void {
    if (this.footShadowGfx) {
      this.footShadowGfx.destroy();
      this.footShadowGfx = null;
    }
    if (this.eyesGfx) {
      this.eyesGfx.destroy();
      this.eyesGfx = null;
    }
    super.destroy(fromScene);
  }
}
