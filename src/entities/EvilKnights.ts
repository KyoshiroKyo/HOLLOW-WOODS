/**
 * HOLLOW WOODS V1.4 — BƯỚC V14-P8-10 / BƯỚC V14-P8-14A
 * THỰC THỂ NHÓM HIỆP SĨ TÀ ÁC (EVIL KNIGHTS FACTION ENTITIES)
 * 
 * QUY TẮC TÁCH BẠCH TÀI NGUYÊN (ASSET ISOLATION CONTRACT — V14-P8-14A):
 * - Toàn bộ các thực thể thuộc phe Hiệp Sĩ Tà Ác trong rừng (FallenKnightEntity, DreadHorsemanEntity, HoodedKnightBoss)
 *   tuyệt đối CHỈ sử dụng bộ tài nguyên bóng tối/kẻ thù tha hóa (assets/characters/enemies/ và assets/characters/bosses/):
 *     + Fallen Knight: SPRITE_FALLEN_KNIGHT ('fallen_knight_sheet' - bộ giáp tà ác tha hóa)
 *     + Dread Horseman: SPRITE_DREAD_HORSEMAN ('dread_horseman_sheet' - kỵ binh hắc ám từ PixelHorse_V1.0)
 *     + Hooded Knight Boss: SPRITE_HOODED_KNIGHT ('hooded_knight_sheet' - chỉ huy trùm mũ từ Hooded Knight Sprites)
 * - TUYỆT ĐỐI KHÔNG sử dụng hay dùng chung bộ tài nguyên Giáp Bạc nguyên bản của NPC Hiệp Sĩ Canh Lửa.
 * 
 * 1. FallenKnightEntity: Hiệp Sĩ Sa Ngã (Bộ binh tàn quân bóng tối)
 * 2. DreadHorsemanEntity: Kỵ Binh Hắc Ám (Kỵ sĩ tuần tra càn quét)
 * 3. HoodedKnightBoss: Chỉ Huy Hiệp Sĩ Trùm Mũ (Trùm trấn thủ tàn tích)
 */

import * as Phaser from 'phaser';
import {
  SPRITE_FALLEN_KNIGHT,
  SPRITE_DREAD_HORSEMAN,
  SPRITE_HOODED_KNIGHT
} from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';

// Hợp đồng cam kết tách bạch tài nguyên giữa quái vật hiệp sĩ tà ác và NPC thân thiện
export const EVIL_KNIGHTS_ASSET_CONTRACT = {
  FACTION: 'EVIL_KNIGHTS' as const,
  IS_CORRUPTED_ENEMY: true,
  ALLOWED_SPRITES: [SPRITE_FALLEN_KNIGHT, SPRITE_DREAD_HORSEMAN, SPRITE_HOODED_KNIGHT] as const,
  PROHIBITED_NPC_ASSETS: [
    'campfire_knight_pray_sheet',
    'campfire_knight_idle_sheet',
    'portrait_campfire_knight'
  ] as const
};

export interface KnightContext {
  playerX: number;
  playerY: number;
  isLanternLit: boolean;
  lightRadius: number;
  isPlayerInSafeZone: boolean;
  timePhase: 'DAY' | 'DUSK' | 'NIGHT';
  isPlayerHiding?: boolean;
}

// =========================================================================
// 1. HIỆP SĨ SA NGÃ (FALLEN KNIGHT)
// =========================================================================
export type FallenKnightState = 'pray' | 'idle' | 'chase' | 'attack' | 'vulnerable' | 'hurt' | 'death';

export class FallenKnightEntity extends Phaser.Physics.Arcade.Sprite {
  public knightState: FallenKnightState = 'pray';
  public hp: number = 4;
  public maxHp: number = 4;
  public isDefeated: boolean = false;
  public isVulnerable: boolean = false;
  public hasHitPlayerInCurrentAttack: boolean = false;
  public hasRecognizedCommander: boolean = false;

  private spawnX: number;
  private spawnY: number;
  private stateTimer: number = 0;
  private attackCooldown: number = 0;
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private darkAuraGfx: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_FALLEN_KNIGHT);
    this.spawnX = x;
    this.spawnY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Điểm tựa chân ở y=63 trong khung 64x64
    this.setOrigin(0.5, 0.95);
    this.setDepth(Math.floor(y));

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(24, 28);
      body.setOffset(20, 32);
      body.setCollideWorldBounds(true);
    }

    this.footShadowGfx = scene.add.graphics();
    this.footShadowGfx.fillStyle(0x000000, 0.28);
    this.footShadowGfx.fillEllipse(0, 0, 26, 8);
    this.footShadowGfx.setDepth(this.depth - 1);

    // V1.5 - BƯỚC V15-08: Khói đen mờ tỏa ra quanh kiếm và giáp ban đêm
    this.darkAuraGfx = scene.add.graphics();
    this.drawDarkSmokeAura();
    this.darkAuraGfx.setVisible(false);

    this.initAnims();
    this.play('fallen_knight_pray', true);
  }

  private drawDarkSmokeAura(): void {
    if (!this.darkAuraGfx) return;
    this.darkAuraGfx.clear();
    this.darkAuraGfx.fillStyle(0x180924, 0.38);
    this.darkAuraGfx.fillCircle(0, -18, 22);
    this.darkAuraGfx.fillStyle(0x2d1240, 0.25);
    this.darkAuraGfx.fillCircle(6, -26, 16);
    this.darkAuraGfx.fillCircle(-6, -14, 18);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('fallen_knight_idle')) {
      anims.create({
        key: 'fallen_knight_idle',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!anims.exists('fallen_knight_run')) {
      anims.create({
        key: 'fallen_knight_run',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 8, end: 15 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!anims.exists('fallen_knight_attack')) {
      anims.create({
        key: 'fallen_knight_attack',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 16, end: 21 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (!anims.exists('fallen_knight_pray')) {
      anims.create({
        key: 'fallen_knight_pray',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 24, end: 27 }),
        frameRate: 4,
        repeat: -1
      });
    }
    if (!anims.exists('fallen_knight_hurt')) {
      anims.create({
        key: 'fallen_knight_hurt',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 32, end: 34 }),
        frameRate: 8,
        repeat: 0
      });
    }
    if (!anims.exists('fallen_knight_death')) {
      anims.create({
        key: 'fallen_knight_death',
        frames: anims.generateFrameNumbers(SPRITE_FALLEN_KNIGHT, { start: 40, end: 44 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  public updateAI(_time: number, delta: number, ctx: KnightContext): void {
    if (this.isDefeated || !this.active) return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
      if (this.footShadowGfx) {
        this.footShadowGfx.setDepth(targetDepth - 1);
      }
    }

    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y - 2);
    }

    const isNight = ctx.timePhase === 'NIGHT';
    // V1.5 - BƯỚC V15-08: Khói đen mờ quanh kiếm và giáp ban đêm
    if (this.darkAuraGfx) {
      if (isNight && this.visible && !this.isDefeated) {
        this.darkAuraGfx.setPosition(this.x, this.y);
        this.darkAuraGfx.setDepth(targetDepth - 1);
        this.darkAuraGfx.setVisible(true);
        if (!this.isVulnerable) this.setTint(0x9988aa);
      } else {
        this.darkAuraGfx.setVisible(false);
        if (!this.isVulnerable) this.clearTint();
      }
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    // Không tấn công người chơi nếu đang trong Safe Zone hoặc đang ẩn nấp an toàn
    if (ctx.isPlayerInSafeZone || ctx.isPlayerHiding) {
      if (this.knightState !== 'pray') {
        const distToSpawn = Phaser.Math.Distance.Between(this.x, this.y, this.spawnX, this.spawnY);
        if (distToSpawn > 15) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, this.spawnX, this.spawnY);
          this.setVelocity(Math.cos(angle) * 45, Math.sin(angle) * 45);
          this.setFlipX(this.spawnX < this.x);
          this.play('fallen_knight_run', true);
        } else {
          this.setVelocity(0, 0);
          this.knightState = 'pray';
          this.play('fallen_knight_pray', true);
        }
      }
      return;
    }

    // Ghi chép Bestiary khi nhìn thấy
    if (distToPlayer <= 260) {
      PlayerState.getInstance().observeCreature('fallen_knight');
    }

    switch (this.knightState) {
      case 'pray': {
        // V1.5 - BƯỚC V15-08: Tăng tần suất và phạm vi phát hiện ban đêm
        const baseDetect = isNight ? 180 : 130;
        const detectRange = ctx.isLanternLit ? (isNight ? 270 : 220) : baseDetect;
        if (distToPlayer <= detectRange) {
          this.knightState = 'chase';
          AudioManager.getInstance().playArmorClank();
          this.play('fallen_knight_run', true);
        }
        break;
      }

      case 'chase': {
        this.setFlipX(ctx.playerX < this.x);
        if (distToPlayer <= 36 && this.attackCooldown <= 0) {
          // Bắt đầu chuỗi vung kiếm chém
          this.knightState = 'attack';
          this.hasHitPlayerInCurrentAttack = false;
          this.stateTimer = 650;
          this.setVelocity(0, 0);
          AudioManager.getInstance().playKnightSwordSlash();
          this.play('fallen_knight_attack', true);
        } else if (distToPlayer > 300) {
          // Mất dấu mục tiêu, quay về cầu nguyện
          this.knightState = 'pray';
          this.setVelocity(0, 0);
          this.play('fallen_knight_pray', true);
        } else {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
          const chaseSpeed = 68;
          this.setVelocity(Math.cos(angle) * chaseSpeed, Math.sin(angle) * chaseSpeed);
          this.play('fallen_knight_run', true);
        }
        break;
      }

      case 'attack': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          // Vào trạng thái thở dốc sơ hở (vulnerable)
          // V1.5 - BƯỚC V15-08: Giảm 25% thời gian nghỉ giữa các đòn vung kiếm ban đêm (1800ms -> 1350ms)
          this.knightState = 'vulnerable';
          this.isVulnerable = true;
          this.stateTimer = isNight ? Math.round(900 * 0.75) : 900;
          this.attackCooldown = isNight ? Math.round(1800 * 0.75) : 1800;
          this.setVelocity(0, 0);
          this.play('fallen_knight_idle', true);
        }
        break;
      }

      case 'vulnerable': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.isVulnerable = false;
          this.knightState = 'chase';
        }
        break;
      }

      case 'hurt': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.clearTint();
          this.knightState = 'chase';
        }
        break;
      }
    }
  }

  public takeDamage(amount: number = 1, sourceX?: number, sourceY?: number): void {
    if (this.isDefeated || this.knightState === 'death') return;

    const finalDamage = this.isVulnerable ? amount * 2 : amount;
    this.hp -= finalDamage;

    AudioManager.getInstance().playArmorClank();
    this.setTint(0xff4444);
    this.knightState = 'hurt';
    this.stateTimer = 400;

    if (sourceX !== undefined && sourceY !== undefined) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
      this.setVelocity(Math.cos(angle) * 110, Math.sin(angle) * 110);
    }

    if (this.hp <= 0) {
      this.defeatKnight();
    } else {
      this.play('fallen_knight_hurt', true);
    }
  }

  private defeatKnight(): void {
    this.isDefeated = true;
    this.knightState = 'death';
    this.setVelocity(0, 0);
    this.clearTint();

    AudioManager.getInstance().playKnightDefeat();
    this.play('fallen_knight_death', true);

    PlayerState.getInstance().observeCreature('fallen_knight');
    PlayerState.getInstance().addItem('res_dry_wood', 1);

    this.scene.events.emit('fallen_knight_defeated', {
      x: this.x,
      y: this.y,
      dropItemId: 'res_dry_wood',
      dropCount: 1
    });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 600,
        onComplete: () => this.destroy()
      });
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.footShadowGfx) {
      this.footShadowGfx.destroy();
      this.footShadowGfx = null;
    }
    if (this.darkAuraGfx) {
      this.darkAuraGfx.destroy();
      this.darkAuraGfx = null;
    }
    super.destroy(fromScene);
  }
}

// =========================================================================
// 2. KỴ BINH HẮC ÁM (DREAD HORSEMAN)
// =========================================================================
export type HorsemanState = 'patrol' | 'rear_prep' | 'charge' | 'cooldown' | 'hurt' | 'death';

export class DreadHorsemanEntity extends Phaser.Physics.Arcade.Sprite {
  public horseState: HorsemanState = 'patrol';
  public hp: number = 5;
  public maxHp: number = 5;
  public isDefeated: boolean = false;
  public isVulnerable: boolean = false;
  public hasHitPlayerInCurrentCharge: boolean = false;

  private minX: number;
  private maxX: number;
  private patrolDir: number = 1;
  private stateTimer: number = 0;
  private chargeCooldown: number = 0;
  private chargeVelX: number = 0;
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private darkAuraGfx: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number = 200) {
    super(scene, x, y, SPRITE_DREAD_HORSEMAN);
    this.minX = x - patrolRange;
    this.maxX = x + patrolRange;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.95);
    this.setDepth(Math.floor(y));

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(38, 28);
      body.setOffset(13, 32);
      body.setCollideWorldBounds(true);
    }

    this.footShadowGfx = scene.add.graphics();
    this.footShadowGfx.fillStyle(0x000000, 0.3);
    this.footShadowGfx.fillEllipse(0, 0, 42, 12);
    this.footShadowGfx.setDepth(this.depth - 1);

    // V1.5 - BƯỚC V15-08: Khói đen mờ quanh kỵ sĩ và chiến mã ban đêm
    this.darkAuraGfx = scene.add.graphics();
    this.drawDarkSmokeAura();
    this.darkAuraGfx.setVisible(false);

    this.initAnims();
    this.play('dread_horseman_trot', true);
  }

  private drawDarkSmokeAura(): void {
    if (!this.darkAuraGfx) return;
    this.darkAuraGfx.clear();
    this.darkAuraGfx.fillStyle(0x180924, 0.35);
    this.darkAuraGfx.fillCircle(-6, -20, 28);
    this.darkAuraGfx.fillCircle(12, -26, 22);
    this.darkAuraGfx.fillStyle(0x2d1240, 0.22);
    this.darkAuraGfx.fillCircle(0, -12, 34);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('dread_horseman_idle')) {
      anims.create({
        key: 'dread_horseman_idle',
        frames: anims.generateFrameNumbers(SPRITE_DREAD_HORSEMAN, { start: 0, end: 6 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!anims.exists('dread_horseman_trot')) {
      anims.create({
        key: 'dread_horseman_trot',
        frames: anims.generateFrameNumbers(SPRITE_DREAD_HORSEMAN, { start: 7, end: 12 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('dread_horseman_charge')) {
      anims.create({
        key: 'dread_horseman_charge',
        frames: anims.generateFrameNumbers(SPRITE_DREAD_HORSEMAN, { start: 21, end: 24 }),
        frameRate: 12,
        repeat: -1
      });
    }
    if (!anims.exists('dread_horseman_rear')) {
      anims.create({
        key: 'dread_horseman_rear',
        frames: anims.generateFrameNumbers(SPRITE_DREAD_HORSEMAN, { start: 28, end: 31 }),
        frameRate: 8,
        repeat: 0
      });
    }
    if (!anims.exists('dread_horseman_hurt')) {
      anims.create({
        key: 'dread_horseman_hurt',
        frames: anims.generateFrameNumbers(SPRITE_DREAD_HORSEMAN, { start: 35, end: 38 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  public updateAI(_time: number, delta: number, ctx: KnightContext): void {
    if (this.isDefeated || !this.active) return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
      if (this.footShadowGfx) {
        this.footShadowGfx.setDepth(targetDepth - 1);
      }
    }

    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y - 2);
    }

    const isNight = ctx.timePhase === 'NIGHT';
    // V1.5 - BƯỚC V15-08: Khói đen mờ quanh kỵ sĩ và chiến mã ban đêm
    if (this.darkAuraGfx) {
      if (isNight && this.visible && !this.isDefeated) {
        this.darkAuraGfx.setPosition(this.x, this.y);
        this.darkAuraGfx.setDepth(targetDepth - 1);
        this.darkAuraGfx.setVisible(true);
        if (!this.isVulnerable) this.setTint(0x9988aa);
      } else {
        this.darkAuraGfx.setVisible(false);
        if (!this.isVulnerable) this.clearTint();
      }
    }

    if (this.chargeCooldown > 0) {
      this.chargeCooldown -= delta;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    if (distToPlayer <= 280) {
      PlayerState.getInstance().observeCreature('dread_horseman');
    }

    // Không tấn công người chơi nếu đang trong Safe Zone
    if (ctx.isPlayerInSafeZone || ctx.isPlayerHiding) {
      this.updatePatrol(isNight);
      return;
    }

    switch (this.horseState) {
      case 'patrol': {
        const canSpot = distToPlayer <= 220 && Math.abs(ctx.playerY - this.y) <= 55;
        if (canSpot && this.chargeCooldown <= 0) {
          // Bắt đầu giương vó báo hiệu cú phóng
          this.horseState = 'rear_prep';
          this.stateTimer = 850;
          this.setVelocity(0, 0);
          this.patrolDir = ctx.playerX < this.x ? -1 : 1;
          this.setFlipX(this.patrolDir < 0);
          AudioManager.getInstance().playHorseCharge();
          this.play('dread_horseman_rear', true);
        } else {
          this.updatePatrol(isNight);
        }
        break;
      }

      case 'rear_prep': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          // Phóng nước đại càn quét thẳng hàng
          this.horseState = 'charge';
          this.stateTimer = 1100;
          this.hasHitPlayerInCurrentCharge = false;
          this.chargeVelX = this.patrolDir * 165;
          this.setVelocity(this.chargeVelX, 0);
          this.play('dread_horseman_charge', true);
        }
        break;
      }

      case 'charge': {
        this.stateTimer -= delta;
        this.setVelocity(this.chargeVelX, 0);
        if (this.stateTimer <= 0) {
          // Kết thúc cú phóng, vào trạng thái khựng lại hồi sức
          // V1.5 - BƯỚC V15-08: Giảm 25% thời gian nghỉ giữa các đòn phóng ban đêm (2800ms -> 2100ms)
          this.horseState = 'cooldown';
          this.isVulnerable = true;
          this.stateTimer = isNight ? Math.round(1400 * 0.75) : 1400;
          this.chargeCooldown = isNight ? Math.round(2800 * 0.75) : 2800;
          this.setVelocity(0, 0);
          this.play('dread_horseman_idle', true);
        }
        break;
      }

      case 'cooldown': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.isVulnerable = false;
          this.horseState = 'patrol';
        }
        break;
      }

      case 'hurt': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.clearTint();
          this.horseState = 'patrol';
        }
        break;
      }
    }
  }

  private updatePatrol(isNight: boolean = false): void {
    if (this.x <= this.minX) {
      this.patrolDir = 1;
    } else if (this.x >= this.maxX) {
      this.patrolDir = -1;
    }
    // V1.5 - BƯỚC V15-08: Tăng tần suất và tốc độ tuần tra dọc các tuyến đường ban đêm (42 -> 62 px/s)
    const patrolSpeed = isNight ? 62 : 42;
    this.setVelocity(this.patrolDir * patrolSpeed, 0);
    this.setFlipX(this.patrolDir < 0);
    this.play('dread_horseman_trot', true);
  }

  public takeDamage(amount: number = 1, sourceX?: number, sourceY?: number): void {
    if (this.isDefeated || this.horseState === 'death') return;

    const finalDamage = this.isVulnerable ? amount * 2 : amount;
    this.hp -= finalDamage;

    AudioManager.getInstance().playArmorClank();
    this.setTint(0xff4444);
    this.horseState = 'hurt';
    this.stateTimer = 450;

    if (sourceX !== undefined && sourceY !== undefined) {
      const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
      this.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
    }

    if (this.hp <= 0) {
      this.defeatHorseman();
    } else {
      this.play('dread_horseman_hurt', true);
    }
  }

  private defeatHorseman(): void {
    this.isDefeated = true;
    this.horseState = 'death';
    this.setVelocity(0, 0);
    this.clearTint();

    AudioManager.getInstance().playKnightDefeat();
    this.play('dread_horseman_hurt', true);

    PlayerState.getInstance().observeCreature('dread_horseman');
    PlayerState.getInstance().addItem('res_flint', 1);

    this.scene.events.emit('dread_horseman_defeated', {
      x: this.x,
      y: this.y,
      dropItemId: 'res_flint',
      dropCount: 1
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 650,
      onComplete: () => this.destroy()
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.footShadowGfx) {
      this.footShadowGfx.destroy();
      this.footShadowGfx = null;
    }
    if (this.darkAuraGfx) {
      this.darkAuraGfx.destroy();
      this.darkAuraGfx = null;
    }
    super.destroy(fromScene);
  }
}

// =========================================================================
// 3. CHỈ HUY HIỆP SĨ TRÙM MŨ (HOODED KNIGHT BOSS)
// =========================================================================
export type HoodedKnightState = 'idle' | 'walk' | 'powerup' | 'attack' | 'stagger' | 'hurt' | 'death';

export class HoodedKnightBoss extends Phaser.Physics.Arcade.Sprite {
  public bossState: HoodedKnightState = 'idle';
  public maxHp: number = 10;
  public currentHp: number = 10;
  public isDefeated: boolean = false;
  public isVulnerable: boolean = false;
  public hasHitPlayerInCurrentAttack: boolean = false;
  public hasRecognizedCommander: boolean = false;

  private stateTimer: number = 0;
  private attackCooldown: number = 2400;
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private darkAuraGfx: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SPRITE_HOODED_KNIGHT);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Điểm tựa chân ở y=140 trong khung 160x160 -> 140/160 = 0.875
    this.setOrigin(0.5, 0.875);
    this.setDepth(Math.floor(y));

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(44, 46);
      body.setOffset(58, 96);
      body.setCollideWorldBounds(true);
    }

    this.footShadowGfx = scene.add.graphics();
    this.footShadowGfx.fillStyle(0x000000, 0.35);
    this.footShadowGfx.fillEllipse(0, 0, 52, 14);
    this.footShadowGfx.setDepth(this.depth - 1);

    // V1.5 - BƯỚC V15-08: Khói đen mờ tỏa ra quanh kiếm và giáp ban đêm
    this.darkAuraGfx = scene.add.graphics();
    this.drawDarkSmokeAura();
    this.darkAuraGfx.setVisible(false);

    this.initAnims();
    this.play('hooded_knight_idle', true);
  }

  private drawDarkSmokeAura(): void {
    if (!this.darkAuraGfx) return;
    this.darkAuraGfx.clear();
    this.darkAuraGfx.fillStyle(0x180924, 0.42);
    this.darkAuraGfx.fillCircle(0, -32, 38);
    this.darkAuraGfx.fillStyle(0x2d1240, 0.28);
    this.darkAuraGfx.fillCircle(12, -45, 26);
    this.darkAuraGfx.fillCircle(-12, -22, 30);
  }

  private initAnims(): void {
    const anims = this.scene.anims;
    if (!anims.exists('hooded_knight_idle')) {
      anims.create({
        key: 'hooded_knight_idle',
        frames: anims.generateFrameNumbers(SPRITE_HOODED_KNIGHT, { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!anims.exists('hooded_knight_powerup')) {
      anims.create({
        key: 'hooded_knight_powerup',
        frames: anims.generateFrameNumbers(SPRITE_HOODED_KNIGHT, { start: 12, end: 25 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!anims.exists('hooded_knight_attack')) {
      anims.create({
        key: 'hooded_knight_attack',
        frames: anims.generateFrameNumbers(SPRITE_HOODED_KNIGHT, { start: 26, end: 44 }),
        frameRate: 14,
        repeat: 0
      });
    }
    if (!anims.exists('hooded_knight_stagger')) {
      anims.create({
        key: 'hooded_knight_stagger',
        frames: anims.generateFrameNumbers(SPRITE_HOODED_KNIGHT, { start: 45, end: 55 }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  public updateAI(_time: number, delta: number, ctx: KnightContext): void {
    if (this.isDefeated || !this.active) return;

    // C4-14-B03: Dynamic Depth Sorting theo trục Y chân đứng
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
      if (this.footShadowGfx) {
        this.footShadowGfx.setDepth(targetDepth - 1);
      }
    }

    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y - 2);
    }

    const isNight = ctx.timePhase === 'NIGHT';
    // V1.5 - BƯỚC V15-08: Khói đen mờ quanh kiếm và giáp ban đêm
    if (this.darkAuraGfx) {
      if (isNight && this.visible && !this.isDefeated) {
        this.darkAuraGfx.setPosition(this.x, this.y);
        this.darkAuraGfx.setDepth(targetDepth - 1);
        this.darkAuraGfx.setVisible(true);
        if (!this.isVulnerable) this.setTint(0x9988aa);
      } else {
        this.darkAuraGfx.setVisible(false);
        if (!this.isVulnerable) this.clearTint();
      }
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, ctx.playerX, ctx.playerY);

    if (distToPlayer <= 320) {
      PlayerState.getInstance().observeCreature('hooded_knight');
    }

    // Tôn trọng Safe Zone tuyệt đối
    if (ctx.isPlayerInSafeZone || ctx.isPlayerHiding) {
      this.bossState = 'idle';
      this.setVelocity(0, 0);
      this.play('hooded_knight_idle', true);
      return;
    }

    // V14-P8-15B: Kích hoạt Giai đoạn 2 của Thức Tỉnh Ký Ức khi chạm trán Hooded Knight Boss
    if (distToPlayer <= 220 && !this.hasRecognizedCommander) {
      this.hasRecognizedCommander = true;
      const ps = PlayerState.getInstance();
      if (ps.memoryAwakeningStage < 2) {
        ps.setMemoryAwakeningStage(2);
        this.scene.events.emit('memory_awakening_stage_changed', 2);
      }

      // Tên trùm khựng lại trong bàng hoàng nhận diện thân phận Chỉ Huy
      this.bossState = 'stagger';
      this.stateTimer = 2200;
      this.setVelocity(0, 0);
      this.play('hooded_knight_stagger', true);

      this.scene.events.emit('hooded_knight_commander_recognition', {
        bossX: this.x,
        bossY: this.y,
        text: 'Không thể nào... Hơi thở bóng tối trên bộ giáp đen ấy... Ngài chính là Chỉ Huy Hiệp Sĩ Đen?! Sao ngài lại quay mũi kiếm về phía chúng tôi?'
      });

      const gameScene = this.scene as any;
      if (gameScene.uiScene?.showPopupMessage) {
        gameScene.uiScene.showPopupMessage('⚔️ Hooded Knight bàng hoàng: “Hơi thở bóng tối ấy... Ngài chính là Chỉ Huy Hiệp Sĩ Đen?! Sao ngài lại quay kiếm về phía chúng tôi?!”');
      }
      return;
    }

    this.setFlipX(ctx.playerX < this.x);

    switch (this.bossState) {
      case 'idle':
      case 'walk': {
        if (distToPlayer <= 220 && this.attackCooldown <= 0) {
          // Bắt đầu tụ năng lượng hắc ám (Powerup)
          this.bossState = 'powerup';
          this.stateTimer = 1500;
          this.setVelocity(0, 0);
          AudioManager.getInstance().playKnightPowerup();
          this.play('hooded_knight_powerup', true);

          this.scene.events.emit('hooded_knight_powerup_start', {
            x: this.x,
            y: this.y,
            radius: 80
          });
        } else if (distToPlayer > 40 && distToPlayer <= 260) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, ctx.playerX, ctx.playerY);
          const bossSpeed = isNight ? 65 : 52;
          this.setVelocity(Math.cos(angle) * bossSpeed, Math.sin(angle) * bossSpeed);
          this.bossState = 'walk';
          this.play('hooded_knight_idle', true);
        } else {
          this.bossState = 'idle';
          this.setVelocity(0, 0);
          this.play('hooded_knight_idle', true);
        }
        break;
      }

      case 'powerup': {
        this.stateTimer -= delta;

        // Nếu người chơi áp sát rọi đèn lồng cực mạnh (<= 75px) hoặc ném đuốc, ngắt chiêu và Stagger
        if (ctx.isLanternLit && distToPlayer <= 75) {
          this.interruptPowerup();
          return;
        }

        if (this.stateTimer <= 0) {
          // Tụ chiêu hoàn tất -> Bung nhát chém cuồng nộ
          this.bossState = 'attack';
          this.hasHitPlayerInCurrentAttack = false;
          this.stateTimer = 1100;
          this.setVelocity(0, 0);
          AudioManager.getInstance().playKnightSwordSlash();
          this.play('hooded_knight_attack', true);

          this.scene.events.emit('hooded_knight_attack_warning', {
            x: this.x,
            y: this.y,
            radius: 75
          });
        }
        break;
      }

      case 'attack': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.bossState = 'idle';
          this.attackCooldown = isNight ? Math.round(3200 * 0.75) : 3200;
          this.play('hooded_knight_idle', true);
        }
        break;
      }

      case 'stagger': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.isVulnerable = false;
          this.bossState = 'idle';
          this.attackCooldown = isNight ? Math.round(2000 * 0.75) : 2000;
          this.play('hooded_knight_idle', true);
        }
        break;
      }

      case 'hurt': {
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.clearTint();
          this.bossState = 'idle';
        }
        break;
      }
    }
  }

  public interruptPowerup(): void {
    if (this.bossState !== 'powerup') return;

    this.bossState = 'stagger';
    this.isVulnerable = true;
    this.stateTimer = 2200;
    this.setVelocity(0, 0);

    AudioManager.getInstance().playArmorClank();
    this.setTint(0x88bbff);
    this.scene.time.delayedCall(300, () => {
      if (this.active) this.clearTint();
    });

    this.play('hooded_knight_stagger', true);

    this.scene.events.emit('hooded_knight_interrupted', {
      x: this.x,
      y: this.y
    });
  }

  public takeDamage(amount: number = 1): void {
    if (this.isDefeated || this.bossState === 'death') return;

    // Nếu đang tụ chiêu, nhận đòn sẽ bị gián đoạn và stagger
    if (this.bossState === 'powerup') {
      this.interruptPowerup();
    }

    const effectiveDamage = this.isVulnerable ? amount * 2 : amount;
    this.currentHp -= effectiveDamage;

    AudioManager.getInstance().playArmorClank();
    this.setTint(0xff3333);
    this.stateTimer = 400;

    if (this.bossState !== 'stagger') {
      this.bossState = 'hurt';
      this.play('hooded_knight_stagger', true);
    }

    this.scene.time.delayedCall(200, () => {
      if (this.active && this.bossState !== 'stagger') this.clearTint();
    });

    if (this.currentHp <= 0) {
      this.defeatBoss();
    }
  }

  private defeatBoss(): void {
    this.isDefeated = true;
    this.bossState = 'death';
    this.setVelocity(0, 0);
    this.clearTint();

    AudioManager.getInstance().playKnightDefeat();
    this.play('hooded_knight_stagger', true);

    PlayerState.getInstance().observeCreature('hooded_knight');
    // Rơi vật phẩm nhiệm vụ cốt truyện: Huy Hiệu Hiệp Sĩ Tha Hóa
    PlayerState.getInstance().addItem('quest_corrupted_crest', 1);
    PlayerState.getInstance().setFlag('boss_hooded_knight_defeated');

    this.scene.events.emit('hooded_knight_defeated', {
      x: this.x,
      y: this.y,
      dropItemId: 'quest_corrupted_crest',
      dropCount: 1
    });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 900,
        onComplete: () => this.destroy()
      });
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.footShadowGfx) {
      this.footShadowGfx.destroy();
      this.footShadowGfx = null;
    }
    if (this.darkAuraGfx) {
      this.darkAuraGfx.destroy();
      this.darkAuraGfx = null;
    }
    super.destroy(fromScene);
  }
}
