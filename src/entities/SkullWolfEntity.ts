import * as Phaser from 'phaser';
import { SPRITE_SKULL_WOLF } from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';

export type SkullWolfState = 'patrol' | 'stalk' | 'fear_light' | 'lunge' | 'hurt' | 'dissolve';

export interface SkullWolfContext {
  playerX: number;
  playerY: number;
  isLanternLit: boolean;
  lightX: number;
  lightY: number;
  lightRadius: number;
  isPlayerInSafeZone: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
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

  // Foot shadow graphics
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;

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

  public updateAI(_time: number, delta: number, ctx: SkullWolfContext): void {
    if (this.isDefeated) return;

    // Update ground shadow
    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y);
      this.footShadowGfx.setVisible(this.visible && this.wolfState !== 'dissolve');
    }

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
      if (this.footShadowGfx) {
        this.footShadowGfx.setDepth(targetDepth - 1);
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

    // Light Fear calculation: Check if player has active lantern, campfire or resin flare
    const distToLight = Phaser.Math.Distance.Between(this.x, this.y, ctx.lightX, ctx.lightY);
    const isInLightPerimeter = ctx.isLanternLit && distToLight <= (ctx.lightRadius + 45);

    // AI State Machine
    if (isInLightPerimeter) {
      // FEAR_LIGHT: The bone wolf is repelled by sacred/campfire/lantern light
      this.handleFearLight(ctx, distToLight);
    } else if (distToPlayer < 280 && !ctx.isPlayerInSafeZone) {
      // STALK or LUNGE: Player is in darkness or outside light ring
      this.handleHunting(ctx, distToPlayer);
    } else {
      // PATROL: Idle roaming in the woods
      this.handlePatrol(delta);
    }
  }

  private handleFearLight(ctx: SkullWolfContext, distToLight: number): void {
    this.wolfState = 'fear_light';

    // Face the light source
    this.setFacing(ctx.lightX < this.x ? 'left' : 'right');

    // Growl menacingly at the edge of the light
    if (this.growlCooldown <= 0) {
      this.growlCooldown = 3500 + Math.random() * 2000;
      AudioManager.getInstance().playWolfGrowl();
    }

    // Back away slowly to stay just outside the light perimeter
    const targetDist = ctx.lightRadius + 50;
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
    // Face player
    this.setFacing(ctx.playerX < this.x ? 'left' : 'right');

    if (distToPlayer <= 160 && this.lungeCooldown <= 0) {
      // LUNGE attack: sudden leap toward the player
      this.wolfState = 'lunge';
      this.lungeCooldown = 4500;
      this.stateTimer = 800; // Duration of lunge
      this.hasHitPlayerInCurrentLunge = false;

      AudioManager.getInstance().playWolfLunge();
      this.play('skull_wolf_lunge', true);

      const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      const lungeSpeed = 195;
      this.setVelocity(Math.cos(angle) * lungeSpeed, Math.sin(angle) * lungeSpeed);
    } else if (this.wolfState === 'lunge' && this.stateTimer > 0) {
      // Currently executing lunge velocity
      return;
    } else {
      // STALK: Stalking from fog edge toward darkness
      this.wolfState = 'stalk';
      const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
      const stalkSpeed = 65;
      this.setVelocity(Math.cos(angle) * stalkSpeed, Math.sin(angle) * stalkSpeed);
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
    super.destroy(fromScene);
  }
}
