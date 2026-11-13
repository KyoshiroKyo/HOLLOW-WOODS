import * as Phaser from 'phaser';
import satyrAnimsData from '../data/satyr_animations.json';
import { SATYR_SHEET_KEY } from '../config/Constants';

/**
 * Đăng ký toàn bộ hoạt ảnh của Satyr vào AnimationManager của Phaser.
 * Xử lý ánh xạ các frame 64×64 chuẩn xác cho 4 hướng (DOWN, LEFT, RIGHT, UP).
 */
export function registerSatyrAnimations(anims: Phaser.Animations.AnimationManager): void {
  for (const def of satyrAnimsData.animations) {
    if (!anims.exists(def.key)) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(SATYR_SHEET_KEY, {
          frames: def.frames
        }),
        frameRate: def.frameRate,
        repeat: def.repeat
      });
    }
  }
}
