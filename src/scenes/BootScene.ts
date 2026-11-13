import * as Phaser from 'phaser';
import { SCENE_BOOT, SCENE_PRELOAD } from '../config/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_BOOT });
  }

  public preload(): void {
    // Nạp tài nguyên tối thiểu cho loading screen nếu cần
  }

  public create(): void {
    // Chuyển ngay sang PreloadScene
    this.scene.start(SCENE_PRELOAD);
  }
}

