import * as Phaser from 'phaser';
import { SCENE_BOOT, SCENE_PRELOAD, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config/Constants';

export class BootScene extends Phaser.Scene {
  private static hasNotifiedReady = false;

  constructor() {
    super({ key: SCENE_BOOT });
  }

  public preload(): void {
    // Nạp tài nguyên tối thiểu cho loading screen nếu cần
  }

  public create(): void {
    // Vẽ khung hình đầu tiên ngay lập tức tránh cảnh báo RT-004
    this.cameras.main.setBackgroundColor('#0b0c10');
    const bg = this.add.graphics();
    bg.fillStyle(0x0b0c10, 1);
    bg.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Thông báo cho nền tảng P2Game rằng khung hình đầu tiên đã được dựng xong (chỉ gọi 1 lần duy nhất)
    if (!BootScene.hasNotifiedReady) {
      BootScene.hasNotifiedReady = true;
      try {
        if (typeof window !== 'undefined' && window.p2 && typeof window.p2.ready === 'function') {
          window.p2.ready();
          console.log('[P2Game SDK] Đã phát tín hiệu p2.ready() ở khung hình đầu tiên.');
        }
      } catch (err) {
        console.warn('[P2Game SDK] Lỗi khi gọi p2.ready():', err);
      }
    }

    // Chuyển ngay sang PreloadScene
    this.scene.start(SCENE_PRELOAD);
  }
}

