import * as Phaser from 'phaser';
import { Monster } from './monsters/Monster';
import { ListenerAI, Waypoint } from '../systems/ListenerAI';
import { SPRITE_THE_LISTENER } from '../config/Constants';

export class TheListener extends Monster {
  public ai!: ListenerAI;
  private alertIcon!: Phaser.GameObjects.Container;
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

    // 2. Dựng biểu tượng cảnh báo Telegraph [!👂]
    this.alertIcon = scene.add.container(0, -54);
    const alertBg = scene.add.graphics();
    alertBg.fillStyle(0x922b21, 0.95);
    alertBg.fillCircle(0, 0, 10);
    alertBg.lineStyle(1, 0xf1c40f, 1);
    alertBg.strokeCircle(0, 0, 10);

    const alertText = scene.add.text(0, 0, '!', {
      fontFamily: 'serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.alertIcon.add([alertBg, alertText]);
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

    // Bóng đổ ma quái đen tuyền dưới chân
    g.fillStyle(0x050608, 0.55);
    g.fillEllipse(0, 0, 28, 8);
  }

  public setAlertVisual(visible: boolean): void {
    this.alertIcon.setVisible(visible);
    if (visible) {
      this.scene.tweens.add({
        targets: this.alertIcon,
        y: -58,
        duration: 250,
        yoyo: true,
        repeat: 2
      });
    }
  }

  public hearSound(sourceX: number, sourceY: number, volume: number): void {
    const dist = Math.hypot(this.x - sourceX, this.y - sourceY);
    if (dist <= this.hearingRadius * volume) {
      this.ai.triggerSoundAlert(sourceX, sourceY, volume);
    }
  }

  public forceChase(): void {
    this.ai.forceChase();
  }

  public update(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean): void {
    this.ai.update(delta, playerX, playerY, isPlayerHiding);

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
}

