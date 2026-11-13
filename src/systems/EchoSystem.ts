import * as Phaser from 'phaser';
import { SPRITE_THE_ECHO } from '../config/Constants';

export interface EchoSpawnPoint {
  id: string;
  x: number;
  y: number;
  targetClueX: number;
  targetClueY: number;
  message: string;
  triggered: boolean;
}

export class EchoSystem {
  private scene: Phaser.Scene;
  private echoSpawns: EchoSpawnPoint[] = [
    {
      id: 'echo_fog_gate',
      x: 390,
      y: 180,
      targetClueX: 450,
      targetClueY: 180,
      message: 'Một bóng hình lữ khách mờ ảo chỉ tay về phía Cổng Làng trước khi tan biến...',
      triggered: false
    },
    {
      id: 'echo_crooked_tree',
      x: 1860,
      y: 220,
      targetClueX: 1900,
      targetClueY: 180,
      message: 'Tiếng vọng chỉ vào Thân Cây Rỗng: “Ẩn nấp... khi tiếng bước chân cất lên...”',
      triggered: false
    },
    {
      id: 'echo_mire_entrance',
      x: 2750,
      y: 280,
      targetClueX: 2820,
      targetClueY: 280,
      message: 'Hình bóng mờ thì thào: “Đừng theo chiếc đèn thứ hai... hãy nhìn ký hiệu cổ...”',
      triggered: false
    }
  ];

  private activeEchoContainer: Phaser.GameObjects.Container | null = null;
  private currentSpawnPoint: EchoSpawnPoint | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public update(playerX: number, playerY: number, onEchoDisappear?: (msg: string) => void): void {
    // 1. Kiểm tra kích hoạt Echo mới nếu chưa có Echo đang hiển thị
    if (!this.activeEchoContainer) {
      for (const sp of this.echoSpawns) {
        if (!sp.triggered) {
          const dist = Math.hypot(playerX - sp.x, playerY - sp.y);
          // Xuất hiện ở rìa tầm nhìn (~140–200 px)
          if (dist <= 180 && dist >= 80) {
            this.spawnEcho(sp);
            break;
          }
        }
      }
    } else if (this.currentSpawnPoint) {
      // 2. Nếu Satyr tiến lại gần trong bán kính 45px -> Echo tan biến
      const dist = Math.hypot(playerX - this.currentSpawnPoint.x, playerY - this.currentSpawnPoint.y);
      if (dist <= 48) {
        this.dissolveEcho(onEchoDisappear);
      }
    }
  }

  private spawnEcho(sp: EchoSpawnPoint): void {
    sp.triggered = true;
    this.currentSpawnPoint = sp;

    this.activeEchoContainer = this.scene.add.container(sp.x, sp.y);

    // Vầng hào quang sương mù mờ ảo phát sáng nhẹ
    const aura = this.scene.add.graphics();
    aura.fillStyle(0xaed6f1, 0.22);
    aura.fillCircle(0, -32, 24);

    // Sprite thật của The Echo trích xuất từ pixel art
    const echoSprite = this.scene.add.image(0, 0, SPRITE_THE_ECHO);
    echoSprite.setOrigin(0.5, 0.95);
    echoSprite.setAlpha(0.85);

    this.activeEchoContainer.add([aura, echoSprite]);
    this.activeEchoContainer.setDepth(sp.y);
    this.activeEchoContainer.setAlpha(0);

    // Xuất hiện chập chờn
    this.scene.tweens.add({
      targets: this.activeEchoContainer,
      alpha: 0.65,
      y: sp.y - 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private dissolveEcho(callback?: (msg: string) => void): void {
    if (!this.activeEchoContainer || !this.currentSpawnPoint) return;

    const sp = this.currentSpawnPoint;
    const container = this.activeEchoContainer;

    // Hiệu ứng tan biến thành sương
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 0.2,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        container.destroy();
        this.activeEchoContainer = null;
        this.currentSpawnPoint = null;
        if (callback) {
          callback(sp.message);
        }
      }
    });
  }
}

