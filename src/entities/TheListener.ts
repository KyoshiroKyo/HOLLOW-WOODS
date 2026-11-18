import * as Phaser from 'phaser';
import { Monster } from './monsters/Monster';
import { ListenerAI, Waypoint } from '../systems/ListenerAI';
import { SPRITE_THE_LISTENER } from '../config/Constants';
import { TimePhase } from '../systems/DayNightSystem';

export class TheListener extends Monster {
  public ai!: ListenerAI;
  private alertIcon!: Phaser.GameObjects.Container;
  private alertBg!: Phaser.GameObjects.Graphics;
  private alertText!: Phaser.GameObjects.Text;
  private visualGfx!: Phaser.GameObjects.Graphics;
  private eyesGfx!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, waypoints: Waypoint[]) {
    // Sử dụng spritesheet thật của The Listener (64×64 px, 4 frames) từ Pixel_Art (GATE 2B)
    super(scene, x, y, SPRITE_THE_LISTENER);

    this.setOrigin(0.5, 0.95);
    this.ai = new ListenerAI(this, waypoints);

    // GATE 2B: Đăng ký và kích hoạt hoạt ảnh lơ lửng / thở tự nhiên cho The Listener
    if (!scene.anims.exists('listener_idle')) {
      scene.anims.create({
        key: 'listener_idle',
        frames: scene.anims.generateFrameNumbers(SPRITE_THE_LISTENER, { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }
    this.play('listener_idle');

    // 1. Dựng bóng đổ chân thực dưới chân quái vật
    this.visualGfx = scene.add.graphics();
    this.drawMonsterShadow();

    // V1.5 - BƯỚC V15-07: Mắt quái vật rực đỏ trong bóng tối (Glowing Crimson Eyes)
    this.eyesGfx = scene.add.graphics();
    this.drawGlowingEyes();
    this.eyesGfx.setVisible(false);

    // 2. Dựng biểu tượng cảnh báo Telegraph [? / !] (C4-13-05)
    this.alertIcon = scene.add.container(0, -54);
    this.alertBg = scene.add.graphics();
    this.alertText = scene.add.text(0, 0, '!', {
      fontFamily: 'serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.drawAlertIconBadge('chase');
    this.alertIcon.add([this.alertBg, this.alertText]);
    this.alertIcon.setVisible(false);

    // Cấu hình vật lý body chân thực tại chân (22×14 px)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(22, 14);
      body.setOffset(21, 48);
    }
  }

  private drawMonsterShadow(): void {
    const g = this.visualGfx;
    g.clear();

    // C4-13-06: Bóng đổ mặt đất đen mờ mịn (alpha 0.25) ôm sát bàn chân
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, 0, 22, 6);
  }

  /**
   * V1.5 - BƯỚC V15-07: Vẽ hai đốm mắt đỏ rực / lân tinh đỏ rực sắc nhọn trong bóng tối
   */
  private drawGlowingEyes(): void {
    const g = this.eyesGfx;
    if (!g) return;
    g.clear();

    // Quầng sáng đỏ mờ tỏa ra (outer glow halo)
    g.fillStyle(0xff1111, 0.35);
    g.fillCircle(-4, -44, 4);
    g.fillCircle(4, -44, 4);

    // Đồng tử mắt đỏ rực sắc nhọn (inner piercing core)
    g.fillStyle(0xff5555, 0.95);
    g.fillCircle(-4, -44, 1.8);
    g.fillCircle(4, -44, 1.8);
  }

  /**
   * V1.5 - BƯỚC V15-07: Đồng bộ pha thời gian với AI và độ sáng của mắt quái vật
   */
  public setTimePhase(phase: TimePhase): void {
    this.ai.setTimePhase(phase);
    this.hearingRadius = this.ai.getAggressionConfig().listenerHearingRadius;

    if (this.eyesGfx) {
      if (phase === 'NIGHT') {
        this.eyesGfx.setVisible(true);
        this.eyesGfx.setAlpha(0.95);
      } else if (phase === 'DUSK') {
        this.eyesGfx.setVisible(true);
        this.eyesGfx.setAlpha(0.45);
      } else {
        this.eyesGfx.setVisible(false);
      }
    }
  }

  /**
   * V1.5 - BƯỚC V15-07: Kích hoạt hiệu ứng lóe sáng mắt đỏ khi màn đêm buông xuống
   */
  public onNightfall(): void {
    this.setTimePhase('NIGHT');
    if (this.scene && this.eyesGfx) {
      this.scene.tweens.add({
        targets: this.eyesGfx,
        alpha: { from: 0.2, to: 1.0 },
        scaleX: { from: 1.6, to: 1.0 },
        scaleY: { from: 1.6, to: 1.0 },
        duration: 900,
        ease: 'Cubic.easeOut'
      });
    }
  }

  private drawAlertIconBadge(type: 'alert' | 'chase'): void {
    if (!this.alertBg || !this.alertText) return;
    this.alertBg.clear();
    if (type === 'alert') {
      // Dấu [?] màu vàng hổ phách (Nghi vấn / Tìm kiếm)
      this.alertBg.fillStyle(0xd35400, 0.95);
      this.alertBg.fillCircle(0, 0, 10);
      this.alertBg.lineStyle(1.5, 0xf1c40f, 1);
      this.alertBg.strokeCircle(0, 0, 10);
      this.alertText.setText('?');
      this.alertText.setColor('#ffffff');
    } else {
      // Dấu [!] màu đỏ thẫm (Truy đuổi khẩn cấp)
      this.alertBg.fillStyle(0x922b21, 0.95);
      this.alertBg.fillCircle(0, 0, 10);
      this.alertBg.lineStyle(1.5, 0xe74c3c, 1);
      this.alertBg.strokeCircle(0, 0, 10);
      this.alertText.setText('!');
      this.alertText.setColor('#ffffff');
    }
  }

  public setAlertVisual(visible: boolean, type: 'alert' | 'chase' = 'chase'): void {
    if (!visible) {
      this.alertIcon.setVisible(false);
      return;
    }

    this.drawAlertIconBadge(type);
    this.alertIcon.setVisible(true);
    this.scene.tweens.add({
      targets: this.alertIcon,
      y: -58,
      duration: 220,
      yoyo: true,
      repeat: type === 'chase' ? 2 : 1
    });
  }

  public onAlertTelegraph(): void {
    this.setAlertVisual(true, 'alert');
    const audio = (this.scene as any).audioManager;
    if (audio && typeof audio.playListenerAlert === 'function') {
      audio.playListenerAlert();
    }
  }

  public onChaseAlert(): void {
    this.setAlertVisual(true, 'chase');
    const audio = (this.scene as any).audioManager;
    if (audio) {
      if (typeof audio.playListenerAlert === 'function') {
        audio.playListenerAlert();
      }
      if (typeof audio.setHeartbeatActive === 'function') {
        audio.setHeartbeatActive(true, 420);
      }
    }
  }

  public onSearchVisual(): void {
    this.setAlertVisual(true, 'alert');
  }

  public onChaseEnded(): void {
    this.setAlertVisual(false);
    const audio = (this.scene as any).audioManager;
    if (audio && typeof audio.setHeartbeatActive === 'function') {
      audio.setHeartbeatActive(false);
    }
  }

  public canAttack(): boolean {
    return this.ai.canAttack();
  }

  public triggerAttackCooldown(ms: number = 1500): void {
    this.ai.triggerAttackCooldown(ms);
  }

  public hearSound(x: number, y: number, volume: number = 1.0, originX?: number, originY?: number): void {
    const dist = Math.hypot(this.x - x, this.y - y);
    if (dist <= this.hearingRadius * volume) {
      this.ai.triggerSoundAlert(x, y, volume, originX, originY);
    }
  }

  public forceChase(): void {
    this.ai.forceChase();
  }

  public repelByFlare(flareX: number, flareY: number, durationMs: number = 15000): void {
    this.triggerFlareRepel(flareX, flareY, durationMs);
  }

  public triggerFlareRepel(flareX: number, flareY: number, durationMs: number = 3500): void {
    this.ai.triggerFlareRepel(flareX, flareY, durationMs);
    this.setTint(0xffbb77);
    this.scene.time.delayedCall(Math.min(1500, durationMs), () => {
      if (this.active) this.clearTint();
    });
  }

  public resetToPatrol(initialX?: number, initialY?: number): void {
    this.ai.resetToPatrol(initialX, initialY);
  }

  public update(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, isPlayerDead: boolean = false, timePhase?: TimePhase): void {
    this.ai.update(delta, playerX, playerY, isPlayerHiding, isPlayerDead, timePhase);

    // Cập nhật hướng mặt theo vận tốc di chuyển
    if (this.body && Math.abs(this.body.velocity.x) > 5) {
      this.setFlipX(this.body.velocity.x > 0);
    }

    // Cập nhật vị trí bóng đổ, mắt đỏ và biểu tượng cảnh báo
    this.visualGfx.setPosition(this.x, this.y);
    this.alertIcon.setPosition(this.x, this.y - 54);
    if (this.eyesGfx) {
      this.eyesGfx.setPosition(this.x, this.y);
      this.eyesGfx.setScale(this.flipX ? -1 : 1, 1);
      this.eyesGfx.setDepth(this.y + 1);
    }
    this.visualGfx.setDepth(this.y - 1);
    this.setDepth(this.y);
    this.alertIcon.setDepth(this.y + 100);
  }

  /**
   * C4-13-09: Dọn dẹp triệt để Graphics, Containers và Tweens khi quái vật bị hủy hoặc chuyển scene
   */
  public destroy(fromScene?: boolean): void {
    if (this.scene) {
      this.scene.tweens.killTweensOf(this.alertIcon);
      if (this.eyesGfx) {
        this.scene.tweens.killTweensOf(this.eyesGfx);
      }
    }
    if (this.visualGfx) {
      this.visualGfx.destroy();
    }
    if (this.eyesGfx) {
      this.eyesGfx.destroy();
    }
    if (this.alertIcon) {
      this.alertIcon.destroy();
    }
    super.destroy(fromScene);
  }
}

