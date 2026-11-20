import * as Phaser from 'phaser';
import { SCENE_BOOT, SCENE_PRELOAD, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config/Constants';

export class BootScene extends Phaser.Scene {
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

    // V152-08: p2.ready() được chuyển sang MainMenuScene khi vẽ xong khung hình đầu tiên để tránh SD-004

    // Chuyển ngay sang PreloadScene
    this.scene.start(SCENE_PRELOAD);
  }
}

