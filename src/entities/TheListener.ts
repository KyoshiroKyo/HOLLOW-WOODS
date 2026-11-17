import * as Phaser from 'phaser';
import { Monster } from './monsters/Monster';
import { ListenerAI, Waypoint } from '../systems/ListenerAI';
import { SPRITE_THE_LISTENER } from '../config/Constants';

export class TheListener extends Monster {
  public ai!: ListenerAI;
  private alertIcon!: Phaser.GameObjects.Container;
  private alertBg!: Phaser.GameObjects.Graphics;
  private alertText!: Phaser.GameObjects.Text;
  private visualGfx!: Phaser.GameObjects.Graphics;

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

  public update(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, isPlayerDead: boolean = false): void {
    this.ai.update(delta, playerX, playerY, isPlayerHiding, isPlayerDead);

    // Cập nhật hướng mặt theo vận tốc di chuyển
    if (this.body && Math.abs(this.body.velocity.x) > 5) {
      this.setFlipX(this.body.velocity.x > 0);
    }

    // Cập nhật vị trí bóng đổ và biểu tượng cảnh báo
    this.visualGfx.setPosition(this.x, this.y);
    this.alertIcon.setPosition(this.x, this.y - 54);
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
    }
    if (this.visualGfx) {
      this.visualGfx.destroy();
    }
    if (this.alertIcon) {
      this.alertIcon.destroy();
    }
    super.destroy(fromScene);
  }
}

